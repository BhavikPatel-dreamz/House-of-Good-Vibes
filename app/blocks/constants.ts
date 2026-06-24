// Plain values only — safe to import from SSR code (no @wordpress runtime).
export const RIYASAT_CATEGORY = "riyasat-blocks";

// Block names match the saved JSON / mobile contract.
export const IMAGE_CAROUSEL_BLOCK = "core/image-carousel";
export const IMAGE_CAROUSEL_ITEM_BLOCK = "core/image-carousel-item";

export const IMAGE_SLIDER_BLOCK = "core/image-slider";
export const IMAGE_SLIDER_ITEM_BLOCK = "core/image-slider-item";

export const PRODUCT_SCROLLER_BLOCK = "core/product-scroller";

export const CATEGORIES_SCROLLER_BLOCK = "core/categories-scroller";
export const CATEGORIES_SCROLLER_ITEM_BLOCK = "core/categories-scroller-item";

export const STANDARD_BANNER_BLOCK = "standard/banner";
export const STANDARD_VIDEO_BLOCK = "standard/video";
export const STANDARD_SPACER_BLOCK = "standard/spacer";
export const STANDARD_SELECTED_PRODUCTS_BLOCK = "standard/selected-products";

/**
 * Blocks kept registered + insertable. Everything else (all WP core blocks) is
 * unregistered in index.ts; the kit's myapp/* demos are dropped via
 * `disableBundledBlocks`. Add a new block's name here when you add it.
 */
export const RIYASAT_BLOCKS = [
  IMAGE_CAROUSEL_BLOCK,
  IMAGE_CAROUSEL_ITEM_BLOCK,
  IMAGE_SLIDER_BLOCK,
  IMAGE_SLIDER_ITEM_BLOCK,
  PRODUCT_SCROLLER_BLOCK,
  CATEGORIES_SCROLLER_BLOCK,
  CATEGORIES_SCROLLER_ITEM_BLOCK,
  STANDARD_BANNER_BLOCK,
  STANDARD_VIDEO_BLOCK,
  STANDARD_SPACER_BLOCK,
  STANDARD_SELECTED_PRODUCTS_BLOCK,
];
