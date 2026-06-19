// @ts-nocheck
// Trust badges — parent (core/trust-badges) + child badge
// (core/trust-badges-item) using InnerBlocks. Authored against the kit's shared
// @wordpress runtime. Registered from ../index.ts inside registerBlocks().
import { registerBlockType, createBlock } from 'gutenberg-block-kit/wp/blocks';
import {
  useBlockProps,
  InnerBlocks,
  InspectorControls,
  PanelColorSettings,
  MediaUpload,
  MediaUploadCheck,
} from 'gutenberg-block-kit/wp/block-editor';
import { PanelBody, TextControl, TextareaControl, Button } from 'gutenberg-block-kit/wp/components';
import { ActionBuilder } from 'gutenberg-block-kit/actions';
import { contentTabStyle, ImagePicker, useChildBlocks } from '../inspector-shared';
import {
  TRUST_BADGES_BLOCK,
  TRUST_BADGES_ITEM_BLOCK,
  RIYASAT_CATEGORY,
} from '../constants';

const DEFAULT_BACKGROUND = '#f5f5f5';

function TrustBadgesIcon() {
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
        d="M12 2 4 5v6c0 5 3.4 8.5 8 11 4.6-2.5 8-6 8-11V5l-8-3zm-1.2 13.5L7 11.7l1.4-1.4 2.4 2.4 4.6-4.6L16.8 9.5l-6 6z"
      />
    </svg>
  );
}

function TrustBadgeFields({ attributes, onChange }) {
  const { icon, label, popupTitle, popupDescription, popupButtonText, action } = attributes;

  return (
    <>
      <ImagePicker
        imageUrl={icon}
        addLabel="Add icon"
        changeLabel="Change icon"
        onSelect={(url) => onChange({ icon: url })}
        onClear={() => onChange({ icon: '' })}
      />
      <TextControl
        label="Label"
        value={label}
        onChange={(value) => onChange({ label: value })}
      />
      <PanelBody title="Popup" initialOpen={false}>
        <TextControl
          label="Popup title"
          value={popupTitle}
          onChange={(value) => onChange({ popupTitle: value })}
        />
        <TextareaControl
          label="Popup description"
          value={popupDescription}
          rows={4}
          onChange={(value) => onChange({ popupDescription: value })}
        />
        <TextControl
          label="Popup button text"
          value={popupButtonText}
          onChange={(value) => onChange({ popupButtonText: value })}
        />
      </PanelBody>
      <ActionBuilder
        label="Tap action"
        value={action ?? {}}
        onChange={(next) => onChange({ action: next })}
      />
    </>
  );
}

