"use client";

import type { Exercise, ExerciseVersion } from "@/lib/types";
import { getExercises, saveExercises } from "@/lib/storage";
import { createClient } from "@/lib/supabase/client";

type ExerciseRow = {
  id: string; slug: string; title: string; summary: string; category: string;
  tags: string[]; date: string; code: string; stdin: string; expected: string;
  description: string; learning: string; allow_run: boolean; external_url: string;
  published: boolean; featured: boolean; archived: boolean; image_urls: string[];
  created_at?: string; updated_at?: string;
};

const MIGRATION_KEY = "code-archive-cloud-import-v1";

function toRow(item: Exercise): ExerciseRow {
  return {
    id: item.id, slug: item.slug, title: item.title, summary: item.summary,
    category: item.category, tags: item.tags ?? [], date: item.date,
    code: item.code, stdin: item.stdin, expected: item.expected,
    description: item.description, learning: item.learning,
    allow_run: item.allowRun, external_url: item.externalUrl,
    published: item.published, featured: !!item.featured,
    archived: !!item.archived, image_urls: item.imageUrls ?? [], updated_at: new Date().toISOString(),
  };
}

function fromRow(row: ExerciseRow): Exercise {
  return {
    id: row.id, slug: row.slug, title: row.title, summary: row.summary,
    category: row.category, tags: row.tags ?? [], date: row.date,
    code: row.code, stdin: row.stdin, expected: row.expected,
    description: row.description, learning: row.learning,
    allowRun: row.allow_run, externalUrl: row.external_url,
    published: row.published, featured: !!row.featured, archived: !!row.archived,
    updatedAt: row.updated_at, imageUrls: row.image_urls ?? [],
  };
}

export async function getPublishedExercises(): Promise<Exercise[]> {
  const supabase = createClient();
  const { data, error } = await supabase.from("exercises").select("*")
    .eq("published", true).eq("archived", false).order("date", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => fromRow(row as ExerciseRow));
}

export async function getFeaturedExercises(): Promise<Exercise[]> {
  const supabase = createClient();
  const { data, error } = await supabase.from("exercises").select("*")
    .eq("published", true).eq("featured", true).eq("archived", false).order("date", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => fromRow(row as ExerciseRow));
}

export async function getAdminExercises(): Promise<Exercise[]> {
  const supabase = createClient();
  const { data, error } = await supabase.from("exercises").select("*")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => fromRow(row as ExerciseRow));
}

export async function getExerciseVersions(exerciseId: string): Promise<ExerciseVersion[]> {
  const supabase = createClient();
  const { data, error } = await supabase.from("exercise_versions")
    .select("id, exercise_id, original_exercise_id, version_number, snapshot, created_at")
    .eq("original_exercise_id", exerciseId)
    .order("version_number", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id as string,
    exerciseId: row.exercise_id as string,
    originalExerciseId: row.original_exercise_id as string,
    versionNumber: row.version_number as number,
    snapshot: fromRow(row.snapshot as ExerciseRow),
    createdAt: row.created_at as string,
  }));
}

export async function restoreExerciseVersion(version: ExerciseVersion): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("exercises")
    .upsert(toRow({ ...version.snapshot, archived: false, published: false, featured: false }), { onConflict: "id" });
  if (error) throw error;
  const restored = { ...version.snapshot, archived: false, published: false, featured: false };
  const local = getExercises();
  saveExercises(local.some((item) => item.id === restored.id)
    ? local.map((item) => item.id === restored.id ? restored : item)
    : [restored, ...local]);
}

export async function saveCloudExercise(item: Exercise): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("exercises").upsert(toRow(item), { onConflict: "id" });
  if (error) throw error;
  const local = getExercises();
  const next = local.some((x) => x.id === item.id)
    ? local.map((x) => x.id === item.id ? item : x)
    : [item, ...local];
  saveExercises(next);
}

export async function archiveCloudExercise(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("exercises").update({
    archived: true, published: false, featured: false, updated_at: new Date().toISOString(),
  }).eq("id", id);
  if (error) throw error;
  const local = getExercises().map((item) => item.id === id
    ? { ...item, archived: true, published: false, featured: false }
    : item);
  saveExercises(local);
}

