import { generateHexAuraPolygon } from "./hex-utils.mjs";

/**
 * Layer for managing hex auras on a canvas.
 */
export class HexAuraLayer extends CanvasLayer {

	/** @type {Map<Token, Map<string, HexAuraGraphics>>} */
	#tokenAuraGraphicsMap = new Map();

	/** @returns {HexAuraLayer | undefined} */
	static get current() {
		return game.ready ? game.canvas?.hexAuraLayer : undefined;
	}

	// Sorting within the PrimaryCanvasGroup works by the `elevation`, then by whether it is a token, then by whether it
	// is a Drawing, then finally by the `sort`. We can then use the same elevation as tokens, then an extremely high
	// sort value to sort over tiles, but below tokens.
	// Terrain Height Tools uses 9999999999, so add 1 to ensure we render on top of the height map.
	get elevation() { return 0; }
	get sort() { return 10000000000; }

	get isActive() {
		return canvas.grid.isHex;
	}

	/** @override */
	async _draw() {
	}

	/**
	 * Updates the Auras for a specific token.
	 * @param {Token} token
	 */
	updateToken(token) {
		this.#getTokenAuraGraphic(token, "a").update({ radius: 3 });
	}

	/**
	 * Removes auras for the specified token.
	 * @param {Token} token
	 */
	destroyToken(token) {
		const aurasMap = this.#tokenAuraGraphicsMap.get(token);
		if (!aurasMap) return;

		for (const child of aurasMap.values())
			this.removeChild(child);

		this.#tokenAuraGraphicsMap.delete(token);
	}

	/**
	 * Gets or creates a `HexAuraGraphics` instance for the given token and aura.
	 * @param {Token} token
	 * @param {string} auraId
	 * @returns {HexAuraGraphics}
	 */
	#getTokenAuraGraphic(token, auraId) {
		let tokenAuras = this.#tokenAuraGraphicsMap.get(token);
		if (!tokenAuras) {
			tokenAuras = new Map();
			this.#tokenAuraGraphicsMap.set(token, tokenAuras);
		}

		let auraGraphics = tokenAuras.get(auraId);
		if (!auraGraphics) {
			auraGraphics = this.addChild(new HexAuraGraphics(token));
			tokenAuras.set(auraId, auraGraphics);
		}

		return auraGraphics;
	}
}

/**
 * Graphics class that renders a single hex aura.
 */
export class HexAuraGraphics extends PIXI.Graphics {

	/** @type {Token} */
	#token;

	#radius = 0;

	#isHeavy = false;

	#centreSize = 1;

	constructor(token) {
		super();
		this.#token = token;
	}

	/**
	 * Updates this aura graphic, and redraws it if required.
	*/
	update({ radius = this.#radius } = {}) {
		let shouldRedraw = false;

		// Update position
		this.x = this.#token.x;
		this.y = this.#token.y;

		// Update token size (only integer-sized tokens with equal width/height are supported)
		const centreSize = this.#token.document.width !== this.#token.document.height || (this.#token.document.width % 1) !== 0
			? 0
			: this.#token.document.width;
		if (this.#centreSize !== centreSize) {
			this.#centreSize = centreSize;
			shouldRedraw = true;
		}

		// Update radius
		if (this.#radius !== radius) {
			this.#radius = radius;
			shouldRedraw = true;
		}

		// Update heavy flag
		// TODO: Foundry seems to render size 2 tokens as heavy and size 4s as not-heavy. Will need to support hex-size-support module.
		const isHeavy = this.#token.document.width === 2;
		if (this.#isHeavy !== isHeavy) {
			this.#isHeavy = isHeavy;
			shouldRedraw = true;
		}

		// If a relevant property has changed, do a redraw
		if (shouldRedraw) {
			this.#redraw();
		}
	}

	#redraw() {
		this.clear();

		if (this.#radius <= 0 || this.#centreSize <= 0 || (this.#centreSize % 1) !== 0) return;

		const points = generateHexAuraPolygon(this.#radius, {
			centreSize: this.#centreSize,
			gridSize: canvas.grid.size,
			cols: [CONST.GRID_TYPES.HEXEVENQ, CONST.GRID_TYPES.HEXODDQ].includes(canvas.grid.type),
			heavy: this.#isHeavy
		});

		this.beginFill(Math.random() * 0xFFFFFF, 0.8);

		this.moveTo(points[0], points[1]);
		for (let i = 2; i < points.length; i += 2)
			this.lineTo(points[i], points[i + 1]);
		this.lineTo(points[0], points[1]);

		this.beginFill(0x000000, 0.6);
		this.drawCircle(0, 0, 5);
		this.drawCircle(points[0], points[1], 5);
	}
}
