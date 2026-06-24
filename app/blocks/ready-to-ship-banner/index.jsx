// @ts-nocheck
// Ready to Ship Banner — single block with media, stats repeater and dual CTAs.
import { registerBlockType } from 'gutenberg-block-kit/wp/blocks';
import {
  useBlockProps,
  InspectorControls,
  PanelColorSettings,
  MediaUpload,
  MediaUploadCheck,
} from 'gutenberg-block-kit/wp/block-editor';
import {
  PanelBody,
  TextControl,
  TextareaControl,
  Button,
} from 'gutenberg-block-kit/wp/components';
import { ActionBuilder } from 'gutenberg-block-kit/actions';
import { contentTabStyle } from '../inspector-shared';
import { READY_TO_SHIP_BANNER_BLOCK, RIYASAT_CATEGORY } from '../constants';

const DEFAULT_BACKGROUND = '#982054';
const DEFAULT_PRIMARY_COLOR = '#FFFFFF';
const DEFAULT_SECONDARY_BORDER = '#FFFFFF';

const DEFAULT_STATS = [
  { value: '100+', label: 'Styles Available' },
  { value: '7', label: 'Day Shipping' },
  { value: 'Pan', label: 'India Delivery' },
];

function ReadyToShipBannerIcon() {
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
        d="M3 6h13l5 5v7a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2zm2 2v10h14V9.8L15.2 8H5zm3 2h8v2H8v-2zm0 3h6v2H8v-2z"
      />
    </svg>
  );
}

const isVideoMedia = (media) =>
  media?.type === 'video' ||
  (typeof media?.type === 'string' && media.type.startsWith('video/'));

function resolveMediaType(selected) {
  const mime =
    selected?.mime ||
    selected?.mime_type ||
    (typeof selected?.type === 'string' && selected.type.includes('/')
      ? selected.type
      : '');

  if (typeof mime === 'string' && mime.startsWith('video')) return 'video';
  if (selected?.type === 'video') return 'video';

  const url = selected?.url || selected?.source_url || '';
  if (/\.(mp4|webm|mov|m4v|ogg)(\?|$)/i.test(url)) return 'video';

  return 'image';
}

function ReadyToShipMedia({ media, hasMedia, onSelectMedia }) {
  if (hasMedia) {
    if (isVideoMedia(media)) {
      return (
        <video
          className="riyasat-ready-to-ship-banner__video"
          src={media.url}
          controls
        />
      );
    }

    return (
      <img
        className="riyasat-ready-to-ship-banner__image"
        src={media.url}
        alt=""
      />
    );
  }

  return (
    <MediaUploadCheck>
      <MediaUpload
        onSelect={onSelectMedia}
        allowedTypes={['image', 'video']}
        render={({ open }) => (
          <button
            type="button"
            className="riyasat-ready-to-ship-banner__media-btn"
            onClick={open}
          >
            Add image or video
          </button>
        )}
      />
    </MediaUploadCheck>
  );
}

function StatsRepeater({ stats, onChange }) {
  const items = Array.isArray(stats) ? stats : [];

  function updateStat(index, patch) {
    const next = items.map((item, i) =>
      i === index ? { ...(item || {}), ...patch } : { ...(item || {}) },
    );
    onChange(next);
  }

  function addStat() {
    onChange([...items.map((item) => ({ ...(item || {}) })), { value: '', label: '' }]);
  }

  function removeStat(index) {
    onChange(items.filter((_, i) => i !== index).map((item) => ({ ...(item || {}) })));
  }

  return (
    <PanelBody title="Stats" initialOpen={false}>
      {items.map((stat, index) => (
        <div
          key={`stat-${index}`}
          style={{
            marginBottom: '16px',
            paddingBottom: '12px',
            borderBottom: '1px solid #e5e7eb',
          }}
        >
          <p
            style={{
              margin: '0 0 10px',
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              color: '#6b7280',
            }}
          >
            Stat {index + 1}
          </p>
          <TextControl
            id={`ready-to-ship-stat-${index}-value`}
            label="Value"
            value={stat?.value ?? ''}
            onChange={(value) => updateStat(index, { value })}
          />
          <TextControl
            id={`ready-to-ship-stat-${index}-label`}
            label="Label"
            value={stat?.label ?? ''}
            onChange={(value) => updateStat(index, { label: value })}
          />
          <Button
            onClick={() => removeStat(index)}
            variant="link"
            isDestructive
            style={{ marginTop: '4px' }}
          >
            Remove stat
          </Button>
        </div>
      ))}
      <Button
        variant="secondary"
        onClick={addStat}
        style={{ width: '100%', justifyContent: 'center' }}
      >
        Add stat
      </Button>
    </PanelBody>
  );
}

