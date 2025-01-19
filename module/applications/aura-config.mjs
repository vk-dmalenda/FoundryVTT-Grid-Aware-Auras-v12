/** @import { Aura } from ("../utils/aura.mjs"); */
import { AURA_VISIBILITY_MODES, LINE_TYPES, MODULE_NAME } from "../consts.mjs";
import { auraVisibilityModeMatrices, getAura } from "../utils/aura.mjs";
import { partialEqual } from "../utils/misc-utils.mjs";

export class AuraConfigApplication extends FormApplication {

	/** @type {((aura: Aura) => void) | undefined} */
	onChange;

	/** @type {(() => void) | undefined} */
	onClose;

	constructor(aura, options = {}) {
		super(aura, options);
	}

	/** @override */
	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			title: "Aura Configuration",
			classes: ["sheet", "grid-aware-auras-aura-config"],
			template: `modules/${MODULE_NAME}/templates/aura-config.hbs`,
			width: 360,
			height: "auto",
			tabs: [{ navSelector: ".tabs", contentSelector: "form" }],
			submitOnChange: true,
			closeOnSubmit: false,
			submitOnClose: false
		});
	}

	/** @override */
	get id() {
		return `gaa-aura-config-${this.object.id}`;
	}

	/** @override */
	async getData(options = {}) {
		const data = await super.getData(options);

		// Apply default values for fields if they are unset
		data.object = getAura(this.object);

		data.visibilityMode = this.#getVisibilityMode(data.object.ownerVisibility, data.object.nonOwnerVisibility);

		data.lineTypes = Object.fromEntries(Object.entries(LINE_TYPES)
			.map(([name, value]) => [value, `GRIDAWAREAURAS.LineType${name.titleCase()}`]));

		data.fillTypes = Object.fromEntries(Object.entries(CONST.DRAWING_FILL_TYPES)
			.map(([name, value]) => [value, `DRAWING.FillType${name.titleCase()}`]));

		data.visibilityModes = AURA_VISIBILITY_MODES;

		return data;
	}

	/** @override */
	activateListeners(html) {
		super.activateListeners(html);
		html.find("[data-action='close']").on("click", () => this.close());

		// Prevent negative or decimals from being entered into the radius.
		html.find("[name='radius']").on("input", e => {
			const newValue = parseInt(e.target.value);
			e.target.value = isNaN(newValue) ? 0 : Math.max(newValue, 0);
		});

		// Disable/enable visibility custom fieldset depending on selected visibility mode
		html.find("[name='visibilityMode']").on("change", e => {
			const newMode = e.target.value;
			const isCustom = newMode === "CUSTOM";

			html.find("[name='visibilityCustom']").toggleClass("disabled", !isCustom);

			if (!isCustom) {
				const preset = auraVisibilityModeMatrices[newMode];
				Object.entries(preset.owner).forEach(([key, value]) => html.find(`[name="ownerVisibility.${key}"]`).prop("checked", value));
				Object.entries(preset.nonOwner).forEach(([key, value]) => html.find(`[name="nonOwnerVisibility.${key}"]`).prop("checked", value));
			}
		});
	}

	/** @override */
	async _updateObject(_event, formData) {
		const aura = foundry.utils.expandObject(formData);
		delete aura.visibilityMode;
		this.onChange?.(aura);
	}

	/** @override */
	async close(options) {
		if (options?.callOnClose !== false)
			this.onClose?.();
		await super.close(options);
	}

	/**
	 * @param {import("../utils/aura.mjs").VisibilityConfig} ownerVisibility
	 * @param {import("../utils/aura.mjs").VisibilityConfig} nonOwnerVisibility
	 * @returns {AURA_VISIBILITY_MODES}
	 */
	#getVisibilityMode(ownerVisibility, nonOwnerVisibility) {
		for (const [mode, modeConfig] of Object.entries(auraVisibilityModeMatrices)) {
			if (partialEqual(ownerVisibility, modeConfig.owner) && partialEqual(nonOwnerVisibility, modeConfig.nonOwner))
				return mode;
		}
		return "CUSTOM";
	}
}
