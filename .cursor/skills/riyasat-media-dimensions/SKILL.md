---
name: riyasat-media-dimensions
description: >-
  Auto image width/height from media library (hidden UI, saved in block JSON) and
  video upload via MediaUpload. Use when porting Riyasat CMS media behavior to
  another project, fixing video upload in gutenberg-block-kit, or auditing blocks
  for manual width/height fields.
---

# Riyasat media dimensions & video upload

Portable recipe for the media changes in this repo:

1. **Images** — auto-set `imageWidth` / `imageHeight` from `media.width` /
   `media.height` on select; **no** manual width/height inspector fields.
2. **Videos** — use `MediaUpload` with `allowedTypes={['video']}` (not a raw
   `<input type="file">`).
3. **Kit patch** — fix `gutenberg-block-kit` so video files without a browser
   MIME type still pass validation.

Reference implementation: `app/blocks/inspector-shared.jsx`, `app/blocks/banner/index.jsx`,
`app/blocks/video/index.jsx`.

---

## When to use

- User asks to hide image width/height fields but keep values in API JSON.
- User asks to enable video upload in the CMS editor.
- Porting the Riyasat block editor to another Shopify CMS app using
  `gutenberg-block-kit`.
- Auditing blocks after adding a new image picker.

---

## 1. Shared helpers (`inspector-shared.jsx`)

Add and export:

```javascript
export function imageAttributesFromMedia(media, urlKey = 'imageUrl') {
  return {
    [urlKey]: media?.url ?? '',
    imageWidth: media?.width ?? 0,
    imageHeight: media?.height ?? 0,
  };
}

export function clearImageAttributes(urlKey = 'imageUrl') {
  return {
    [urlKey]: '',
    imageWidth: 0,
    imageHeight: 0,
  };
}
```

**ImagePicker** must pass the full `media` object (not just `media.url`):

```javascript
onSelect={(media) => onSelect(media)}
```

Callers use:

```javascript
onSelect={(media) => setAttributes(imageAttributesFromMedia(media))}
onClear={() => setAttributes(clearImageAttributes())}
```

For non-`imageUrl` keys (icon, thumbnailUrl):

```javascript
imageAttributesFromMedia(media, 'thumbnailUrl')
clearImageAttributes('thumbnailUrl')
```

Parent blocks with `updateBlockAttributes`:

```javascript
updateBlockAttributes(block.clientId, imageAttributesFromMedia(media))
updateBlockAttributes(block.clientId, clearImageAttributes())
```

---

## 2. Block attributes

Every block (or child item) with an image URL also needs:

```javascript
imageWidth: { type: 'number', default: 0 },
imageHeight: { type: 'number', default: 0 },
```

**Do not** add `TextControl` for width/height in the inspector.

**Media object blocks** (`media: { url, type }`) — extend `onSelectMedia`:

```javascript
media: {
  url: selected?.url ?? '',
  type: selected?.mime ?? '',
  width: selected?.width ?? 0,
  height: selected?.height ?? 0,
}
```

**Video block** — auto height from thumbnail/video, no manual Height field:

```javascript
function getVideoAttributesFromMedia(media) {
  return {
    videoUrl: media?.url ?? media?.source_url ?? '',
    height: media?.height > 0 ? media.height : DEFAULT_HEIGHT,
  };
}
```

Thumbnail select:

```javascript
setAttributes({
  thumbnailUrl: getPickedMediaUrl(media),
  height: media?.height > 0 ? media.height : DEFAULT_HEIGHT,
})
```

---

## 3. Replace old patterns (grep targets)

| Find | Replace with |
|------|----------------|
| `onSelect={(url) => setAttributes({ imageUrl: url })}` | `onSelect={(media) => setAttributes(imageAttributesFromMedia(media))}` |
| `onClear={() => setAttributes({ imageUrl: '' })}` | `onClear={() => setAttributes(clearImageAttributes())}` |
| `setAttributes({ imageUrl: media?.url ?? '' })` | `setAttributes(imageAttributesFromMedia(media))` |
| `setAttributes({ icon: media?.url ?? '' })` | `setAttributes(imageAttributesFromMedia(media, 'icon'))` |
| Custom `<input type="file">` for video | `MediaUpload` + `allowedTypes={['video']}` |

