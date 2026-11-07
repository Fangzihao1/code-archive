"use client";

import type { Exercise } from "@/lib/types";
import { getExercises, saveExercises } from "@/lib/storage";
import { createClient } from "@/lib/supabase/client";

type ExerciseRow = {
  id: string; slug: string; title: string; summary: string; category: string;
  tags: string[]; date: string; code: string; stdin: string; expected: string;
  description: string; learning: string; allow_run: boolean; external_url: string;
  published: boolean; featured: boolean; created_at?: string; updated_at?: string;
};

const MIGRATION_KEY = "code-archive-cloud-import-v1";

function toRow(item: Exercise): ExerciseRow {
  return {
    id: item.id, slug: item.slug, title: item.title, summary: item.summary,
    category: item.category, tags: item.tags ?? [], date: item.date,
    code: item.code, stdin: item.stdin, expected: item.expected,
    description: item.description, learning: item.learning,
    allow_run: item.allowRun, external_url: item.externalUrl,
    published: item.published, featured: !!item.featured, updated_at: new Date().toISOString(),
  };
}

function fromRow(row: ExerciseRow): Exercise {
  return {
    id: row.id, slug: row.slug, title: row.title, summary: row.summary,
    category: row.category, tags: row.tags ?? [], date: row.date,
    code: row.code, stdin: row.stdin, expected: row.expected,
    description: row.description, learning: row.learning,
    allowRun: row.allow_run, externalUrl: row.external_url,
    published: row.published, featured: !!row.featured,
  };
}

export async function getPublishedExercises(): Promise<Exercise[]> {
  const supabase = createClient();
  const { data, error } = await supabase.from("exercises").select("*")
    .eq("published", true).eq("featured", true).order("date", { ascending: false });
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

export async function deleteCloudExercise(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("exercises").delete().eq("id", id);
  if (error) throw error;
  saveExercises(getExercises().filter((x) => x.id !== id));
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
