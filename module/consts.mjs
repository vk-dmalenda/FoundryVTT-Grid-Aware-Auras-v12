export const MODULE_NAME = "grid-aware-auras";

export const TOKEN_AURAS_FLAG = "auras";

export const SQUARE_GRID_MODE_SETTING = "squareGridMode";

const HOOK_PREFIX = "gridAwareAuras";
export const ENTER_LEAVE_AURA_HOOK = `${HOOK_PREFIX}.enterLeaveAura`;

/** @enum {number} */
export const LINE_TYPES = /** @type {const} */ ({
	NONE: 0,
	SOLID: 1,
	DASHED: 2
});

/** @enum {number} */
export const SQUARE_GRID_MODE = /** @type {const} */ ({
	EQUIDISTANT: 0,
	ALTERNATING: 1,
	MANHATTAN: 2
});

/** @enum {string} */
export const AURA_VISIBILITY_MODES = /** @type {const} */ ({
	ALWAYS: "TOKEN.DISPLAY_ALWAYS",
	OWNER: "TOKEN.DISPLAY_OWNER",
	HOVER: "TOKEN.DISPLAY_HOVER",
	OWNER_HOVER: "TOKEN.DISPLAY_OWNER_HOVER",
	CONTROL: "TOKEN.DISPLAY_CONTROL",
	TURN: "GRIDAWAREAURAS.AuraDisplayOwnerTurn",
	OWNER_TURN: "GRIDAWAREAURAS.AuraDisplayTurn",
	NONE: "TOKEN.DISPLAY_NONE",
	CUSTOM: "GRIDAWAREAURAS.AuraDisplayCustom"
});
