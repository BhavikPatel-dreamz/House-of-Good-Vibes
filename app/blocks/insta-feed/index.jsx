// @ts-nocheck
// Insta Feed — parent (core/insta-feed) + child image tile
// (core/insta-feed-item) using InnerBlocks. Authored against the kit's shared
// @wordpress runtime; registered from ../index.ts.
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
  Button,
} from 'gutenberg-block-kit/wp/components';
import { ActionBuilder } from 'gutenberg-block-kit/actions';
import {
  INSTA_FEED_BLOCK,
  INSTA_FEED_ITEM_BLOCK,
  RIYASAT_CATEGORY,
} from '../constants';

const DEFAULT_BACKGROUND = '#f5ead6';

function InstaFeedIcon() {
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
        d="M12 2c2.7 0 3 0 4.1.1 1 .1 1.7.2 2.3.5.6.2 1.1.5 1.6 1s.8 1 1 1.6c.3.6.4 1.3.5 2.3.1 1.1.1 1.4.1 4.1s0 3-.1 4.1c-.1 1-.2 1.7-.5 2.3-.2.6-.5 1.1-1 1.6s-1 .8-1.6 1c-.6.3-1.3.4-2.3.5-1.1.1-1.4.1-4.1.1s-3 0-4.1-.1c-1-.1-1.7-.2-2.3-.5-.6-.2-1.1-.5-1.6-1s-.8-1-1-1.6c-.3-.6-.4-1.3-.5-2.3C2 15 2 14.7 2 12s0-3 .1-4.1c.1-1 .2-1.7.5-2.3.2-.6.5-1.1 1-1.6s1-.8 1.6-1c.6-.3 1.3-.4 2.3-.5C8.6 2 9 2 12 2zm0 5a5 5 0 100 10 5 5 0 000-10zm0 8.2a3.2 3.2 0 110-6.4 3.2 3.2 0 010 6.4zM17.4 5.4a1.2 1.2 0 100 2.4 1.2 1.2 0 000-2.4z"
      />
    </svg>
  );
}

function InstaOverlayIcon() {
  return (
    <span className="riyasat-insta-feed-item-editor__icon" aria-hidden="true">
      <InstaFeedIcon />
    </span>
  );
}

// ---------------------------------------------------------------------------
// Child: core/insta-feed-item — one image tile (with optional action)
// ---------------------------------------------------------------------------
function registerInstaFeedItem() {
  registerBlockType(INSTA_FEED_ITEM_BLOCK, {
    apiVersion: 3,
    title: 'Insta Feed Tile',
    description: 'A single feed image tile with an optional tap action.',
    category: RIYASAT_CATEGORY,
    parent: [INSTA_FEED_BLOCK],
    icon: 'format-image',
    supports: { html: false, reusable: false },
    attributes: {
      imageUrl: { type: 'string', default: '' },
      action: { type: 'object', default: {} },
    },

    edit: ({ attributes, setAttributes }) => {
      const { imageUrl, action } = attributes;
      const blockProps = useBlockProps({
        className: 'riyasat-insta-feed-item-editor',
      });

      return (
        <>
          <InspectorControls>
            <PanelBody title="Image" initialOpen={true}>
              <MediaUploadCheck>
                <MediaUpload
                  onSelect={(media) => setAttributes({ imageUrl: media?.url ?? '' })}
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
                      <Button
                        onClick={open}
                        variant="secondary"
                        style={{ width: '100%', justifyContent: 'center' }}
                      >
                        {imageUrl ? 'Change Image' : 'Add Image'}
                      </Button>
                      {imageUrl ? (
                        <Button
                          onClick={() => setAttributes({ imageUrl: '' })}
                          variant="link"
                          isDestructive
                          style={{ marginTop: '4px' }}
                        >
                          Remove Image
                        </Button>
                      ) : null}
                    </div>
                  )}
                />
              </MediaUploadCheck>
            </PanelBody>

            <PanelBody title="Action" initialOpen={true}>
              <ActionBuilder
                label="Tap action"
                value={action}
                onChange={(next) => setAttributes({ action: next })}
              />
            </PanelBody>
          </InspectorControls>

          <div {...blockProps}>
            {imageUrl ? (
              <MediaUploadCheck>
                <MediaUpload
                  onSelect={(media) => setAttributes({ imageUrl: media?.url ?? '' })}
                  allowedTypes={['image']}
                  render={({ open }) => (
                    <img
                      src={imageUrl}
                      alt=""
                      className="riyasat-insta-feed-item-editor__image"
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
                  onSelect={(media) => setAttributes({ imageUrl: media?.url ?? '' })}
                  allowedTypes={['image']}
                  render={({ open }) => (
                    <button
                      type="button"
                      className="riyasat-insta-feed-item-editor__image-btn"
                      onClick={open}
                    >
                      Add image
                    </button>
                  )}
                />
              </MediaUploadCheck>
            )}
            <InstaOverlayIcon />
          </div>
        </>
      );
    },

    save: ({ attributes }) => {
      const { imageUrl, action } = attributes;
      const blockProps = useBlockProps.save({
        className: 'riyasat-insta-feed__item',
        'data-action': JSON.stringify(action ?? {}),
      });
      return (
        <div {...blockProps}>
          {imageUrl ? (
            <img src={imageUrl} alt="" className="riyasat-insta-feed__image" />
          ) : null}
        </div>
      );
    },
  });
}

