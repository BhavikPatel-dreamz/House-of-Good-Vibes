// @ts-nocheck
// Client Stories — parent (core/client-stories) + child testimonial card
// (core/client-stories-item) using InnerBlocks.
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
  TextareaControl,
  SelectControl,
  ToggleControl,
  Button,
} from 'gutenberg-block-kit/wp/components';
import { useState } from 'gutenberg-block-kit/wp/element';
import { ActionBuilder } from 'gutenberg-block-kit/actions';
import {
  contentTabStyle,
  ImagePicker,
  useChildBlocks,
  useSliderPagination,
  SliderPaginationDots,
} from '../inspector-shared';
import {
  CLIENT_STORIES_BLOCK,
  CLIENT_STORIES_ITEM_BLOCK,
  RIYASAT_CATEGORY,
} from '../constants';

const DEFAULT_BACKGROUND = '#f5f2ee';
const BRAND_MAROON = '#982054';
const DEFAULT_BUTTON_TEXT = 'VIEW PRODUCT';

const RATING_OPTIONS = [
  { label: '5 stars', value: '5' },
  { label: '4 stars', value: '4' },
  { label: '3 stars', value: '3' },
  { label: '2 stars', value: '2' },
  { label: '1 star', value: '1' },
];

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

function renderStars(rating) {
  const count = Math.max(0, Math.min(5, parseInt(rating, 10) || 5));
  return `${'★'.repeat(count)}${'☆'.repeat(5 - count)}`;
}

function ClientStoryFields({ attributes, onChange }) {
  const { review, rating, imageUrl, reviewerName, city, buttonText, action } = attributes;

  return (
    <>
      <ImagePicker
        imageUrl={imageUrl}
        onSelect={(url) => onChange({ imageUrl: url })}
        onClear={() => onChange({ imageUrl: '' })}
      />
      <TextareaControl
        label="Review"
        value={review}
        rows={4}
        onChange={(value) => onChange({ review: value })}
      />
      <SelectControl
        label="Rating"
        value={rating || '5'}
        options={RATING_OPTIONS}
        onChange={(value) => onChange({ rating: value })}
      />
      <TextControl
        label="Reviewer name"
        value={reviewerName}
        onChange={(value) => onChange({ reviewerName: value })}
      />
      <TextControl
        label="City"
        value={city}
        onChange={(value) => onChange({ city: value })}
      />
      <TextControl
        label="Button text"
        value={buttonText}
        onChange={(value) => onChange({ buttonText: value })}
      />
      <ActionBuilder
        label="Button action"
        value={action ?? {}}
        onChange={(next) => onChange({ action: next })}
      />
    </>
  );
}

