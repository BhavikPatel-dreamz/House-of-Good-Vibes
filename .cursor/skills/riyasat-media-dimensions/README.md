# riyasat-media-dimensions

Portable guide for auto image dimensions + video upload in Riyasat CMS projects.

| File | Purpose |
|------|---------|
| [SKILL.md](./SKILL.md) | Full porting steps + validation checklist |
| [gutenberg-block-kit-media.patch](./gutenberg-block-kit-media.patch) | Patch for video MIME validation in the kit |

## Quick apply (another project)

1. Copy helpers from `SKILL.md` §1 into your `inspector-shared` (or equivalent).
2. Update blocks per §2–§3; run validation grep commands in §Validation checklist.
3. Patch the kit:

```bash
cd node_modules/gutenberg-block-kit
# Adjust filename if dist bundle hash differs (App-*.mjs / App-*.js)
patch -p1 < /path/to/riyasat-media-dimensions/gutenberg-block-kit-media.patch
```

If the patch fails (different kit version), apply the logic manually from
`SKILL.md` §5 or copy the functions from this repo’s
`node_modules/gutenberg-block-kit/dist/App-*.mjs` after a successful apply here.
