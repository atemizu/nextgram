// app/page.tsx
import Image from "next/image";

type Post = {
  id: number;
  user: string;
  text: string;
  date: string;
  imageSrc?: string;
};

const posts: Post[] = [
  {
    id: 1,
    user: "ochin",
    text: "フライパンに絵を描いてみた！",
    date: "2025-12-05",
    imageSrc: "/pan-drawing.jpg",
  },
  {
    id: 2,
    user: "ochin",
    text: "これはテスト投稿です。SNS っぽい見た目だけ先に作ってみた。",
    date: "2025-01-01",
  },
  {
    id: 3,
    user: "guest_user",
    text: "本当のデータベースはまだ無いけど、タイムラインごっこはできる。",
    date: "2025-01-02",
  },
  {
    id: 4,
    user: "ochin",
    text: "そのうち投稿フォーム付けたり、ログインつけたりする予定（かもしれない）。",
    date: "2025-01-03",
  },
  {
    id: 5,
    user: "someone",
    text: "とりあえず Vercel でデプロイできた時点で初心者卒業レベルではある。",
    date: "2025-01-04",
  },
];

export default function HomePage() {
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
            おちんSNS（見た目だけ）
          </h1>
          <p
            style={{
              fontSize: "13px",
              color: "#6b7280",
              marginTop: "4px",
            }}
          >
            これはただのダミータイムラインです。本物っぽさだけ楽しんでください。
          </p>
        </header>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {posts.map((post) => (
            <article
              key={post.id}
              style={{
                backgroundColor: "#ffffff",
                borderRadius: "12px",
                padding: "12px 14px",
                boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "4px",
                  fontSize: "12px",
                  color: "#6b7280",
                }}
              >
                <span>@{post.user}</span>
                <span>{post.date}</span>
              </div>
              <p
                style={{
                  fontSize: "14px",
                  lineHeight: 1.6,
                  whiteSpace: "pre-wrap",
                  marginBottom: post.imageSrc ? "12px" : "0",
                }}
              >
                {post.text}
              </p>
              {post.imageSrc && (
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    aspectRatio: "1",
                    borderRadius: "8px",
                    overflow: "hidden",
                    backgroundColor: "#f3f4f6",
                  }}
                >
                  <Image
                    src={post.imageSrc}
                    alt={post.text}
                    fill
                    style={{ objectFit: "cover" }}
                    sizes="(max-width: 640px) 100vw, 640px"
                  />
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
