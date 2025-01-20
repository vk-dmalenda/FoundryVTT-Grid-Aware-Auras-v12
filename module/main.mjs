import { tokenConfigClose, tokenConfigRenderInner } from "./applications/token-aura-config.mjs";
import { MODULE_NAME } from "./consts.mjs";
import { AuraLayer } from "./layers/aura-layer.mjs";
import { registerSettings } from "./settings.mjs";

Hooks.once("init", () => {
	registerSettings();

	CONFIG.Canvas.layers.gaaAuraLayer = { group: "primary", layerClass: AuraLayer };

	// Wrap the default TokenConfig instead of using the renderTokenConfig hook because the latter does not run when the
	// config is re-rendered, and it can cause the tab to disappear :(
	libWrapper.register(MODULE_NAME, "TokenConfig.prototype._renderInner", tokenConfigRenderInner, libWrapper.WRAPPER);
});

Hooks.on("updateToken", (tokenDocument) => {
	const token = game.canvas.tokens.get(tokenDocument.id);
	if (token && AuraLayer.current) {
		AuraLayer.current._updateToken(token);
		AuraLayer.current._testCollisionsForToken(token);
	}
})

// When token moves or is made visible/hidden, update the aura position and visibility
Hooks.on("refreshToken", (token, { refreshPosition, refreshVisibility }) => {
	if (refreshPosition || refreshVisibility) {
		AuraLayer.current?._updateToken(token);

		// If the token is a drag preview, then we test collisions (using the position of the preview). We don't test
		// collisions for non-preview tokens, because then it constantly fires when the token is animating for example.
		if (token.isPreview) {
			AuraLayer.current?._testCollisionsForToken(token, { useActualPosition: true });
		}
	}
});

// When token is hovered/unhovered, we need to check aura visibility
Hooks.on("hoverToken", token => {
	AuraLayer.current?._updateToken(token);
});

// When token is controlled/uncontrolled, we need to check aura visibility
Hooks.on("controlToken", token => {
	AuraLayer.current?._updateToken(token);
});

// When token is targeted/untargeted, we need to check aura visibility
Hooks.on("targetToken", (_user, token) => {
	AuraLayer.current?._updateToken(token);
});

// When combat is updated (e.g. if a turn was changed), we need to check aura visibility
Hooks.on("updateCombat", combat => {
	for (const combatant of combat.combatants) {
		AuraLayer.current?._updateToken(combatant.token);
	}
});

Hooks.on("deleteCombat", combat => {
	for (const combatant of combat.combatants) {
		AuraLayer.current?._updateToken(combatant.token);
	}
});

Hooks.on("destroyToken", token => {
	AuraLayer.current?._destroyToken(token);
});

// Need to set the flag in a canvasTearDown instead of in AuraLayer's own tear-down because the TokenLayer tear-down
// happens before the AuraLayer's.
Hooks.on("canvasTearDown", () => {
	if (AuraLayer.current)
		AuraLayer.current._isTearingDown = true;
});

Hooks.on("closeTokenConfig", tokenConfigClose);
