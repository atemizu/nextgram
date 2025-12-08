import { NextResponse } from "next/server";

interface SummarizeRequest {
  title: string;
  description: string;
}

export async function POST(request: Request) {
  try {
    const body: SummarizeRequest = await request.json();
    const { title, description } = body;

    if (!title || !description) {
      return NextResponse.json(
        { success: false, error: "タイトルと説明文が必要です" },
        { status: 400 }
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      // APIキーがない場合はシンプルな要約を返す
      const fallbackSummary = generateFallbackSummary(title, description);
      return NextResponse.json({
        success: true,
        summary: fallbackSummary,
      });
    }

    // Anthropic Claude APIを呼び出し
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 256,
        messages: [
          {
            role: "user",
            content: `以下のニュース記事を日本語で3行で要約してください。各行は簡潔に、重要なポイントを含めてください。

タイトル: ${title}

内容: ${description}

3行の要約:`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Anthropic API error:", errorData);
      // APIエラーの場合はフォールバック
      const fallbackSummary = generateFallbackSummary(title, description);
      return NextResponse.json({
        success: true,
        summary: fallbackSummary,
      });
    }

    const data = await response.json();
    const summary =
      data.content?.[0]?.text || generateFallbackSummary(title, description);

    return NextResponse.json({
      success: true,
      summary: summary,
    });
  } catch (error) {
    console.error("Summarize API error:", error);
    return NextResponse.json(
      { success: false, error: "要約の生成に失敗しました" },
      { status: 500 }
    );
  }
}

// フォールバック: シンプルな要約を生成
function generateFallbackSummary(title: string, description: string): string {
  const sentences = description
    .replace(/([。！？])/g, "$1\n")
    .split("\n")
    .filter((s) => s.trim().length > 0);

  const lines: string[] = [];

  // タイトルから1行目
  lines.push(`・${title}`);

  // 説明から2行を抽出
  if (sentences.length >= 1) {
    const firstSentence = sentences[0].trim();
    if (firstSentence.length > 50) {
      lines.push(`・${firstSentence.slice(0, 50)}...`);
    } else {
      lines.push(`・${firstSentence}`);
    }
  }

  if (sentences.length >= 2) {
    const lastSentence = sentences[sentences.length - 1].trim();
    if (lastSentence.length > 50) {
      lines.push(`・${lastSentence.slice(0, 50)}...`);
    } else {
      lines.push(`・${lastSentence}`);
    }
  } else {
    lines.push("・詳細は記事をご確認ください。");
  }

  return lines.join("\n");
}
