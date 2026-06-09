import { useCallback, useEffect, useRef, useState } from "react";
import { ClientBlockEditor } from "gutenberg-block-kit/editor-client";

type MetaState = {
  slug: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
  ogImage: string;
  keywords: string;
};

type CmsEditorShellProps = {
  pageId?: string;
  initialTitle?: string;
  initialContent?: string;
  isNew?: boolean;
  previewSlug?: string;
  onSaved?: (pageId: string) => void;
  initialSlug?: string;
  initialDescription?: string;
  initialSeoTitle?: string;
  initialSeoDescription?: string;
  initialOgImage?: string;
  initialKeywords?: string;
};

function EditorFallback() {
  return (
    <s-page heading="CMS Editor">
      <s-section>
        <s-paragraph>Loading editor…</s-paragraph>
      </s-section>
    </s-page>
  );
}

async function fetchPage(pageId: string) {
  const response = await fetch(`/api/cms/pages/${pageId}`);

  if (!response.ok) {
    return null;
  }

  return response.json();
}

export function CmsEditorShell({
  pageId,
  initialTitle = "Untitled page",
  initialContent,
  isNew = false,
  previewSlug,
  onSaved,
  initialSlug = "",
  initialDescription = "",
  initialSeoTitle = "",
  initialSeoDescription = "",
  initialOgImage = "",
  initialKeywords = "",
}: CmsEditorShellProps) {
  useEffect(() => {
    import("gutenberg-block-kit/styles");
  }, []);

  const [meta, setMeta] = useState<MetaState>({
    slug: initialSlug,
    description: initialDescription,
    seoTitle: initialSeoTitle,
    seoDescription: initialSeoDescription,
    ogImage: initialOgImage,
    keywords: initialKeywords,
  });
  const [uploadingOg, setUploadingOg] = useState(false);
  const [metaError, setMetaError] = useState<string | null>(null);

  // onSave is captured by the editor at mount; read live meta via a ref so the
  // latest field values are included no matter when the user clicks Save.
  const metaRef = useRef(meta);
  useEffect(() => {
    metaRef.current = meta;
  }, [meta]);

  const setField = useCallback(
    <K extends keyof MetaState>(key: K, value: MetaState[K]) => {
      setMeta((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const onSave = useCallback(
    async ({
      title,
      html,
      json,
    }: {
      id: string;
      title: string;
      html: string;
      json: string;
    }) => {
      const current = metaRef.current;
      const payload = {
        title,
        html,
        json,
        slug: current.slug.trim() || undefined,
        description: current.description,
        seoTitle: current.seoTitle,
        seoDescription: current.seoDescription,
        ogImage: current.ogImage,
        keywords: current.keywords,
      };

      const response = isNew
        ? await fetch("/api/cms/pages", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch(`/api/cms/pages/${pageId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || "Failed to save page.");
      }

      const saved = await response.json();
      // Reflect the server-resolved slug (it may de-dupe or derive from title).
      if (saved.slug) {
        setField("slug", saved.slug);
      }
      onSaved?.(saved.id);
      return saved;
    },
    [isNew, onSaved, pageId, setField],
  );

  const onLoad = useCallback(
    async (id: string) => {
      if (isNew) {
        return null;
      }

      return fetchPage(id);
    },
    [isNew],
  );

  const listImages = useCallback(
    async ({
      page,
      perPage,
      search,
    }: {
      page: number;
      perPage: number;
      search: string;
    }) => {
      const params = new URLSearchParams({
        page: String(page),
        perPage: String(perPage),
        q: search,
      });

      const response = await fetch(`/api/cms/media?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Failed to load media library.");
      }

      return response.json();
    },
    [],
  );

  const uploadImage = useCallback(async (file: File) => {
    const body = new FormData();
    body.append("file", file);

    const response = await fetch("/api/cms/media", {
      method: "POST",
      body,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || "Failed to upload image.");
    }

    return response.json();
  }, []);

  const onOgFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.target.value = "";
      if (!file) return;

      setUploadingOg(true);
      setMetaError(null);
      try {
        const uploaded = await uploadImage(file);
        if (uploaded?.url) {
          setField("ogImage", uploaded.url);
        }
      } catch (error) {
        setMetaError(
          error instanceof Error ? error.message : "Failed to upload image.",
        );
      } finally {
        setUploadingOg(false);
      }
    },
    [setField, uploadImage],
  );

  const ogFileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="cms-editor-shell">
      <s-section heading="Page settings">
        {metaError ? (
          <s-banner tone="critical" heading="Image upload failed">
            <s-paragraph>{metaError}</s-paragraph>
          </s-banner>
        ) : null}

        <s-stack direction="block" gap="base">
          <s-text-field
            label="URL slug"
            name="slug"
            prefix="/pages/"
            placeholder="auto-generated from the title"
            details="Used in the page URL and the mobile API. Leave blank to generate from the title."
            value={meta.slug}
            onChange={(e) =>
              setField("slug", e.currentTarget.value)
            }
          ></s-text-field>

          <s-text-area
            label="Page description / excerpt"
            name="description"
            rows={2}
            details="Short summary shown in list/card views on mobile."
            value={meta.description}
            onChange={(e) =>
              setField("description", e.currentTarget.value)
            }
          ></s-text-area>

          <s-text-field
            label="SEO title"
            name="seoTitle"
            maxLength={70}
            placeholder="Defaults to the page title"
            details={`${meta.seoTitle.length}/70 characters`}
            value={meta.seoTitle}
            onChange={(e) =>
              setField("seoTitle", e.currentTarget.value)
            }
          ></s-text-field>

          <s-text-area
            label="Meta description"
            name="seoDescription"
            rows={3}
            maxLength={160}
            details={`${meta.seoDescription.length}/160 characters`}
            value={meta.seoDescription}
            onChange={(e) =>
              setField("seoDescription", e.currentTarget.value)
            }
          ></s-text-area>

          <s-text-field
            label="Keywords"
            name="keywords"
            placeholder="comma, separated, keywords"
            details="Comma-separated. Exposed as an array in the mobile API."
            value={meta.keywords}
            onChange={(e) =>
              setField("keywords", e.currentTarget.value)
            }
          ></s-text-field>

          <s-stack direction="block" gap="small">
            <s-text>Social / OG image</s-text>
            <s-stack direction="inline" gap="base" alignItems="center">
              {meta.ogImage ? (
                <s-thumbnail size="large" src={meta.ogImage} alt="OG image" />
              ) : null}
              <s-stack direction="block" gap="small">
                <s-button
                  variant="secondary"
                  onClick={() => ogFileInputRef.current?.click()}
                  {...(uploadingOg ? { loading: true } : {})}
                >
                  {meta.ogImage ? "Replace image" : "Upload image"}
                </s-button>
                {meta.ogImage ? (
                  <s-button
                    variant="tertiary"
                    tone="critical"
                    onClick={() => setField("ogImage", "")}
                  >
                    Remove
                  </s-button>
                ) : null}
              </s-stack>
            </s-stack>
            <s-text-field
              label="Image URL"
              labelAccessibilityVisibility="exclusive"
              name="ogImage"
              placeholder="https://…"
              value={meta.ogImage}
              onChange={(e) =>
                setField("ogImage", e.currentTarget.value)
              }
            ></s-text-field>
            <input
              ref={ogFileInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={onOgFileChange}
            />
          </s-stack>
        </s-stack>
      </s-section>

      <ClientBlockEditor
        fallback={<EditorFallback />}
        initialPageId={pageId}
        initialTitle={initialTitle}
        initialContent={initialContent}
        onSave={onSave}
        onLoad={onLoad}
        media={{
          perPage: 20,
          listImages,
          uploadImage,
        }}
        onViewSite={
          previewSlug
            ? () => {
                window.open(
                  `/pages/${previewSlug}`,
                  "_blank",
                  "noopener,noreferrer",
                );
              }
            : undefined
        }
      />
    </div>
  );
}
