import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { text } = body;

  if (!text || !text.trim()) {
    return NextResponse.json(
      { error: "لم يتم تقديم نص للشرح" },
      { status: 400 }
    );
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "مفتاح API OpenAI غير متوفر. يرجى تكوين البيئة بشكل صحيح." },
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
            content: `اشرح هذا الحديث الشريف بدقة وأمانة علمية، بدون افتراءات أو إضافات:\n\n${text}`,
          },
        ],
        temperature: 0.2,
        max_tokens: 1200,
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

    try {
      // Try parsing the JSON response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return NextResponse.json(parsed);
      }
    } catch {
      // If JSON parsing fails, return structured response from raw text
    }

    return NextResponse.json({
      summary: content.slice(0, 200),
      explanation: content,
      keywords: [],
    });
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    return NextResponse.json(
      { error: "خطأ في جلب الشرح من API" },
      { status: 500 }
    );
  }
}
