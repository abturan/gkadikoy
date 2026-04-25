import OpenAI from "openai";
import { ENV } from "./env";

let _client: OpenAI | null = null;

function getClient(): OpenAI | null {
  if (!ENV.openaiApiKey) return null;
  if (!_client) {
    _client = new OpenAI({ apiKey: ENV.openaiApiKey });
  }
  return _client;
}

export function isOpenAIEnabled(): boolean {
  return Boolean(ENV.openaiApiKey);
}

const MODEL = "gpt-4o-mini";

/**
 * Revise Turkish news text — improve grammar, style, flow.
 * Returns improved text + editor notes.
 */
export async function reviseText(
  input: string,
  options?: { tone?: "neutral" | "warm" | "formal"; keepLength?: boolean }
): Promise<{ revised: string; notes: string[] } | null> {
  const client = getClient();
  if (!client) return null;

  const tone = options?.tone ?? "neutral";
  const keepLength = options?.keepLength ?? true;

  const systemPrompt = `Sen deneyimli bir Türkçe haber editörüsün. Görevin:
1) Verilen haber metnini dilbilgisi, noktalama ve üslup açısından düzelt.
2) Türkçenin doğal akışına uygun hale getir — devrik cümleleri düzelt, gereksiz tekrarları kaldır.
3) Kadıköy yerel gazetesi için uygun, ${tone === "warm" ? "sıcak ve yakın" : tone === "formal" ? "kurumsal ve resmî" : "nesnel ve bilgilendirici"} bir ton kullan.
4) ${keepLength ? "Metnin uzunluğunu koru, sadece kaliteyi artır." : "Gereksiz kısımları kısalt."}
5) Özel isimleri, rakamları, tarihleri AYNEN KORU.
6) HTML etiketleri varsa koru (<p>, <h2>, <strong>, <em>, <blockquote>, <a> vb).

Cevabını JSON olarak ver: { "revised": "düzeltilmiş metin", "notes": ["not 1", "not 2"] }`;

  try {
    const resp = await client.chat.completions.create({
      model: MODEL,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: input },
      ],
      temperature: 0.3,
    });

    const content = resp.choices[0]?.message?.content;
    if (!content) return null;
    const parsed = JSON.parse(content);
    return {
      revised: String(parsed.revised ?? ""),
      notes: Array.isArray(parsed.notes) ? parsed.notes.map(String) : [],
    };
  } catch (err) {
    console.error("[OpenAI] reviseText failed:", err);
    return null;
  }
}

/**
 * Suggest 3 candidate titles for a news article.
 */
export async function suggestTitles(content: string): Promise<string[] | null> {
  const client = getClient();
  if (!client) return null;

  const systemPrompt = `Sen bir Türk gazete editörüsün. Verilen haber metni için 3 başlık önerisi üret:
- Her başlık 8 kelimeyi geçmesin
- İlgi çekici ama abartıdan uzak
- Clickbait olmasın
- Özel ismi varsa öne çıkar

Cevap formatı: JSON { "titles": ["başlık 1", "başlık 2", "başlık 3"] }`;

  try {
    const resp = await client.chat.completions.create({
      model: MODEL,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: content.slice(0, 4000) },
      ],
      temperature: 0.6,
    });

    const text = resp.choices[0]?.message?.content;
    if (!text) return null;
    const parsed = JSON.parse(text);
    return Array.isArray(parsed.titles) ? parsed.titles.slice(0, 3).map(String) : null;
  } catch (err) {
    console.error("[OpenAI] suggestTitles failed:", err);
    return null;
  }
}

/**
 * Generate a concise summary (dek) from article content.
 */
export async function suggestSummary(content: string): Promise<string | null> {
  const client = getClient();
  if (!client) return null;

  const systemPrompt = `Sen bir gazete editörüsün. Aşağıdaki haber metni için 1-2 cümlelik (max 220 karakter) öz / dek üret. Haberin ne anlattığını doğrudan söyle. Abartma, sadece nesnel özet.`;

  try {
    const resp = await client.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: content.slice(0, 4000) },
      ],
      temperature: 0.4,
      max_tokens: 200,
    });

    return resp.choices[0]?.message?.content?.trim() ?? null;
  } catch (err) {
    console.error("[OpenAI] suggestSummary failed:", err);
    return null;
  }
}

/**
 * Generate a URL-safe slug from a title (uses AI for Turkish character handling).
 */
export function generateSlug(title: string): string {
  const map: Record<string, string> = {
    ç: "c", Ç: "c", ğ: "g", Ğ: "g", ı: "i", İ: "i",
    ö: "o", Ö: "o", ş: "s", Ş: "s", ü: "u", Ü: "u",
  };
  return title
    .split("")
    .map((c) => map[c] ?? c)
    .join("")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
