// Plain values only — safe to import from SSR code (no @wordpress runtime).
export const RIYASAT_CATEGORY = "riyasat-blocks";

// Block names match the saved JSON / mobile contract.
export const IMAGE_CAROUSEL_BLOCK = "core/image-carousel";
export const IMAGE_CAROUSEL_ITEM_BLOCK = "core/image-carousel-item";

export const TRUST_BADGES_BLOCK = "core/trust-badges";
export const TRUST_BADGES_ITEM_BLOCK = "core/trust-badges-item";

export const IMAGE_SLIDER_BLOCK = "core/image-slider";
export const IMAGE_SLIDER_ITEM_BLOCK = "core/image-slider-item";

export const PRODUCT_SCROLLER_BLOCK = "core/product-scroller";

export const FREE_CONSULTATION_BLOCK = "core/free-consultation";

export const EDITORS_PICK_BLOCK = "core/editors-pick";
export const EDITORS_PICK_ITEM_BLOCK = "core/editors-pick-item";

export const VISIT_OUR_STORES_BLOCK = "core/visit-our-stores";
export const VISIT_OUR_STORES_ITEM_BLOCK = "core/visit-our-stores-item";

export const INSTA_FEED_BLOCK = "core/insta-feed";
export const INSTA_FEED_ITEM_BLOCK = "core/insta-feed-item";

export const CLIENT_STORIES_BLOCK = "core/client-stories";
export const CLIENT_STORIES_ITEM_BLOCK = "core/client-stories-item";

export const SHOP_THE_LOOK_BLOCK = "core/shop-the-look";
export const SHOP_THE_LOOK_ITEM_BLOCK = "core/shop-the-look-item";

export const OCCASION_BLOCK = "core/occasion";
export const OCCASION_TAB_BLOCK = "core/occasion-tab";
export const OCCASION_TAB_ITEM_BLOCK = "core/occasion-tab-item";

export const CATEGORIES_SCROLLER_BLOCK = "core/categories-scroller";
export const CATEGORIES_SCROLLER_ITEM_BLOCK = "core/categories-scroller-item";

export const HERO_BANNER_SLIDER_BLOCK = "core/hero-banner-slider";
export const HERO_BANNER_SLIDER_ITEM_BLOCK = "core/hero-banner-slider-item";

export const OCCASION_CARDS_GRID_BLOCK = "core/occasion-cards-grid";
export const OCCASION_CARD_ITEM_BLOCK = "core/occasion-card-item";

export const READY_TO_SHIP_BANNER_BLOCK = "core/ready-to-ship-banner";
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
  TRUST_BADGES_BLOCK,
  TRUST_BADGES_ITEM_BLOCK,
  IMAGE_SLIDER_BLOCK,
  IMAGE_SLIDER_ITEM_BLOCK,
  PRODUCT_SCROLLER_BLOCK,
  FREE_CONSULTATION_BLOCK,
  EDITORS_PICK_BLOCK,
  EDITORS_PICK_ITEM_BLOCK,
  VISIT_OUR_STORES_BLOCK,
  VISIT_OUR_STORES_ITEM_BLOCK,
  INSTA_FEED_BLOCK,
  INSTA_FEED_ITEM_BLOCK,
  CLIENT_STORIES_BLOCK,
  CLIENT_STORIES_ITEM_BLOCK,
  SHOP_THE_LOOK_BLOCK,
  SHOP_THE_LOOK_ITEM_BLOCK,
  OCCASION_BLOCK,
  OCCASION_TAB_BLOCK,
  OCCASION_TAB_ITEM_BLOCK,
  CATEGORIES_SCROLLER_BLOCK,
  CATEGORIES_SCROLLER_ITEM_BLOCK,
  HERO_BANNER_SLIDER_BLOCK,
  HERO_BANNER_SLIDER_ITEM_BLOCK,
  OCCASION_CARDS_GRID_BLOCK,
  OCCASION_CARD_ITEM_BLOCK,
  READY_TO_SHIP_BANNER_BLOCK,
  STANDARD_BANNER_BLOCK,
  STANDARD_VIDEO_BLOCK,
  STANDARD_SPACER_BLOCK,
  STANDARD_SELECTED_PRODUCTS_BLOCK,
];
