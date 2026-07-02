// @ts-nocheck
// Hero/Image carousel — parent (core/image-carousel) + child slide
// (core/image-carousel-item) using InnerBlocks. Authored against the kit's
// shared @wordpress runtime so registerBlockType() hits the editor's registry.
// Called from ../index.ts inside registerBlocks().
import { useState } from 'gutenberg-block-kit/wp/element';
import { registerBlockType, createBlock } from 'gutenberg-block-kit/wp/blocks';
import {
  useBlockProps,
  InnerBlocks,
  InspectorControls,
  MediaUpload,
  MediaUploadCheck,
  PanelColorSettings,
} from 'gutenberg-block-kit/wp/block-editor';
import { PanelBody, ToggleControl, Button } from 'gutenberg-block-kit/wp/components';
import { ActionBuilder } from 'gutenberg-block-kit/actions';
import {
  contentTabStyle,
  ImagePicker,
  imageAttributesFromMedia,
  clearImageAttributes,
  useChildBlocks,
  useCarouselPagination,
  SliderPaginationDots,
} from '../inspector-shared';
import {
  IMAGE_CAROUSEL_BLOCK,
  IMAGE_CAROUSEL_ITEM_BLOCK,
  RIYASAT_CATEGORY,
} from '../constants';

const DEFAULT_ACTIVE_DOT_COLOR = 'rgba(255, 255, 255, 1)';
const DEFAULT_INACTIVE_DOT_COLOR = 'rgba(255, 255, 255, 0.7)';
const DEFAULT_BACKGROUND_COLOR = '#ffffff';

function getCarouselDotColors(activeDotColor, inactiveDotColor) {
  return {
    '--riyasat-pagination-active': activeDotColor || DEFAULT_ACTIVE_DOT_COLOR,
    '--riyasat-pagination-inactive': inactiveDotColor || DEFAULT_INACTIVE_DOT_COLOR,
  };
}

function CarouselIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="24"
      height="24"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="currentColor"
        d="M4 5h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2zm0 2v9h16V7H4z"
      />
      <circle cx="9" cy="19.5" r="1.1" fill="currentColor" />
      <circle cx="12" cy="19.5" r="1.1" fill="currentColor" />
      <circle cx="15" cy="19.5" r="1.1" fill="currentColor" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Child: core/image-carousel-item — one slide (image + tap action)
// ---------------------------------------------------------------------------
function registerCarouselItem() {
  registerBlockType(IMAGE_CAROUSEL_ITEM_BLOCK, {
    apiVersion: 3,
    title: 'Carousel Slide',
    description: 'A single image slide with optional tap action.',
    category: RIYASAT_CATEGORY,
    parent: [IMAGE_CAROUSEL_BLOCK],
    icon: 'format-image',
    supports: { html: false, reusable: false },
    attributes: {
      imageUrl: { type: 'string', default: '' },
      imageWidth: { type: 'number', default: 0 },
      imageHeight: { type: 'number', default: 0 },
      action: { type: 'object', default: {} },
    },

    edit: ({ attributes, setAttributes }) => {
      const { imageUrl, action: rawAction } = attributes;
      const action = rawAction ?? {};
      const blockProps = useBlockProps({
        className: 'riyasat-image-carousel-item-editor',
      });

      return (
        <>
          <InspectorControls group="content">
            <div style={contentTabStyle}>
              <PanelBody title="Slide" initialOpen={true}>
                <ImagePicker
                  imageUrl={imageUrl}
                  onSelect={(media) => setAttributes(imageAttributesFromMedia(media))}
                  onClear={() => setAttributes(clearImageAttributes())}
                />
                <ActionBuilder
                  label="Tap action"
                  value={action}
                  onChange={(next) => setAttributes({ action: next })}
                />
              </PanelBody>
            </div>
          </InspectorControls>

          <div {...blockProps}>
            {imageUrl ? (
              <MediaUploadCheck>
                <MediaUpload
                  onSelect={(media) => setAttributes(imageAttributesFromMedia(media))}
                  allowedTypes={['image']}
                  render={({ open }) => (
                    <img
                      src={imageUrl}
                      alt=""
                      className="riyasat-image-carousel-item-editor__image"
                      onClick={open}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') open();
                      }}
                      role="button"
                      tabIndex={0}
                    />
                  )}
                />
              </MediaUploadCheck>
            ) : (
              <MediaUploadCheck>
                <MediaUpload
                  onSelect={(media) => setAttributes(imageAttributesFromMedia(media))}
                  allowedTypes={['image']}
                  render={({ open }) => (
                    <button
                      type="button"
                      className="riyasat-image-carousel-item-editor__placeholder"
                      onClick={open}
                    >
                      Click to add slide image
                    </button>
                  )}
                />
              </MediaUploadCheck>
            )}
          </div>
        </>
      );
    },

    save: ({ attributes }) => {
      const { imageUrl, action } = attributes;
      const blockProps = useBlockProps.save({
        className: 'riyasat-image-carousel__slide',
        'data-action': JSON.stringify(action ?? {}),
      });
      if (!imageUrl) return <div {...blockProps} />;
      return (
        <div {...blockProps}>
          <img src={imageUrl} alt="" />
        </div>
      );
    },
  });
}

