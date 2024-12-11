import { SQUARE_GRID_MODE } from "../consts.mjs";

/**
 * Generates a square aura polygon for the given radius.
 * The origin of the polygon is the top-left of the centre.
 * @param {number} radius The radius of the polygon, measured in grid cells. Must be positive.
 * @param {Object} [options]
 * @param {number} [options.gridSize] The size of the grid in pixels.
 * @param {SQUARE_GRID_MODE} [options.mode] The algorithm used to generate the aura.
 * @param {number} [options.width] The width of the centre, in grid cells.
 * @param {number} [options.height] The height of the centre, in grid cells.
 */
export function generateSquareAuraPolygon(radius, {
	gridSize: s = 100,
	mode = SQUARE_GRID_MODE.EQUIDISTANT,
	width: w = 1,
	height: h = 1
} = {}) {
	const r = radius;
	switch (mode) {
		// This is the easiest to implement, just a large rectangle/square around the centre
		case SQUARE_GRID_MODE.EQUIDISTANT: {
			return [
				/* top-left: */ -r * s, -r * s,
				/* top-right: */ (w + r) * s, -r * s,
				/* bottom-right: */ (w + r) * s, (h + r) * s,
				/* bottom-left: */ -r * s, (h + r) * s
			];
		}

		// Alternating seems to generate a pattern where there are 3 distinct slopes between adjacent sides, e.g. from
		// the top to the right, the x:y ratio of the first slope is 2:1, the second 1:1, then finally 1:2. The 1:1 part
		// is always either 1 or 3 squares in size.
		case SQUARE_GRID_MODE.ALTERNATING: {
			const padding = r > 0 ? 1 : 0 // All radii except 0 have the straight side extend 1 square further than the width/height
			const innerDiagonalLength = Math.max(r - 1, 0) % 3; // The length of the 1:1 slope part
			const outerDialogalLength = Math.floor(Math.max(r - 1, 0) / 3); // The length of the two 2:1/2:1 parts

			return [
				/* top: */ -padding * s, -r * s,
				/* top-right diagonals: */ ...alternatingDiagonals(w + padding, -r, "x", 1, 1),
				/* right: */ (w + r) * s, -padding * s,
				/* bottom-right diagonals: */ ...alternatingDiagonals(w + r, h + padding, "y", -1, 1),
				/* bottom: */ (w + padding) * s, (h + r) * s,
				/* bottom-left diagonals: */ ...alternatingDiagonals(-padding, h + r, "x", -1, -1),
				/* left: */ -r * s, (h + padding) * s,
				/* top-left diagonals: */ ...alternatingDiagonals(-radius, -padding, "y", 1, -1)
			];

			/**
			 * Generates diagonals for the alternating aura. One call of this will generate the 3 distinct diagonals.
			 * Dir will determine which values are stretched. dx/dy will determine the direction of the diagonals.
			 * @type {(x: number, y: number, dir: "x" | "y", dx: number, dy: number) => Generator<number, void, void>}
			 */
			function* alternatingDiagonals(x, y, dir, dx, dy) {
				const ifX = v => dir === "x" ? v : 0;
				const ifY = v => dir === "y" ? v : 0;
				([x, y] = yield *diagonal(x, y, outerDialogalLength, ifY(1) * dx, ifX(1) * dy, ifX(2) * dx, ifY(2) * dy));
				([x, y] = yield *diagonal(x, y, innerDiagonalLength, ifY(1) * dx, ifX(1) * dy, ifX(1) * dx, ifY(1) * dy));
				([x, y] = yield *diagonal(x, y, outerDialogalLength, ifY(2) * dx, ifX(2) * dy, ifX(1) * dx, ifY(1) * dy));
			}
		}

		// Manhattan can be boiled down to a top/bottom/left/right which are the same as the width/heigh, and then a
		// diagonal between the sides. The length of the diagonals equals the radius of aura.
		case SQUARE_GRID_MODE.MANHATTAN: {
			return [
				/** top: */ 0, -r * s,
				/** top-right diagonal: */ ...diagonal(w, -r, r, 0, 1, 1, 0),
				/** right: */ (w + r) * s, 0,
				/** bottom-right diagonal: */ ...diagonal(w + r, h, r, -1, 0, 0, 1),
				/** bottom: */ w * s, (h + r) * s,
				/** bottom-left diagonal: */ ...diagonal(0, h + r, r, 0, -1, -1, 0),
				/** left: */ -r * s, h * s,
				/** top-left diagonal: */ ...diagonal(-r, 0, r, 1, 0, 0, -1)
			];
		}
	}

	throw new Error("Unknown `mode` for generateSquareAuraPolygon.");

	/**
	 * Creates a diagonal for a square grid. dx0/dy0 are the number of squares to move on the first step, and dx1/dy1
	 * are the number of squares to move on the second step.
	 * @type {(x: number, y: number, count: number, dx0: number, dy0: number, dx1: number, dy1: number) => Generator<number, [number, number], void>}
	 */
	function* diagonal(x, y, count, dx0, dy0, dx1, dy1) {
		for (let i = 0; i < count; i++) {
			yield x * s;
			yield y * s;
			x += dx0;
			y += dy0;
			yield x * s;
			yield y * s;
			x += dx1;
			y += dy1;
		}

		return [x, y];
	}
}
