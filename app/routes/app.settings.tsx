import { useCallback, useRef, useState, type ChangeEvent, type CSSProperties } from "react";
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
import {
  createMeditationEntry,
  type TodaysMeditationEntry,
} from "../lib/todays-meditation";
import { normalizeUploadFile } from "../lib/media-utils";
import { authenticate } from "../shopify.server";

const twoCol = "1fr 1fr";
const threeCol = "minmax(220px, 0.9fr) minmax(240px, 1.1fr) minmax(220px, 1fr)";

const fieldLabelStyle: CSSProperties = {
  display: "block",
  marginBottom: "6px",
  fontSize: "13px",
  fontWeight: 600,
  color: "#303030",
};

const fieldHelpStyle: CSSProperties = {
  marginTop: "6px",
  fontSize: "12px",
  color: "#6d7175",
  lineHeight: 1.4,
};

const dateInputStyle: CSSProperties = {
  width: "100%",
  minHeight: "44px",
  padding: "10px 12px",
  border: "1px solid #8c9196",
  borderRadius: "10px",
  background: "#fff",
  fontSize: "14px",
  color: "#202223",
  boxSizing: "border-box",
  fontFamily: "inherit",
};

const mediaPreviewBoxStyle: CSSProperties = {
  marginTop: "10px",
  padding: "10px",
  borderRadius: "10px",
  border: "1px solid #e1e3e5",
  background: "#f6f6f7",
};

