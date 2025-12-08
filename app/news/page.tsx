"use client";

import { useState, useEffect } from "react";

interface NewsItem {
  id: string;
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string;
}

interface NewsWithSummary extends NewsItem {
  summary?: string;
  isLoading?: boolean;
}

export default function NewsPage() {
  const [news, setNews] = useState<NewsWithSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ニュースを取得
  useEffect(() => {
    async function fetchNews() {
      try {
        const response = await fetch("/api/news");
        const data = await response.json();

        if (data.success) {
          setNews(data.data.map((item: NewsItem) => ({ ...item, isLoading: false })));
        } else {
          setError(data.error || "ニュースの取得に失敗しました");
        }
      } catch {
        setError("ニュースの取得に失敗しました");
      } finally {
        setIsLoading(false);
      }
    }

    fetchNews();
  }, []);

  // 要約を取得
  const summarize = async (newsItem: NewsWithSummary) => {
    // すでに要約がある場合はスキップ
    if (newsItem.summary) return;

    // ローディング状態に設定
    setNews((prev) =>
      prev.map((item) =>
        item.id === newsItem.id ? { ...item, isLoading: true } : item
      )
    );

    try {
      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: newsItem.title,
          description: newsItem.description,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setNews((prev) =>
          prev.map((item) =>
            item.id === newsItem.id
              ? { ...item, summary: data.summary, isLoading: false }
              : item
          )
        );
      }
    } catch {
      setNews((prev) =>
        prev.map((item) =>
          item.id === newsItem.id ? { ...item, isLoading: false } : item
        )
      );
    }
  };

  // 全てのニュースを要約
  const summarizeAll = async () => {
    for (const item of news) {
      if (!item.summary) {
        await summarize(item);
      }
    }
  };

  if (isLoading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>
          <div style={styles.spinner}></div>
          <p>ニュースを読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>
          <p>エラー: {error}</p>
          <button onClick={() => window.location.reload()} style={styles.button}>
            再読み込み
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>📰 ニュース3行要約</h1>
        <p style={styles.subtitle}>AIがニュースを3行に要約します</p>
        <button onClick={summarizeAll} style={styles.summarizeAllButton}>
          🤖 すべて要約する
        </button>
      </header>

      <main style={styles.main}>
        {news.map((item) => (
          <article key={item.id} style={styles.card}>
            <div style={styles.cardHeader}>
              <span style={styles.source}>{item.source}</span>
              <span style={styles.date}>
                {new Date(item.publishedAt).toLocaleDateString("ja-JP", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>

            <h2 style={styles.cardTitle}>
              <a href={item.url} target="_blank" rel="noopener noreferrer" style={styles.link}>
                {item.title}
              </a>
            </h2>

            {item.summary ? (
              <div style={styles.summary}>
                <h3 style={styles.summaryTitle}>📝 3行要約</h3>
                <div style={styles.summaryContent}>
                  {item.summary.split("\n").map((line, index) => (
                    <p key={index} style={styles.summaryLine}>
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            ) : (
              <div style={styles.originalContent}>
                <p style={styles.description}>
                  {item.description.slice(0, 200)}
                  {item.description.length > 200 ? "..." : ""}
                </p>
                <button
                  onClick={() => summarize(item)}
                  disabled={item.isLoading}
                  style={{
                    ...styles.button,
                    ...(item.isLoading ? styles.buttonDisabled : {}),
                  }}
                >
                  {item.isLoading ? (
                    <>
                      <span style={styles.buttonSpinner}></span>
                      要約中...
                    </>
                  ) : (
                    "🤖 3行に要約する"
                  )}
                </button>
              </div>
            )}
          </article>
        ))}
      </main>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#f5f5f5",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  header: {
    backgroundColor: "#1a1a2e",
    color: "white",
    padding: "2rem",
    textAlign: "center",
  },
  title: {
    fontSize: "2rem",
    margin: 0,
    marginBottom: "0.5rem",
  },
  subtitle: {
    fontSize: "1rem",
    margin: 0,
    opacity: 0.8,
    marginBottom: "1rem",
  },
  summarizeAllButton: {
    backgroundColor: "#4361ee",
    color: "white",
    border: "none",
    padding: "0.75rem 1.5rem",
    borderRadius: "8px",
    fontSize: "1rem",
    cursor: "pointer",
    fontWeight: "bold",
  },
  main: {
    maxWidth: "800px",
    margin: "0 auto",
    padding: "2rem 1rem",
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
  },
  card: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "1.5rem",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "0.75rem",
    fontSize: "0.85rem",
  },
  source: {
    backgroundColor: "#e8f4fd",
    color: "#1976d2",
    padding: "0.25rem 0.75rem",
    borderRadius: "12px",
    fontWeight: "500",
  },
  date: {
    color: "#666",
  },
  cardTitle: {
    fontSize: "1.2rem",
    margin: "0 0 1rem 0",
    lineHeight: 1.4,
  },
  link: {
    color: "#1a1a2e",
    textDecoration: "none",
  },
  description: {
    color: "#444",
    lineHeight: 1.6,
    marginBottom: "1rem",
  },
  summary: {
    backgroundColor: "#f0fdf4",
    borderRadius: "8px",
    padding: "1rem",
    borderLeft: "4px solid #22c55e",
  },
  summaryTitle: {
    fontSize: "0.9rem",
    color: "#166534",
    margin: "0 0 0.75rem 0",
  },
  summaryContent: {
    margin: 0,
  },
  summaryLine: {
    margin: "0.5rem 0",
    color: "#333",
    lineHeight: 1.6,
  },
  originalContent: {},
  button: {
    backgroundColor: "#4361ee",
    color: "white",
    border: "none",
    padding: "0.6rem 1.2rem",
    borderRadius: "6px",
    fontSize: "0.9rem",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  buttonDisabled: {
    backgroundColor: "#9ca3af",
    cursor: "not-allowed",
  },
  buttonSpinner: {
    width: "14px",
    height: "14px",
    border: "2px solid transparent",
    borderTopColor: "white",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  loading: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    gap: "1rem",
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: "4px solid #e5e7eb",
    borderTopColor: "#4361ee",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  error: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    gap: "1rem",
    color: "#dc2626",
  },
};
