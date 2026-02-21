import { NextRequest, NextResponse } from "next/server";
import { 
  sanitizeString, 
  validateNonEmptyString, 
  getClientIp,
  checkRateLimit,
  sanitizeErrorMessage 
} from "@/lib/security";

// Lightweight in-memory rate limiter (per IP, reset every 24h)
const EXPLAIN_RATE_LIMIT = parseInt(process.env.EXPLAIN_RATE_LIMIT || "20", 10);
const EXPLAIN_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours
const explainRateMap = new Map<string, { count: number; ts: number }>();

function checkAndIncrementRate(ip: string) {
  return checkRateLimit(explainRateMap, ip, EXPLAIN_RATE_LIMIT, EXPLAIN_WINDOW_MS);
}

export async function POST(request: NextRequest) {
  try {
    // Validate request content type
    const contentType = request.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      return NextResponse.json(
        { error: "Content-Type يجب أن يكون application/json" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { text } = body;

    // Sanitize and validate input
    const sanitizedText = sanitizeString(text, 10000);
    const validation = validateNonEmptyString(sanitizedText, "Hadith text");

    if (!validation.valid) {
      return NextResponse.json(
        { error: "لم يتم تقديم نص للشرح" },
        { status: 400 }
      );
    }

    // Rate limit (per IP)
    const clientIp = getClientIp(request);
    if (!checkAndIncrementRate(clientIp)) {
      return NextResponse.json(
        { error: "تم تجاوز حد الطلبات اليومية لميزة الشرح" },
        { status: 429 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      console.error('Missing OPENAI_API_KEY');
      return NextResponse.json(
        { error: "حدث خطأ في الخادم" },
        { status: 500 }
      );
    }

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: `أنت عالم متخصص في الحديث الشريف والسنة النبوية. دورك هو شرح الأحاديث بطريقة علمية دقيقة وموثوقة.

قواعد حتمية يجب الالتزام بها:
- لا تفتري على الدين أو النبي ﷺ بأي أفتراضات
- لا تضيف معاني ليست من النص الأصلي
- اشرح فقط ما يتضمنه الحديث بوضوح
- استند إلى فهم العلماء المعروفين والموثوق
- إذا كان هناك تفسير متعدد، اذكر الأوجه المختلفة بحذر
- لا تُصدر فتاوى أو أحكام شرعية
- استخدم لغة عربية فصحى مبسطة وواضحة
- ركز على الفهم الصحيح للحديث وليس التأويلات الشخصية

منهج الشرح:
1. الملخص: اختصر معنى الحديث في سطر أو سطرين
2. الشرح: اشرح الحديث كلمة تلو الأخرى، وضح المعاني الصعبة، اربط بين أجزاء الحديث
3. الكلمات المفتاحية: استخرج أهم المواضيع والمفاهيم

أجب بصيغة JSON فقط بهذا الشكل:
{
  "summary": "ملخص قصير جداً للحديث",
  "explanation": "شرح تفصيلي ودقيق للحديث بدون افتراءات",
  "keywords": ["كلمة1", "كلمة2", "كلمة3"]
}`,
            },
            {
              role: "user",
              content: `اشرح هذا الحديث الشريف بدقة وأمانة علمية، بدون افتراءات أو إضافات:\n\n${validation.value!}`,
            },
          ],
          temperature: 0.2,
          max_tokens: 1200,
        }),
      });

      if (!response.ok) {
        const errorMsg = sanitizeErrorMessage(new Error(`OpenAI API error: ${response.status}`));
        return NextResponse.json(
          { error: errorMsg },
          { status: response.status }
        );
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || "";

      try {
        // Try parsing the JSON response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return NextResponse.json({
            summary: sanitizeString(parsed.summary || "", 500),
            explanation: sanitizeString(parsed.explanation || "", 5000),
            keywords: Array.isArray(parsed.keywords) ? parsed.keywords.map((k: any) => sanitizeString(k, 100)) : [],
          });
        }
      } catch {
        // If JSON parsing fails, return structured response from raw text
      }

      return NextResponse.json({
        summary: sanitizeString(content.slice(0, 200), 500),
        explanation: sanitizeString(content, 5000),
        keywords: [],
      });
    } catch (error) {
      const errorMsg = sanitizeErrorMessage(error);
      return NextResponse.json(
        { error: errorMsg },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Explain API error:', error);
    return NextResponse.json(
      { error: "حدث خطأ في معالجة الطلب" },
      { status: 400 }
    );
  }
}
