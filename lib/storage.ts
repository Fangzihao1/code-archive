"use client";
import { seedExercises } from "./data";
import { Exercise, STORAGE_KEY } from "./types";

export function getExercises(): Exercise[] {
  if (typeof window === "undefined") return seedExercises;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seedExercises));
      return seedExercises;
    }
    return JSON.parse(raw) as Exercise[];
  } catch {
    return seedExercises;
  }
}

export function saveExercises(items: Exercise[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}
