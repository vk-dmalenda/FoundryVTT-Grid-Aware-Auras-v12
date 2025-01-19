/**
 * Determines if the `a` and `b` are partially equal. For each property in `b`, if it has a property in `a` with the
 * same value, it is equal. Does not check additional properties on `a`.
 * @param {Object} a
 * @param {Object} b
 * @example
 * partialEqual({ x: 1 }, { x: 1 }); // => true - both objects have `x` with the same value
 * partialEqual({ x: 1, y: 2 }, { x: 1 }); // => true - both have equal `x` values, `y` is ignored because it's not on b
 * partialEqual({ x: 1 }, { x: 1, y: 2 }); // => false - a does not have the `y` property
 */
export function partialEqual(a, b) {
	for (const [k, v] of Object.entries(b))
		if (a[k] !== v)
			return false;
	return true;
}
