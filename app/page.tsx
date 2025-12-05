// app/page.tsx
"use client";

import { useState, FormEvent } from "react";

type Post = {
  id: number;
  user: string;
  text: string;
  date: string;
};

const initialPosts: Post[] = [
  {
    id: 1,
    user: "ochin",
    text: "これはテスト投稿です。SNSっぽい見た目だけ先に作ってみた。",
    date: "2025-01-01",
  },
  {
    id: 2,
    user: "guest_user",
    text: "本当のデータベースはまだ無いけど、タイムラインごっこはできる。",
    date: "2025-01-02",
  },
  {
    id: 3,
    user: "ochin",
    text: "そのうち投稿フォーム付けたり、ログインつけたりする予定（かもしれない）。",
    date: "2025-01-03",
  },
  {
    id: 4,
    user: "someone",
    text: "とりあえず Vercel でデプロイできた時点で初心者卒業レベルではある。",
    date: "2025-01-04",
  },
  {
    id: 5,
    user: "ochin",
    text: "意見は無いけど SNS は作る男。",
    date: "2025-01-05",
  },
];

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [text, setText] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;

    const newPost: Post = {
      id: Date.now(),
      user: "visitor",
