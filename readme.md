# Grid-Aware Auras

[![Latest module version](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fgithub.com%2FWibble199%2FFoundryVTT-Grid-Aware-Auras%2Freleases%2Flatest%2Fdownload%2Fmodule.json&query=%24.version&prefix=v&style=for-the-badge&label=module%20version)](https://github.com/Wibble199/FoundryVTT-Grid-Aware-Auras/releases/latest)
![Latest Foundry version](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fgithub.com%2FWibble199%2FFoundryVTT-Grid-Aware-Auras%2Freleases%2Flatest%2Fdownload%2Fmodule.json&query=%24.compatibility.verified&style=for-the-badge&label=foundry%20version&color=fe6a1f)
<br/>
[![GitHub downloads (total)](https://img.shields.io/github/downloads/Wibble199/FoundryVTT-Grid-Aware-Auras/release.zip?style=for-the-badge&label=downloads%20(total))](https://github.com/Wibble199/FoundryVTT-Grid-Aware-Auras/releases/latest)
[![GitHub downloads (latest version)](https://img.shields.io/github/downloads/Wibble199/FoundryVTT-Grid-Aware-Auras/latest/release.zip?style=for-the-badge&label=downloads%20(latest))](https://github.com/Wibble199/FoundryVTT-Grid-Aware-Auras/releases/latest)

A module which draws grid-accurate auras around tokens, which supports any size token and has customisable display styles. Supports the Token Border Supplements (formerly Hex Size Support) module.

![Preview image](./docs/img/preview.png)

## Installation

Simply search for 'Grid-Aware Auras' in the Foundry 'Install Module' screen and install it from there.

Alternatively, paste this URL into the 'Manifest URL' field of the 'Install Module' dialog in the Foundry configuration: `https://github.com/Wibble199/FoundryVTT-Grid-Aware-Auras/releases/latest/download/module.json`, then enable the module in your world.

## Usage

1. First open a token configuration by using the cog button when right-clicking a token on the scene, or open the prototype token configuration for an actor.
2. Then, navigate to the new "Auras" tab, then click the `+` button to create a new aura. You can then set the size of the aura, as well as how you want it to appear to everyone. You can add as many auras as you want!
3. If you need to edit an existing aura, you can click the cog button next to it to edit it. You can also quickly toggle whether that aura is visible by clicking the eye icon.
4. Finally, just click the "Update Token" button.

> [!NOTE]
> For hex grids, GAA only supports cases where the width and height of the token are identical. If this is not the case, the aura will not be shown. Square grids do not have this restriction.

### Square Grids

When dealing with square grids, there are different ways of handling diagonals. You can configure which rules Grid-Aware Auras uses in the module settings. Which one you choose will depend on your game. GAA supports the following:

|Name|Picture|Description|
|-|-|-|
|Equidistant (1/1/1)|![Equidistant example](./docs/img/square-equidistant.png)|In this ruleset, moving diagonally always costs 1 (i.e. the same as moving horizontally or vertically). Therefore, the resulting aura ends up being a large square around the token. For example, this is how D&D5E usually works.|
|Alternating (1/2/1)|![Equidistant example](./docs/img/square-alternating.png)|In this ruleset, the first diagonal costs 1, the second 2, the third 1 again, then 2 again, etc. This is the technique that Pathfinder 2E uses, for example.|
|Manhattan|![Equidistant example](./docs/img/square-manhattan.png)|In this ruleset, diagonals are effectly disallowed. Moving 1 square diagonally would always cost 2 (1 horizontal and 1 vertical).|

_(Numbers are for illustrative purposes only)_

## Roadmap

Features that I will be looking to add to Grid-Aware Auras in future (in rough order of priority):

- [ ] Hooks for when other tokens enter/leave an aura (e.g. to allow applying active effects)
- [ ] Per-aura option to only show it under certain circumstances (e.g. only when token selected, only when dragging, only owner, etc.)
- [ ] Formal API for creating/updating/deleting auras on tokens.
- [ ] Allow auras on items, which will get added to the token when owned by that token's actor.
- [ ] Setting auras by active effects (e.g. allowing effects to alter the range of an aura).
