import { tokenConfigClose, tokenConfigRenderInner } from "./applications/token-aura-config.mjs";
import { MODULE_NAME } from "./consts.mjs";
import { AuraLayer } from "./layers/aura-graphics.mjs";

Hooks.once("init", () => {
	CONFIG.Canvas.layers.gaaAuraLayer = { group: "primary", layerClass: AuraLayer };

	// Wrap the default TokenConfig instead of using the renderTokenConfig hook because the latter does not run when the
	// config is re-rendered, and it can cause the tab to disappear :(
	libWrapper.register(MODULE_NAME, "TokenConfig.prototype._renderInner", tokenConfigRenderInner, libWrapper.WRAPPER);

	// When the TokenConfig closes, close any opened aura configs
	Hooks.on("closeTokenConfig", tokenConfigClose);

	// Wrap getSubmitData so that the object is saved as an array.
	//libWrapper.register(MODULE_NAME, "TokenConfig.prototype._getSubmitData", tokenConfigGetSubmitData, libWrapper.WRAPPER);
});

Hooks.on("updateToken", tokenDocument => {
	const token = game.canvas.tokens.get(tokenDocument.id);
	if (token) AuraLayer.current?.updateToken(token);
})

Hooks.on("refreshToken", (token, { refreshPosition, refreshVisibility }) => {
	if (refreshPosition || refreshVisibility)
		AuraLayer.current?.updateToken(token);
});

Hooks.on("destroyToken", token => {
	AuraLayer.current?.destroyToken(token);
});
