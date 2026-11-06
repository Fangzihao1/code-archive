import type { Metadata } from "next";
import "./globals.css";
import "./apple-overrides.css";

export const metadata: Metadata = {
  title: "CODE ARCHIVE — Python 编程学习档案",
  description: "记录 Python 课堂练习，展示代码思路，让每一段代码都能运行。"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