**Skip** layout-only height (e.g. Spacer block) — not image-derived.

---

## 4. Editor shell — MIME inference on upload

`uploadImage` passed to `gutenberg-block-kit` must normalize files before POST:

```typescript
import { withInferredMimeType } from "../lib/media-mime";

const uploadImage = useCallback(async (file: File) => {
  const body = new FormData();
  body.append("file", withInferredMimeType(file));
  // POST /api/cms/media ...
}, []);
```

Backend (`shopify-files.server.ts`) already supports video via staged upload;
`listImages` returns items with `type: "video"` and `mimeType`.

---

## 5. gutenberg-block-kit video validation patch

Stock kit rejects video uploads when `file.type` is empty (common for `.mov` /
`.mp4`). Patch **both** dist bundles (names vary by version):

- `node_modules/gutenberg-block-kit/dist/App-*.mjs`
- `node_modules/gutenberg-block-kit/dist/App-*.js`

Apply `gutenberg-block-kit-media.patch` from this skill folder:

```bash
cd node_modules/gutenberg-block-kit
patch -p1 < ../../.claude/skills/riyasat-media-dimensions/gutenberg-block-kit-media.patch
```

Or use `patch-package` and commit the patch under `patches/` so it survives
`npm install`.

**Long-term:** upgrade `gutenberg-block-kit` when upstream includes the same fix.

---

## 6. Blocks to update (this repo)

Child / item blocks with `imageUrl`:

- carousel, image-slider, visit-our-stores, insta-feed, editors-pick,
  categories-scroller, hero-banner-slider, client-stories, occasion-cards-grid,
  occasion

Other:

- `banner` — `imageUrl` (reference)
- `trust-badges` — `icon` key
- `shop-the-look` — `thumbnailUrl` key
- `free-consultation`, `ready-to-ship-banner` — `media` object
- `video` — `MediaUpload` + `allowedTypes={['video']}`

---

## Validation checklist

Run after porting to a new project:

### Code audit

```bash
# No manual image dimension fields left
rg 'label="Image (width|height)"' app/blocks

# No ImagePicker still passing URL string only
rg 'onSelect=\{\(url\)' app/blocks

# All MediaUpload image handlers use helpers
rg "imageUrl: media\?\.url" app/blocks   # should be empty

# Video blocks use MediaUpload, not raw file input for primary flow
rg 'type="file".*video|SHOPIFY_VIDEO_ACCEPT' app/blocks/video
```

### Attributes

- [ ] Each image child block has `imageWidth` + `imageHeight` attributes.
- [ ] `onSelect` sets dimensions from `media.width` / `media.height`.
- [ ] `onClear` resets dimensions to `0`.
- [ ] No width/height `TextControl` in inspector (except Spacer / layout).

### Editor wiring

- [ ] `media={{ listImages, uploadImage }}` passed to block editor.
- [ ] `uploadImage` uses `withInferredMimeType(file)`.
- [ ] API `/api/cms/media` POST accepts video (Shopify staged upload).

### Kit patch

- [ ] `inferMimeFromFilename` exists in `gutenberg-block-kit` dist.
- [ ] `matchesAllowedTypes` handles `type === "video"` and `item.type === "video"`.
- [ ] `fileMatchesAllowedTypes` infers MIME from filename before rejecting.

### Manual test

- [ ] Pick image → saved JSON includes `imageWidth` / `imageHeight`.
- [ ] Inspector shows no width/height fields.
- [ ] Video block: Add video → library + Upload tab accept `.mp4` / `.mov`.
- [ ] Free consultation / ready-to-ship: video in `allowedTypes={['image','video']}`.

### Build

```bash
npx react-router build   # or project build command
```

---

## Related skills

- `riyasat-block-builder` — new blocks; use `imageAttributesFromMedia` for any
  `image` control in the spec instead of manual dimension fields.