function formatMeditationDate(date: string): string {
  if (!date) return "Untitled date";
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function shortUrl(url: string): string {
  if (!url) return "";
  try {
    const parsed = new URL(url);
    const path = parsed.pathname.split("/").filter(Boolean).pop() || parsed.hostname;
    return path.length > 42 ? `${path.slice(0, 39)}…` : path;
  } catch {
    return url.length > 42 ? `${url.slice(0, 39)}…` : url;
  }
}

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

export default function AppSettings() {
  const { settings: initialSettings } = useLoaderData<typeof loader>();
  const [settings, setSettings] = useState<ShopSettingsInput>(initialSettings);
  const [saving, setSaving] = useState(false);
  const [uploadingMusic, setUploadingMusic] = useState(false);
  const [uploadingDefaultImage, setUploadingDefaultImage] = useState(false);
  const [uploadingEntryId, setUploadingEntryId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const musicFileInputRef = useRef<HTMLInputElement>(null);
  const defaultImageInputRef = useRef<HTMLInputElement>(null);
  const entryAudioInputRef = useRef<HTMLInputElement>(null);
  const entryImageInputRef = useRef<HTMLInputElement>(null);
  const [pendingEntryUpload, setPendingEntryUpload] = useState<{
    id: string;
    kind: "audio" | "image";
  } | null>(null);

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

  const uploadMediaFile = useCallback(async (file: File) => {
    const normalizedFile = normalizeUploadFile(file);
    const body = new FormData();
    body.append("file", normalizedFile);

    const response = await fetch("/api/cms/media", {
      method: "POST",
      body,
    });
    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(payload.error || "Failed to upload file.");
    }
    if (!payload.url) {
      throw new Error("Upload succeeded but no file URL was returned.");
    }

    return String(payload.url);
  }, []);

  const updateMeditationEntry = useCallback(
    (id: string, patch: Partial<TodaysMeditationEntry>) => {
      setSettings((current) => ({
        ...current,
        todaysMeditationEntries: current.todaysMeditationEntries.map((entry) =>
          entry.id === id ? { ...entry, ...patch } : entry,
        ),
      }));
      setSuccess(false);
    },
    [],
  );

  const addMeditationEntry = useCallback(() => {
    setSettings((current) => ({
      ...current,
      todaysMeditationEntries: [
        ...current.todaysMeditationEntries,
        createMeditationEntry(),
      ],
    }));
    setSuccess(false);
  }, []);

  const removeMeditationEntry = useCallback((id: string) => {
    setSettings((current) => ({
      ...current,
      todaysMeditationEntries: current.todaysMeditationEntries.filter(
        (entry) => entry.id !== id,
      ),
    }));
    setSuccess(false);
  }, []);

  const onDefaultImageChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.target.value = "";
      if (!file) return;

      setUploadingDefaultImage(true);
      setError("");
      setSuccess(false);
      try {
        const url = await uploadMediaFile(file);
        setField("todaysMeditationDefaultImageUrl", url);
      } catch (uploadError) {
        setError(
          uploadError instanceof Error
            ? uploadError.message
            : "Failed to upload default meditation image.",
        );
      } finally {
        setUploadingDefaultImage(false);
      }
    },
    [setField, uploadMediaFile],
  );

  const onEntryMediaChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.target.value = "";
      if (!file || !pendingEntryUpload) return;

      const { id, kind } = pendingEntryUpload;
      setPendingEntryUpload(null);
      setUploadingEntryId(id);
      setError("");
      setSuccess(false);

      try {
        const url = await uploadMediaFile(file);
        updateMeditationEntry(
          id,
          kind === "audio" ? { audioUrl: url } : { imageUrl: url },
        );
      } catch (uploadError) {
        setError(
          uploadError instanceof Error
            ? uploadError.message
            : `Failed to upload meditation ${kind}.`,
        );
      } finally {
        setUploadingEntryId(null);
      }
    },
    [pendingEntryUpload, updateMeditationEntry, uploadMediaFile],
  );

  const resolvedMusicUrl =
    settings.backgroundMusicFileUrl.trim() ||
    settings.backgroundMusicUrl.trim() ||
    "";

  const meditationEntries = Array.isArray(settings.todaysMeditationEntries)
    ? settings.todaysMeditationEntries
    : [];

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

      <s-section heading="Today's Meditation">
        <s-stack direction="block" gap="base">
          <s-paragraph>
            Schedule meditation audio for specific dates. The mobile app shows
            today&apos;s entry automatically. If an entry has no background
            image, the default meditation background is used.
          </s-paragraph>

          <s-box padding="base" border="base" borderRadius="base">
            <s-stack direction="block" gap="base">
              <s-heading>Default background image</s-heading>
              <s-paragraph>
                Optional fallback image used when a dated entry does not include
                its own background.
              </s-paragraph>

              <s-stack direction="inline" gap="small" alignItems="center">
                <s-button
                  variant="secondary"
                  onClick={() => defaultImageInputRef.current?.click()}
                  {...(uploadingDefaultImage ? { loading: true } : {})}
                >
                  {settings.todaysMeditationDefaultImageUrl
                    ? "Replace default image"
                    : "Upload default image"}
                </s-button>
                {settings.todaysMeditationDefaultImageUrl ? (
                  <s-button
                    variant="tertiary"
                    tone="critical"
                    onClick={() => setField("todaysMeditationDefaultImageUrl", "")}
                  >
                    Remove
                  </s-button>
                ) : null}
              </s-stack>

              {settings.todaysMeditationDefaultImageUrl ? (
                <s-stack direction="block" gap="small">
                  <img
                    src={settings.todaysMeditationDefaultImageUrl}
                    alt="Default meditation background"
                    style={{
                      width: "100%",
                      maxWidth: "280px",
                      borderRadius: "8px",
                      objectFit: "cover",
                    }}
                  />
                  <s-text color="subdued">
                    {settings.todaysMeditationDefaultImageUrl}
                  </s-text>
                </s-stack>
              ) : (
                <s-text color="subdued">No default image uploaded.</s-text>
              )}

              <input
                ref={defaultImageInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={onDefaultImageChange}
              />
            </s-stack>
          </s-box>

          <s-box padding="base" border="base" borderRadius="base">
            <s-stack direction="block" gap="base">
              <s-stack
                direction="inline"
                gap="base"
                alignItems="center"
                justifyContent="space-between"
              >
                <s-stack direction="block" gap="small">
                  <s-heading>Scheduled meditations</s-heading>
                  <s-text color="subdued">
                    {meditationEntries.length
                      ? `${meditationEntries.length} scheduled ${
                          meditationEntries.length === 1 ? "day" : "days"
                        }`
                      : "No dates scheduled yet"}
                  </s-text>
                </s-stack>
                <s-button variant="primary" onClick={addMeditationEntry}>
                  Add date
                </s-button>
              </s-stack>

              {meditationEntries.length === 0 ? (
                <s-box padding="base" border="base" borderRadius="base" background="subdued">
                  <s-stack direction="block" gap="small">
                    <s-text>
                      Pre-schedule meditation audio for each day of the month.
                    </s-text>
                    <s-text color="subdued">
                      Click <strong>Add date</strong> to create your first entry.
                    </s-text>
                  </s-stack>
                </s-box>
              ) : null}

              {meditationEntries.map((entry, index) => {
                const isUploading = uploadingEntryId === entry.id;
                const missingAudio = !entry.audioUrl.trim();
                const missingDate = !entry.date.trim();

                return (
                  <s-box
                    key={entry.id}
                    padding="base"
                    border="base"
                    borderRadius="base"
                    background="base"
                  >
                    <s-stack direction="block" gap="base">
                      <s-stack
                        direction="inline"
                        gap="base"
                        alignItems="center"
                        justifyContent="space-between"
                      >
                        <s-stack direction="block" gap="small">
                          <s-heading>
                            {formatMeditationDate(entry.date)}
                          </s-heading>
                          <s-text color="subdued">
                            Entry {index + 1}
                            {missingDate || missingAudio
                              ? " · Incomplete — date and audio are required"
                              : " · Ready"}
                          </s-text>
                        </s-stack>
                        <s-button
                          variant="tertiary"
                          tone="critical"
                          onClick={() => removeMeditationEntry(entry.id)}
                        >
                          Remove
                        </s-button>
                      </s-stack>

                      <s-grid gridTemplateColumns={threeCol} gap="base">
                        <s-box padding="base" border="base" borderRadius="base">
                          <label htmlFor={`meditation-date-${entry.id}`} style={fieldLabelStyle}>
                            Scheduled date
                          </label>
                          <div style={{ position: "relative" }}>
                            <input
                              id={`meditation-date-${entry.id}`}
                              type="date"
                              name={`meditation-date-${entry.id}`}
                              value={entry.date || ""}
                              required
                              onChange={(event) =>
                                updateMeditationEntry(entry.id, {
                                  date: event.currentTarget.value,
                                })
                              }
                              style={{
                                ...dateInputStyle,
                                borderColor: missingDate ? "#d72c0d" : "#8c9196",
                              }}
                            />
                          </div>
                          <div style={fieldHelpStyle}>
                            {missingDate
                              ? "Choose the day this meditation should appear."
                              : "Opens the calendar picker. One unique date per entry."}
                          </div>
                        </s-box>

                        <s-box padding="base" border="base" borderRadius="base">
                          <div style={fieldLabelStyle}>Meditation audio</div>
                          <s-stack direction="inline" gap="small" alignItems="center">
                            <s-button
                              variant="secondary"
                              onClick={() => {
                                setPendingEntryUpload({ id: entry.id, kind: "audio" });
                                entryAudioInputRef.current?.click();
                              }}
                              {...(isUploading ? { loading: true } : {})}
                            >
                              {entry.audioUrl ? "Replace audio" : "Upload audio"}
                            </s-button>
                            {entry.audioUrl ? (
                              <s-button
                                variant="tertiary"
                                tone="critical"
                                onClick={() =>
                                  updateMeditationEntry(entry.id, { audioUrl: "" })
                                }
                              >
                                Clear
                              </s-button>
                            ) : null}
                          </s-stack>
                          {entry.audioUrl ? (
                            <div style={mediaPreviewBoxStyle}>
                              <audio
                                controls
                                src={entry.audioUrl}
                                style={{ width: "100%", display: "block" }}
                              />
                              <div style={{ ...fieldHelpStyle, marginTop: "8px" }}>
                                {shortUrl(entry.audioUrl)}
                              </div>
                            </div>
                          ) : (
                            <div style={fieldHelpStyle}>
                              Required. Upload an MP3 / M4A / WAV file.
                            </div>
                          )}
                        </s-box>

                        <s-box padding="base" border="base" borderRadius="base">
                          <div style={fieldLabelStyle}>Background image</div>
                          <s-stack direction="inline" gap="small" alignItems="center">
                            <s-button
                              variant="secondary"
                              onClick={() => {
                                setPendingEntryUpload({ id: entry.id, kind: "image" });
                                entryImageInputRef.current?.click();
                              }}
                              {...(isUploading ? { loading: true } : {})}
                            >
                              {entry.imageUrl ? "Replace image" : "Upload image"}
                            </s-button>
                            {entry.imageUrl ? (
                              <s-button
                                variant="tertiary"
                                tone="critical"
                                onClick={() =>
                                  updateMeditationEntry(entry.id, { imageUrl: "" })
                                }
                              >
                                Clear
                              </s-button>
                            ) : null}
                          </s-stack>
                          {entry.imageUrl ? (
                            <div style={mediaPreviewBoxStyle}>
                              <img
                                src={entry.imageUrl}
                                alt={`Meditation background for ${
                                  entry.date || "entry"
                                }`}
                                style={{
                                  width: "100%",
                                  maxHeight: "140px",
                                  objectFit: "cover",
                                  borderRadius: "8px",
                                  display: "block",
                                }}
                              />
                            </div>
                          ) : (
                            <div style={fieldHelpStyle}>
                              Optional. Falls back to the default background.
                            </div>
                          )}
                        </s-box>
                      </s-grid>
                    </s-stack>
                  </s-box>
                );
              })}

              <input
                ref={entryAudioInputRef}
                type="file"
                accept="audio/mpeg,audio/mp4,audio/aac,audio/wav,.mp3,.m4a,.aac,.wav"
                style={{ display: "none" }}
                onChange={onEntryMediaChange}
              />
              <input
                ref={entryImageInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={onEntryMediaChange}
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
