import { useCallback, useRef, useState, type ChangeEvent } from "react";
import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";

import { getShopSettings, type ShopSettingsInput } from "../lib/settings.server";
import {
  EMPTY_COLLECTION_REF,
  EMPTY_PRODUCT_REF,
  hasCollectionRef,
  hasProductRef,
  type SettingsCollectionRef,
  type SettingsProductRef,
} from "../lib/settings-resources";
import { normalizeUploadFile } from "../lib/media-utils";
import { authenticate } from "../shopify.server";

async function pickCollection(): Promise<SettingsCollectionRef | null> {
  const picker =
    typeof window !== "undefined" ? window.shopify?.resourcePicker : null;
  if (!picker) return null;

  const selection = await picker({ type: "collection", multiple: false });
  const collection = selection?.[0];
  if (!collection?.id) return null;

  return {
    collectionId: String(collection.id),
    handle: collection.handle ? String(collection.handle) : "",
    title: collection.title ? String(collection.title) : "",
  };
}

async function pickProduct(): Promise<SettingsProductRef | null> {
  const picker =
    typeof window !== "undefined" ? window.shopify?.resourcePicker : null;
  if (!picker) return null;

  const selection = await picker({ type: "product", multiple: false });
  const product = selection?.[0];
  if (!product?.id) return null;

  return {
    productId: String(product.id),
    handle: product.handle ? String(product.handle) : "",
    title: product.title ? String(product.title) : "",
  };
}

function CollectionPickerField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: SettingsCollectionRef;
  onChange: (next: SettingsCollectionRef) => void;
}) {
  const selected = hasCollectionRef(value);

  return (
    <s-stack direction="block" gap="small">
      <s-text color="subdued">{label}</s-text>
      {selected ? (
        <s-stack direction="block" gap="small">
          <s-text>
            <strong>{value.title || "Selected collection"}</strong>
          </s-text>
          {value.handle ? <s-text color="subdued">{value.handle}</s-text> : null}
        </s-stack>
      ) : (
        <s-text color="subdued">No collection selected.</s-text>
      )}
      <s-stack direction="inline" gap="small" alignItems="center">
        <s-button
          variant="secondary"
          onClick={async () => {
            const picked = await pickCollection();
            if (picked) onChange(picked);
          }}
        >
          {selected ? "Change collection" : "Select collection"}
        </s-button>
        {selected ? (
          <s-button variant="tertiary" onClick={() => onChange({ ...EMPTY_COLLECTION_REF })}>
            Clear
          </s-button>
        ) : null}
      </s-stack>
    </s-stack>
  );
}

function ProductPickerField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: SettingsProductRef;
  onChange: (next: SettingsProductRef) => void;
}) {
  const selected = hasProductRef(value);

  return (
    <s-stack direction="block" gap="small">
      <s-text color="subdued">{label}</s-text>
      {selected ? (
        <s-stack direction="block" gap="small">
          <s-text>
            <strong>{value.title || "Selected product"}</strong>
          </s-text>
          {value.handle ? <s-text color="subdued">{value.handle}</s-text> : null}
        </s-stack>
      ) : (
        <s-text color="subdued">No product selected.</s-text>
      )}
      <s-stack direction="inline" gap="small" alignItems="center">
        <s-button
          variant="secondary"
          onClick={async () => {
            const picked = await pickProduct();
            if (picked) onChange(picked);
          }}
        >
          {selected ? "Change product" : "Select product"}
        </s-button>
        {selected ? (
          <s-button variant="tertiary" onClick={() => onChange({ ...EMPTY_PRODUCT_REF })}>
            Clear
          </s-button>
        ) : null}
      </s-stack>
    </s-stack>
  );
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const settings = await getShopSettings(session.shop);
  return { settings };
};

const twoCol = "1fr 1fr";

