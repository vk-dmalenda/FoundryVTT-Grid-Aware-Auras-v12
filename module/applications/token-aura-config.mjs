/** @import { Aura } from ("../utils/aura.mjs"); */
import { LINE_TYPES, MODULE_NAME, TOKEN_AURAS_FLAG } from "../consts.mjs";
import { createAura, getTokenAuras } from "../utils/aura.mjs";
import { AuraConfig } from "./aura-config.mjs";

const openAuraConfigs = Symbol("openAuraConfigs");

/**
 * Wrapper for the TokenConfig._renderInner function to add the GAA aura config to it.
 * @param {TokenConfig["_renderInner"]} wrapped
 * @param {Parameters<TokenConfig["_renderInner"]>} args
 * @this {TokenConfig}
 */
export async function tokenConfigRenderInner(wrapped, ...args) {
	const html = await wrapped(...args);

	/** @type {Map<string, AuraConfig>} */
	this[openAuraConfigs] = this[openAuraConfigs] ?? new Map();

	// Insert a tab item for the new control
	html.find("> nav.sheet-tabs").append(`
		<a class="item" data-tab="gridawareauras"><i class="far fa-hexagon"></i> ${game.i18n.localize("GRIDAWAREAURAS.Auras")}</a>
	`);

	// Load template
	const template = await getTemplate(`modules/${MODULE_NAME}/templates/token-aura-config.hbs`);

	// Create the tab content
	const tagContent = $(`<div class="tab" data-group="main" data-tab="gridawareauras"></div>`);
	html.find("> footer").before(tagContent);

	const getCurrentAuras = () => getTokenAuras(this.preview ?? this.document);

	const render = () => {
		const auras = getCurrentAuras();
		const flagPath = `flags.${MODULE_NAME}.${TOKEN_AURAS_FLAG}`;
		tagContent.html(template({
			auras,
			flagPath,
			LINE_TYPES,
			FILL_TYPES: CONST.DRAWING_FILL_TYPES,
			showGridTypeWarning: !this.isPrototype && canvas.grid.type === CONST.GRID_TYPES.GRIDLESS
		}));
		tagContent.find(`[name="${flagPath}"]`).val(JSON.stringify(auras));
		if (this._state === Application.RENDER_STATES.RENDERED)
			this.setPosition();
	};

	render();

	// Setup listeners
	/**
	 * Enriches the event with the aura ID and aura as determined by the [data-aura-id] DOM attribute.
	 * @param {(e: Event, auraId: number, aura: Aura) => void} callback
	 * @returns {(e: Event) => void}
	 */
	const withAura = callback => {
		return e => {
			const { auraId } = e.target.closest("[data-aura-id]").dataset;
			const aura = getCurrentAuras().find(a => a.id == auraId)
			callback(e, auraId, aura);
		};
	};

	/**
	 * Opens a dialog and begins editing the given Aura.
	 * @param {Aura} aura
	 */
	const editAura = aura => {
		if (this[openAuraConfigs].has(aura.id)) return;

		const app = new AuraConfig(aura);
		this[openAuraConfigs].set(aura.id, app);

		app.onChange = newAura => {
			this._previewChanges({
				[`flags.${MODULE_NAME}.${TOKEN_AURAS_FLAG}`]: getCurrentAuras().map(a => a.id === aura.id ? ({ ...a, ...newAura }) : a)
			});
			this.render();
		};

		app.onClose = () => {
			this[openAuraConfigs].delete(aura.id);
		};

		app.render(true);
	};

	tagContent.on("click", "[data-action='grid-aware-auras-add']", () => {
		const aura = createAura();
		editAura(aura);
		this._previewChanges({
			[`flags.${MODULE_NAME}.${TOKEN_AURAS_FLAG}`]: [...getCurrentAuras(), aura]
		});
		render();
	});

	tagContent.on("click", "[data-action='grid-aware-auras-delete']", withAura((_e, auraId) => {
		this._previewChanges({
			[`flags.${MODULE_NAME}.${TOKEN_AURAS_FLAG}`]: getCurrentAuras().filter(a => a.id !== auraId)
		});
		render();
	}));

	tagContent.on("click", "[data-action='grid-aware-auras-config']", withAura((_e, _auraId, aura) => {
		editAura(aura);
	}));

	tagContent.on("change", "[data-action='grid-aware-auras-toggle-enabled']", withAura((_e, auraId) => {
		this._previewChanges({
			[`flags.${MODULE_NAME}.${TOKEN_AURAS_FLAG}`]: getCurrentAuras().map(a => ({
				...a,
				enabled: a.id === auraId ? !a.enabled : a.enabled
			}))
		});
		render();
	}));

	return html;
}

/**
 * Hook for when the TokenConfig dialog is closed.
 * @param {TokenConfig} tokenConfig
 */
export function tokenConfigClose(tokenConfig) {
	/** @type {Map<string, AuraConfig>} */
	const auraConfigs = tokenConfig[openAuraConfigs];
	if (!auraConfigs) return;

	for (const auraConfig of auraConfigs.values())
		auraConfig.close({ callOnClose: false });
}
