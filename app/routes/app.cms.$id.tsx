import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";

import { CmsEditorShell } from "../components/cms/CmsEditorShell";
import { getPageById } from "../lib/cms.server";
import { authenticate } from "../shopify.server";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const page = await getPageById(session.shop, params.id || "");

  if (!page) {
    throw new Response("Page not found", { status: 404 });
  }

  return { page };
};

export default function CmsEditPage() {
  const { page } = useLoaderData<typeof loader>();

  return (
    <CmsEditorShell
      pageId={page.id}
      previewSlug={page.slug}
      initialTitle={page.title}
      initialContent={page.json || page.html}
      initialSlug={page.slug}
      initialDescription={page.description}
      initialSeoTitle={page.seoTitle}
      initialSeoDescription={page.seoDescription}
      initialOgImage={page.ogImage}
      initialKeywords={page.keywords}
    />
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
