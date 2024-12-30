export const MODULE_NAME = "grid-aware-auras";

export const TOKEN_AURAS_FLAG = "auras";

export const SQUARE_GRID_MODE_SETTING = "squareGridMode";

const HOOK_PREFIX = "gridAwareAuras";
export const ENTER_AURA_HOOK = `${HOOK_PREFIX}.enterAura`;
export const LEAVE_AURA_HOOK = `${HOOK_PREFIX}.leaveAura`;

/** @enum {number} */
export const LINE_TYPES = /** @type {const} */ ({
	NONE: 0,
	SOLID: 1,
	DASHED: 2
});

/** @num {number} */
export const SQUARE_GRID_MODE = /** @type {const} */ ({
	EQUIDISTANT: 0,
	ALTERNATING: 1,
	MANHATTAN: 2
});