// ---------------------------------------------------------------------------
// Parent: core/insta-feed — heading + 2-column image grid
// ---------------------------------------------------------------------------
function registerInstaFeedParent() {
  registerBlockType(INSTA_FEED_BLOCK, {
    apiVersion: 3,
    title: 'Insta Feed',
    description: 'A titled 2-column Instagram-style image grid on a colored background.',
    category: RIYASAT_CATEGORY,
    icon: InstaFeedIcon,
    keywords: ['insta', 'instagram', 'feed', 'social', 'gallery'],
    supports: { html: false, align: ['wide', 'full'] },
    attributes: {
      title: { type: 'string', default: '' },
      subTitle: { type: 'string', default: '' },
      backgroundColor: { type: 'string', default: DEFAULT_BACKGROUND },
      action: { type: 'object', default: {} },
    },

    edit: ({ attributes, setAttributes }) => {
      const { title, subTitle, backgroundColor, action } = attributes;
      const blockProps = useBlockProps({ className: 'riyasat-insta-feed-editor' });

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

            <PanelBody title="Section action" initialOpen={false}>
              <ActionBuilder
                label="Action"
                value={action}
                onChange={(next) => setAttributes({ action: next })}
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
              className="riyasat-insta-feed"
              style={{ background: backgroundColor }}
            >
              {(subTitle || title) && (
                <div className="riyasat-insta-feed__heading">
                  {subTitle ? (
                    <p className="riyasat-insta-feed__subtitle">{subTitle}</p>
                  ) : null}
                  {title ? (
                    <h3 className="riyasat-insta-feed__title">{title}</h3>
                  ) : null}
                </div>
              )}

              <div className="riyasat-insta-feed__grid">
                <InnerBlocks
                  allowedBlocks={[INSTA_FEED_ITEM_BLOCK]}
                  template={[
                    [INSTA_FEED_ITEM_BLOCK, {}],
                    [INSTA_FEED_ITEM_BLOCK, {}],
                    [INSTA_FEED_ITEM_BLOCK, {}],
                    [INSTA_FEED_ITEM_BLOCK, {}],
                  ]}
                  templateLock={false}
                  renderAppender={InnerBlocks.ButtonBlockAppender}
                />
              </div>
            </div>
          </div>
        </>
      );
    },

    save: ({ attributes }) => {
      const { title, subTitle, backgroundColor, action } = attributes;
      const blockProps = useBlockProps.save({
        className: 'riyasat-insta-feed',
        'data-background-color': backgroundColor,
        'data-action': JSON.stringify(action ?? {}),
        style: { background: backgroundColor },
      });
      return (
        <div {...blockProps}>
          <div className="riyasat-insta-feed__heading">
            {subTitle ? (
              <p className="riyasat-insta-feed__subtitle">{subTitle}</p>
            ) : null}
            {title ? (
              <h3 className="riyasat-insta-feed__title">{title}</h3>
            ) : null}
          </div>
          <div className="riyasat-insta-feed__grid">
            <InnerBlocks.Content />
          </div>
        </div>
      );
    },
  });
}

/**
 * Register the insta-feed parent + tile child. Child registers first so the
 * parent's InnerBlocks template can reference it.
 */
export function registerInstaFeed() {
  registerInstaFeedItem();
  registerInstaFeedParent();
}
