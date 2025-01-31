import { AuraLayer } from "./layers/aura-layer/aura-layer.mjs";
import { getTokenAuras as getTokenAurasImpl } from "./utils/aura.mjs";
import { toggleEffect as toggleEffectImpl } from "./utils/misc-utils.mjs";

/**
 * For the given token, returns the auras defined on that token.
 * @param {Token | TokenDocument} token
 */
export function getTokenAuras(token) {
	return getTokenAurasImpl(token);
}

/**
 * Returns an array of auras that the given token is currently inside.
 * @param {Token | { id: string; preview: boolean; }} token
 */
export function getAurasContainingToken(token) {
	return (AuraLayer.current?._auraManager.getAurasContainingToken(token) ?? [])
		.map(({ parent, aura }) => ({ parent, aura: aura.config }));
}

/**
 * Returns an array of tokens that are inside the given aura.
 * @param {Token | { id: string; preview: boolean; }} parent The token that owns the aura.
 * @param {string} auraId The ID of the aura to check.
 */
export function getTokensInsideAura(parent, auraId) {
	return AuraLayer.current?._auraManager.getTokensInsideAura(parent, auraId) ?? [];
}

/**
 * Can be used to toggle an effect on a target token or actor. If the user calling the function is able to modify the
 * actor, does so immediately. If the user cannot, the action is delegated to a GM user. If no GMs are present, the
 * action will fail.
 * Requires the 'Enable Effect Automation' setting to be turned on.
 * @param {Token | TokenDocument | Actor | string} target A token, token document, actor, or UUID for a token or actor which the effect will be applied to/removed from.
 * @param {string} effectId The ID of the effect to add to/remove from the target.
 * @param {boolean} state true to apply the effect, or false to remove it.
 * @param {Object} [options]
 * @param {boolean} [options.overlay] Whether to apply the effect as an overlay.
 * @returns {Promise<void>}
 */
export async function toggleEffect(target, effectId, state, { overlay = false } = {}) {
	// Try get the actor from the passed target.
	let actor;
	if (target instanceof Token || target instanceof TokenDocument) {
		actor = target.actor;
	} else if (target instanceof Actor) {
		actor = target;
	} else if (typeof target === "string") {
		const targetFromUuid = await fromUuid(target);
		return await toggleEffect(targetFromUuid, effectId, state, { overlay });
	}

	if (!actor) {
		throw new Error("Could not resolve actor.");
	}

	// Toggle the effect
	await toggleEffectImpl(actor, effectId, !!state, overlay, true);
}