// ---------------------------------------------------------------------------
// Child: core/trust-badges-item — one badge (icon + label + tap action)
// ---------------------------------------------------------------------------
function registerTrustBadgesItem() {
  registerBlockType(TRUST_BADGES_ITEM_BLOCK, {
    apiVersion: 3,
    title: 'Trust Badge',
    description: 'A single badge: icon, label and optional tap action.',
    category: RIYASAT_CATEGORY,
    parent: [TRUST_BADGES_BLOCK],
    icon: 'awards',
    supports: { html: false, reusable: false },
    attributes: {
      icon: { type: 'string', default: '' },
      label: { type: 'string', default: '' },
      popupTitle: { type: 'string', default: '' },
      popupDescription: { type: 'string', default: '' },
      popupButtonText: { type: 'string', default: '' },
      action: { type: 'object', default: {} },
    },

    edit: ({ attributes, setAttributes }) => {
      const { icon, label } = attributes;
      const blockProps = useBlockProps({
        className: 'riyasat-trust-badges-item-editor',
      });

      return (
        <>
          <InspectorControls group="content">
            <div style={contentTabStyle}>
              <PanelBody title="Badge" initialOpen={true}>
                <TrustBadgeFields
                  attributes={attributes}
                  onChange={(next) => setAttributes(next)}
                />
              </PanelBody>
            </div>
          </InspectorControls>

          <div {...blockProps}>
            {icon ? (
              <MediaUploadCheck>
                <MediaUpload
                  onSelect={(media) => setAttributes({ icon: media?.url ?? '' })}
                  allowedTypes={['image']}
                  render={({ open }) => (
                    <img
                      src={icon}
                      alt=""
                      className="riyasat-trust-badges-item-editor__icon"
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
                  onSelect={(media) => setAttributes({ icon: media?.url ?? '' })}
                  allowedTypes={['image']}
                  render={({ open }) => (
                    <button
                      type="button"
                      className="riyasat-trust-badges-item-editor__icon-btn"
                      onClick={open}
                      aria-label="Add badge icon"
                    >
                      +
                    </button>
                  )}
                />
              </MediaUploadCheck>
            )}
            <input
              type="text"
              className="riyasat-trust-badges-item-editor__label"
              value={label}
              placeholder="Badge label…"
              onChange={(event) => setAttributes({ label: event.target.value })}
            />
          </div>
        </>
      );
    },

    save: ({ attributes }) => {
      const { icon, label, popupTitle, popupDescription, popupButtonText, action } =
        attributes;
      const blockProps = useBlockProps.save({
        className: 'riyasat-trust-badges__item',
        'data-action': JSON.stringify(action ?? {}),
        'data-popup-title': popupTitle || '',
        'data-popup-description': popupDescription || '',
        'data-popup-button-text': popupButtonText || '',
      });
      return (
        <div {...blockProps}>
          {icon ? (
            <img src={icon} alt="" className="riyasat-trust-badges__icon" />
          ) : null}
          {label ? (
            <span className="riyasat-trust-badges__label">{label}</span>
          ) : null}
        </div>
      );
    },
  });
}

// ---------------------------------------------------------------------------
// Parent: core/trust-badges — row of badges with a background color
// ---------------------------------------------------------------------------
function registerTrustBadgesParent() {
  registerBlockType(TRUST_BADGES_BLOCK, {
    apiVersion: 3,
    title: 'Trust Badges',
    description: 'A row of trust badges (icon + label) on a colored background.',
    category: RIYASAT_CATEGORY,
    icon: TrustBadgesIcon,
    keywords: ['trust', 'badges', 'features', 'usp'],
    supports: { html: false, align: ['wide', 'full'] },
    attributes: {
      backgroundColor: { type: 'string', default: DEFAULT_BACKGROUND },
    },

    edit: ({ attributes, setAttributes, clientId }) => {
      const { backgroundColor } = attributes;
      const blockProps = useBlockProps({
        className: 'riyasat-trust-badges-editor',
      });
      const { childBlocks, childCount, insertBlock, removeBlock, updateBlockAttributes } =
        useChildBlocks(clientId);

      return (
        <>
          <InspectorControls group="content">
            <div style={contentTabStyle}>
              {childBlocks.map((block, index) => {
                const badgeLabel = block.attributes.label;
                return (
                  <PanelBody
                    key={block.clientId}
                    title={`Badge ${index + 1}${badgeLabel ? `: ${badgeLabel}` : ''}`}
                    initialOpen={false}
                  >
                    <TrustBadgeFields
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
                        Remove badge
                      </Button>
                    ) : null}
                  </PanelBody>
                );
              })}
              <Button
                variant="primary"
                onClick={() =>
                  insertBlock(createBlock(TRUST_BADGES_ITEM_BLOCK, {}), childCount, clientId)
                }
                style={{ width: '100%', justifyContent: 'center' }}
              >
                Add badge
              </Button>
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
              className="riyasat-trust-badges"
              style={{ background: backgroundColor }}
            >
              <InnerBlocks
                allowedBlocks={[TRUST_BADGES_ITEM_BLOCK]}
                template={[
                  [TRUST_BADGES_ITEM_BLOCK, {}],
                  [TRUST_BADGES_ITEM_BLOCK, {}],
                  [TRUST_BADGES_ITEM_BLOCK, {}],
                ]}
                templateLock={false}
                  renderAppender={false}
                orientation="horizontal"
              />
            </div>
          </div>
        </>
      );
    },

    save: ({ attributes }) => {
      const { backgroundColor } = attributes;
      const blockProps = useBlockProps.save({
        className: 'riyasat-trust-badges',
        'data-background-color': backgroundColor,
        style: { background: backgroundColor },
      });
      return (
        <div {...blockProps}>
          <InnerBlocks.Content />
        </div>
      );
    },
  });
}

/**
 * Register the trust-badges parent + badge child. Child registers first so the
 * parent's InnerBlocks template can reference it.
 */
export function registerTrustBadges() {
  registerTrustBadgesItem();
  registerTrustBadgesParent();
}
