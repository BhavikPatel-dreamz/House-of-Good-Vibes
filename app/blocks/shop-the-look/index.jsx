// @ts-nocheck
// Shop the Look — parent (core/shop-the-look) + child item
// (core/shop-the-look-item) using InnerBlocks. Each item carries a thumbnail
// image, a video URL, a CTA label and an action. Authored against the kit's
// shared @wordpress runtime; registered from ../index.ts.
import { useState } from 'gutenberg-block-kit/wp/element';
import { registerBlockType, createBlock } from 'gutenberg-block-kit/wp/blocks';
import {
  useBlockProps,
  InnerBlocks,
  InspectorControls,
  PanelColorSettings,
  MediaUpload,
  MediaUploadCheck,
} from 'gutenberg-block-kit/wp/block-editor';
import {
  PanelBody,
  TextControl,
  ToggleControl,
  Button,
} from 'gutenberg-block-kit/wp/components';
import { ActionBuilder } from 'gutenberg-block-kit/actions';
import { contentTabStyle, ImagePicker, useChildBlocks, useSliderPagination, SliderPaginationDots } from '../inspector-shared';
import {
  SHOP_THE_LOOK_BLOCK,
  SHOP_THE_LOOK_ITEM_BLOCK,
  RIYASAT_CATEGORY,
} from '../constants';

const DEFAULT_BACKGROUND = '#f5ead6';

function ShopTheLookIcon() {
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
        d="M4 4h7v7H4V4zm9 0h7v7h-7V4zM4 13h7v7H4v-7zm12.5 0L21 16.5 16.5 20 12 16.5 16.5 13z"
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Child: core/shop-the-look-item — thumbnail + video + CTA
// ---------------------------------------------------------------------------
function registerShopTheLookItem() {
  registerBlockType(SHOP_THE_LOOK_ITEM_BLOCK, {
    apiVersion: 3,
    title: 'Shop the Look Item',
    description: 'A single look: thumbnail image, video and a call-to-action.',
    category: RIYASAT_CATEGORY,
    parent: [SHOP_THE_LOOK_BLOCK],
    icon: 'format-video',
    supports: { html: false, reusable: false },
    attributes: {
      thumbnailUrl: { type: 'string', default: '' },
      videoUrl: { type: 'string', default: '' },
      buttonText: { type: 'string', default: '' },
      action: { type: 'object', default: {} },
    },

    edit: ({ attributes, setAttributes }) => {
      const { thumbnailUrl, videoUrl, buttonText, action } = attributes;
      const blockProps = useBlockProps({
        className: 'riyasat-shop-the-look-item-editor',
      });

      return (
        <>
          <InspectorControls group="content">
            <div style={contentTabStyle}>
              <PanelBody title="Look" initialOpen={true}>
                <ImagePicker
                  imageUrl={thumbnailUrl}
                  addLabel="Add thumbnail"
                  changeLabel="Change thumbnail"
                  onSelect={(url) => setAttributes({ thumbnailUrl: url })}
                  onClear={() => setAttributes({ thumbnailUrl: '' })}
                />
                <MediaUploadCheck>
                  <MediaUpload
                    onSelect={(media) => setAttributes({ videoUrl: media?.url ?? '' })}
                    allowedTypes={['video']}
                    render={({ open }) => (
                      <div style={{ marginTop: '12px' }}>
                        <Button onClick={open} variant="secondary" style={{ width: '100%' }}>
                          {videoUrl ? 'Change video' : 'Add video'}
                        </Button>
                        {videoUrl ? (
                          <Button
                            onClick={() => setAttributes({ videoUrl: '' })}
                            variant="link"
                            isDestructive
                            style={{ marginTop: '4px' }}
                          >
                            Remove video
                          </Button>
                        ) : null}
                      </div>
                    )}
                  />
                </MediaUploadCheck>
                <TextControl
                  label="Button text"
                  value={buttonText}
                  onChange={(value) => setAttributes({ buttonText: value })}
                />
                <ActionBuilder
                  label="Button action"
                  value={action}
                  onChange={(next) => setAttributes({ action: next })}
                />
              </PanelBody>
            </div>
          </InspectorControls>

          <div {...blockProps}>
            {thumbnailUrl ? (
              <img
                src={thumbnailUrl}
                alt=""
                className="riyasat-shop-the-look-item-editor__thumbnail"
              />
            ) : (
              <MediaUploadCheck>
                <MediaUpload
                  onSelect={(media) =>
                    setAttributes({ thumbnailUrl: media?.url ?? '' })
                  }
                  allowedTypes={['image']}
                  render={({ open }) => (
                    <button
                      type="button"
                      className="riyasat-shop-the-look-item-editor__thumbnail-btn"
                      onClick={open}
                    >
                      Add thumbnail
                    </button>
                  )}
                />
              </MediaUploadCheck>
            )}

            <div className="riyasat-shop-the-look-item-editor__play" aria-hidden="true">
              <span className="riyasat-shop-the-look-item-editor__play-icon" />
            </div>

            <div className="riyasat-shop-the-look-item-editor__cta-wrap">
              <span className="riyasat-shop-the-look-item-editor__cta">
                {buttonText || 'SHOP NOW'}
              </span>
            </div>
          </div>
        </>
      );
    },

    save: ({ attributes }) => {
      const { thumbnailUrl, videoUrl, buttonText, action } = attributes;
      const blockProps = useBlockProps.save({
        className: 'riyasat-shop-the-look__item',
        'data-action': JSON.stringify(action ?? {}),
        'data-video-url': videoUrl,
      });
      return (
        <div {...blockProps}>
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt=""
              className="riyasat-shop-the-look__thumbnail"
            />
          ) : null}
          {buttonText ? (
            <span className="riyasat-shop-the-look__item-button">
              {buttonText}
            </span>
          ) : null}
        </div>
      );
    },
  });
}

