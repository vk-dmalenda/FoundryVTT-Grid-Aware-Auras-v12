/** @import { Aura } from "../utils/aura.mjs"; */
import { LINE_TYPES, MODULE_NAME, SQUARE_GRID_MODE_SETTING } from "../consts.mjs";
import { auraDefaults, getTokenAuras } from "../utils/aura.mjs";
import { generateHexAuraPolygon } from "../utils/hex-utils.mjs";
import { drawDashedPath } from "../utils/pixi-utils.mjs";
import { generateSquareAuraPolygon } from "../utils/square-utils.mjs";

/**
 * Layer for managing grid-aware auras on a canvas.
 */
export class AuraLayer extends CanvasLayer {

	/** @type {Map<Token, AuraGraphics[]>} */
	#tokenAuraGraphicsMap = new Map();

	/** @returns {AuraLayer | undefined} */
	static get current() {
		return game.ready ? game.canvas?.gaaAuraLayer : undefined;
	}

	// Sorting within the PrimaryCanvasGroup works by the `elevation`, then by whether it is a token, then by whether it
	// is a Drawing, then finally by the `sort`. We can then use the same elevation as tokens, then an extremely high
	// sort value to sort over tiles, but below tokens.
	// Terrain Height Tools uses 9999999999, so add 1 to ensure we render on top of the height map.
	get elevation() { return 0; }
	get sort() { return 10000000000; }

	/** @override */
	async _draw() {
	}

	/**
	 * Updates the Auras for a specific token.
	 * @param {Token} token
	 * @param {boolean} force Force a redraw, even if no aura properties have changed.
	 */
	updateToken(token, force = false) {
		const auras = token.hasPreview || canvas.grid.type === CONST.GRID_TYPES.GRIDLESS
			? []
			: getTokenAuras(token);

		let tokenAuras = this.#tokenAuraGraphicsMap.get(token);
		if (!tokenAuras) {
			tokenAuras = [];
			this.#tokenAuraGraphicsMap.set(token, tokenAuras);
		}

		while (tokenAuras.length < auras.length)
			tokenAuras.push(this.addChild(new AuraGraphics(token)));

		while (tokenAuras.length > auras.length)
			this.removeChild(tokenAuras.pop());

		for (let i = 0; i < auras.length; i++)
			tokenAuras[i].update(auras[i], auras[i].enabled && token.isVisible, force);
	}

	/**
	 * Removes auras for the specified token.
	 * @param {Token} token
	 */
	destroyToken(token) {
		const auraGraphics = this.#tokenAuraGraphicsMap.get(token);
		if (!auraGraphics) return;

		for (const auraGraphic of auraGraphics)
			this.removeChild(auraGraphic);

		this.#tokenAuraGraphicsMap.delete(token);
	}

	/** Forces a redraw of all auras. */
	redraw() {
		for (const token of canvas.tokens.placeables)
			this.updateToken(token, true);
	}
}

/**
 * Graphics class that renders a single aura.
 */
export class AuraGraphics extends PIXI.Graphics {

	/** @type {Token} */
	#token;

	/** @type {Aura} */
	#aura;

	/**
	 * For evenly-sized tokens on hex grids, whether that token is "heavy" (i.e. the largest part of the token is on
	 * the bottom or the right).
	 */
	#isHeavy = false;

	/** @type {number} */
	#width;

	/** @type {number} */
	#height;

	/**
	 * `null` is only used when no renders have been done yet. When null, the animation is not played. This prevents a
	 * flash when creating a token with an invisible aura.
	 * @type {boolean | null}
	 */
	#isVisible = null;

	constructor(token) {
		super();
		this.#token = token;
	}

	/**
	 * Updates this aura graphic, and redraws it if required.
	 * @param {Aura} aura
	 * @param {boolean} isVisible
	 * @param {boolean} force Force a redraw, even if no aura properties have changed.
	*/
	update(aura, isVisible, force = false) {
		let shouldRedraw = false;

		// Update position
		this.x = this.#token.x;
		this.y = this.#token.y;

		// Update token size
		if (this.#width !== this.#token.document.width) {
			this.#width = this.#token.document.width;
			shouldRedraw = true;
		}

		if (this.#height !== this.#token.document.height) {
			this.#height = this.#token.document.height;
			shouldRedraw = true;
		}

		// Update aura
		if (this.#aura !== aura) {
			this.#aura = aura;
			shouldRedraw = true;
		}

		// Update heavy flag
		const isHeavy = AuraGraphics.#isTokenHeavy(this.#token);
		if (this.#isHeavy !== isHeavy) {
			this.#isHeavy = isHeavy;
			shouldRedraw = true;
		}

		// If a relevant property has changed, do a redraw
		if (shouldRedraw || force) {
			this.#redraw();
		}

		// Transition opacity
		// We use null as the initial visibility. If the existing value is null, then we don't animate. This prevents
		// a brief flash when a token is created with an invisible aura (e.g. if a token is dropped while holding 'Alt')
		if (this.#isVisible !== isVisible) {
			if (this.#isVisible === null) {
				this.alpha = isVisible ? 1 : 0;
			} else {
				CanvasAnimation.animate([
					{
						parent: this,
						attribute: "alpha",
						to: isVisible ? 1 : 0
					}
				], { duration: 500 });
			}
			this.#isVisible = isVisible;
		}
	}

