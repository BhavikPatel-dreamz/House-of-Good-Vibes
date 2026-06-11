// @ts-nocheck
// Visit our stores — parent (core/visit-our-stores) + child store card
// (core/visit-our-stores-item) using InnerBlocks. Authored against the kit's
// shared @wordpress runtime; registered from ../index.ts.
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
  VISIT_OUR_STORES_BLOCK,
  VISIT_OUR_STORES_ITEM_BLOCK,
  RIYASAT_CATEGORY,
} from '../constants';

const DEFAULT_BACKGROUND = '#f5f5f5';

function VisitOurStoresIcon() {
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
        d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Child: core/visit-our-stores-item — one store (image + name + address + map)
// ---------------------------------------------------------------------------
function registerVisitOurStoresItem() {
  registerBlockType(VISIT_OUR_STORES_ITEM_BLOCK, {
    apiVersion: 3,
    title: 'Store',
    description: 'A single store: image, name, address and a Google Maps link.',
    category: RIYASAT_CATEGORY,
    parent: [VISIT_OUR_STORES_BLOCK],
    icon: 'store',
    supports: { html: false, reusable: false },
    attributes: {
      imageUrl: { type: 'string', default: '' },
      storeName: { type: 'string', default: '' },
      address: { type: 'string', default: '' },
      mapLink: { type: 'string', default: '' },
    },

    edit: ({ attributes, setAttributes }) => {
      const { imageUrl, storeName, address, mapLink } = attributes;
      const blockProps = useBlockProps({
        className: 'riyasat-visit-our-stores-item-editor',
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

            <PanelBody title="Store details" initialOpen={true}>
              <TextControl
                label="Store name"
                value={storeName}
                onChange={(value) => setAttributes({ storeName: value })}
              />
              <TextareaControl
                label="Address"
                value={address}
                rows={3}
                onChange={(value) => setAttributes({ address: value })}
              />
              <TextControl
                label="Google Maps link"
                type="url"
                placeholder="https://maps.google.com/…"
                value={mapLink}
                onChange={(value) => setAttributes({ mapLink: value })}
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
                      className="riyasat-visit-our-stores-item-editor__image"
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
                      className="riyasat-visit-our-stores-item-editor__image-btn"
                      onClick={open}
                    >
                      Add image
                    </button>
                  )}
                />
              </MediaUploadCheck>
            )}

            <div className="riyasat-visit-our-stores-item-editor__body">
              <input
                type="text"
                className="riyasat-visit-our-stores-item-editor__field"
                value={storeName}
                placeholder="Store name…"
                onChange={(event) => setAttributes({ storeName: event.target.value })}
              />
              <textarea
                className="riyasat-visit-our-stores-item-editor__field riyasat-visit-our-stores-item-editor__field--address"
                value={address}
                placeholder="Address…"
                rows={3}
                onChange={(event) => setAttributes({ address: event.target.value })}
              />
              <input
                type="url"
                className="riyasat-visit-our-stores-item-editor__field"
                value={mapLink}
                placeholder="Google Maps link…"
                onChange={(event) => setAttributes({ mapLink: event.target.value })}
              />
            </div>
          </div>
        </>
      );
    },

    save: ({ attributes }) => {
      const { imageUrl, storeName, address, mapLink } = attributes;
      const blockProps = useBlockProps.save({
        className: 'riyasat-visit-our-stores__item',
        'data-map-link': mapLink || '',
      });
      return (
        <div {...blockProps}>
          {imageUrl ? (
            <img
              src={imageUrl}
              alt=""
              className="riyasat-visit-our-stores__image"
            />
          ) : null}
          {storeName ? (
            <h4 className="riyasat-visit-our-stores__name">{storeName}</h4>
          ) : null}
          {address ? (
            <p className="riyasat-visit-our-stores__address">{address}</p>
          ) : null}
          {mapLink ? (
            <a
              className="riyasat-visit-our-stores__map"
              href={mapLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              View on map
            </a>
          ) : null}
        </div>
      );
    },
  });
}

// ---------------------------------------------------------------------------
// Parent: core/visit-our-stores — heading + horizontal row of store cards
// ---------------------------------------------------------------------------
function registerVisitOurStoresParent() {
  registerBlockType(VISIT_OUR_STORES_BLOCK, {
    apiVersion: 3,
    title: 'Visit Our Stores',
    description: 'A titled, horizontally scrolling row of store cards.',
    category: RIYASAT_CATEGORY,
    icon: VisitOurStoresIcon,
    keywords: ['stores', 'locations', 'map', 'address'],
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
      const blockProps = useBlockProps({
        className: 'riyasat-visit-our-stores-editor',
      });
      const [activeIndex, setActiveIndex] = useState(0);
      const storeCount = useSelect(
        (select) => select('core/block-editor').getBlockCount(clientId),
        [clientId],
      );

      useEffect(() => {
        if (storeCount <= 0) {
          setActiveIndex(0);
          return;
        }
        if (activeIndex > storeCount - 1) setActiveIndex(storeCount - 1);
      }, [activeIndex, storeCount]);

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
              className="riyasat-visit-our-stores"
              style={{ background: backgroundColor }}
            >
              {(subTitle || title) && (
                <div className="riyasat-visit-our-stores__heading">
                  {subTitle ? (
                    <p className="riyasat-visit-our-stores__subtitle">{subTitle}</p>
                  ) : null}
                  {title ? (
                    <h3 className="riyasat-visit-our-stores__title">{title}</h3>
                  ) : null}
                </div>
              )}

              <div className="riyasat-visit-our-stores__track">
                <InnerBlocks
                  allowedBlocks={[VISIT_OUR_STORES_ITEM_BLOCK]}
                  template={[
                    [VISIT_OUR_STORES_ITEM_BLOCK, {}],
                    [VISIT_OUR_STORES_ITEM_BLOCK, {}],
                    [VISIT_OUR_STORES_ITEM_BLOCK, {}],
                  ]}
                  templateLock={false}
                  renderAppender={InnerBlocks.ButtonBlockAppender}
                  orientation="horizontal"
                />
              </div>

              {showPagination && storeCount > 1 ? (
                <div className="riyasat-visit-our-stores__pagination">
                  {Array.from({ length: storeCount }).map((_, index) => (
                    <button
                      key={index}
                      type="button"
                      className={`riyasat-visit-our-stores__dot${
                        index === activeIndex ? ' is-active' : ''
                      }`}
                      aria-label={`Go to store ${index + 1}`}
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
        className: 'riyasat-visit-our-stores',
        'data-background-color': backgroundColor,
        'data-action': JSON.stringify(action ?? {}),
        'data-show-pagination': showPagination ? 'true' : 'false',
        style: { background: backgroundColor },
      });
      return (
        <div {...blockProps}>
          <div className="riyasat-visit-our-stores__heading">
            {subTitle ? (
              <p className="riyasat-visit-our-stores__subtitle">{subTitle}</p>
            ) : null}
            {title ? (
              <h3 className="riyasat-visit-our-stores__title">{title}</h3>
            ) : null}
          </div>
          <div className="riyasat-visit-our-stores__track">
            <InnerBlocks.Content />
          </div>
          {showPagination ? (
            <div className="riyasat-visit-our-stores__pagination" aria-hidden="true" />
          ) : null}
        </div>
      );
    },
  });
}

/**
 * Register the visit-our-stores parent + store child. Child registers first so
 * the parent's InnerBlocks template can reference it.
 */
export function registerVisitOurStores() {
  registerVisitOurStoresItem();
  registerVisitOurStoresParent();
}
