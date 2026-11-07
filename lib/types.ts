export type Exercise = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  category: string;
  tags: string[];
  date: string;
  code: string;
  stdin: string;
  expected: string;
  description: string;
  learning: string;
  allowRun: boolean;
  externalUrl: string;
  published: boolean;
  featured?: boolean;
};

export const STORAGE_KEY = "code-archive-exercises-v1";
