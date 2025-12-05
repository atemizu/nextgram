// app/page.tsx
"use client";

import { useEffect, useState, FormEvent } from "react";

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

  // ブラウザの localStorage から保存済みの投稿を読み込む
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = window.localStorage.getItem("ochin-sns-posts");
      if (!saved) return;
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        setPosts(parsed);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // 投稿が変わるたびに localStorage に保存
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("ochin-sns-posts", JSON.stringify(posts));
  }, [posts]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;

    const newPost: Post = {
      id: Date.now(),
      user: "visitor", // ゲストは全部これでOK
      text: trimmed,
      date: new Date().toISOString().slice(0, 10),
    };

    // 新しい投稿を先頭に
    setPosts([newPost, ...posts]);
    setText("");
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#f3f4f6",
        padding: "16px",
        fontFamily: "-apple-system, BlinkMacSystemFont, system-ui, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "640px",
          margin: "0 auto",
        }}
      >
        <header
          style={{
            marginBottom: "16px",
            paddingBottom: "8px",
            borderBottom: "1px solid #e5e7eb",
          }}
        >
          <h1
            style={{
              fontSize: "20px",
              fontWeight: 700,
            }}
          >
            おちんSNS（見た目＋その場投稿）
          </h1>
          <p
            style={{
              fontSize: "13px",
              color: "#6b7280",
              marginTop: "4px",
            }}
          >
            投稿すると、このブラウザの中だけでタイムラインに追加されます。
            他の人の画面にはまだ反映されない、ゆるいSNSごっこです。
          </p>
        </header>

        {/* 投稿フ*
