import db from "../db.server";

export type PageStatus = "draft" | "published";

type PageRow = {
  id: string;
  title: string;
  slug: string;
  html: string;
  json: string;
  status: string;
  description: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  ogImage: string | null;
  keywords: string | null;
  updatedAt: Date;
};

export type PageRecord = {
  id: string;
  title: string;
  slug: string;
  html: string;
  json: string;
  status: PageStatus;
  description: string;
  seoTitle: string;
  seoDescription: string;
  ogImage: string;
  keywords: string;
  updatedAt: string;
};

/**
 * Clean JSON shape consumed by the mobile app via the signed App Proxy.
 * Excludes shop-internal fields and only exposes what a client needs to render.
 */
export type PublicPageRecord = {
  id: string;
  title: string;
  slug: string;
  html: string;
  json: string;
  description: string;
  seo: {
    title: string;
    description: string;
    ogImage: string;
    keywords: string[];
  };
  updatedAt: string;
};

function serializePage(page: PageRow): PageRecord {
  return {
    id: page.id,
    title: page.title,
    slug: page.slug,
    html: page.html,
    json: page.json,
    status: page.status as PageStatus,
    description: page.description ?? "",
    seoTitle: page.seoTitle ?? "",
    seoDescription: page.seoDescription ?? "",
    ogImage: page.ogImage ?? "",
    keywords: page.keywords ?? "",
    updatedAt: page.updatedAt.toISOString(),
  };
}

function parseKeywords(value: string | null): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((keyword) => keyword.trim())
    .filter(Boolean);
}

export function serializePublicPage(page: PageRow): PublicPageRecord {
  return {
    id: page.id,
    title: page.title,
    slug: page.slug,
    html: page.html,
    json: page.json,
    description: page.description ?? "",
    seo: {
      title: page.seoTitle || page.title,
      description: page.seoDescription || page.description || "",
      ogImage: page.ogImage ?? "",
      keywords: parseKeywords(page.keywords),
    },
    updatedAt: page.updatedAt.toISOString(),
  };
}

export async function listPages(shop: string) {
  const pages = await db.page.findMany({
    where: { shop },
    orderBy: { updatedAt: "desc" },
  });

  return pages.map(serializePage);
}

/** Published pages only — used by the public mobile API (list endpoint). */
export async function listPublishedPages(shop: string) {
  const pages = await db.page.findMany({
    where: { shop, status: "published" },
    orderBy: { updatedAt: "desc" },
  });

  return pages.map(serializePublicPage);
}

export async function getPageById(shop: string, id: string) {
  const page = await db.page.findFirst({
    where: { id, shop },
  });

  return page ? serializePage(page) : null;
}

export async function getPageBySlug(shop: string, slug: string) {
  const page = await db.page.findFirst({
    where: { shop, slug, status: "published" },
  });

  return page ? serializePage(page) : null;
}

/** Published page by slug as a public JSON record (mobile API single endpoint). */
export async function getPublishedPageBySlug(shop: string, slug: string) {
  const page = await db.page.findFirst({
    where: { shop, slug, status: "published" },
  });

  return page ? serializePublicPage(page) : null;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

export type PageMetaInput = {
  description?: string;
  seoTitle?: string;
  seoDescription?: string;
  ogImage?: string;
  keywords?: string;
};

export async function createPage(
  shop: string,
  data: {
    title: string;
    slug?: string;
    html: string;
    json: string;
    status?: PageStatus;
  } & PageMetaInput,
) {
  const slug = slugify(data.slug || data.title) || "page";

  const existing = await db.page.findFirst({
    where: { shop, slug },
  });

  const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

  const page = await db.page.create({
    data: {
      shop,
      title: data.title,
      slug: finalSlug,
      html: data.html,
      json: data.json,
      status: data.status ?? "draft",
      description: data.description,
      seoTitle: data.seoTitle,
      seoDescription: data.seoDescription,
      ogImage: data.ogImage,
      keywords: data.keywords,
    },
  });

  return serializePage(page);
}

export async function updatePage(
  shop: string,
  id: string,
  data: {
    title?: string;
    slug?: string;
    html?: string;
    json?: string;
    status?: PageStatus;
  } & PageMetaInput,
) {
  const existing = await db.page.findFirst({
    where: { id, shop },
  });

  if (!existing) {
    return null;
  }

  const nextSlug = data.slug ? slugify(data.slug) : undefined;

  if (nextSlug && nextSlug !== existing.slug) {
    const conflict = await db.page.findFirst({
      where: { shop, slug: nextSlug, NOT: { id } },
    });

    if (conflict) {
      throw new Error("A page with this slug already exists.");
    }
  }

  const page = await db.page.update({
    where: { id },
    data: {
      title: data.title,
      slug: nextSlug,
      html: data.html,
      json: data.json,
      status: data.status,
      description: data.description,
      seoTitle: data.seoTitle,
      seoDescription: data.seoDescription,
      ogImage: data.ogImage,
      keywords: data.keywords,
    },
  });

  return serializePage(page);
}

export async function deletePage(shop: string, id: string) {
  const existing = await db.page.findFirst({
    where: { id, shop },
  });

  if (!existing) {
    return false;
  }

  await db.page.delete({ where: { id } });
  return true;
}

export async function createMediaRecord(
  shop: string,
  data: {
    shopifyFileId?: string;
    url: string;
    alt?: string;
    title?: string;
    mimeType?: string;
  },
) {
  return db.media.create({
    data: {
      shop,
      shopifyFileId: data.shopifyFileId,
      url: data.url,
      alt: data.alt,
      title: data.title,
      mimeType: data.mimeType,
    },
  });
}
