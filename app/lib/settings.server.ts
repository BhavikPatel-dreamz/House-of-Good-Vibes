import type { ShopSettings } from "@prisma/client";

import db from "../db.server";
import {
  EMPTY_COLLECTION_REF,
  EMPTY_PRODUCT_REF,
  parseCollectionRef,
  parseProductRef,
  type SettingsCollectionRef,
  type SettingsProductRef,
} from "./settings-resources";

export type ShopSettingsInput = {
  androidAppVersion: string;
  androidPlayStoreUrl: string;
  androidForceUpdateEnabled: boolean;
  iosAppVersion: string;
  iosAppStoreUrl: string;
  iosForceUpdateEnabled: boolean;
  backgroundMusicFileUrl: string;
  backgroundMusicUrl: string;
  productsTabCollection: SettingsCollectionRef;
  coursesTabCollection: SettingsCollectionRef;
  yagnasTabCollection: SettingsCollectionRef;
  yagnasTabProduct: SettingsProductRef;
};

export const DEFAULT_SHOP_SETTINGS: ShopSettingsInput = {
  androidAppVersion: "",
  androidPlayStoreUrl: "",
  androidForceUpdateEnabled: false,
  iosAppVersion: "",
  iosAppStoreUrl: "",
  iosForceUpdateEnabled: false,
  backgroundMusicFileUrl: "",
  backgroundMusicUrl: "",
  productsTabCollection: { ...EMPTY_COLLECTION_REF },
  coursesTabCollection: { ...EMPTY_COLLECTION_REF },
  yagnasTabCollection: { ...EMPTY_COLLECTION_REF },
  yagnasTabProduct: { ...EMPTY_PRODUCT_REF },
};

function serializeShopSettings(row: ShopSettings): ShopSettingsInput {
  return {
    androidAppVersion: row.androidAppVersion,
    androidPlayStoreUrl: row.androidPlayStoreUrl,
    androidForceUpdateEnabled: row.androidForceUpdateEnabled,
    iosAppVersion: row.iosAppVersion,
    iosAppStoreUrl: row.iosAppStoreUrl,
    iosForceUpdateEnabled: row.iosForceUpdateEnabled,
    backgroundMusicFileUrl: row.backgroundMusicFileUrl,
    backgroundMusicUrl: row.backgroundMusicUrl,
    productsTabCollection: parseCollectionRef(row.productsTabCollection),
    coursesTabCollection: parseCollectionRef(row.coursesTabCollection),
    yagnasTabCollection: parseCollectionRef(row.yagnasTabCollection),
    yagnasTabProduct: parseProductRef(row.yagnasTabProduct),
  };
}

export function resolveBackgroundMusicUrl(
  settings: Pick<ShopSettingsInput, "backgroundMusicFileUrl" | "backgroundMusicUrl">,
): string | null {
  const uploaded = settings.backgroundMusicFileUrl.trim();
  if (uploaded) return uploaded;

  const external = settings.backgroundMusicUrl.trim();
  if (external) return external;

  return null;
}

export type PublicShopSettings = {
  forceUpdate: {
    android: {
      appVersion: string;
      storeUrl: string;
      enabled: boolean;
    };
    ios: {
      appVersion: string;
      storeUrl: string;
      enabled: boolean;
    };
  };
  backgroundMusic: {
    url: string | null;
    source: "upload" | "url" | null;
    fileUrl: string | null;
    externalUrl: string | null;
  };
  bottomTabActions: {
    products: {
      collection: SettingsCollectionRef;
    };
    courses: {
      collection: SettingsCollectionRef;
    };
    yagnas: {
      collection: SettingsCollectionRef;
      product: SettingsProductRef;
    };
  };
};

export function toPublicShopSettings(
  settings: ShopSettingsInput,
): PublicShopSettings {
  const uploaded = settings.backgroundMusicFileUrl.trim();
  const external = settings.backgroundMusicUrl.trim();
  const resolvedUrl = resolveBackgroundMusicUrl(settings);

  return {
    forceUpdate: {
      android: {
        appVersion: settings.androidAppVersion,
        storeUrl: settings.androidPlayStoreUrl,
        enabled: settings.androidForceUpdateEnabled,
      },
      ios: {
        appVersion: settings.iosAppVersion,
        storeUrl: settings.iosAppStoreUrl,
        enabled: settings.iosForceUpdateEnabled,
      },
    },
    backgroundMusic: {
      url: resolvedUrl,
      source: uploaded ? "upload" : external ? "url" : null,
      fileUrl: uploaded || null,
      externalUrl: external || null,
    },
    bottomTabActions: {
      products: {
        collection: settings.productsTabCollection,
      },
      courses: {
        collection: settings.coursesTabCollection,
      },
      yagnas: {
        collection: settings.yagnasTabCollection,
        product: settings.yagnasTabProduct,
      },
    },
  };
}

export async function getShopSettings(shop: string): Promise<ShopSettingsInput> {
  const row = await db.shopSettings.findFirst({ where: { shop } });
  if (!row) {
    return { ...DEFAULT_SHOP_SETTINGS };
  }
  return serializeShopSettings(row);
}

export async function upsertShopSettings(
  shop: string,
  input: ShopSettingsInput,
): Promise<ShopSettingsInput> {
  const existing = await db.shopSettings.findFirst({ where: { shop } });

  const row = existing
    ? await db.shopSettings.update({
        where: { id: existing.id },
        data: input,
      })
    : await db.shopSettings.create({
        data: {
          shop,
          ...input,
        },
      });

  return serializeShopSettings(row);
}

export async function deleteShopSettings(shop: string): Promise<void> {
  await db.shopSettings.deleteMany({ where: { shop } });
}