// ---------------------------------------------------------------------------
// Parent: core/shop-the-look — heading + row of looks
// ---------------------------------------------------------------------------
function registerShopTheLookParent() {
  registerBlockType(SHOP_THE_LOOK_BLOCK, {
    apiVersion: 3,
    title: 'Shop the Look',
    description: 'A titled, swipeable row of shoppable looks on a colored background.',
    category: RIYASAT_CATEGORY,
    icon: ShopTheLookIcon,
    keywords: ['shop', 'look', 'video', 'shoppable'],
    supports: { html: false, align: ['wide', 'full'] },
    attributes: {
      title: { type: 'string', default: '' },
      subTitle: { type: 'string', default: '' },
      backgroundColor: { type: 'string', default: DEFAULT_BACKGROUND },
      showPagination: { type: 'boolean', default: true },
    },

    edit: ({ attributes, setAttributes, clientId }) => {
      const { title, subTitle, backgroundColor, showPagination } = attributes;
      const blockProps = useBlockProps({
        className: 'riyasat-shop-the-look-editor',
      });
      const { childBlocks, childCount, insertBlock, removeBlock, updateBlockAttributes } =
        useChildBlocks(clientId);
      const [activeIndex, setActiveIndex] = useState(0);
      const { trackRef, slideCount, goToSlide } = useSliderPagination(
        clientId,
        activeIndex,
        setActiveIndex,
      );

      return (
        <>
          <InspectorControls group="content">
            <div style={contentTabStyle}>
              <PanelBody title="Heading" initialOpen={true}>
                <TextControl
                  label="Main Title"
                  value={title}
                  onChange={(value) => setAttributes({ title: value })}
                />
                <TextControl
                  label="Sub Title"
                  value={subTitle}
                  onChange={(value) => setAttributes({ subTitle: value })}
                />
              </PanelBody>
              {childBlocks.map((block, index) => {
                const { thumbnailUrl, videoUrl, buttonText, action } = block.attributes;
                return (
                  <PanelBody
                    key={block.clientId}
                    title={`Look ${index + 1}`}
                    initialOpen={false}
                  >
                    <ImagePicker
                      imageUrl={thumbnailUrl}
                      addLabel="Add thumbnail"
                      changeLabel="Change thumbnail"
                      onSelect={(url) =>
                        updateBlockAttributes(block.clientId, { thumbnailUrl: url })
                      }
                      onClear={() =>
                        updateBlockAttributes(block.clientId, { thumbnailUrl: '' })
                      }
                    />
                    <MediaUploadCheck>
                      <MediaUpload
                        onSelect={(media) =>
                          updateBlockAttributes(block.clientId, {
                            videoUrl: media?.url ?? '',
                          })
                        }
                        allowedTypes={['video']}
                        render={({ open }) => (
                          <div style={{ marginTop: '12px' }}>
                            <Button onClick={open} variant="secondary" style={{ width: '100%' }}>
                              {videoUrl ? 'Change video' : 'Add video'}
                            </Button>
                            {videoUrl ? (
                              <Button
                                onClick={() =>
                                  updateBlockAttributes(block.clientId, { videoUrl: '' })
                                }
                                variant="link"
                                isDestructive
                                style={{ marginTop: '4px' }}
                              >
                                Remove video
                              </Button>
                            ) : null}
                          </div>
                        )}
                      />
                    </MediaUploadCheck>
                    <TextControl
                      label="Button text"
                      value={buttonText}
                      onChange={(value) =>
                        updateBlockAttributes(block.clientId, { buttonText: value })
                      }
                    />
                    <ActionBuilder
                      label="Button action"
                      value={action}
                      onChange={(next) =>
                        updateBlockAttributes(block.clientId, { action: next })
                      }
                    />
                    {childCount > 1 ? (
                      <Button
                        onClick={() => removeBlock(block.clientId)}
                        variant="link"
                        isDestructive
                        style={{ marginTop: '8px' }}
                      >
                        Remove look
                      </Button>
                    ) : null}
                  </PanelBody>
                );
              })}
              <Button
                variant="primary"
                onClick={() =>
                  insertBlock(createBlock(SHOP_THE_LOOK_ITEM_BLOCK, {}), childCount, clientId)
                }
                style={{ width: '100%', justifyContent: 'center' }}
              >
                Add look
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
                title="Colors"
                colorSettings={[
                  {
                    label: 'Background color',
                    value: backgroundColor,
                    onChange: (value) =>
                      setAttributes({ backgroundColor: value || DEFAULT_BACKGROUND }),
                  },
                ]}
              />
            </PanelBody>
          </InspectorControls>

          <div {...blockProps}>
            <div
              className="riyasat-shop-the-look"
              style={{ background: backgroundColor }}
            >
              <div className="riyasat-shop-the-look__heading">
                  {title ? (
                  <h3 className="riyasat-shop-the-look__title">{title}</h3>
                ) : null}
                {subTitle ? (
                  <p className="riyasat-shop-the-look__subtitle">{subTitle}</p>
                ) : null}
              </div>

              <div className="riyasat-shop-the-look__track" ref={trackRef}>
                <InnerBlocks
                  allowedBlocks={[SHOP_THE_LOOK_ITEM_BLOCK]}
                  template={[
                    [SHOP_THE_LOOK_ITEM_BLOCK, {}],
                    [SHOP_THE_LOOK_ITEM_BLOCK, {}],
                    [SHOP_THE_LOOK_ITEM_BLOCK, {}],
                  ]}
                  templateLock={false}
                  renderAppender={false}
                  orientation="horizontal"
                />
              </div>

              {showPagination ? (
                <SliderPaginationDots
                  count={slideCount}
                  activeIndex={activeIndex}
                  onSelect={goToSlide}
                  className="riyasat-shop-the-look__pagination"
                  dotClassName="riyasat-shop-the-look__pagination-dot"
                  ariaLabelPrefix="Go to look"
                />
              ) : null}
            </div>
          </div>
        </>
      );
    },

    save: ({ attributes }) => {
      const { title, subTitle, backgroundColor, showPagination } = attributes;
      const blockProps = useBlockProps.save({
        className: 'riyasat-shop-the-look',
        'data-background-color': backgroundColor,
        'data-show-pagination': showPagination ? 'true' : 'false',
        style: { background: backgroundColor },
      });
      return (
        <div {...blockProps}>
          <div className="riyasat-shop-the-look__heading">
                  {title ? (
              <h3 className="riyasat-shop-the-look__title">{title}</h3>
            ) : null}
            {subTitle ? (
              <p className="riyasat-shop-the-look__subtitle">{subTitle}</p>
            ) : null}
          </div>
          <div className="riyasat-shop-the-look__track">
            <InnerBlocks.Content />
          </div>
        </div>
      );
    },
  });
}

/**
 * Register the shop-the-look parent + item child. Child registers first so the
 * parent's InnerBlocks template can reference it.
 */
export function registerShopTheLook() {
  registerShopTheLookItem();
  registerShopTheLookParent();
}
