// @ts-nocheck
// Standard Banner — single block (standard/banner) with image + action.
import { registerBlockType } from 'gutenberg-block-kit/wp/blocks';
import {
  useBlockProps,
  InspectorControls,
  MediaUpload,
  MediaUploadCheck,
} from 'gutenberg-block-kit/wp/block-editor';
import { PanelBody, Button } from 'gutenberg-block-kit/wp/components';
import { ActionBuilder } from 'gutenberg-block-kit/actions';
import { contentTabStyle } from '../inspector-shared';
import { STANDARD_BANNER_BLOCK, RIYASAT_CATEGORY } from '../constants';

function StandardBannerIcon() {
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
        d="M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zm1 2v10h16V7H4zm2 2h8v2H6V9z"
      />
    </svg>
  );
}

export function registerStandardBanner() {
  registerBlockType(STANDARD_BANNER_BLOCK, {
    apiVersion: 3,
    title: 'Banner',
    description: 'Standard banner with selectable image and action.',
    category: RIYASAT_CATEGORY,
    icon: StandardBannerIcon,
    supports: { html: false, align: ['wide', 'full'] },
    attributes: {
      imageUrl: { type: 'string', default: '' },
      action: { type: 'object', default: {} },
    },

    edit: ({ attributes, setAttributes }) => {
      const { imageUrl, action } = attributes;
      const blockProps = useBlockProps({ className: 'riyasat-standard-banner-editor' });

      return (
        <>
          <InspectorControls group="content">
            <div style={contentTabStyle}>
              <PanelBody title="Banner" initialOpen={true}>
                <MediaUploadCheck>
                  <MediaUpload
                    onSelect={(media) =>
                      setAttributes({ imageUrl: media?.url ?? '' })
                    }
                    allowedTypes={['image']}
                    render={({ open }) => (
                      <div>
                        <Button
                          onClick={open}
                          variant="secondary"
                          style={{ width: '100%', justifyContent: 'center' }}
                        >
                          {imageUrl ? 'Change image' : 'Add image'}
                        </Button>
                        {imageUrl ? (
                          <Button
                            onClick={() => setAttributes({ imageUrl: '' })}
                            variant="link"
                            isDestructive
                            style={{ marginTop: '4px' }}
                          >
                            Remove image
                          </Button>
                        ) : null}
                      </div>
                    )}
                  />
                </MediaUploadCheck>
                <ActionBuilder
                  label="Banner action"
                  value={action ?? {}}
                  onChange={(next) => setAttributes({ action: next })}
                />
              </PanelBody>
            </div>
          </InspectorControls>

          <div {...blockProps}>
            {imageUrl ? (
              <img
                src={imageUrl}
                alt=""
                style={{
                  width: '100%',
                  display: 'block',
                  borderRadius: '8px',
                  minHeight: '160px',
                  objectFit: 'cover',
                }}
              />
            ) : (
              <div
                style={{
                  minHeight: '160px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px dashed rgba(0, 0, 0, 0.25)',
                  borderRadius: '8px',
                  color: '#6b7280',
                }}
              >
                Select banner image from sidebar
              </div>
            )}
          </div>
        </>
      );
    },

    save: ({ attributes }) => {
      const { imageUrl, action } = attributes;
      const blockProps = useBlockProps.save({
        className: 'riyasat-standard-banner',
        'data-action': JSON.stringify(action ?? {}),
      });

      return (
        <div {...blockProps}>
          {imageUrl ? (
            <img src={imageUrl} alt="" className="riyasat-standard-banner__image" />
          ) : null}
        </div>
      );
    },
  });
}
