import type { ActionFunctionArgs } from "react-router";

import { createPage } from "../lib/cms.server";
import { authenticate } from "../shopify.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  const body = await request.json();

  if (!body.title || body.html === undefined || body.json === undefined) {
    return Response.json(
      { error: "title, html, and json are required." },
      { status: 400 },
    );
  }

  try {
    const page = await createPage(session.shop, {
      title: body.title,
      slug: body.slug,
      html: body.html,
      json: typeof body.json === "string" ? body.json : JSON.stringify(body.json),
      status: body.status,
      description: body.description,
      seoTitle: body.seoTitle,
      seoDescription: body.seoDescription,
      ogImage: body.ogImage,
      keywords: body.keywords,
    });

    return Response.json(page, { status: 201 });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to create page." },
      { status: 500 },
    );
  }
};
