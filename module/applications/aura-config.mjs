/** @import { Aura } from ("../utils/aura.mjs"); */
import { LINE_TYPES, MODULE_NAME } from "../consts.mjs";
import { getAura } from "../utils/aura.mjs";

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

		data.lineTypes = Object.fromEntries(Object.entries(LINE_TYPES)
			.map(([name, value]) => [value, `GRIDAWAREAURAS.LineType${name.titleCase()}`]));

		data.fillTypes = Object.fromEntries(Object.entries(CONST.DRAWING_FILL_TYPES)
			.map(([name, value]) => [value, `DRAWING.FillType${name.titleCase()}`]));

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
	}

	/** @override */
	async _updateObject(_event, formData) {
		const aura = foundry.utils.expandObject(formData);
		this.onChange?.(aura);
	}

	/** @override */
	async close(options) {
		if (options?.callOnClose !== false)
			this.onClose?.();
		await super.close(options);
	}
}
