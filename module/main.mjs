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

	Hooks.on("gridAwareAuras.enterAura", (t1, t2, aura, args) => console.log(`${t1.name} entered ${t2.name}'s ${aura.name} aura.`, args));
	Hooks.on("gridAwareAuras.leaveAura", (t1, t2, aura, args) => console.log(`${t1.name} left ${t2.name}'s ${aura.name} aura.`, args));
});

Hooks.on("updateToken", (tokenDocument) => {
	const token = game.canvas.tokens.get(tokenDocument.id);
	if (token) AuraLayer.current?._updateToken(token);
})

Hooks.on("refreshToken", (token, { refreshPosition, refreshVisibility }) => {
	if (refreshPosition || refreshVisibility)
		AuraLayer.current?._updateToken(token);
});

Hooks.on("destroyToken", token => {
	AuraLayer.current?._destroyToken(token);
});

Hooks.on("canvasTearDown", () => {
	// Need to set the flag in a canvasTearDown instead of in AuraLayer's own tear-down because the TokenLayer tear-down
	// happens before the AuraLayer's.
	if (AuraLayer.current)
		AuraLayer.current._isTearingDown = true;
});

Hooks.on("closeTokenConfig", tokenConfigClose);
