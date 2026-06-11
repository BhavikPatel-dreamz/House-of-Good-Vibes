// @ts-nocheck
// Editor's Pick — parent (core/editors-pick) + child card
// (core/editors-pick-item) using InnerBlocks. Authored against the kit's shared
// @wordpress runtime; registered from ../index.ts.
import { useState, useEffect } from 'gutenberg-block-kit/wp/element';
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
  TextareaControl,
  ToggleControl,
  Button,
} from 'gutenberg-block-kit/wp/components';
import { useSelect } from 'gutenberg-block-kit/wp/data';
import { ActionBuilder } from 'gutenberg-block-kit/actions';
import {
  EDITORS_PICK_BLOCK,
  EDITORS_PICK_ITEM_BLOCK,
  RIYASAT_CATEGORY,
} from '../constants';

const DEFAULT_BACKGROUND = '#f5f5f5';

function EditorsPickIcon() {
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
        d="M12 2l2.9 6 6.6.5-5 4.3 1.5 6.4L12 16.9 5.9 19.2 7.4 12.8l-5-4.3L9 8z"
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Child: core/editors-pick-item — one card (image + title + desc + CTA)
// ---------------------------------------------------------------------------
function registerEditorsPickItem() {
  registerBlockType(EDITORS_PICK_ITEM_BLOCK, {
    apiVersion: 3,
    title: "Editor's Pick Card",
    description: 'A single card: image, title, description and a call-to-action.',
    category: RIYASAT_CATEGORY,
    parent: [EDITORS_PICK_BLOCK],
    icon: 'format-image',
    supports: { html: false, reusable: false },
    attributes: {
      title: { type: 'string', default: '' },
      description: { type: 'string', default: '' },
      imageUrl: { type: 'string', default: '' },
      buttonText: { type: 'string', default: '' },
      action: { type: 'object', default: {} },
    },

    edit: ({ attributes, setAttributes }) => {
      const { title, description, imageUrl, buttonText, action } = attributes;
      const blockProps = useBlockProps({
        className: 'riyasat-editors-pick-item-editor',
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

            <PanelBody title="Content" initialOpen={true}>
              <TextControl
                label="Title"
                value={title}
                onChange={(value) => setAttributes({ title: value })}
              />
              <TextareaControl
                label="Description"
                value={description}
                rows={3}
                onChange={(value) => setAttributes({ description: value })}
              />
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
                      className="riyasat-editors-pick-item-editor__image"
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
                      className="riyasat-editors-pick-item-editor__image-btn"
                      onClick={open}
                    >
                      Add image
                    </button>
                  )}
                />
              </MediaUploadCheck>
            )}

            <div className="riyasat-editors-pick-item-editor__body">
              <input
                type="text"
                className="riyasat-editors-pick-item-editor__field"
                value={title}
                placeholder="Title…"
                onChange={(event) => setAttributes({ title: event.target.value })}
              />
              <textarea
                className="riyasat-editors-pick-item-editor__field riyasat-editors-pick-item-editor__field--textarea"
                value={description}
                placeholder="Description…"
                rows={3}
                onChange={(event) => setAttributes({ description: event.target.value })}
              />
              {buttonText ? (
                <span className="riyasat-editors-pick-item-editor__button">
                  {buttonText}
                </span>
              ) : null}
            </div>
          </div>
        </>
      );
    },

    save: ({ attributes }) => {
      const { title, description, imageUrl, buttonText, action } = attributes;
      const blockProps = useBlockProps.save({
        className: 'riyasat-editors-pick__item',
        'data-action': JSON.stringify(action ?? {}),
      });
      return (
        <div {...blockProps}>
          {imageUrl ? (
            <img src={imageUrl} alt="" className="riyasat-editors-pick__image" />
          ) : null}
          {title ? (
            <h4 className="riyasat-editors-pick__item-title">{title}</h4>
          ) : null}
          {description ? (
            <p className="riyasat-editors-pick__item-description">{description}</p>
          ) : null}
          {buttonText ? (
            <span className="riyasat-editors-pick__item-button">{buttonText}</span>
          ) : null}
        </div>
      );
    },
  });
}