export function registerReadyToShipBanner() {
  registerBlockType(READY_TO_SHIP_BANNER_BLOCK, {
    apiVersion: 3,
    title: 'Ready to Ship Banner',
    description: 'Promo banner with stats, media and dual call-to-action buttons.',
    category: RIYASAT_CATEGORY,
    icon: ReadyToShipBannerIcon,
    keywords: ['ready', 'ship', 'banner', 'stats', 'cta'],
    supports: { html: false, align: ['wide', 'full'] },
    attributes: {
      title: { type: 'string', default: '' },
      subTitle: { type: 'string', default: '' },
      description: { type: 'string', default: '' },
      backgroundColor: { type: 'string', default: DEFAULT_BACKGROUND },
      media: { type: 'object', default: {} },
      stats: {
        type: 'array',
        default: DEFAULT_STATS.map((stat) => ({ ...stat })),
      },
      primaryButtonText: { type: 'string', default: '' },
      primaryButtonColor: { type: 'string', default: DEFAULT_PRIMARY_COLOR },
      primaryButtonBorderColor: { type: 'string', default: DEFAULT_PRIMARY_COLOR },
      primaryButtonAction: { type: 'object', default: {} },
      secondaryButtonText: { type: 'string', default: '' },
      secondaryButtonColor: { type: 'string', default: 'transparent' },
      secondaryButtonBorderColor: { type: 'string', default: DEFAULT_SECONDARY_BORDER },
      secondaryButtonAction: { type: 'object', default: {} },
    },

    edit: ({ attributes, setAttributes }) => {
      const {
        title,
        subTitle,
        description,
        backgroundColor,
        media,
        stats,
        primaryButtonText,
        primaryButtonColor,
        primaryButtonBorderColor,
        primaryButtonAction,
        secondaryButtonText,
        secondaryButtonColor,
        secondaryButtonBorderColor,
        secondaryButtonAction,
      } = attributes;
      const blockProps = useBlockProps({
        className: 'riyasat-ready-to-ship-banner-editor',
      });
      const hasMedia = media && media.url;
      const statItems = Array.isArray(stats) ? stats : [];

      function onSelectMedia(selected) {
        const url = selected?.url ?? selected?.source_url ?? '';
        setAttributes({
          media: {
            url,
            type: resolveMediaType({ ...selected, url }),
          },
        });
      }

      return (
        <>
          <InspectorControls group="content">
            <div style={contentTabStyle}>
              <PanelBody title="Heading" initialOpen={true}>
                <TextControl
                  id="ready-to-ship-main-title"
                  label="Main Title"
                  value={title ?? ''}
                  onChange={(value) => setAttributes({ title: value })}
                />
                <TextControl
                  id="ready-to-ship-sub-title"
                  label="Sub Title"
                  value={subTitle ?? ''}
                  onChange={(value) => setAttributes({ subTitle: value })}
                />
                <TextareaControl
                  id="ready-to-ship-description"
                  label="Description"
                  value={description ?? ''}
                  rows={4}
                  onChange={(value) => setAttributes({ description: value })}
                />
              </PanelBody>

              <PanelBody title="Media (image or video)" initialOpen={true}>
                <MediaUploadCheck>
                  <MediaUpload
                    onSelect={onSelectMedia}
                    allowedTypes={['image', 'video']}
                    render={({ open }) => (
                      <div>
                        <Button
                          onClick={open}
                          variant="secondary"
                          style={{ width: '100%', justifyContent: 'center' }}
                        >
                          {hasMedia ? 'Change media' : 'Add media'}
                        </Button>
                        {hasMedia ? (
                          <>
                            <p
                              style={{
                                margin: '6px 0 0',
                                fontSize: '12px',
                                color: '#666',
                                wordBreak: 'break-all',
                              }}
                            >
                              {media.type || 'media'}
                            </p>
                            <Button
                              onClick={() => setAttributes({ media: {} })}
                              variant="link"
                              isDestructive
                              style={{ marginTop: '4px' }}
                            >
                              Remove media
                            </Button>
                          </>
                        ) : null}
                      </div>
                    )}
                  />
                </MediaUploadCheck>
              </PanelBody>

              <StatsRepeater
                stats={statItems}
                onChange={(next) => setAttributes({ stats: next })}
              />

              <PanelBody title="Primary button" initialOpen={false}>
                <TextControl
                  label="Button text"
                  value={primaryButtonText}
                  onChange={(value) => setAttributes({ primaryButtonText: value })}
                />
                <PanelColorSettings
                  title="Button colors"
                  colorSettings={[
                    {
                      label: 'Button color',
                      value: primaryButtonColor,
                      onChange: (value) =>
                        setAttributes({ primaryButtonColor: value || DEFAULT_PRIMARY_COLOR }),
                    },
                    {
                      label: 'Border color',
                      value: primaryButtonBorderColor,
                      onChange: (value) =>
                        setAttributes({
                          primaryButtonBorderColor: value || DEFAULT_PRIMARY_COLOR,
                        }),
                    },
                  ]}
                />
                <ActionBuilder
                  label="Button action"
                  value={primaryButtonAction ?? {}}
                  onChange={(next) => setAttributes({ primaryButtonAction: next })}
                />
              </PanelBody>

              <PanelBody title="Secondary button" initialOpen={false}>
                <TextControl
                  label="Button text"
                  value={secondaryButtonText}
                  onChange={(value) => setAttributes({ secondaryButtonText: value })}
                />
                <PanelColorSettings
                  title="Button colors"
                  colorSettings={[
                    {
                      label: 'Button color',
                      value: secondaryButtonColor,
                      onChange: (value) =>
                        setAttributes({ secondaryButtonColor: value || 'transparent' }),
                    },
                    {
                      label: 'Border color',
                      value: secondaryButtonBorderColor,
                      onChange: (value) =>
                        setAttributes({
                          secondaryButtonBorderColor: value || DEFAULT_SECONDARY_BORDER,
                        }),
                    },
                  ]}
                />
                <ActionBuilder
                  label="Button action"
                  value={secondaryButtonAction ?? {}}
                  onChange={(next) => setAttributes({ secondaryButtonAction: next })}
                />
              </PanelBody>
            </div>
          </InspectorControls>

          <InspectorControls>
            <PanelBody title="Settings" initialOpen={true}>
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
              className="riyasat-ready-to-ship-banner"
              style={{ background: backgroundColor, color: '#fff' }}
            >
              <div className="riyasat-ready-to-ship-banner__content">
                  {title ? (
                  <h2 className="riyasat-ready-to-ship-banner__title">{title}</h2>
                ) : null}
                {subTitle ? (
                  <p className="riyasat-ready-to-ship-banner__subtitle">{subTitle}</p>
                ) : null}
                {description ? (
                  <p className="riyasat-ready-to-ship-banner__description">{description}</p>
                ) : null}

                {statItems.length > 0 ? (
                  <div className="riyasat-ready-to-ship-banner__stats">
                    {statItems.map((stat, index) => (
                      <div
                        key={`preview-stat-${index}`}
                        className="riyasat-ready-to-ship-banner__stat"
                      >
                        {stat.value ? (
                          <span className="riyasat-ready-to-ship-banner__stat-value">
                            {stat.value}
                          </span>
                        ) : null}
                        {stat.label ? (
                          <span className="riyasat-ready-to-ship-banner__stat-label">
                            {stat.label}
                          </span>
                        ) : null}
                      </div>
                    ))}
                  </div>
                ) : null}

                <div className="riyasat-ready-to-ship-banner__media">
                  <ReadyToShipMedia
                    media={media}
                    hasMedia={hasMedia}
                    onSelectMedia={onSelectMedia}
                  />
                </div>

                <div className="riyasat-ready-to-ship-banner__buttons">
                  {primaryButtonText ? (
                    <span
                      className="riyasat-ready-to-ship-banner__button riyasat-ready-to-ship-banner__button--primary"
                      style={{
                        background: primaryButtonColor || DEFAULT_PRIMARY_COLOR,
                        borderColor: primaryButtonBorderColor || DEFAULT_PRIMARY_COLOR,
                        color: primaryButtonColor === '#FFFFFF' ? DEFAULT_BACKGROUND : '#fff',
                      }}
                    >
                      {primaryButtonText}
                    </span>
                  ) : null}
                  {secondaryButtonText ? (
                    <span
                      className="riyasat-ready-to-ship-banner__button riyasat-ready-to-ship-banner__button--secondary"
                      style={{
                        background: secondaryButtonColor || 'transparent',
                        borderColor: secondaryButtonBorderColor || DEFAULT_SECONDARY_BORDER,
                        color: '#fff',
                      }}
                    >
                      {secondaryButtonText}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </>
      );
    },

    save: ({ attributes }) => {
      const {
        title,
        subTitle,
        description,
        backgroundColor,
        media,
        stats,
        primaryButtonText,
        primaryButtonColor,
        primaryButtonBorderColor,
        primaryButtonAction,
        secondaryButtonText,
        secondaryButtonColor,
        secondaryButtonBorderColor,
        secondaryButtonAction,
      } = attributes;
      const statItems = Array.isArray(stats) ? stats : [];

      const blockProps = useBlockProps.save({
        className: 'riyasat-ready-to-ship-banner',
        'data-background-color': backgroundColor || '',
        'data-media': JSON.stringify(media ?? {}),
        'data-stats': JSON.stringify(statItems),
        'data-primary-button-color': primaryButtonColor || '',
        'data-primary-button-border-color': primaryButtonBorderColor || '',
        'data-primary-button-action': JSON.stringify(primaryButtonAction ?? {}),
        'data-secondary-button-color': secondaryButtonColor || '',
        'data-secondary-button-border-color': secondaryButtonBorderColor || '',
        'data-secondary-button-action': JSON.stringify(secondaryButtonAction ?? {}),
        style: { background: backgroundColor },
      });

      return (
        <div {...blockProps}>
          <div className="riyasat-ready-to-ship-banner__content">
            {title ? <h2 className="riyasat-ready-to-ship-banner__title">{title}</h2> : null}
            {subTitle ? (
              <p className="riyasat-ready-to-ship-banner__subtitle">{subTitle}</p>
            ) : null}
            {description ? (
              <p className="riyasat-ready-to-ship-banner__description">{description}</p>
            ) : null}

            {statItems.length > 0 ? (
              <div className="riyasat-ready-to-ship-banner__stats">
                {statItems.map((stat, index) => (
                  <div
                    key={`stat-${index}`}
                    className="riyasat-ready-to-ship-banner__stat"
                    data-value={stat.value || ''}
                    data-label={stat.label || ''}
                  >
                    {stat.value ? (
                      <span className="riyasat-ready-to-ship-banner__stat-value">
                        {stat.value}
                      </span>
                    ) : null}
                    {stat.label ? (
                      <span className="riyasat-ready-to-ship-banner__stat-label">
                        {stat.label}
                      </span>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : null}

            {media?.url ? (
              <div className="riyasat-ready-to-ship-banner__media">
                {isVideoMedia(media) ? (
                  <video
                    className="riyasat-ready-to-ship-banner__video"
                    src={media.url}
                    playsInline
                    muted
                  />
                ) : (
                  <img
                    className="riyasat-ready-to-ship-banner__image"
                    src={media.url}
                    alt=""
                  />
                )}
              </div>
            ) : null}

            <div className="riyasat-ready-to-ship-banner__buttons">
              {primaryButtonText ? (
                <span
                  className="riyasat-ready-to-ship-banner__button riyasat-ready-to-ship-banner__button--primary"
                  style={{
                    background: primaryButtonColor || undefined,
                    borderColor: primaryButtonBorderColor || undefined,
                  }}
                >
                  {primaryButtonText}
                </span>
              ) : null}
              {secondaryButtonText ? (
                <span
                  className="riyasat-ready-to-ship-banner__button riyasat-ready-to-ship-banner__button--secondary"
                  style={{
                    background: secondaryButtonColor || undefined,
                    borderColor: secondaryButtonBorderColor || undefined,
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
