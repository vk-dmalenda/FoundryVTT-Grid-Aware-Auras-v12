/** The side length of a hexagon with a grid size of 1 (apothem of 0.5). */
const UNIT_SIDE_LENGTH = 1 / Math.sqrt(3);

/** 30 degrees expressed as radians. */
const RADIANS_30 = 30 * Math.PI / 180;

/**
 * A pre-calculated map of the X and Y offsets of a line of length 1 in multiples of 30 degrees.
 * The keys are in degrees because it's easier for me to understand that way :) And also we _may_ run into rounding
 * errors when using radians as keys?
 * @type {Map<number, [number, number]>}
 */
const offsets = new Map(new Array(12).fill(0)
	.map((_, i) => [i * 30, [Math.cos(i * RADIANS_30), Math.sin(i * RADIANS_30)]]));

/**
 * Generates a hex aura polygon for the given radius.
 * The origin of the polygon is the top-left of the centre hexagon.
 * @param {number} radius The radius of the hex polygon, measured in grid cells. Must be an positive integer.
 * @param {Object} [options]
 * @param {number} [options.gridSize] The size of the grid in pixels.
 * @param {boolean} [options.cols] Whether the grid is using columns (true), or rows (false).
 * @param {number} [options.centreSize] The size of the centre/token of the aura in grid cells. Most be a positive, non-zero integer.
 * @param {boolean} [options.heavy] For evenly-sized centres, whether the bottom of the hexagon is the larger part.
 */
export function generateHexAuraPolygon(radius, { gridSize = 100, cols = false, centreSize = 1, heavy = false } = {}) {
	if ((radius % 1) !== 0)
		throw new Error("`radius` argument must be an integer.");
	if ((centreSize % 1) !== 0 || centreSize < 1)
		throw new Error("`centreSize` argument must be a positive, non-zero integer.");
	if (radius + centreSize <= 0)
		throw new Error("Resulting hex aura cannot be of size 0 or smaller.");

	// The given centreSize is the actual token size, nor the radius of the centre, so calculate the radius.
	const centreRadius = Math.ceil(centreSize / 2);

	/** Size of an individual length of a single hexagon. */
	const edgeLength = gridSize * UNIT_SIDE_LENGTH;

	/** @type {number[]} */
	const points = [];

	// Initial angle for hex row grids is offset by half a turn (30deg) so that we get pointy hexes
	let angle = cols ? 0 : -30;

	// Initial cursor position is calculated so that the (0,0) of the polygon lines up with the top-left corner of the
	// bounding box of the centre shape (so that we can easily position this hex on tokens)
	// Honestly I don't understand the maths behind this at all, I determined this by drawing a bunch of debug points
	// and measuring how far off it was in the different directions.
	// Look I KNOW it's REALLY awful okay, but it works... I think... so we'll just leave it like this. 🙈
	let cursorX = cols
		? centreSize === 1 ? (edgeLength / 2) : (4 * edgeLength * offsets.get(300)[0])
		: (radius - 1) * offsets.get(210)[0] * edgeLength - (centreSize === 1 ? gridSize / 2 : 0);

	let cursorY = cols
		? 2 * edgeLength * offsets.get(300)[1] * radius
		: ((radius - 1) * offsets.get(210)[1] - radius) * edgeLength;

	/** @type {(angle: number) => void} */
	const addPoint = angle => {
		const [x, y] = offsets.get(clampAngle(angle));
		points.push(cursorX, cursorY);
		cursorX += x * edgeLength;
		cursorY += y * edgeLength;
	};

	for (let i = 0; i < 6; i++) {

		// Work out how many grid-cell hexes this side of the resulting aura hex should have.
		// Auras with even-sized tokens work slightly differently. Every other side has an additional hex on it.
		// Whether the long side is on the top or bottom depends on the orientation of the token (whether it is "heavy")
		let hexesPerSide = radius + centreRadius;
		if ((centreSize % 2) === 0) {
			hexesPerSide += +((i % 2) === (heavy ? 1 : 0));
		}

		// Actually draw the edges of the sub-hexes
		for (let j = 0; j < hexesPerSide; j++) {
			if (j > 0) {
				addPoint(angle + 60);
			}
			addPoint(angle);
		}

		angle += 60;
	}

	return points;
}

/**
 * Clamps the given angle (in degrees) to be a value between 0 <= a < 360.
 * @param {number} angle
 */
function clampAngle(angle) {
	while (angle < 0)
		angle += 360;
	return angle % 360;
}
