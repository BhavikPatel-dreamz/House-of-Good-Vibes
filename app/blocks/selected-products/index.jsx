// @ts-nocheck
// Selected Products — single block (standard/selected-products).
import { registerBlockType } from 'gutenberg-block-kit/wp/blocks';
import { useBlockProps, InspectorControls } from 'gutenberg-block-kit/wp/block-editor';
import { PanelBody, Button } from 'gutenberg-block-kit/wp/components';
import { ActionBuilder } from 'gutenberg-block-kit/actions';
import { contentTabStyle } from '../inspector-shared';
import { STANDARD_SELECTED_PRODUCTS_BLOCK, RIYASAT_CATEGORY } from '../constants';

async function pickProducts() {
  const picker = typeof window !== 'undefined' ? window.shopify?.resourcePicker : null;
  if (!picker) return null;
  const selection = await picker({ type: 'product', multiple: true });
  if (!Array.isArray(selection) || selection.length === 0) return null;
  return selection.map((product) => ({
    productId: product?.id ? String(product.id) : '',
    productHandle: product?.handle ? String(product.handle) : '',
    action: {},
  }));
}

function mergeProducts(existing, picked) {
  const byId = new Map();
  [...existing, ...picked].forEach((item) => {
    const key = String(item?.productId || item?.productHandle || '');
    if (!key) return;
    if (!byId.has(key)) byId.set(key, item);
  });
  return Array.from(byId.values());
}

export function registerStandardSelectedProducts() {
  registerBlockType(STANDARD_SELECTED_PRODUCTS_BLOCK, {
    apiVersion: 3,
    title: 'Selected Products',
    description: 'Select multiple individual products across collections.',
    category: RIYASAT_CATEGORY,
    icon: 'products',
    supports: { html: false, align: ['wide', 'full'] },
    attributes: {
      products: { type: 'array', default: [] },
      action: { type: 'object', default: {} },
    },

    edit: ({ attributes, setAttributes }) => {
      const { products, action } = attributes;
      const productList = Array.isArray(products) ? products : [];
      const blockProps = useBlockProps({
        className: 'riyasat-standard-selected-products-editor',
      });

      async function onPickProducts() {
        const picked = await pickProducts();
        if (!picked) return;
        setAttributes({ products: mergeProducts(productList, picked) });
      }

      function onRemove(index) {
        setAttributes({ products: productList.filter((_, i) => i !== index) });
      }

      return (
        <>
          <InspectorControls group="content">
            <div style={contentTabStyle}>
              <PanelBody title="Selected Products" initialOpen={true}>
                <Button
                  variant="secondary"
                  onClick={onPickProducts}
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  {productList.length > 0 ? 'Add/Change Products' : 'Select Products'}
                </Button>
                {productList.length > 0 ? (
                  <div style={{ marginTop: '10px' }}>
                    {productList.map((product, index) => (
                      <div
                        key={`${product.productId}-${index}`}
                        style={{
                          border: '1px solid #e5e7eb',
                          borderRadius: '6px',
                          padding: '8px',
                          marginBottom: '8px',
                        }}
                      >
                        <div style={{ fontSize: '12px', color: '#374151' }}>
                          <strong>ID:</strong> {product.productId || '-'}
                        </div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>
                          <strong>Handle:</strong> {product.productHandle || '-'}
                        </div>
                        <Button variant="link" isDestructive onClick={() => onRemove(index)}>
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : null}
                <ActionBuilder
                  label="Section action"
                  value={action ?? {}}
                  onChange={(next) => setAttributes({ action: next })}
                />
              </PanelBody>
            </div>
          </InspectorControls>

          <div {...blockProps}>
            {productList.length > 0 ? (
              <div
                style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '10px',
                  background: '#fff',
                }}
              >
                <div
                  style={{
                    fontSize: '12px',
                    color: '#6b7280',
                    marginBottom: '8px',
                    fontWeight: 600,
                  }}
                >
                  {productList.length} selected product(s)
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                    gap: '8px',
                  }}
                >
                  {productList.map((product, index) => (
                    <div
                      key={`${product.productId}-${index}-preview`}
                      style={{
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        padding: '8px',
                        minHeight: '60px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        gap: '2px',
                      }}
                    >
                      <div style={{ fontSize: '11px', color: '#6b7280' }}>
                        {product.productId || '-'}
                      </div>
                      <div
                        style={{
                          fontSize: '12px',
                          color: '#111827',
                          fontWeight: 600,
                          wordBreak: 'break-word',
                        }}
                      >
                        {product.productHandle || 'product'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div
                style={{
                  border: '1px dashed rgba(0,0,0,0.2)',
                  borderRadius: '8px',
                  padding: '12px',
                  fontSize: '12px',
                  color: '#6b7280',
                }}
              >
                Select products from the right sidebar
              </div>
            )}
          </div>
        </>
      );
    },

    save: ({ attributes }) => {
      const { products, action } = attributes;
      const blockProps = useBlockProps.save({
        className: 'riyasat-standard-selected-products',
        'data-products': JSON.stringify(Array.isArray(products) ? products : []),
        'data-action': JSON.stringify(action ?? {}),
      });
      return <div {...blockProps} />;
    },
  });
}
