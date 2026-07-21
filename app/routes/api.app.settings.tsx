import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";

import {
  getShopSettings,
  toPublicShopSettings,
  upsertShopSettings,
  type ShopSettingsInput,
} from "../lib/settings.server";
import { authenticate } from "../shopify.server";

function parseBoolean(value: unknown): boolean {
  return value === true || value === "true" || value === 1 || value === "1";
}

function parseSettingsBody(body: unknown): ShopSettingsInput | null {
  if (!body || typeof body !== "object") {
    return null;
  }

  const input = body as Record<string, unknown>;

  return {
    androidAppVersion: String(input.androidAppVersion ?? ""),
    androidPlayStoreUrl: String(input.androidPlayStoreUrl ?? ""),
    androidForceUpdateEnabled: parseBoolean(input.androidForceUpdateEnabled),
    iosAppVersion: String(input.iosAppVersion ?? ""),
    iosAppStoreUrl: String(input.iosAppStoreUrl ?? ""),
    iosForceUpdateEnabled: parseBoolean(input.iosForceUpdateEnabled),
    backgroundMusicFileUrl: String(input.backgroundMusicFileUrl ?? ""),
    backgroundMusicUrl: String(input.backgroundMusicUrl ?? ""),
  };
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const settings = await getShopSettings(session.shop);

  return Response.json({
    success: true,
    settings,
    public: toPublicShopSettings(settings),
  });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  if (request.method !== "PUT" && request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const input = parseSettingsBody(body);
  if (!input) {
    return Response.json({ error: "Invalid settings payload." }, { status: 400 });
  }

  try {
    const settings = await upsertShopSettings(session.shop, input);

    return Response.json({
      success: true,
      settings,
      public: toPublicShopSettings(settings),
    });
  } catch (error) {
    console.error("Failed to save shop settings:", error);
    const message =
      error instanceof Error ? error.message : "Failed to save settings.";
    return Response.json({ error: message }, { status: 500 });
  }
};
