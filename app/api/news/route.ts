import { NextResponse } from "next/server";

interface NewsItem {
  id: string;
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string;
}

// RSSフィードからニュースを取得する関数
async function fetchRSSNews(): Promise<NewsItem[]> {
  try {
    // Google News Japan RSSフィード
    const rssUrl = "https://news.google.com/rss?hl=ja&gl=JP&ceid=JP:ja";
    const response = await fetch(rssUrl, {
      next: { revalidate: 300 }, // 5分間キャッシュ
    });

    if (!response.ok) {
      throw new Error("RSS fetch failed");
    }

    const xmlText = await response.text();

    // 簡易的なXMLパース（正規表現を使用）
    const items: NewsItem[] = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    const titleRegex = /<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>|<title>([\s\S]*?)<\/title>/;
    const linkRegex = /<link>([\s\S]*?)<\/link>/;
    const pubDateRegex = /<pubDate>([\s\S]*?)<\/pubDate>/;
    const descriptionRegex = /<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>|<description>([\s\S]*?)<\/description>/;
    const sourceRegex = /<source[^>]*>([\s\S]*?)<\/source>/;

    let match;
    let index = 0;

    while ((match = itemRegex.exec(xmlText)) !== null && index < 10) {
      const itemContent = match[1];

      const titleMatch = itemContent.match(titleRegex);
      const linkMatch = itemContent.match(linkRegex);
      const pubDateMatch = itemContent.match(pubDateRegex);
      const descriptionMatch = itemContent.match(descriptionRegex);
      const sourceMatch = itemContent.match(sourceRegex);

      const title = titleMatch ? (titleMatch[1] || titleMatch[2] || "").trim() : "";
      const link = linkMatch ? linkMatch[1].trim() : "";
      const pubDate = pubDateMatch ? pubDateMatch[1].trim() : "";
      const description = descriptionMatch
        ? (descriptionMatch[1] || descriptionMatch[2] || "").trim()
        : "";
      const source = sourceMatch ? sourceMatch[1].trim() : "Google News";

      if (title && link) {
        items.push({
          id: `news-${index}`,
          title: title.replace(/<[^>]*>/g, ""), // HTMLタグを除去
          description: description.replace(/<[^>]*>/g, "").slice(0, 500),
          url: link,
          source: source.replace(/<[^>]*>/g, ""),
          publishedAt: pubDate,
        });
        index++;
      }
    }

    return items;
  } catch (error) {
    console.error("RSS fetch error:", error);
    // フォールバック: モックデータを返す
    return getMockNews();
  }
}

// モックニュースデータ
function getMockNews(): NewsItem[] {
  return [
    {
      id: "1",
      title: "AI技術の進化が加速、新たな言語モデルが登場",
      description:
        "人工知能の分野で革新的な進展が見られています。最新の言語モデルは、より自然な会話能力と高度な推論能力を備えており、様々な産業での活用が期待されています。研究者たちは、この技術が医療、教育、ビジネスなど多岐にわたる分野で革命をもたらす可能性があると指摘しています。",
      url: "https://example.com/news/1",
      source: "テックニュース",
      publishedAt: new Date().toISOString(),
    },
    {
      id: "2",
      title: "環境問題への取り組み強化、再生可能エネルギーへの転換進む",
      description:
        "世界各国で環境問題への意識が高まる中、再生可能エネルギーへの転換が加速しています。太陽光発電や風力発電などのクリーンエネルギーの導入が進み、多くの企業が脱炭素化に向けた取り組みを強化しています。専門家は、2030年までに再生可能エネルギーの割合が大幅に増加すると予測しています。",
      url: "https://example.com/news/2",
      source: "環境ニュース",
      publishedAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: "3",
      title: "経済市場の動向、株式市場が安定推移",
      description:
        "今週の株式市場は安定した推移を見せています。主要株価指数は小幅な変動にとどまり、投資家は今後の金融政策の動向を注視しています。アナリストは、インフレ率の推移と中央銀行の政策決定が今後の市場動向に大きな影響を与えると分析しています。",
      url: "https://example.com/news/3",
      source: "経済ニュース",
      publishedAt: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      id: "4",
      title: "スポーツ界で若手選手が台頭、新記録続出",
      description:
        "スポーツの世界で若い世代の選手たちが次々と活躍を見せています。各競技で新記録が生まれ、ベテラン選手との世代交代が進んでいます。特に陸上競技や水泳では、10代の選手が国際大会で優勝するなど、将来への期待が高まっています。",
      url: "https://example.com/news/4",
      source: "スポーツニュース",
      publishedAt: new Date(Date.now() - 10800000).toISOString(),
    },
    {
      id: "5",
      title: "医療技術の革新、新たな治療法が承認へ",
      description:
        "医療分野で画期的な進展がありました。長年研究が進められてきた新しい治療法が臨床試験を経て承認される見通しとなりました。この治療法は従来の方法と比較して副作用が少なく、より効果的な結果が期待されています。患者団体からは歓迎の声が上がっています。",
      url: "https://example.com/news/5",
      source: "医療ニュース",
      publishedAt: new Date(Date.now() - 14400000).toISOString(),
    },
  ];
}

export async function GET() {
  try {
    const news = await fetchRSSNews();

    return NextResponse.json({
      success: true,
      data: news,
    });
  } catch (error) {
    console.error("News API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "ニュースの取得に失敗しました",
      },
      { status: 500 }
    );
  }
}
