// @ts-nocheck
// Client Stories — parent (core/client-stories) + child testimonial card
// (core/client-stories-item) using InnerBlocks. Authored against the kit's
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
import { useState, useEffect } from 'gutenberg-block-kit/wp/element';
import { useSelect } from 'gutenberg-block-kit/wp/data';
import { ActionBuilder } from 'gutenberg-block-kit/actions';
import {
  CLIENT_STORIES_BLOCK,
  CLIENT_STORIES_ITEM_BLOCK,
  RIYASAT_CATEGORY,
} from '../constants';

const DEFAULT_BACKGROUND = '#f5f5f5';

function ClientStoriesIcon() {
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
        d="M21 6h-2v9H6v2c0 .55.45 1 1 1h11l4 4V7c0-.55-.45-1-1-1zm-4 6V3c0-.55-.45-1-1-1H3c-.55 0-1 .45-1 1v14l4-4h10c.55 0 1-.45 1-1z"
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Child: core/client-stories-item — one testimonial card
// ---------------------------------------------------------------------------
function registerClientStoriesItem() {
  registerBlockType(CLIENT_STORIES_ITEM_BLOCK, {
    apiVersion: 3,
    title: 'Client Story',
    description: 'A single testimonial: review, rating, image, reviewer and CTA.',
    category: RIYASAT_CATEGORY,
    parent: [CLIENT_STORIES_BLOCK],
    icon: 'format-quote',
    supports: { html: false, reusable: false },
    attributes: {
      review: { type: 'string', default: '' },
      rating: { type: 'string', default: '' },
      imageUrl: { type: 'string', default: '' },
      reviewerName: { type: 'string', default: '' },
      city: { type: 'string', default: '' },
      buttonText: { type: 'string', default: '' },
      action: { type: 'object', default: {} },
    },

    edit: ({ attributes, setAttributes }) => {
      const { review, rating, imageUrl, reviewerName, city, buttonText, action } =
        attributes;
      const blockProps = useBlockProps({
        className: 'riyasat-client-stories-item-editor',
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
                label="Review"
                value={review}
                onChange={(value) => setAttributes({ review: value })}
              />
              <TextControl
                label="Rating"
                value={rating}
                onChange={(value) => setAttributes({ rating: value })}
              />
              <TextControl
                label="Reviewer name"
                value={reviewerName}
                onChange={(value) => setAttributes({ reviewerName: value })}
              />
              <TextControl
                label="City"
                value={city}
                onChange={(value) => setAttributes({ city: value })}
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

          <div
            {...blockProps}
            style={{
              width: '260px',
              flexShrink: 0,
              background: '#fff',
              borderRadius: '8px',
              overflow: 'hidden',
              border: '1px solid rgba(0,0,0,0.08)',
              padding: '16px',
            }}
          >
            {rating ? (
              <div
                className="riyasat-client-stories__rating"
                style={{ color: '#f5a623', fontSize: '14px', marginBottom: '6px' }}
              >
                {'★'.repeat(Math.max(0, Math.min(5, parseInt(rating, 10) || 0)))}
                <span style={{ color: '#888', marginLeft: '4px' }}>{rating}</span>
              </div>
            ) : null}
            <TextControl
              label=""
              value={review}
              placeholder="Review…"
              onChange={(value) => setAttributes({ review: value })}
            />
            {imageUrl ? (
              <img
                src={imageUrl}
                alt=""
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '999px',
                  objectFit: 'cover',
                  display: 'block',
                  margin: '8px 0',
                }}
              />
            ) : null}
            <TextControl
              label=""
              value={reviewerName}
              placeholder="Reviewer name…"
              onChange={(value) => setAttributes({ reviewerName: value })}
            />
            <TextControl
              label=""
              value={city}
              placeholder="City…"
              onChange={(value) => setAttributes({ city: value })}
            />
            {buttonText ? (
              <span
                style={{
                  display: 'inline-block',
                  marginTop: '8px',
                  padding: '8px 18px',
                  background: '#1a1a2e',
                  color: '#fff',
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '13px',
                }}
              >
                {buttonText}
              </span>
            ) : null}
          </div>
        </>
      );
    },

    save: ({ attributes }) => {
      const { review, rating, imageUrl, reviewerName, city, buttonText, action } =
        attributes;
      const blockProps = useBlockProps.save({
        className: 'riyasat-client-stories__item',
        'data-action': JSON.stringify(action ?? {}),
        'data-rating': rating,
      });
      return (
        <div {...blockProps}>
          {rating ? (
            <span className="riyasat-client-stories__rating">{rating}</span>
          ) : null}
          {review ? (
            <p className="riyasat-client-stories__review">{review}</p>
          ) : null}
          {imageUrl ? (
            <img
              src={imageUrl}
              alt=""
              className="riyasat-client-stories__image"
            />
          ) : null}
          {reviewerName ? (
            <span className="riyasat-client-stories__reviewer">{reviewerName}</span>
          ) : null}
          {city ? (
            <span className="riyasat-client-stories__city">{city}</span>
          ) : null}
          {buttonText ? (
            <span className="riyasat-client-stories__button">{buttonText}</span>
          ) : null}
        </div>
      );
    },
  });
}

