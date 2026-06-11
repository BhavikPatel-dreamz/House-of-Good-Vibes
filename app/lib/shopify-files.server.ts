import { createMediaRecord } from "./cms.server";

type ShopifyAdminClient = {
  graphql: (
    query: string,
    options?: { variables?: Record<string, unknown> },
  ) => Promise<Response>;
};

export type MediaItem = {
  id: string;
  url: string;
  alt?: string;
  title?: string;
  mimeType?: string;
  width?: number;
  height?: number;
};

type ListImagesInput = {
  page: number;
  perPage: number;
  search?: string;
};

type ListImagesResult = {
  items: MediaItem[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
};

const LIST_FILES_QUERY = `#graphql
  query CmsListFiles($first: Int!, $after: String, $query: String) {
    files(
      first: $first
      after: $after
      query: $query
      sortKey: CREATED_AT
      reverse: true
    ) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          id
          alt
          ... on MediaImage {
            mimeType
            image {
              url
              altText
              width
              height
            }
          }
        }
      }
    }
  }`;

const STAGED_UPLOADS_MUTATION = `#graphql
  mutation CmsStagedUploadsCreate($input: [StagedUploadInput!]!) {
    stagedUploadsCreate(input: $input) {
      stagedTargets {
        url
        resourceUrl
        parameters {
          name
          value
        }
      }
      userErrors {
        field
        message
      }
    }
  }`;

const FILE_CREATE_MUTATION = `#graphql
  mutation CmsFileCreate($files: [FileCreateInput!]!) {
    fileCreate(files: $files) {
      files {
        id
        alt
        fileStatus
        ... on MediaImage {
          image {
            url
            altText
          }
          mimeType
        }
        ... on GenericFile {
          url
          mimeType
        }
      }
      userErrors {
        field
        message
      }
    }
  }`;

function toMediaItem(node: {
  id: string;
  alt?: string | null;
  mimeType?: string | null;
  image?: {
    url?: string | null;
    altText?: string | null;
    width?: number | null;
    height?: number | null;
  } | null;
  url?: string | null;
}): MediaItem | null {
  const url = node.image?.url || node.url;

  if (!url) {
    return null;
  }

  return {
    id: node.id,
    url,
    alt: node.image?.altText || node.alt || undefined,
    title: node.alt || undefined,
    mimeType: node.mimeType || undefined,
    width: node.image?.width ?? undefined,
    height: node.image?.height ?? undefined,
  };
}

export async function listImages(
  admin: ShopifyAdminClient,
  shop: string,
  { page, perPage, search = "" }: ListImagesInput,
): Promise<ListImagesResult> {
  const term = search.trim();
  const query = term
    ? `media_type:IMAGE AND filename:*${term}*`
    : "media_type:IMAGE";
  const targetIndex = (page - 1) * perPage;

  let after: string | undefined;
  let cursor = 0;
  const collected: MediaItem[] = [];
  let hasNextPage = true;

  while (hasNextPage && collected.length < targetIndex + perPage) {
    const response = await admin.graphql(LIST_FILES_QUERY, {
      variables: {
        first: Math.min(perPage, 50),
        after,
        query,
      },
    });

    const json = await response.json();
    const connection = json.data?.files;

    if (!connection) {
      break;
    }

    for (const edge of connection.edges ?? []) {
      const item = toMediaItem(edge.node);
      if (!item) continue;

      if (cursor >= targetIndex && collected.length < perPage) {
        collected.push(item);
      }

      cursor += 1;
    }

    hasNextPage = connection.pageInfo?.hasNextPage ?? false;
    after = connection.pageInfo?.endCursor ?? undefined;

    if (!hasNextPage) {
      break;
    }
  }

  const total = cursor;
  const totalPages = Math.max(1, Math.ceil(total / perPage));

  return {
    items: collected,
    total,
    page,
    perPage,
    totalPages,
  };
}

async function uploadToStagedTarget(
  target: {
    url: string;
    parameters: Array<{ name: string; value: string }>;
  },
  file: File,
) {
  const formData = new FormData();

  for (const parameter of target.parameters) {
    formData.append(parameter.name, parameter.value);
  }

  formData.append("file", file);

  const uploadResponse = await fetch(target.url, {
    method: "POST",
    body: formData,
  });

  if (!uploadResponse.ok) {
    throw new Error(`Failed to upload file to Shopify storage (${uploadResponse.status}).`);
  }
}

export async function uploadImage(
  admin: ShopifyAdminClient,
  shop: string,
  file: File,
): Promise<MediaItem> {
  const stagedResponse = await admin.graphql(STAGED_UPLOADS_MUTATION, {
    variables: {
      input: [
        {
          filename: file.name,
          mimeType: file.type || "image/jpeg",
          resource: "IMAGE",
          fileSize: String(file.size),
          httpMethod: "POST",
        },
      ],
    },
  });

  const stagedJson = await stagedResponse.json();
  const stagedTarget = stagedJson.data?.stagedUploadsCreate?.stagedTargets?.[0];
  const stagedErrors = stagedJson.data?.stagedUploadsCreate?.userErrors ?? [];

  if (!stagedTarget || stagedErrors.length > 0) {
    throw new Error(
      stagedErrors[0]?.message || "Failed to create staged upload target.",
    );
  }

  await uploadToStagedTarget(stagedTarget, file);

  const createResponse = await admin.graphql(FILE_CREATE_MUTATION, {
    variables: {
      files: [
        {
          alt: file.name,
          contentType: "IMAGE",
          originalSource: stagedTarget.resourceUrl,
        },
      ],
    },
  });

  const createJson = await createResponse.json();
  const createdFile = createJson.data?.fileCreate?.files?.[0];
  const createErrors = createJson.data?.fileCreate?.userErrors ?? [];

  if (!createdFile || createErrors.length > 0) {
    throw new Error(createErrors[0]?.message || "Failed to create Shopify file.");
  }

  const item = toMediaItem(createdFile);

  if (!item) {
    throw new Error("Shopify file was created without a public URL.");
  }

  await createMediaRecord(shop, {
    shopifyFileId: item.id,
    url: item.url,
    alt: item.alt,
    title: item.title,
    mimeType: item.mimeType,
  });

  return item;
}
