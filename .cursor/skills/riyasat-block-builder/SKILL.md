---
name: riyasat-block-builder
description: Build a Gutenberg block for the Riyasat Shopify CMS from a block spec + sample JSON. Trigger when the user pastes a block spec (lines like "#core/<name>" with "- attr(control)"), provides saved block JSON, or asks to add/create/build a new CMS block or section. Authoritative recipe lives in app/blocks/README.md.
---

# Riyasat block builder

Generate a `gutenberg-block-kit` block for this app's CMS from a spec, the same
way the existing blocks were built. Optimize for low back-and-forth.

## On invocation

1. **Read `app/blocks/README.md`** — it holds the architecture, SSR rule,
   conventions, the control→component map, the 3 steps, and copy-paste
   templates. Follow it exactly. Do NOT re-investigate the kit internals.
2. Parse the user's spec. Expected shape (one or two blocks):
   ```
   Block name: <Human title>
   #core/<name>
   - <attr>(<control type>)
   #core/<name>-item        (only when JSON has innerBlocks)
   - <attr>(<control type>)
   <sample saved JSON>
   ```
   - JSON has `innerBlocks` with items → **parent + child** (`core/<x>` +
     `core/<x>-item`, child `parent:[...]`, registers first).
   - JSON `innerBlocks: []` → **single block**.
3. Map every control via the README table (text→TextControl,
   text area→TextareaControl, toggle→ToggleControl, color→PanelColorSettings,
   image→MediaUpload + `imageAttributesFromMedia` (see
   `riyasat-media-dimensions` skill — auto width/height, no manual fields),
   image/video→MediaUpload `allowedTypes:['image','video']`
   storing `{url,type:mime}`, action→ActionBuilder default `{}`,
   collection→`window.shopify.resourcePicker`, innerBlocks→InnerBlocks).
4. Match attribute names + defaults to the sample JSON exactly (the JSON is the
   mobile contract). Object attrs (`action`/`media`/`collection`) default `{}`.

## The 3 edits (per README)

1. `app/blocks/constants.ts` — add `<NAME>_BLOCK` (+ `_ITEM`) and append to
   `RIYASAT_BLOCKS`.
2. `app/blocks/<kebab>/index.jsx` — `// @ts-nocheck`; import only from
   `gutenberg-block-kit/wp/*` + `gutenberg-block-kit/actions` + `../constants`;
   export `register<Name>()`.
3. `app/blocks/index.ts` — import + call `register<Name>()` inside the
   `registerBlocks` callback, before the unregister sweep.

## Verify (always run, report results)

```
npx tsc --noEmit -p tsconfig.json     # only the pre-existing cms.server.ts error is allowed
npx react-router build                 # must exit 0
grep -rl "wp-runtime" build/server/   # must print nothing — SSR clean
```

## Hard rules

- Never import `@wordpress/*` directly — use `gutenberg-block-kit/wp/*` (shared
  singleton; direct import = different registry, block won't appear).
- Block files + the barrel are **client-only**. Never static-import them from SSR
  code. `constants.ts` stays plain strings.
- `save()` emits `data-*` JSON (`data-action`, `data-media`, etc.) + classes
  `riyasat-<name>__*`. Don't write storefront CSS unless asked.
- Names are `core/<name>` to match the saved JSON / mobile contract.

Reference implementations: `app/blocks/{carousel,trust-badges,image-slider,product-scroller,free-consultation,editors-pick}/index.jsx`.