export default function AppSettings() {
  const { settings: initialSettings } = useLoaderData<typeof loader>();
  const [settings, setSettings] = useState<ShopSettingsInput>(initialSettings);
  const [saving, setSaving] = useState(false);
  const [uploadingMusic, setUploadingMusic] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const musicFileInputRef = useRef<HTMLInputElement>(null);

  const setField = useCallback(
    <K extends keyof ShopSettingsInput>(key: K, value: ShopSettingsInput[K]) => {
      setSettings((current) => ({ ...current, [key]: value }));
      setSuccess(false);
    },
    [],
  );

  const saveSettings = useCallback(async () => {
    setSaving(true);
    setError("");
    setSuccess(false);

    try {
      const response = await fetch("/api/app/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.error || "Failed to save settings.");
      }

      if (payload.settings) {
        setSettings(payload.settings);
      }

      setSuccess(true);
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : "Failed to save settings.",
      );
    } finally {
      setSaving(false);
    }
  }, [settings]);

  const onMusicFileChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.target.value = "";

      if (!file) return;

      setUploadingMusic(true);
      setError("");
      setSuccess(false);

      try {
        const normalizedFile = normalizeUploadFile(file);
        const body = new FormData();
        body.append("file", normalizedFile);

        const response = await fetch("/api/cms/media", {
          method: "POST",
          body,
        });

        const payload = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(payload.error || "Failed to upload music file.");
        }

        if (!payload.url) {
          throw new Error("Upload succeeded but no file URL was returned.");
        }

        setField("backgroundMusicFileUrl", payload.url);
      } catch (uploadError) {
        setError(
          uploadError instanceof Error
            ? uploadError.message
            : "Failed to upload music file.",
        );
      } finally {
        setUploadingMusic(false);
      }
    },
    [setField],
  );

  const resolvedMusicUrl =
    settings.backgroundMusicFileUrl.trim() ||
    settings.backgroundMusicUrl.trim() ||
    "";

  return (
    <s-page heading="Settings">
      <s-button
        slot="primary-action"
        variant="primary"
        onClick={saveSettings}
        {...(saving ? { loading: true } : {})}
      >
        Save
      </s-button>

      {error ? (
        <s-banner tone="critical" heading="Something went wrong">
          <s-paragraph>{error}</s-paragraph>
        </s-banner>
      ) : null}

      {success ? (
        <s-banner tone="success" heading="Settings saved">
          <s-paragraph>Your app configuration has been updated.</s-paragraph>
        </s-banner>
      ) : null}

      <s-section heading="Force Update Configuration">
        <s-stack direction="block" gap="base">
          <s-paragraph>
            When force update is enabled, the mobile app compares the installed
            version with the configured version. If the installed version is
            lower, users must update via the store URL before continuing.
          </s-paragraph>

          <s-box padding="base" border="base" borderRadius="base">
            <s-stack direction="block" gap="base">
              <s-heading>Android</s-heading>

              <s-grid gridTemplateColumns={twoCol} gap="base">
                <s-text-field
                  label="Android App Version"
                  name="androidAppVersion"
                  placeholder="e.g. 2.1.0"
                  value={settings.androidAppVersion}
                  onChange={(event) =>
                    setField("androidAppVersion", event.currentTarget.value)
                  }
                ></s-text-field>

                <s-text-field
                  label="Play Store URL"
                  name="androidPlayStoreUrl"
                  placeholder="https://play.google.com/store/apps/details?id=…"
                  value={settings.androidPlayStoreUrl}
                  onChange={(event) =>
                    setField("androidPlayStoreUrl", event.currentTarget.value)
                  }
                ></s-text-field>
              </s-grid>

              <s-checkbox
                label="Enable Force Update"
                name="androidForceUpdateEnabled"
                checked={settings.androidForceUpdateEnabled}
                onChange={(event) =>
                  setField("androidForceUpdateEnabled", event.currentTarget.checked)
                }
              ></s-checkbox>
            </s-stack>
          </s-box>

          <s-box padding="base" border="base" borderRadius="base">
            <s-stack direction="block" gap="base">
              <s-heading>iOS</s-heading>

              <s-grid gridTemplateColumns={twoCol} gap="base">
                <s-text-field
                  label="iOS App Version"
                  name="iosAppVersion"
                  placeholder="e.g. 2.1.0"
                  value={settings.iosAppVersion}
                  onChange={(event) =>
                    setField("iosAppVersion", event.currentTarget.value)
                  }
                ></s-text-field>

                <s-text-field
                  label="App Store URL"
                  name="iosAppStoreUrl"
                  placeholder="https://apps.apple.com/app/id…"
                  value={settings.iosAppStoreUrl}
                  onChange={(event) =>
                    setField("iosAppStoreUrl", event.currentTarget.value)
                  }
                ></s-text-field>
              </s-grid>

              <s-checkbox
                label="Enable Force Update"
                name="iosForceUpdateEnabled"
                checked={settings.iosForceUpdateEnabled}
                onChange={(event) =>
                  setField("iosForceUpdateEnabled", event.currentTarget.checked)
                }
              ></s-checkbox>
            </s-stack>
          </s-box>
        </s-stack>
      </s-section>

      <s-section heading="Background Music">
        <s-stack direction="block" gap="base">
          <s-paragraph>
            Configure background music that plays automatically when the app
            launches and continues globally unless stopped by app logic. If both
            an uploaded file and a URL are provided, the uploaded file takes
            priority.
          </s-paragraph>

          <s-box padding="base" border="base" borderRadius="base">
            <s-stack direction="block" gap="base">
              <s-text color="subdued">Upload music file</s-text>

              <s-stack direction="inline" gap="small" alignItems="center">
                <s-button
                  variant="secondary"
                  onClick={() => musicFileInputRef.current?.click()}
                  {...(uploadingMusic ? { loading: true } : {})}
                >
                  {settings.backgroundMusicFileUrl ? "Replace file" : "Upload file"}
                </s-button>

                {settings.backgroundMusicFileUrl ? (
                  <s-button
                    variant="tertiary"
                    tone="critical"
                    onClick={() => setField("backgroundMusicFileUrl", "")}
                  >
                    Remove upload
                  </s-button>
                ) : null}
              </s-stack>

              {settings.backgroundMusicFileUrl ? (
                <s-text color="subdued">
                  Uploaded file: {settings.backgroundMusicFileUrl}
                </s-text>
              ) : null}

              <input
                ref={musicFileInputRef}
                type="file"
                accept="audio/mpeg,audio/mp4,audio/aac,audio/wav,.mp3,.m4a,.aac,.wav"
                style={{ display: "none" }}
                onChange={onMusicFileChange}
              />

              <s-divider></s-divider>

              <s-text-field
                label="Music URL"
                name="backgroundMusicUrl"
                placeholder="https://cdn.example.com/music.mp3"
                details="Used when no uploaded file is set."
                value={settings.backgroundMusicUrl}
                onChange={(event) =>
                  setField("backgroundMusicUrl", event.currentTarget.value)
                }
              ></s-text-field>

              {resolvedMusicUrl ? (
                <s-banner tone="info" heading="Resolved music source">
                  <s-paragraph>
                    {settings.backgroundMusicFileUrl.trim()
                      ? "The uploaded file will be used."
                      : "The music URL will be used."}
                  </s-paragraph>
                  <s-paragraph>{resolvedMusicUrl}</s-paragraph>
                </s-banner>
              ) : null}
            </s-stack>
          </s-box>
        </s-stack>
      </s-section>

      <s-section heading="Bottom Tab Actions">
        <s-stack direction="block" gap="base">
          <s-paragraph>
            Configure where the mobile app bottom tabs navigate. Products and
            Courses open a collection. Yagnas can open either a collection or a
            single product.
          </s-paragraph>

          <s-box padding="base" border="base" borderRadius="base">
            <s-stack direction="block" gap="base">
              <s-heading>Products</s-heading>
              <CollectionPickerField
                label="Collection"
                value={settings.productsTabCollection}
                onChange={(next) => setField("productsTabCollection", next)}
              />
            </s-stack>
          </s-box>

          <s-box padding="base" border="base" borderRadius="base">
            <s-stack direction="block" gap="base">
              <s-heading>Courses</s-heading>
              <CollectionPickerField
                label="Collection"
                value={settings.coursesTabCollection}
                onChange={(next) => setField("coursesTabCollection", next)}
              />
            </s-stack>
          </s-box>

          <s-box padding="base" border="base" borderRadius="base">
            <s-stack direction="block" gap="base">
              <s-heading>Yagnas</s-heading>
              <s-paragraph>
                Select either a collection or a product. Choosing one clears
                the other.
              </s-paragraph>
              <CollectionPickerField
                label="Collection"
                value={settings.yagnasTabCollection}
                onChange={(next) => {
                  setSettings((current) => ({
                    ...current,
                    yagnasTabCollection: next,
                    yagnasTabProduct: { ...EMPTY_PRODUCT_REF },
                  }));
                  setSuccess(false);
                }}
              />
              <s-divider></s-divider>
              <ProductPickerField
                label="Product"
                value={settings.yagnasTabProduct}
                onChange={(next) => {
                  setSettings((current) => ({
                    ...current,
                    yagnasTabProduct: next,
                    yagnasTabCollection: { ...EMPTY_COLLECTION_REF },
                  }));
                  setSuccess(false);
                }}
              />
            </s-stack>
          </s-box>
        </s-stack>
      </s-section>
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