// ---------------------------------------------------------------------------
// Parent: core/client-stories — heading + row of testimonial cards
// ---------------------------------------------------------------------------
function registerClientStoriesParent() {
  registerBlockType(CLIENT_STORIES_BLOCK, {
    apiVersion: 3,
    title: 'Client Stories',
    description: 'A titled row of customer testimonials on a colored background.',
    category: RIYASAT_CATEGORY,
    icon: ClientStoriesIcon,
    keywords: ['client', 'stories', 'testimonials', 'reviews', 'customers'],
    supports: { html: false, align: ['wide', 'full'] },
    attributes: {
      title: { type: 'string', default: '' },
      subTitle: { type: 'string', default: '' },
      backgroundColor: { type: 'string', default: DEFAULT_BACKGROUND },
      showPagination: { type: 'boolean', default: true },
      action: { type: 'object', default: {} },
    },

    edit: ({ attributes, setAttributes, clientId }) => {
      const { title, subTitle, backgroundColor, showPagination, action } =
        attributes;
      const blockProps = useBlockProps({ className: 'riyasat-client-stories-editor' });
      const [activeIndex, setActiveIndex] = useState(0);
      const slideCount = useSelect(
        (select) => select('core/block-editor').getBlockCount(clientId),
        [clientId],
      );

      useEffect(() => {
        if (slideCount <= 0) {
          setActiveIndex(0);
          return;
        }
        if (activeIndex > slideCount - 1) setActiveIndex(slideCount - 1);
      }, [activeIndex, slideCount]);

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
              className="riyasat-client-stories"
              style={{
                background: backgroundColor,
                padding: '24px',
                borderRadius: '8px',
              }}
            >
              <div
                className="riyasat-client-stories__heading"
                style={{ textAlign: 'center' }}
              >
                {subTitle ? (
                  <p
                    className="riyasat-client-stories__subtitle"
                    style={{ margin: '0 0 4px', color: '#888', fontSize: '13px' }}
                  >
                    {subTitle}
                  </p>
                ) : null}
                {title ? (
                  <h3
                    className="riyasat-client-stories__title"
                    style={{ margin: '0 0 16px', fontSize: '22px', fontWeight: 700 }}
                  >
                    {title}
                  </h3>
                ) : null}
              </div>

              <div
                className="riyasat-client-stories__track"
                style={{ display: 'flex', gap: '16px', overflowX: 'auto' }}
              >
                <InnerBlocks
                  allowedBlocks={[CLIENT_STORIES_ITEM_BLOCK]}
                  template={[
                    [CLIENT_STORIES_ITEM_BLOCK, {}],
                    [CLIENT_STORIES_ITEM_BLOCK, {}],
                    [CLIENT_STORIES_ITEM_BLOCK, {}],
                  ]}
                  templateLock={false}
                  renderAppender={InnerBlocks.ButtonBlockAppender}
                  orientation="horizontal"
                />
              </div>

              {showPagination && slideCount > 1 ? (
                <div
                  className="riyasat-client-stories__pagination"
                  style={{
                    display: 'flex',
                    gap: '8px',
                    justifyContent: 'center',
                    marginTop: '12px',
                  }}
                >
                  {Array.from({ length: slideCount }).map((_, index) => (
                    <button
                      key={index}
                      type="button"
                      className={`riyasat-client-stories__dot${
                        index === activeIndex ? ' is-active' : ''
                      }`}
                      aria-label={`Go to story ${index + 1}`}
                      onClick={() => setActiveIndex(index)}
                      style={{
                        width: index === activeIndex ? '24px' : '10px',
                        height: '10px',
                        borderRadius: '999px',
                        border: 'none',
                        padding: 0,
                        cursor: 'pointer',
                        background:
                          index === activeIndex ? '#1a1a2e' : 'rgba(0,0,0,0.25)',
                      }}
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
      const { title, subTitle, backgroundColor, showPagination, action } =
        attributes;
      const blockProps = useBlockProps.save({
        className: 'riyasat-client-stories',
        'data-background-color': backgroundColor,
        'data-show-pagination': showPagination ? 'true' : 'false',
        'data-action': JSON.stringify(action ?? {}),
        style: { background: backgroundColor },
      });
      return (
        <div {...blockProps}>
          <div className="riyasat-client-stories__heading">
            {subTitle ? (
              <p className="riyasat-client-stories__subtitle">{subTitle}</p>
            ) : null}
            {title ? (
              <h3 className="riyasat-client-stories__title">{title}</h3>
            ) : null}
          </div>
          <div className="riyasat-client-stories__track">
            <InnerBlocks.Content />
          </div>
          {showPagination ? (
            <div
              className="riyasat-client-stories__pagination"
              aria-hidden="true"
            />
          ) : null}
        </div>
      );
    },
  });
}

/**
 * Register the client-stories parent + testimonial child. Child registers first
 * so the parent's InnerBlocks template can reference it.
 */
export function registerClientStories() {
  registerClientStoriesItem();
  registerClientStoriesParent();
}
