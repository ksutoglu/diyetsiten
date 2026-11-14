import { createClient } from '@sanity/client';

import { getToken } from './auth';
import {
  API_VERSION,
  DATASET,
  PROJECT_ID,
  contentTypes,
  getType,
  imageRef,
  isDoc,
  labelFromDoc,
  pickFields,
  type ContentType,
  type Doc,
} from './model';

export function sanity(token = getToken()) {
  return createClient({
    projectId: PROJECT_ID,
    dataset: DATASET,
    apiVersion: API_VERSION,
    useCdn: false,
    token: token || undefined,
  });
}

export async function checkToken(token: string) {
  const client = sanity(token);
  await client.fetch('count(*[_type == "sanity.imageAsset"])');
}

const LIST = `*[_type == $type && !(_id in path("drafts.**"))] | order(_updatedAt desc) {
  _id, _type, _updatedAt, _createdAt,
  title, name, question, pageTitle,
  slug, mainImage, image, anaGorsel, profileImage
}`;

export async function listDocs(type: ContentType) {
  const rows = await sanity().fetch<Doc[]>(LIST, { type: type.name });
  return (Array.isArray(rows) ? rows : []).map((row) => ({
    _id: String(row._id ?? ''),
    _updatedAt: typeof row._updatedAt === 'string' ? row._updatedAt : '',
    label: labelFromDoc(row, type.label),
    image: imageRef(row[type.thumb || '']) || imageRef(row.mainImage) || imageRef(row.image) || imageRef(row.anaGorsel) || imageRef(row.profileImage),
  }));
}

export async function readDoc(id: string): Promise<Doc | null> {
  const doc = await sanity().fetch<Doc | null>(`*[_id == $id && !(_id in path("drafts.**"))][0]`, { id });
  return doc && isDoc(doc) ? doc : null;
}

export async function overview() {
  const names = contentTypes.map((type) => type.name);
  const countProjection = names.map((name) => `"${name}": count(*[_type == "${name}" && !(_id in path("drafts.**"))])`).join(',');
  const data = await sanity().fetch<{ counts: Record<string, number>; recent: Doc[] }>(
    `{
      "counts": { ${countProjection} },
      "recent": *[_type in $types && !(_id in path("drafts.**"))] | order(_updatedAt desc)[0...6]{
        _id, _type, _updatedAt, title, name, question, pageTitle, slug
      }
    }`,
    { types: names },
  );
  return {
    counts: data?.counts || {},
    recent: (data?.recent || []).map((row) => {
      const type = getType(String(row._type ?? ''));
      return {
        _id: String(row._id ?? ''),
        _type: String(row._type ?? ''),
        _updatedAt: typeof row._updatedAt === 'string' ? row._updatedAt : '',
        label: type ? labelFromDoc(row, type.label) : 'Kayıt',
      };
    }),
  };
}

export async function optionsFor(typeName: string) {
  const type = getType(typeName);
  if (!type) return [];
  const rows = await sanity().fetch<Doc[]>(
    `*[_type == $type && !(_id in path("drafts.**"))] | order(title asc) { _id, title, name, question, pageTitle, slug }`,
    { type: typeName },
  );
  return (Array.isArray(rows) ? rows : []).map((row) => ({
    _id: String(row._id ?? ''),
    label: labelFromDoc(row, type.label),
  }));
}

export async function saveDoc(type: ContentType, id: string, input: unknown) {
  const fields = pickFields(type.fields, input);
  await sanity().createOrReplace({ _id: id, _type: type.name, ...fields });
  return readDoc(id);
}

export async function removeDoc(id: string) {
  await sanity().delete(id);
}

export async function uploadImage(bytes: Buffer, filename: string, contentType: string) {
  const asset = await sanity().assets.upload('image', bytes, { filename, contentType });
  return { assetId: asset._id, url: asset.url };
}