function ClientStoryCardPreview({ attributes, setAttributes }) {
  const { review, rating, imageUrl, reviewerName, city, buttonText } = attributes;
  const stars = renderStars(rating || '5');
  const buttonLabel = buttonText || DEFAULT_BUTTON_TEXT;

  return (
    <div className="riyasat-client-stories-item-editor__card">
      <div className="riyasat-client-stories-item-editor__media">
        {imageUrl ? (
          <MediaUploadCheck>
            <MediaUpload
              onSelect={(media) => setAttributes({ imageUrl: media?.url ?? '' })}
              allowedTypes={['image']}
              render={({ open }) => (
                <img
                  src={imageUrl}
                  alt=""
                  className="riyasat-client-stories-item-editor__image"
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
                  className="riyasat-client-stories-item-editor__image-btn"
                  onClick={open}
                >
                  Add image
                </button>
              )}
            />
          </MediaUploadCheck>
        )}
      </div>

      <div className="riyasat-client-stories-item-editor__body">
        <textarea
          className="riyasat-client-stories-item-editor__field riyasat-client-stories-item-editor__field--review"
          value={review}
          placeholder="Review…"
          rows={4}
          onChange={(event) => setAttributes({ review: event.target.value })}
        />

        <div className="riyasat-client-stories-item-editor__footer">
          <div className="riyasat-client-stories-item-editor__meta">
            <input
              type="text"
              className="riyasat-client-stories-item-editor__field riyasat-client-stories-item-editor__field--name"
              value={reviewerName}
              placeholder="Reviewer name…"
              onChange={(event) => setAttributes({ reviewerName: event.target.value })}
            />
            <input
              type="text"
              className="riyasat-client-stories-item-editor__field riyasat-client-stories-item-editor__field--city"
              value={city}
              placeholder="City…"
              onChange={(event) => setAttributes({ city: event.target.value })}
            />
          </div>
          <div
            className="riyasat-client-stories-item-editor__stars"
            aria-label={`${rating || '5'} out of 5 stars`}
          >
            {stars}
          </div>
        </div>

        <span className="riyasat-client-stories-item-editor__button">{buttonLabel}</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Child: core/client-stories-item
// ---------------------------------------------------------------------------
function registerClientStoriesItem() {
  registerBlockType(CLIENT_STORIES_ITEM_BLOCK, {
    apiVersion: 3,
    title: 'Client Story',
    description: 'A testimonial card with image, review, rating and CTA.',
    category: RIYASAT_CATEGORY,
    parent: [CLIENT_STORIES_BLOCK],
    icon: 'format-quote',
    supports: { html: false, reusable: false },
    attributes: {
      review: { type: 'string', default: '' },
      rating: { type: 'string', default: '5' },
      imageUrl: { type: 'string', default: '' },
      reviewerName: { type: 'string', default: '' },
      city: { type: 'string', default: '' },
      buttonText: { type: 'string', default: '' },
      action: { type: 'object', default: {} },
    },

    edit: ({ attributes, setAttributes }) => {
      const blockProps = useBlockProps({
        className: 'riyasat-client-stories-item-editor',
      });

      return (
        <>
          <InspectorControls group="content">
            <div style={contentTabStyle}>
              <PanelBody title="Story" initialOpen={true}>
                <ClientStoryFields
                  attributes={attributes}
                  onChange={(next) => setAttributes(next)}
                />
              </PanelBody>
            </div>
          </InspectorControls>

          <div {...blockProps}>
            <ClientStoryCardPreview attributes={attributes} setAttributes={setAttributes} />
          </div>
        </>
      );
    },

    save: ({ attributes }) => {
      const { review, rating, imageUrl, reviewerName, city, buttonText, action } = attributes;
      const stars = renderStars(rating || '5');
      const buttonLabel = buttonText || DEFAULT_BUTTON_TEXT;

      const blockProps = useBlockProps.save({
        className: 'riyasat-client-stories__item',
        'data-action': JSON.stringify(action ?? {}),
        'data-rating': rating || '5',
      });

      return (
        <div {...blockProps}>
          {imageUrl ? (
            <div className="riyasat-client-stories__media">
              <img
                src={imageUrl}
                alt=""
                className="riyasat-client-stories__image"
              />
            </div>
          ) : null}
          <div className="riyasat-client-stories__body">
            {review ? (
              <p className="riyasat-client-stories__review">{review}</p>
            ) : null}
            <div className="riyasat-client-stories__footer">
              <div className="riyasat-client-stories__meta">
                {reviewerName ? (
                  <span className="riyasat-client-stories__reviewer">{reviewerName}</span>
                ) : null}
                {city ? <span className="riyasat-client-stories__city">{city}</span> : null}
              </div>
              <span
                className="riyasat-client-stories__stars"
                aria-label={`${rating || '5'} out of 5 stars`}
              >
                {stars}
              </span>
            </div>
            <span className="riyasat-client-stories__button">{buttonLabel}</span>
          </div>
        </div>
      );
    },
  });
}

// ---------------------------------------------------------------------------
// Parent: core/client-stories
// ---------------------------------------------------------------------------
function registerClientStoriesParent() {
  registerBlockType(CLIENT_STORIES_BLOCK, {
    apiVersion: 3,
    title: 'Client Stories',
    description: 'A titled, horizontally scrolling row of customer testimonials.',
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
      const { title, subTitle, backgroundColor, showPagination, action } = attributes;
      const blockProps = useBlockProps({ className: 'riyasat-client-stories-editor' });
      const [activeIndex, setActiveIndex] = useState(0);
      const { childBlocks, childCount, insertBlock, removeBlock, updateBlockAttributes } =
        useChildBlocks(clientId);
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
              {childBlocks.map((block, index) => {
                const storyTitle = block.attributes.reviewerName;
                return (
                  <PanelBody
                    key={block.clientId}
                    title={`Story ${index + 1}${storyTitle ? `: ${storyTitle}` : ''}`}
                    initialOpen={false}
                  >
                    <ClientStoryFields
                      attributes={block.attributes}
                      onChange={(next) => updateBlockAttributes(block.clientId, next)}
                    />
                    {childCount > 1 ? (
                      <Button
                        onClick={() => removeBlock(block.clientId)}
                        variant="link"
                        isDestructive
                        style={{ marginTop: '8px' }}
                      >
                        Remove story
                      </Button>
                    ) : null}
                  </PanelBody>
                );
              })}
              <Button
                variant="primary"
                onClick={() =>
                  insertBlock(createBlock(CLIENT_STORIES_ITEM_BLOCK, {}), childCount, clientId)
                }
                style={{ width: '100%', justifyContent: 'center' }}
              >
                Add story
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
              <ActionBuilder
                label="Section action"
                value={action}
                onChange={(next) => setAttributes({ action: next })}
              />
            </PanelBody>
          </InspectorControls>

          <div {...blockProps}>
            <div
              className="riyasat-client-stories"
              style={{ background: backgroundColor }}
            >
              {(subTitle || title) && (
                <div className="riyasat-client-stories__heading">
                  {subTitle ? (
                    <p className="riyasat-client-stories__subtitle">{subTitle}</p>
                  ) : null}
                  {title ? (
                    <h3 className="riyasat-client-stories__title">{title}</h3>
                  ) : null}
                </div>
              )}

              <div className="riyasat-client-stories__track" ref={trackRef}>
                <InnerBlocks
                  allowedBlocks={[CLIENT_STORIES_ITEM_BLOCK]}
                  template={[
                    [CLIENT_STORIES_ITEM_BLOCK, { rating: '5' }],
                    [CLIENT_STORIES_ITEM_BLOCK, { rating: '5' }],
                    [CLIENT_STORIES_ITEM_BLOCK, { rating: '5' }],
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
                  className="riyasat-client-stories__pagination"
                  dotClassName="riyasat-client-stories__dot"
                  ariaLabelPrefix="Go to story"
                />
              ) : null}
            </div>
          </div>
        </>
      );
    },

    save: ({ attributes }) => {
      const { title, subTitle, backgroundColor, showPagination, action } = attributes;
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
            {title ? <h3 className="riyasat-client-stories__title">{title}</h3> : null}
          </div>
          <div className="riyasat-client-stories__track">
            <InnerBlocks.Content />
          </div>
          {showPagination ? (
            <div className="riyasat-client-stories__pagination" aria-hidden="true" />
          ) : null}
        </div>
      );
    },
  });
}

export function registerClientStories() {
  registerClientStoriesItem();
  registerClientStoriesParent();
}
