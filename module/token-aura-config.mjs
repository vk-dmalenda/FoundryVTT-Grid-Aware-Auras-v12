import { MODULE_NAME, TOKEN_AURAS_FLAG } from "./consts.mjs";

export function onRenderTokenConfig({ object: tokenDocument }, jq) {

	const auras = tokenDocument.getFlag(MODULE_NAME, TOKEN_AURAS_FLAG) ?? [];

	// Insert a tab for the new control
	jq.find("form > nav.sheet-tabs").append(`
		<a class="item" data-tab="hexauras"><i class="far fa-hexagon"></i>${game.i18n.localize("HEXAURAS.HexAuras")}</a>
	`);

	// Render tab content and set up event listeners
	renderTemplate(`modules/${MODULE_NAME}/templates/token-aura-config.hbs`, { auras }).then(html => {
		const content = $(html);
		content.insertBefore(jq.find("form footer"));
	});
}
