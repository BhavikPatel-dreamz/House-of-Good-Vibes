// @ts-nocheck
// Hero Banner Slider — parent (core/hero-banner-slider) + child slide
// (core/hero-banner-slider-item) using InnerBlocks.
import { createContext, useContext, useState } from 'gutenberg-block-kit/wp/element';
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
  ToggleControl,
  Button,
} from 'gutenberg-block-kit/wp/components';
import { ActionBuilder } from 'gutenberg-block-kit/actions';
import {
  contentTabStyle,
  ImagePicker,
  useChildBlocks,
  useCarouselPagination,
  SliderPaginationDots,
} from '../inspector-shared';
import {
  HERO_BANNER_SLIDER_BLOCK,
  HERO_BANNER_SLIDER_ITEM_BLOCK,
  RIYASAT_CATEGORY,
} from '../constants';

const DEFAULT_PRIMARY_COLOR = '#971A4C';
const DEFAULT_PRIMARY_TEXT_COLOR = '#FFFFFF';
const DEFAULT_SECONDARY_TEXT_COLOR = '#971A4C';
const DEFAULT_ACTIVE_DOT_COLOR = 'rgba(255, 255, 255, 1)';
const DEFAULT_INACTIVE_DOT_COLOR = 'rgba(255, 255, 255, 0.7)';

function getHeroBannerDotColors(activeDotColor, inactiveDotColor) {
  return {
    '--riyasat-pagination-active': activeDotColor || DEFAULT_ACTIVE_DOT_COLOR,
    '--riyasat-pagination-inactive': inactiveDotColor || DEFAULT_INACTIVE_DOT_COLOR,
  };
}
const HeroBannerTopContentContext = createContext(false);

function HeroBannerSliderIcon() {
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
        d="M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zm2 2v10h14V7H5zm2 2h10v2H7V9zm0 3h7v2H7v-2z"
      />
    </svg>
  );
}

function HeroBannerSlideFields({ attributes, onChange }) {
  const {
    imageUrl,
    title,
    subTitle,
    description,
    primaryButtonText,
    primaryButtonBackgroundColor,
    primaryButtonBorderColor,
    primaryButtonTextColor,
    primaryButtonAction,
    secondaryButtonText,
    secondaryButtonBackgroundColor,
    secondaryButtonBorderColor,
    secondaryButtonTextColor,
    secondaryButtonAction,
  } = attributes;

  return (
    <>
      <ImagePicker
        imageUrl={imageUrl}
        onSelect={(url) => onChange({ imageUrl: url })}
        onClear={() => onChange({ imageUrl: '' })}
      />
      <TextControl
        label="Main Title"
        value={title}
        onChange={(value) => onChange({ title: value })}
      />
      <TextControl
        label="Sub Title"
        value={subTitle}
        onChange={(value) => onChange({ subTitle: value })}
      />
      <TextareaControl
        label="Description"
        value={description}
        rows={3}
        onChange={(value) => onChange({ description: value })}
      />
      <PanelBody title="Primary button" initialOpen={false}>
        <TextControl
          label="Button text"
          value={primaryButtonText}
          onChange={(value) => onChange({ primaryButtonText: value })}
        />
        <PanelColorSettings
          title="Button colors"
          colorSettings={[
            {
              label: 'Background color',
              value: primaryButtonBackgroundColor,
              onChange: (value) =>
                onChange({ primaryButtonBackgroundColor: value || DEFAULT_PRIMARY_COLOR }),
            },
            {
              label: 'Border color',
              value: primaryButtonBorderColor,
              onChange: (value) =>
                onChange({ primaryButtonBorderColor: value || DEFAULT_PRIMARY_COLOR }),
            },
            {
              label: 'Text color',
              value: primaryButtonTextColor,
              onChange: (value) =>
                onChange({ primaryButtonTextColor: value || DEFAULT_PRIMARY_TEXT_COLOR }),
            },
          ]}
        />
        <ActionBuilder
          label="Button action"
          value={primaryButtonAction ?? {}}
          onChange={(next) => onChange({ primaryButtonAction: next })}
        />
      </PanelBody>
      <PanelBody title="Secondary button" initialOpen={false}>
        <TextControl
          label="Button text"
          value={secondaryButtonText}
          onChange={(value) => onChange({ secondaryButtonText: value })}
        />
        <PanelColorSettings
          title="Button colors"
          colorSettings={[
            {
              label: 'Background color',
              value: secondaryButtonBackgroundColor,
              onChange: (value) =>
                onChange({ secondaryButtonBackgroundColor: value || 'transparent' }),
            },
            {
              label: 'Border color',
              value: secondaryButtonBorderColor,
              onChange: (value) =>
                onChange({ secondaryButtonBorderColor: value || DEFAULT_PRIMARY_COLOR }),
            },
            {
              label: 'Text color',
              value: secondaryButtonTextColor,
              onChange: (value) =>
                onChange({
                  secondaryButtonTextColor: value || DEFAULT_SECONDARY_TEXT_COLOR,
                }),
            },
          ]}
        />
        <ActionBuilder
          label="Button action"
          value={secondaryButtonAction ?? {}}
          onChange={(next) => onChange({ secondaryButtonAction: next })}
        />
      </PanelBody>
    </>
  );
}