// ---------------------------------------------------------------------------
// Parent: core/image-carousel — holds slides + pagination toggle
// ---------------------------------------------------------------------------
function registerCarouselParent() {
  registerBlockType(IMAGE_CAROUSEL_BLOCK, {
    apiVersion: 3,
    title: 'Hero Carousel',
    description: 'Full-width image carousel with pagination dots.',
    category: RIYASAT_CATEGORY,
    icon: CarouselIcon,
    keywords: ['carousel', 'hero', 'slider', 'images'],
    supports: { html: false, align: ['wide', 'full'] },
    attributes: {
      showPagination: { type: 'boolean', default: true },
      backgroundColor: { type: 'string', default: DEFAULT_BACKGROUND_COLOR },
      activeDotColor: { type: 'string', default: DEFAULT_ACTIVE_DOT_COLOR },
      inactiveDotColor: { type: 'string', default: DEFAULT_INACTIVE_DOT_COLOR },
    },

    edit: ({ attributes, setAttributes, clientId }) => {
      const { showPagination, backgroundColor, activeDotColor, inactiveDotColor } = attributes;
      const dotColors = getCarouselDotColors(activeDotColor, inactiveDotColor);
      const blockProps = useBlockProps({ className: 'riyasat-image-carousel-editor' });
      const [activeIndex, setActiveIndex] = useState(0);
      const { childBlocks, childCount, insertBlock, removeBlock, updateBlockAttributes } =
        useChildBlocks(clientId);
      const { slideCount, goToSlide } = useCarouselPagination(
        clientId,
        activeIndex,
        setActiveIndex,
      );

      return (
        <>
          <InspectorControls group="content">
            <div style={{ padding: '0 16px 16px' }}>
              {childBlocks.map((block, index) => {
                const { imageUrl, action } = block.attributes;
                return (
                  <PanelBody
                    key={block.clientId}
                    title={`Slide ${index + 1}`}
                    initialOpen={false}
                  >
                    <MediaUploadCheck>
                      <MediaUpload
                        onSelect={(media) =>
                          updateBlockAttributes(
                            block.clientId,
                            imageAttributesFromMedia(media),
                          )
                        }
                        allowedTypes={['image']}
                        render={({ open }) => (
                          <div>
                            {imageUrl ? (
                              <div
                                onClick={open}
                                style={{
                                  marginBottom: '8px',
                                  borderRadius: '6px',
                                  overflow: 'hidden',
                                  cursor: 'pointer',
                                  border: '1px solid #ddd',
                                }}
                              >
                                <img
                                  src={imageUrl}
                                  alt=""
                                  style={{
                                    width: '100%',
                                    height: '80px',
                                    objectFit: 'cover',
                                    display: 'block',
                                  }}
                                />
                              </div>
                            ) : null}
                            <Button onClick={open} variant="secondary" style={{ width: '100%' }}>
                              {imageUrl ? 'Change image' : 'Add image'}
                            </Button>
                            {imageUrl ? (
                              <Button
                                onClick={() =>
                                  updateBlockAttributes(
                                    block.clientId,
                                    clearImageAttributes(),
                                  )
                                }
                                variant="link"
                                isDestructive
                                style={{ marginTop: '4px' }}
                              >
                                Remove image
                              </Button>
                            ) : null}
                          </div>
                        )}
                      />
                    </MediaUploadCheck>
                    <div style={{ marginTop: '12px' }}>
                      <ActionBuilder
                        label="Tap action"
                        value={action}
                        onChange={(next) =>
                          updateBlockAttributes(block.clientId, { action: next })
                        }
                      />
                    </div>
                    {slideCount > 1 ? (
                      <Button
                        onClick={() => removeBlock(block.clientId)}
                        variant="link"
                        isDestructive
                        style={{ marginTop: '8px' }}
                      >
                        Remove slide
                      </Button>
                    ) : null}
                  </PanelBody>
                );
              })}
              <Button
                variant="primary"
                onClick={() =>
                  insertBlock(
                    createBlock(IMAGE_CAROUSEL_ITEM_BLOCK, {}),
                    slideCount,
                    clientId,
                  )
                }
                style={{ width: '100%', justifyContent: 'center' }}
              >
                Add slide
              </Button>
            </div>
          </InspectorControls>

          <InspectorControls>
            <PanelBody title="Settings" initialOpen={true}>
              <ToggleControl
                label="Show pagination"
                checked={showPagination}
                onChange={(value) => setAttributes({ showPagination: value })}
              />
              <PanelColorSettings
                title="Pagination dots"
                colorSettings={[
                  {
                    label: 'Background color',
                    value: backgroundColor || DEFAULT_BACKGROUND_COLOR,
                    onChange: (value) =>
                      setAttributes({
                        backgroundColor: value || DEFAULT_BACKGROUND_COLOR,
                      }),
                  },
                  {
                    label: 'Active dot color',
                    value: activeDotColor || DEFAULT_ACTIVE_DOT_COLOR,
                    onChange: (value) =>
                      setAttributes({
                        activeDotColor: value || DEFAULT_ACTIVE_DOT_COLOR,
                      }),
                  },
                  {
                    label: 'Inactive dot color',
                    value: inactiveDotColor || DEFAULT_INACTIVE_DOT_COLOR,
                    onChange: (value) =>
                      setAttributes({
                        inactiveDotColor: value || DEFAULT_INACTIVE_DOT_COLOR,
                      }),
                  },
                ]}
              />
            </PanelBody>
          </InspectorControls>

          <div {...blockProps}>
            <div
              className="riyasat-image-carousel"
              style={{
                position: 'relative',
                backgroundColor: backgroundColor || DEFAULT_BACKGROUND_COLOR,
                ...dotColors,
              }}
            >
              <div
                className="riyasat-image-carousel__track"
                data-active-index={activeIndex}
              >
                {/*
                  Slides are child blocks (core/image-carousel-item) managed by
                  InnerBlocks. New carousel blocks start with two empty slides
                  from the template below.

                  To add more slides in the editor:
                  - Use the List View (+) next to "Hero Carousel", or
                  - Uncomment renderAppender below to show the canvas "+" button.

                  renderAppender={InnerBlocks.ButtonBlockAppender}
                */}
                <InnerBlocks
                  allowedBlocks={[IMAGE_CAROUSEL_ITEM_BLOCK]}
                  template={[
                    [IMAGE_CAROUSEL_ITEM_BLOCK, {}],
                    [IMAGE_CAROUSEL_ITEM_BLOCK, {}],
                  ]}
                  templateLock={false}
                  renderAppender={false}
                />
              </div>

              {showPagination ? (
                <SliderPaginationDots
                  count={slideCount}
                  activeIndex={activeIndex}
                  onSelect={goToSlide}
                  className="riyasat-image-carousel__pagination riyasat-image-carousel__pagination--preview"
                  dotClassName="riyasat-image-carousel__dot"
                  ariaLabelPrefix="Go to slide"
                />
              ) : null}
            </div>
          </div>
        </>
      );
    },

    save: ({ attributes }) => {
      const { showPagination, backgroundColor, activeDotColor, inactiveDotColor } = attributes;
      const dotColors = getCarouselDotColors(activeDotColor, inactiveDotColor);
      const blockProps = useBlockProps.save({
        className: 'riyasat-image-carousel',
        'data-show-pagination': showPagination ? 'true' : 'false',
        'data-background-color': backgroundColor || DEFAULT_BACKGROUND_COLOR,
        'data-active-dot-color': activeDotColor || DEFAULT_ACTIVE_DOT_COLOR,
        'data-inactive-dot-color': inactiveDotColor || DEFAULT_INACTIVE_DOT_COLOR,
        style: {
          backgroundColor: backgroundColor || DEFAULT_BACKGROUND_COLOR,
          ...dotColors,
        },
      });
      return (
        <div {...blockProps}>
          <div className="riyasat-image-carousel__track">
            <InnerBlocks.Content />
          </div>
          {showPagination ? (
            <div className="riyasat-image-carousel__pagination" aria-hidden="true" />
          ) : null}
        </div>
      );
    },
  });
}

/**
 * Register the carousel parent + slide child. Child must register first so the
 * parent's InnerBlocks template can reference it.
 */
export function registerImageCarousel() {
  registerCarouselItem();
  registerCarouselParent();
}