export async function restoreArchivedExercise(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("exercises").update({
    archived: false, updated_at: new Date().toISOString(),
  }).eq("id", id);
  if (error) throw error;
  saveExercises(getExercises().map((item) => item.id === id ? { ...item, archived: false } : item));
}

export async function importLocalExercisesOnce(): Promise<void> {
  if (typeof window === "undefined" || localStorage.getItem(MIGRATION_KEY) === "done") return;
  const supabase = createClient();
  const localItems = getExercises();
  const { data, error } = await supabase.from("exercises").select("id,slug");
  if (error) throw error;
  const existingIds = new Set((data ?? []).map((x: { id: string }) => x.id));
  const existingSlugs = new Set((data ?? []).map((x: { slug: string }) => x.slug));
  const missing = localItems.filter((x) => !existingIds.has(x.id) && !existingSlugs.has(x.slug));
  if (missing.length) {
    const { error: insertError } = await supabase.from("exercises").insert(missing.map(toRow));
    if (insertError) throw insertError;
  }
  localStorage.setItem(MIGRATION_KEY, "done");
}

export async function bulkSetPublished(ids: string[], published: boolean): Promise<void> {
  if (!ids.length) return;
  const supabase = createClient();
  const patch = published
    ? { published: true, updated_at: new Date().toISOString() }
    : { published: false, featured: false, updated_at: new Date().toISOString() };
  const { error } = await supabase.from("exercises").update(patch).in("id", ids).eq("archived", false);
  if (error) throw error;
  saveExercises(getExercises().map((item) => ids.includes(item.id)
    ? { ...item, published, featured: published ? item.featured : false }
    : item));
}

export async function bulkArchiveExercises(ids: string[]): Promise<void> {
  if (!ids.length) return;
  const supabase = createClient();
  const { error } = await supabase.from("exercises").update({
    archived: true, published: false, featured: false, updated_at: new Date().toISOString(),
  }).in("id", ids).eq("archived", false);
  if (error) throw error;
  saveExercises(getExercises().map((item) => ids.includes(item.id)
    ? { ...item, archived: true, published: false, featured: false }
    : item));
}

export async function renameExerciseCategory(currentName: string, nextName: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("exercises").update({
    category: nextName, updated_at: new Date().toISOString(),
  }).eq("category", currentName);
  if (error) throw error;
  saveExercises(getExercises().map((item) => item.category === currentName
    ? { ...item, category: nextName }
    : item));
}

export async function renameExerciseTag(currentName: string, nextName: string): Promise<void> {
  const items = await getAdminExercises();
  for (const item of items.filter((entry) => entry.tags.includes(currentName))) {
    await saveCloudExercise({
      ...item,
      tags: Array.from(new Set(item.tags.map((tag) => tag === currentName ? nextName : tag))),
    });
  }
}

export async function uploadExerciseImage(file: File): Promise<string> {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) throw new Error("仅支持 JPG、PNG 或 WebP 图片。");
  if (file.size > 5 * 1024 * 1024) throw new Error("单张图片不能超过 5MB。");
  const supabase = createClient();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]+/g, "-").slice(-80) || "image";
  const path = crypto.randomUUID() + "-" + safeName;
  const { error } = await supabase.storage.from("exercise-images").upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw error;
  return supabase.storage.from("exercise-images").getPublicUrl(path).data.publicUrl;
}

export async function deleteExerciseImage(publicUrl: string): Promise<void> {
  const marker = "/storage/v1/object/public/exercise-images/";
  const pathname = new URL(publicUrl).pathname;
  const markerIndex = pathname.indexOf(marker);
  if (markerIndex < 0) throw new Error("图片地址不属于作品集图片空间。");
  const path = decodeURIComponent(pathname.slice(markerIndex + marker.length));
  if (!path) throw new Error("图片路径无效。");
  const supabase = createClient();
  const { error } = await supabase.storage.from("exercise-images").remove([path]);
  if (error) throw error;
}
