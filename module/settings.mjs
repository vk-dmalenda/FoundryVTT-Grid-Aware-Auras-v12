import { MODULE_NAME, SQUARE_GRID_MODE, SQUARE_GRID_MODE_SETTING } from "./consts.mjs";
import { AuraLayer } from "./layers/aura-graphics.mjs";

export function registerSettings() {
	game.settings.register(MODULE_NAME, SQUARE_GRID_MODE_SETTING, {
		name: "SETTINGS.SquareGridMode.Name",
		hint: "SETTINGS.SquareGridMode.Hint",
		scope: "world",
		default: SQUARE_GRID_MODE.EQUIDISTANT,
		type: Number,
		choices: Object.fromEntries(Object.entries(SQUARE_GRID_MODE)
			.map(([name, value]) => [value, `GRIDAWAREAURAS.SquareGridMode${name.titleCase()}`])),
		config: true,
		onChange: () => AuraLayer.current?.redraw()
	});
}
