import type {
  ActionFunctionArgs,
  HeadersFunction,
  LoaderFunctionArgs,
} from "react-router";
import { useFetcher, useLoaderData, useSearchParams } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";

import { deletePage, listPages, updatePage } from "../lib/cms.server";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const url = new URL(request.url);
  const q = (url.searchParams.get("q") || "").trim().toLowerCase();

  const allPages = await listPages(session.shop);
  const pages = q
    ? allPages.filter(
        (page) =>
          page.title.toLowerCase().includes(q) ||
          page.slug.toLowerCase().includes(q) ||
          page.description.toLowerCase().includes(q),
      )
    : allPages;

  return { pages, total: allPages.length, q };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  const intent = String(formData.get("intent") || "status");
  const pageId = String(formData.get("pageId") || "");

  if (!pageId) {
    return { error: "Missing page id." };
  }

  if (intent === "delete") {
    const deleted = await deletePage(session.shop, pageId);
    return deleted ? { deleted: pageId } : { error: "Page not found." };
  }

  const status = String(formData.get("status") || "");
  if (!["draft", "published"].includes(status)) {
    return { error: "Invalid publish request." };
  }

  const page = await updatePage(session.shop, pageId, {
    status: status as "draft" | "published",
  });

  if (!page) {
    return { error: "Page not found." };
  }

  return { page };
};

type PageRow = ReturnType<typeof useLoaderData<typeof loader>>["pages"][number];

function PageRowActions({ page }: { page: PageRow }) {
  const fetcher = useFetcher<typeof action>();
  const busy = fetcher.state !== "idle";

  return (
    <s-stack direction="inline" gap="small">
      <s-button href={`/app/cms/${page.id}`} variant="secondary">
        Edit
      </s-button>

      <fetcher.Form method="post">
        <input type="hidden" name="intent" value="status" />
        <input type="hidden" name="pageId" value={page.id} />
        <input
          type="hidden"
          name="status"
          value={page.status === "published" ? "draft" : "published"}
        />
        <s-button
          type="submit"
          variant="tertiary"
          {...(busy ? { loading: true } : {})}
        >
          {page.status === "published" ? "Unpublish" : "Publish"}
        </s-button>
      </fetcher.Form>

      {page.status === "published" ? (
        <s-button
          href={`/pages/${page.slug}`}
          target="_blank"
          variant="tertiary"
        >
          Preview
        </s-button>
      ) : null}

      <fetcher.Form
        method="post"
        onSubmit={(event) => {
          if (
            !window.confirm(
              `Delete “${page.title}”? This can't be undone.`,
            )
          ) {
            event.preventDefault();
          }
        }}
      >
        <input type="hidden" name="intent" value="delete" />
        <input type="hidden" name="pageId" value={page.id} />
        <s-button
          type="submit"
          variant="tertiary"
          tone="critical"
          {...(busy ? { loading: true } : {})}
        >
          Delete
        </s-button>
      </fetcher.Form>
    </s-stack>
  );
}

export default function CmsIndex() {
  const { pages, total, q } = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();

  return (
    <s-page heading="CMS Pages">
      <s-button slot="primary-action" href="/app/cms/new">
        Create page
      </s-button>

      <s-section heading={`All pages (${total})`}>
        <s-stack direction="block" gap="base">
          <s-search-field
            label="Search pages"
            labelAccessibilityVisibility="exclusive"
            placeholder="Search by title, slug, or description"
            value={q}
            onInput={(e) => {
              const value = e.currentTarget.value;
              setSearchParams(
                (prev) => {
                  if (value) {
                    prev.set("q", value);
                  } else {
                    prev.delete("q");
                  }
                  return prev;
                },
                { replace: true },
              );
            }}
          ></s-search-field>

          {pages.length === 0 ? (
            <s-paragraph>
              {q ? (
                <>No pages match “{q}”.</>
              ) : (
                <>
                  No pages yet.{" "}
                  <s-link href="/app/cms/new">Create your first page</s-link>.
                </>
              )}
            </s-paragraph>
          ) : (
            <s-table>
              <s-table-header-row>
                <s-table-header>Title</s-table-header>
                <s-table-header>Slug</s-table-header>
                <s-table-header>Status</s-table-header>
                <s-table-header>Updated</s-table-header>
                <s-table-header>Actions</s-table-header>
              </s-table-header-row>
              <s-table-body>
                {pages.map((page) => (
                  <s-table-row key={page.id}>
                    <s-table-cell>
                      <s-stack direction="block" gap="none">
                        <s-link href={`/app/cms/${page.id}`}>
                          {page.title}
                        </s-link>
                        {page.description ? (
                          <s-text color="subdued">
                            {page.description.length > 80
                              ? `${page.description.slice(0, 80)}…`
                              : page.description}
                          </s-text>
                        ) : null}
                      </s-stack>
                    </s-table-cell>
                    <s-table-cell>
                      <s-text color="subdued">/{page.slug}</s-text>
                    </s-table-cell>
                    <s-table-cell>
                      {page.status === "published" ? (
                        <s-badge tone="success">Published</s-badge>
                      ) : (
                        <s-badge>Draft</s-badge>
                      )}
                    </s-table-cell>
                    <s-table-cell>
                      <s-text color="subdued">
                        {new Date(page.updatedAt).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </s-text>
                    </s-table-cell>
                    <s-table-cell>
                      <PageRowActions page={page} />
                    </s-table-cell>
                  </s-table-row>
                ))}
              </s-table-body>
            </s-table>
          )}
        </s-stack>
      </s-section>
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
