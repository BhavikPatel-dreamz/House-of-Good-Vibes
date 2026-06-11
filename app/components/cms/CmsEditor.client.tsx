import { useCallback } from "react";
import "gutenberg-block-kit/styles";
import "../../blocks/riyasat/image-carousel.css";
import "../../blocks/riyasat/trust-badges.css";
import "../../blocks/riyasat/image-slider.css";
import "../../blocks/riyasat/shop-the-look.css";
import "../../blocks/riyasat/product-scroller.css";
import { BlockEditor } from "gutenberg-block-kit/editor";

type CmsEditorProps = {
  pageId?: string;
  initialTitle?: string;
  initialContent?: string;
  isNew?: boolean;
  previewSlug?: string;
  onSaved?: (pageId: string) => void;
};

async function fetchPage(pageId: string) {
  const response = await fetch(`/api/cms/pages/${pageId}`);

  if (!response.ok) {
    return null;
  }

  return response.json();
}

export function CmsEditor({
  pageId,
  initialTitle = "Untitled page",
  initialContent,
  isNew = false,
  previewSlug,
  onSaved,
}: CmsEditorProps) {
  const onSave = useCallback(
    async ({
      id,
      title,
      html,
      json,
    }: {
      id: string;
      title: string;
      html: string;
      json: string;
    }) => {
      const payload = {
        title,
        html,
        json,
        slug: id,
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
      onSaved?.(saved.id);
      return saved;
    },
    [isNew, onSaved, pageId],
  );

  const onLoad = useCallback(async (id: string) => {
    if (isNew) {
      return null;
    }

    return fetchPage(id);
  }, [isNew]);

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

  return (
    <div className="cms-editor-shell">
      <BlockEditor
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
