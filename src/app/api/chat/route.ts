import { NextRequest, NextResponse } from "next/server";

// Lightweight in-memory rate limiter (per IP, reset every 24h)
const CHAT_RATE_LIMIT = parseInt(process.env.CHAT_RATE_LIMIT || "50", 10);
const CHAT_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours
const chatRateMap = new Map<string, { count: number; ts: number }>();

function checkAndIncrementRate(ip: string) {
  const now = Date.now();
  const entry = chatRateMap.get(ip) || { count: 0, ts: now };
  if (now - entry.ts > CHAT_WINDOW_MS) {
    entry.count = 0;
    entry.ts = now;
  }
  if (entry.count >= CHAT_RATE_LIMIT) return false;
  entry.count += 1;
  chatRateMap.set(ip, entry);
  return true;
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { hadithText, userQuestion, conversationHistory } = body;

  if (!hadithText || !userQuestion) {
    return NextResponse.json(
      { error: "يجب توفير نص الحديث والسؤال" },
      { status: 400 }
    );
  }

  // Rate limit (per IP)
  const ipHeader = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
  const clientIp = ipHeader.split(",")[0].trim();
  if (!checkAndIncrementRate(clientIp)) {
    return NextResponse.json({ error: "تم تجاوز حد الطلبات اليومية للدردشة" }, { status: 429 });
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "مفتاح API OpenAI غير متوفر" },
      { status: 500 }
    );
  }

  try {
    // Build conversation messages
    const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
      {
        role: "system",
        content: `أنت عالم متخصص في الحديث الشريف والسنة النبوية. دورك هو الإجابة على أسئلة المستخدمين حول أحاديث محددة بطريقة علمية دقيقة.

قواعد حتمية:
- لا تفتري على الدين أو النبي ﷺ بأي افتراضات
- ركز على الحديث المحدد الذي يسأل عنه المستخدم
- اشرح بطريقة مبسطة وواضحة
- استند إلى فهم العلماء المعروفين
- لا تُصدر فتاوى أو أحكام شرعية
- استخدم لغة عربية فصحى مبسطة
- كن ودودًا ولطيفًا في التعامل

الحديث الذي نناقشه:
${hadithText}`,
      },
    ];

    // Add conversation history if provided
    if (conversationHistory && Array.isArray(conversationHistory)) {
      for (const msg of conversationHistory) {
        messages.push({
          role: msg.role,
          content: msg.content,
        });
      }
    }

    // Add new user question
    messages.push({
      role: "user",
      content: userQuestion,
    });

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages,
        temperature: 0.3,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      console.error(`OpenAI API error: ${response.status}`);
      return NextResponse.json(
        { error: `خطأ من OpenAI API: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    return NextResponse.json({
      answer: content,
      success: true,
    });
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    return NextResponse.json(
      { error: "خطأ في جلب الإجابة من API" },
      { status: 500 }
    );
  }
}