	async #redraw() {
		const aura = { ...auraDefaults, ...this.#aura };

		// Negative radii are not supported
		if (aura.radius < 0) {
			this.clear();
			return;
		}

		// Generate polygon points. If there are none, early exit
		const points = this.#getPolygonPoints(aura);
		if (points.length === 0) {
			this.clear();
			return;
		}

		// Load the texture BEFORE clearing, otherwise there's a noticable flash every time something is chaned.
		const texture = aura.fillType === CONST.DRAWING_FILL_TYPES.PATTERN
			? await loadTexture(aura.fillTexture)
			: null;

		this.clear();

		this.#configureFillStyle({ ...aura, fillTexture: texture });

		// If we are using a dashed path, because of the way the dash is implemted, we need to draw the fill separately
		// from the stroke.
		if (aura.lineType === LINE_TYPES.DASHED) {
			this.#configureLineStyle({ lineType: LINE_TYPES.NONE });
			this.drawPolygon(points);
			this.endFill();
			this.#configureLineStyle(aura);
			drawDashedPath(this, points, { closed: true, dashSize: aura.lineDashSize, gapSize: aura.lineGapSize });
		} else {
			this.#configureLineStyle(aura);
			this.drawPolygon(points);
		}
	}

	/**
	 * Gets the points of the shape polygon for the current state.
	 * @param {Aura} aura
	 */
	#getPolygonPoints(aura) {
		switch (canvas.grid.type) {
			case CONST.GRID_TYPES.GRIDLESS: {
				// Gridless not supported
				return [];
			}

			case CONST.GRID_TYPES.SQUARE: {
				return generateSquareAuraPolygon(aura.radius, {
					gridSize: canvas.grid.size,
					width: this.#width,
					height: this.#height,
					mode: game.settings.get(MODULE_NAME, SQUARE_GRID_MODE_SETTING)
				});
			}

			default: { // Any hex
				const centerSize = this.#width !== this.#height || (this.#width % 1) !== 0
					? 0
					: this.#width;

				// Hex only supports tokens with equal width/height and integer size
				if (centerSize <= 0 || (centerSize % 1) !== 0)
					return [];

				return generateHexAuraPolygon(aura.radius, {
					centerSize,
					gridSize: canvas.grid.size,
					cols: [CONST.GRID_TYPES.HEXEVENQ, CONST.GRID_TYPES.HEXODDQ].includes(canvas.grid.type),
					isHeavy: this.#isHeavy
				});
			}
		}
	}

	/**
	 * Configures the line style for this graphics instance based on the given values.
	 */
	#configureLineStyle({
		lineType = LINE_TYPES.NONE,
		lineWidth = 0,
		lineColor = "#000000",
		lineOpacity = 0
	} = {}) {
		this.lineStyle({
			color: Color.from(lineColor),
			alpha: lineOpacity,
			width: lineType === LINE_TYPES.NONE ? 0 : lineWidth
		});
	}

	/**
	 * Configures the fill style for this graphics instance based on the given values.
	 */
	#configureFillStyle({
		fillType = CONST.DRAWING_FILL_TYPES.NONE,
		fillColor = "#000000",
		fillOpacity = 0,
		fillTexture = undefined,
		fillTextureOffset = { x: 0, y: 0 },
		fillTextureScale = { x: 0, y: 0 }
	} = {}) {
		const color = Color.from(fillColor ?? "#000000");
		if (fillType === CONST.DRAWING_FILL_TYPES.SOLID) {
			this.beginFill(fillColor, fillOpacity);
		} else if (fillType === CONST.DRAWING_FILL_TYPES.PATTERN && fillTexture) {
			const { x: xOffset, y: yOffset } = fillTextureOffset;
			const { x: xScale, y: yScale } = fillTextureScale;
			this.beginTextureFill({
				texture: fillTexture,
				color,
				alpha: fillOpacity,
				matrix: new PIXI.Matrix(xScale / 100, 0, 0, yScale / 100, xOffset, yOffset)
			});
		} else { // NONE
			this.beginFill(0x000000, 0);
		}
	}

	/**
	 * Determines if the given hex token is "heavy" (larger at the bottom/right than the top/left).
	 * @param {Token} token
	 */
	static #isTokenHeavy(token) {
		// If the Hex Size Support/Token Border Supplements module is active, use that to determine whether or not it's
		// heavy. "Alt" is HSS's name for what we call "Heavy".
		const hss = game.modules.get("hex-size-support");
		if (hss?.active === true) {
			return hss.api.isAltOrientation(token);
		}

		// Foundry seems to render size 2 tokens as heavy and size 4s as not-heavy.
		return token.document.width === 2;
	}
}
