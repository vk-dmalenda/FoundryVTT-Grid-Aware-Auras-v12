> [!NOTE]
> This page is only relevant to macro, script or module developers that want to integrate with Grid-Aware Auras.

# API

Coming soon!

# Hooks

- [`gridAwareAuras.enterLeaveAura`](#gridawareaurasenteraura)

## gridAwareAuras.enterLeaveAura

This hook fires when a token enters or leaves another token's aura.

If a token enters/leaves multiple auras at the same time, this hook will be called multiple times, once for each entry/exit.

In the options argument, there is an `isPreview` flag which indicates whether or not the hook fired because of part of a drag to move a token. Note that when dealing with previews, when the preview token is first created, if it is within an aura it will immediately call an 'enter' hook. When the drag is released and the preview destroyed, it will call a 'leave' hook. When dragging and dropping a token into an aura, the preview exit hook will fire before the non-preview enter hook.

Enter hooks are called for every token/aura when a scene is loaded. Leave hooks are _not_ called when the scene is unloaded.

Disabled auras will trigger an enter hook when they become enabled if tokens are in their radius. Likewise they will trigger a leave hook when they become disabled for any tokens in their radius. Apart from these two cases, disabled auras will not trigger any hooks.

### Arguments

|Name|Type|Description|
|-|-|-|
|`token`|`Token`|The token that entered/left another token's aura. This is the token that does NOT have that aura.|
|`parent`|`Token`|The token that owns the aura which the other token entered/left.|
|`aura`|[`AuraConfig`](#auraconfig)|The metadata about the aura that was entered/left.|
|`options`|`Object`|Additional information about the entry/exit event.|
|`options.hasEntered`|`boolean`|True if this hook was called because the token entered the aura; False if this hook was called because the token left the aura.|
|`options.isPreview`|`boolean`|True if this hook was called because of a preview token.|
|`options.isInit`|`boolean`|True if this entry happened when a scene was initialised. This can only be true when `options.hasEntered` is also true.|
|`options.userId`|`string`|The ID of the user that triggered the enter/leave hook to be called.|

### Example

In this example, a token's light emission is changed to represent being on shielded when entering an aura called "Shield Aura", and removed when the token leaves.

```js
Hooks.on("gridAwareAuras.enterLeaveAura", async (token, parent, aura, options) => {
	// We don't want to apply this status to preview tokens
	if (options.isPreview) {
		return;
	}

	// We only care about "Shield Aura" auras
	if (aura.name !== "Shield Aura") {
		return;
	}

	const light = options.hasEntered
		? {
			dim: 1,
			bright: 0.5,
			color: "#00ffff",
			animation: { type: "grid", speed: 8, intensity: 8 }
		}
		: {
			dim: 0,
			bright: 0
		};

	await token.document.update({ light });
});
```

# Types

## AuraConfig

Defines metadata about an aura.

|Name|Type|Description|
|-|-|-|
|`id`|`string`|Unique ID for the aura.|
|`name`|`string`|Name of the aura.|
|`enabled`|`boolean`|Whether this aura is enabled or not. Disabled auras do not trigger hooks.|
|`radius`|`number`|Radius of the aura measured in grid cells.|
|`lineType`|`number`|Type of line used for the border of the aura. 0 = None, 1 = Solid, 2 = Dashed.|
|`lineWidth`|`number`|Width of the line used for the border of the aura.|
|`lineColor`|`string`|Color of the line used for the border of the aura.|
|`lineOpacity`|`number`|Opacity of the line used for the border of the aura. Ranges from 0-1 where 0 is transparent and 1 is opaque.|
|`lineDashSize`|`number`|When `lineType` is _Dashed_, the size of the filled segments of the line.|
|`lineGapSize`|`number`|When `lineType` is _Dashed_, the size of the gap between filled segments.|
|`fillType`|`number`|Type of fill used in the area of the aura. 0 = None, 1 = Solid, 2 = Pattern.|
|`fillColor`|`string`|Color of the fill used for the area of the aura.|
|`fillOpacity`|`number`|Opacity of the full used for the area of the aura. Ranges from 0-1 where 0 is transparent and 1 is opaque.|
|`fillTexture`|`string`|When `fillType` is _Pattern_, the URL of the image to use as a texture pattern.|
|`fillTextureOffset`|`{ x: number; y: number; }`|When `fillType` is _Pattern_, an offset (in pixels) for the texture.|
|`fillTextureScale`|`{ x: number; y: number; }`|When `fillType` is _Pattern_, a scale (in percent) for the texture. A value of 100 is the default and means no scaling. A value of 50 would mean to shrink the texture by half in that axis.|
|`ownerVisibility`|[`VisibilityConfig`](#visibilityconfig)|The booleans that determine when the aura is visible to owners of the token.|
|`nonOwnerVisibility`|[`VisibilityConfig`](#visibilityconfig)|The booleans that determine when the aura is visible to non-owners of the token.|

## VisibilityConfig

|Name|Type|Description|
|-|-|-|
|default|`boolean`|Whether the aura should be visible when no other states are applicable.|
|hovered|`boolean`|Whether the aura should be visible when hovered.|
|controlled|`boolean`|Whether the aura should be visible when controlled.|
|dragging|`boolean`|Whether the aura should be visible when being dragged.|
|targeted|`boolean`|Whether the aura should be visible when targeted.|
|turn|`boolean`|Whether the aura should be visible when it is that token's turn in a combat encounter.|
