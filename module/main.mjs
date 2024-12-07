import { HexAuraLayer } from "./hex-aura-graphics.mjs";
import { onRenderTokenConfig } from "./token-aura-config.mjs";

Hooks.once("init", () => {
	CONFIG.Canvas.layers.hexAuraLayer = { group: "interface", layerClass: HexAuraLayer };
});

Hooks.on("destroyToken", token => {
	HexAuraLayer.current?.destroyToken(token);
});

Hooks.on("refreshToken", (token, { refreshPosition, refreshVisibility }) => {
	if (refreshPosition || refreshVisibility)
		HexAuraLayer.current?.updateToken(token);
});

Hooks.on("renderTokenConfig", onRenderTokenConfig);