function HeroBannerSlidePreview({ attributes, setAttributes }) {
  const topContent = useContext(HeroBannerTopContentContext);
  const {
    imageUrl,
    title,
    subTitle,
    description,
    primaryButtonText,
    primaryButtonBackgroundColor,
    primaryButtonBorderColor,
    primaryButtonTextColor,
    secondaryButtonText,
    secondaryButtonBackgroundColor,
    secondaryButtonBorderColor,
    secondaryButtonTextColor,
  } = attributes;

  const contentClass = topContent
    ? 'riyasat-hero-banner-slider-item-editor__content riyasat-hero-banner-slider-item-editor__content--top'
    : 'riyasat-hero-banner-slider-item-editor__content riyasat-hero-banner-slider-item-editor__content--bottom';

  return (
    <div className="riyasat-hero-banner-slider-item-editor__media">
      {imageUrl ? (
        <MediaUploadCheck>
          <MediaUpload
            onSelect={(media) => setAttributes({ imageUrl: media?.url ?? '' })}
            allowedTypes={['image']}
            render={({ open }) => (
              <img
                src={imageUrl}
                alt=""
                className="riyasat-hero-banner-slider-item-editor__image"
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
                className="riyasat-hero-banner-slider-item-editor__placeholder"
                onClick={open}
              >
                Add banner image
              </button>
            )}
          />
        </MediaUploadCheck>
      )}

      <div className={contentClass}>
        {title ? (
          <h3 className="riyasat-hero-banner-slider-item-editor__title">{title}</h3>
        ) : null}
        {subTitle ? (
          <p className="riyasat-hero-banner-slider-item-editor__subtitle">{subTitle}</p>
        ) : null}
        {description ? (
          <p className="riyasat-hero-banner-slider-item-editor__description">{description}</p>
        ) : null}
        <div className="riyasat-hero-banner-slider-item-editor__buttons">
          {primaryButtonText ? (
            <span
              className="riyasat-hero-banner-slider-item-editor__button riyasat-hero-banner-slider-item-editor__button--primary"
              style={{
                background: primaryButtonBackgroundColor || DEFAULT_PRIMARY_COLOR,
                borderColor: primaryButtonBorderColor || DEFAULT_PRIMARY_COLOR,
                color: primaryButtonTextColor || DEFAULT_PRIMARY_TEXT_COLOR,
              }}
            >
              {primaryButtonText}
            </span>
          ) : null}
          {secondaryButtonText ? (
            <span
              className="riyasat-hero-banner-slider-item-editor__button riyasat-hero-banner-slider-item-editor__button--secondary"
              style={{
                background: secondaryButtonBackgroundColor || 'transparent',
                borderColor: secondaryButtonBorderColor || DEFAULT_PRIMARY_COLOR,
                color: secondaryButtonTextColor || DEFAULT_SECONDARY_TEXT_COLOR,
              }}
            >
              {secondaryButtonText}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Child: core/hero-banner-slider-item
// ---------------------------------------------------------------------------
function registerHeroBannerSliderItem() {
  registerBlockType(HERO_BANNER_SLIDER_ITEM_BLOCK, {
    apiVersion: 3,
    title: 'Hero Banner Slide',
    description: 'A hero banner slide with image, copy and two call-to-action buttons.',
    category: RIYASAT_CATEGORY,
    parent: [HERO_BANNER_SLIDER_BLOCK],
    icon: 'format-image',
    supports: { html: false, reusable: false },
    attributes: {
      imageUrl: { type: 'string', default: '' },
      title: { type: 'string', default: '' },
      subTitle: { type: 'string', default: '' },
      description: { type: 'string', default: '' },
      primaryButtonText: { type: 'string', default: '' },
      primaryButtonBackgroundColor: { type: 'string', default: DEFAULT_PRIMARY_COLOR },
      primaryButtonBorderColor: { type: 'string', default: DEFAULT_PRIMARY_COLOR },
      primaryButtonTextColor: { type: 'string', default: DEFAULT_PRIMARY_TEXT_COLOR },
      primaryButtonAction: { type: 'object', default: {} },
      secondaryButtonText: { type: 'string', default: '' },
      secondaryButtonBackgroundColor: { type: 'string', default: 'transparent' },
      secondaryButtonBorderColor: { type: 'string', default: DEFAULT_PRIMARY_COLOR },
      secondaryButtonTextColor: { type: 'string', default: DEFAULT_SECONDARY_TEXT_COLOR },
      secondaryButtonAction: { type: 'object', default: {} },
    },

    edit: ({ attributes, setAttributes }) => {
      const blockProps = useBlockProps({
        className: 'riyasat-hero-banner-slider-item-editor',
      });

      return (
        <>
          <InspectorControls group="content">
            <div style={contentTabStyle}>
              <PanelBody title="Slide" initialOpen={true}>
                <HeroBannerSlideFields
                  attributes={attributes}
                  onChange={(next) => setAttributes(next)}
                />
              </PanelBody>
            </div>
          </InspectorControls>

          <div {...blockProps}>
            <HeroBannerSlidePreview attributes={attributes} setAttributes={setAttributes} />
          </div>
        </>
      );
    },

    save: ({ attributes }) => {
      const {
        imageUrl,
        title,
        subTitle,
        description,
        primaryButtonText,
        primaryButtonBackgroundColor,
        primaryButtonBorderColor,
        primaryButtonTextColor,
        primaryButtonAction,
        secondaryButtonText,
        secondaryButtonBackgroundColor,
        secondaryButtonBorderColor,
        secondaryButtonTextColor,
        secondaryButtonAction,
      } = attributes;

      const blockProps = useBlockProps.save({
        className: 'riyasat-hero-banner-slider__slide',
        'data-primary-button-action': JSON.stringify(primaryButtonAction ?? {}),
        'data-secondary-button-action': JSON.stringify(secondaryButtonAction ?? {}),
        'data-primary-button-background-color': primaryButtonBackgroundColor || '',
        'data-primary-button-border-color': primaryButtonBorderColor || '',
        'data-primary-button-text-color': primaryButtonTextColor || '',
        'data-secondary-button-background-color': secondaryButtonBackgroundColor || '',
        'data-secondary-button-border-color': secondaryButtonBorderColor || '',
        'data-secondary-button-text-color': secondaryButtonTextColor || '',
      });

      return (
        <div {...blockProps}>
          {imageUrl ? (
            <img src={imageUrl} alt="" className="riyasat-hero-banner-slider__image" />
          ) : null}
          <div className="riyasat-hero-banner-slider__content">
            {title ? <h3 className="riyasat-hero-banner-slider__title">{title}</h3> : null}
            {subTitle ? (
              <p className="riyasat-hero-banner-slider__subtitle">{subTitle}</p>
            ) : null}
            {description ? (
              <p className="riyasat-hero-banner-slider__description">{description}</p>
            ) : null}
            <div className="riyasat-hero-banner-slider__buttons">
              {primaryButtonText ? (
                <span
                  className="riyasat-hero-banner-slider__button riyasat-hero-banner-slider__button--primary"
                  style={{
                    background: primaryButtonBackgroundColor || undefined,
                    borderColor: primaryButtonBorderColor || undefined,
                    color: primaryButtonTextColor || undefined,
                  }}
                >
                  {primaryButtonText}
                </span>
              ) : null}
              {secondaryButtonText ? (
                <span
                  className="riyasat-hero-banner-slider__button riyasat-hero-banner-slider__button--secondary"
                  style={{
                    background: secondaryButtonBackgroundColor || undefined,
                    borderColor: secondaryButtonBorderColor || undefined,
                    color: secondaryButtonTextColor || undefined,
                  }}
                >
                  {secondaryButtonText}
                </span>
              ) : null}
            </div>
          </div>
        </div>
      );
    },
  });
}

// ---------------------------------------------------------------------------
// Parent: core/hero-banner-slider
// ---------------------------------------------------------------------------
function registerHeroBannerSliderParent() {
  registerBlockType(HERO_BANNER_SLIDER_BLOCK, {
    apiVersion: 3,
    title: 'Hero Banner Slider',
    description: 'Full-width hero banner carousel with copy and dual CTAs per slide.',
    category: RIYASAT_CATEGORY,
    icon: HeroBannerSliderIcon,
    keywords: ['hero', 'banner', 'slider', 'carousel'],
    supports: { html: false, align: ['wide', 'full'] },
    attributes: {
      topContent: { type: 'boolean', default: false },
      showPagination: { type: 'boolean', default: true },
      activeDotColor: { type: 'string', default: DEFAULT_ACTIVE_DOT_COLOR },
      inactiveDotColor: { type: 'string', default: DEFAULT_INACTIVE_DOT_COLOR },
      action: { type: 'object', default: {} },
    },

    edit: ({ attributes, setAttributes, clientId }) => {
      const { topContent, showPagination, activeDotColor, inactiveDotColor, action } =
        attributes;
      const dotColors = getHeroBannerDotColors(activeDotColor, inactiveDotColor);
      const blockProps = useBlockProps({ className: 'riyasat-hero-banner-slider-editor' });
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
            <div style={contentTabStyle}>
              {childBlocks.map((block, index) => {
                const slideTitle = block.attributes.title;
                return (
                  <PanelBody
                    key={block.clientId}
                    title={`Slide ${index + 1}${slideTitle ? `: ${slideTitle}` : ''}`}
                    initialOpen={false}
                  >
                    <HeroBannerSlideFields
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
                    createBlock(HERO_BANNER_SLIDER_ITEM_BLOCK, {}),
                    childCount,
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
                label="Top content"
                checked={topContent}
                onChange={(value) => setAttributes({ topContent: value })}
                help="When enabled, slide copy and buttons align to the top of the banner."
              />
              <ToggleControl
                label="Show pagination"
                checked={showPagination}
                onChange={(value) => setAttributes({ showPagination: value })}
              />
              <PanelColorSettings
                title="Pagination dots"
                colorSettings={[
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
              <ActionBuilder
                label="Section action"
                value={action ?? {}}
                onChange={(next) => setAttributes({ action: next })}
              />
            </PanelBody>
          </InspectorControls>

          <HeroBannerTopContentContext.Provider value={topContent}>
            <div {...blockProps}>
              <div className="riyasat-hero-banner-slider" style={dotColors}>
                <div
                  className="riyasat-hero-banner-slider__track"
                  data-active-index={activeIndex}
                >
                  <InnerBlocks
                    allowedBlocks={[HERO_BANNER_SLIDER_ITEM_BLOCK]}
                    template={[
                      [HERO_BANNER_SLIDER_ITEM_BLOCK, {}],
                      [HERO_BANNER_SLIDER_ITEM_BLOCK, {}],
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
                    className="riyasat-hero-banner-slider__pagination riyasat-hero-banner-slider__pagination--preview"
                    dotClassName="riyasat-hero-banner-slider__dot"
                    ariaLabelPrefix="Go to slide"
                  />
                ) : null}
              </div>
            </div>
          </HeroBannerTopContentContext.Provider>
        </>
      );
    },

    save: ({ attributes }) => {
      const { topContent, showPagination, activeDotColor, inactiveDotColor, action } =
        attributes;
      const dotColors = getHeroBannerDotColors(activeDotColor, inactiveDotColor);
      const blockProps = useBlockProps.save({
        className: 'riyasat-hero-banner-slider',
        'data-top-content': topContent ? 'true' : 'false',
        'data-show-pagination': showPagination ? 'true' : 'false',
        'data-active-dot-color': activeDotColor || DEFAULT_ACTIVE_DOT_COLOR,
        'data-inactive-dot-color': inactiveDotColor || DEFAULT_INACTIVE_DOT_COLOR,
        'data-action': JSON.stringify(action ?? {}),
        style: dotColors,
      });
      return (
        <div {...blockProps}>
          <div className="riyasat-hero-banner-slider__track">
            <InnerBlocks.Content />
          </div>
          {showPagination ? (
            <div className="riyasat-hero-banner-slider__pagination" aria-hidden="true" />
          ) : null}
        </div>
      );
    },
  });
}

export function registerHeroBannerSlider() {
  registerHeroBannerSliderItem();
  registerHeroBannerSliderParent();
}