// ---------------------------------------------------------------------------
// Parent: core/editors-pick — heading + row of cards
// ---------------------------------------------------------------------------
function registerEditorsPickParent() {
  registerBlockType(EDITORS_PICK_BLOCK, {
    apiVersion: 3,
    title: "Editor's Pick",
    description: 'A titled row of editorial cards on a colored background.',
    category: RIYASAT_CATEGORY,
    icon: EditorsPickIcon,
    keywords: ['editors', 'pick', 'curated', 'cards'],
    supports: { html: false, align: ['wide', 'full'] },
    attributes: {
      title: { type: 'string', default: '' },
      subTitle: { type: 'string', default: '' },
      backgroundColor: { type: 'string', default: DEFAULT_BACKGROUND },
      action: { type: 'object', default: {} },
      showPagination: { type: 'boolean', default: true },
    },

    edit: ({ attributes, setAttributes, clientId }) => {
      const { title, subTitle, backgroundColor, action, showPagination } = attributes;
      const blockProps = useBlockProps({ className: 'riyasat-editors-pick-editor' });
      const [activeIndex, setActiveIndex] = useState(0);
      const cardCount = useSelect(
        (select) => select('core/block-editor').getBlockCount(clientId),
        [clientId],
      );

      useEffect(() => {
        if (cardCount <= 0) {
          setActiveIndex(0);
          return;
        }
        if (activeIndex > cardCount - 1) setActiveIndex(cardCount - 1);
      }, [activeIndex, cardCount]);

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
              className="riyasat-editors-pick"
              style={{ background: backgroundColor }}
            >
              {(subTitle || title) && (
                <div className="riyasat-editors-pick__heading">
                  {subTitle ? (
                    <p className="riyasat-editors-pick__subtitle">{subTitle}</p>
                  ) : null}
                  {title ? (
                    <h3 className="riyasat-editors-pick__title">{title}</h3>
                  ) : null}
                </div>
              )}

              <div className="riyasat-editors-pick__track">
                <InnerBlocks
                  allowedBlocks={[EDITORS_PICK_ITEM_BLOCK]}
                  template={[
                    [EDITORS_PICK_ITEM_BLOCK, {}],
                    [EDITORS_PICK_ITEM_BLOCK, {}],
                  ]}
                  templateLock={false}
                  renderAppender={InnerBlocks.ButtonBlockAppender}
                  orientation="horizontal"
                />
              </div>

              {showPagination && cardCount > 1 ? (
                <div className="riyasat-editors-pick__pagination">
                  {Array.from({ length: cardCount }).map((_, index) => (
                    <button
                      key={index}
                      type="button"
                      className={`riyasat-editors-pick__dot${
                        index === activeIndex ? ' is-active' : ''
                      }`}
                      aria-label={`Go to card ${index + 1}`}
                      onClick={() => setActiveIndex(index)}
                    />
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </>
      );
    },

    save: ({ attributes }) => {
      const { title, subTitle, backgroundColor, action, showPagination } = attributes;
      const blockProps = useBlockProps.save({
        className: 'riyasat-editors-pick',
        'data-background-color': backgroundColor,
        'data-action': JSON.stringify(action ?? {}),
        'data-show-pagination': showPagination ? 'true' : 'false',
        style: { background: backgroundColor },
      });
      return (
        <div {...blockProps}>
          <div className="riyasat-editors-pick__heading">
            {subTitle ? (
              <p className="riyasat-editors-pick__subtitle">{subTitle}</p>
            ) : null}
            {title ? (
              <h3 className="riyasat-editors-pick__title">{title}</h3>
            ) : null}
          </div>
          <div className="riyasat-editors-pick__track">
            <InnerBlocks.Content />
          </div>
          {showPagination ? (
            <div className="riyasat-editors-pick__pagination" aria-hidden="true" />
          ) : null}
        </div>
      );
    },
  });
}

/**
 * Register the editor's-pick parent + card child. Child registers first so the
 * parent's InnerBlocks template can reference it.
 */
export function registerEditorsPick() {
  registerEditorsPickItem();
  registerEditorsPickParent();
}
