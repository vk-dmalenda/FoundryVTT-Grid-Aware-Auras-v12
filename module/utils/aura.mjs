import { LINE_TYPES, MODULE_NAME, TOKEN_AURAS_FLAG } from "../consts.mjs";

/**
 * @typedef {Object} AuraConfig
 * @property {string} id
 * @property {string} name
 * @property {boolean} enabled
 * @property {number} radius
 * @property {LINE_TYPES} lineType
 * @property {number} lineWidth
 * @property {string} lineColor
 * @property {number} lineOpacity
 * @property {number} lineDashSize
 * @property {number} lineGapSize
 * @property {number} fillType
 * @property {string} fillColor
 * @property {number} fillOpacity
 * @property {string} fillTexture
 * @property {{ x: number; y: number; }} fillTextureOffset
 * @property {{ x: number; y: number; }} fillTextureScale
 * @property {VisibilityConfig} ownerVisibility
 * @property {VisibilityConfig} nonOwnerVisibility
 */
/**
 * @typedef {Object} VisibilityConfig
 * @property {boolean} default
 * @property {boolean} hovered
 * @property {boolean} controlled
 * @property {boolean} dragging
 * @property {boolean} targeted
 * @property {boolean} turn
 */

/**
 * Gets the auras that are present on the given token.
 * @param {Token | TokenDocument} token
 * @return {AuraConfig[]}
 */
export function getTokenAuras(token) {
	const tokenDoc = token instanceof Token ? token.document : token;
	return tokenDoc.getFlag(MODULE_NAME, TOKEN_AURAS_FLAG) ?? [];
}

/** @type {VisibilityConfig} */
export const auraVisibilityDefaults = {
	default: true,
	hovered: true,
	controlled: true,
	dragging: true,
	targeted: true,
	turn: true,
};

/** @type {Omit<AuraConfig, "id">} */
export const auraDefaults = {
	name: "New Aura",
	enabled: true,
	radius: 1,
	lineType: LINE_TYPES.SOLID,
	lineWidth: 4,
	lineColor: "#FF0000",
	lineOpacity: 0.8,
	lineDashSize: 15,
	lineGapSize: 10,
	fillType: CONST.DRAWING_FILL_TYPES.SOLID,
	fillColor: "#FF0000",
	fillOpacity: 0.1,
	fillTexture: "",
	fillTextureOffset: { x: 0, y: 0 },
	fillTextureScale: { x: 100, y: 100 },
	ownerVisibility: auraVisibilityDefaults,
	nonOwnerVisibility: auraVisibilityDefaults
};

/** @returns {AuraConfig} */
export function createAura() {
	return { ...auraDefaults, id: foundry.utils.randomID() };
}

/**
 * From the given (possibly incomplete, e.g. when new fields are added) aura config, gets the complete config.
 * @param {Partial<AuraConfig>} [config]
 * @returns {AuraConfig}
 */
export function getAura(config) {
	return foundry.utils.mergeObject(auraDefaults, config, { inplace: false });
}
