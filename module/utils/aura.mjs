import { LINE_TYPES, MODULE_NAME, TOKEN_AURAS_FLAG } from "../consts.mjs";

/**
 * @typedef {Object} Aura
 * @property {string} id
 * @property {string} name
 * @property {boolean} enabled
 * @property {boolean} gridAligned
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
 */

/**
 * Gets the auras that are present on the given token.
 * @param {Token | TokenDocument} token
 * @return {Aura[]}
 */
export function getTokenAuras(token) {
	const tokenDoc = token instanceof Token ? token.document : token;
	return tokenDoc.getFlag(MODULE_NAME, TOKEN_AURAS_FLAG) ?? [];
}

/** @type {Omit<Aura, "id">} */
export const auraDefaults = {
	name: "New Aura",
	enabled: true,
	gridAligned: true,
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
	fillTextureScale: { x: 100, y: 100 }
};

/** @returns {Aura} */
export function createAura() {
	return { ...auraDefaults, id: foundry.utils.randomID() };
}
