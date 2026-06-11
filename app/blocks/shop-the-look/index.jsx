// @ts-nocheck
// Shop the Look — parent (core/shop-the-look) + child item
// (core/shop-the-look-item) using InnerBlocks. Each item carries a thumbnail
// image, a video URL, a CTA label and an action. Authored against the kit's
// shared @wordpress runtime; registered from ../index.ts.
import { registerBlockType } from 'gutenberg-block-kit/wp/blocks';
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
import {
  SHOP_THE_LOOK_BLOCK,
  SHOP_THE_LOOK_ITEM_BLOCK,
  RIYASAT_CATEGORY,
} from '../constants';

const DEFAULT_BACKGROUND = '#f5f5f5';

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
          <InspectorControls>
            <PanelBody title="Thumbnail" initialOpen={true}>
              <MediaUploadCheck>
                <MediaUpload
                  onSelect={(media) =>
                    setAttributes({ thumbnailUrl: media?.url ?? '' })
                  }
                  allowedTypes={['image']}
                  render={({ open }) => (
                    <div>
                      {thumbnailUrl ? (
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
                            src={thumbnailUrl}
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
                      <Button
                        onClick={open}
                        variant="secondary"
                        style={{ width: '100%', justifyContent: 'center' }}
                      >
                        {thumbnailUrl ? 'Change Thumbnail' : 'Add Thumbnail'}
                      </Button>
                      {thumbnailUrl ? (
                        <Button
                          onClick={() => setAttributes({ thumbnailUrl: '' })}
                          variant="link"
                          isDestructive
                          style={{ marginTop: '4px' }}
                        >
                          Remove Thumbnail
                        </Button>
                      ) : null}
                    </div>
                  )}
                />
              </MediaUploadCheck>
            </PanelBody>

            <PanelBody title="Video" initialOpen={true}>
              <MediaUploadCheck>
                <MediaUpload
                  onSelect={(media) =>
                    setAttributes({ videoUrl: media?.url ?? '' })
                  }
                  allowedTypes={['video']}
                  render={({ open }) => (
                    <div>
                      <Button
                        onClick={open}
                        variant="secondary"
                        style={{ width: '100%', justifyContent: 'center' }}
                      >
                        {videoUrl ? 'Change Video' : 'Add Video'}
                      </Button>
                      {videoUrl ? (
                        <>
                          <p
                            style={{
                              margin: '6px 0 0',
                              fontSize: '11px',
                              color: '#666',
                              wordBreak: 'break-all',
                            }}
                          >
                            {videoUrl}
                          </p>
                          <Button
                            onClick={() => setAttributes({ videoUrl: '' })}
                            variant="link"
                            isDestructive
                            style={{ marginTop: '4px' }}
                          >
                            Remove Video
                          </Button>
                        </>
                      ) : null}
                    </div>
                  )}
                />
              </MediaUploadCheck>
              <TextControl
                label="Video URL"
                value={videoUrl}
                onChange={(value) => setAttributes({ videoUrl: value })}
                help="Or paste a video URL directly."
              />
            </PanelBody>

            <PanelBody title="Content" initialOpen={true}>
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
          </InspectorControls>

          <div
            {...blockProps}
            style={{
              position: 'relative',
              width: '230px',
              flexShrink: 0,
              borderRadius: '12px',
              overflow: 'hidden',
              background: '#2a2a4a',
            }}
          >
            {thumbnailUrl ? (
              <img
                src={thumbnailUrl}
                alt=""
                style={{
                  width: '100%',
                  height: '320px',
                  objectFit: 'cover',
                  display: 'block',
                }}
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
                      onClick={open}
                      style={{
                        width: '100%',
                        height: '320px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: '#fff',
                        background: '#2a2a4a',
                        border: 'none',
                      }}
                    >
                      Add thumbnail
                    </button>
                  )}
                />
              </MediaUploadCheck>
            )}

            {/* Play button overlay — centered */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.92)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 12px rgba(0,0,0,0.25)',
              }}
            >
              <span
                style={{
                  width: 0,
                  height: 0,
                  marginLeft: '4px',
                  borderTop: '10px solid transparent',
                  borderBottom: '10px solid transparent',
                  borderLeft: '16px solid #b3024a',
                }}
              />
            </div>

            {/* SHOP NOW button — bottom */}
            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 0,
                padding: '14px',
                textAlign: 'center',
                background:
                  'linear-gradient(to top, rgba(0,0,0,0.55), rgba(0,0,0,0))',
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  padding: '10px 28px',
                  background: '#b3024a',
                  color: '#fff',
                  borderRadius: '4px',
                  fontWeight: 700,
                  fontSize: '12px',
                  letterSpacing: '1px',
                }}
              >
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

    edit: ({ attributes, setAttributes }) => {
      const { title, subTitle, backgroundColor, showPagination } = attributes;
      const blockProps = useBlockProps({
        className: 'riyasat-shop-the-look-editor',
      });

      return (
        <>
          <InspectorControls>
            <PanelBody title="Heading" initialOpen={true}>
              <TextControl
                label="Title"
                value={title}
                onChange={(value) => setAttributes({ title: value })}
              />
              <TextControl
                label="Subtitle"
                value={subTitle}
                onChange={(value) => setAttributes({ subTitle: value })}
              />
            </PanelBody>

            <PanelBody title="Settings" initialOpen={true}>
              <ToggleControl
                label="Show pagination"
                checked={showPagination}
                onChange={(value) => setAttributes({ showPagination: value })}
              />
            </PanelBody>

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
          </InspectorControls>

          <div {...blockProps}>
            <div
              className="riyasat-shop-the-look"
              style={{
                background: backgroundColor,
                padding: '24px',
                borderRadius: '8px',
              }}
            >
              <div
                className="riyasat-shop-the-look__heading"
                style={{ textAlign: 'center' }}
              >
                {subTitle ? (
                  <p
                    className="riyasat-shop-the-look__subtitle"
                    style={{
                      margin: '0 0 6px',
                      color: '#c9a86a',
                      fontSize: '12px',
                      fontWeight: 600,
                      letterSpacing: '2px',
                      textTransform: 'uppercase',
                    }}
                  >
                    {subTitle}
                  </p>
                ) : null}
                {title ? (
                  <h3
                    className="riyasat-shop-the-look__title"
                    style={{
                      margin: '0 0 20px',
                      fontSize: '28px',
                      fontWeight: 700,
                      color: '#fff',
                      fontFamily: 'Georgia, "Times New Roman", serif',
                    }}
                  >
                    {title}
                  </h3>
                ) : null}
              </div>

              <div
                className="riyasat-shop-the-look__track"
                style={{ display: 'flex', gap: '16px', overflowX: 'auto' }}
              >
                <InnerBlocks
                  allowedBlocks={[SHOP_THE_LOOK_ITEM_BLOCK]}
                  template={[
                    [SHOP_THE_LOOK_ITEM_BLOCK, {}],
                    [SHOP_THE_LOOK_ITEM_BLOCK, {}],
                    [SHOP_THE_LOOK_ITEM_BLOCK, {}],
                  ]}
                  templateLock={false}
                  renderAppender={InnerBlocks.ButtonBlockAppender}
                  orientation="horizontal"
                />
              </div>

              {showPagination ? (
                <div
                  className="riyasat-shop-the-look__pagination"
                  style={{
                    display: 'flex',
                    gap: '6px',
                    justifyContent: 'center',
                    marginTop: '16px',
                  }}
                >
                  <span
                    style={{
                      width: '18px',
                      height: '6px',
                      borderRadius: '3px',
                      background: '#b3024a',
                    }}
                  />
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: 'rgba(255,255,255,0.4)',
                    }}
                  />
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: 'rgba(255,255,255,0.4)',
                    }}
                  />
                </div>
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
            {subTitle ? (
              <p className="riyasat-shop-the-look__subtitle">{subTitle}</p>
            ) : null}
            {title ? (
              <h3 className="riyasat-shop-the-look__title">{title}</h3>
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
