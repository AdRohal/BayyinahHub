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

  // If no API key, return a demo explanation
  if (!apiKey) {
    return NextResponse.json(getDemoExplanation(text));
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `أنت مساعد متخصص في شرح الأحاديث النبوية الشريفة بأسلوب مبسط وواضح.
قواعد مهمة:
- لا تُصدر فتاوى
- لا تُنشئ أحاديث جديدة
- اشرح النص كما هو فقط
- استخدم لغة عربية فصيحة مبسطة
- قدّم ملخصاً قصيراً ثم شرحاً مفصلاً
- استخرج الكلمات المفتاحية الرئيسية

أجب بصيغة JSON بالشكل التالي:
{
  "summary": "ملخص قصير للحديث",
  "explanation": "شرح مفصل بأسلوب مبسط",
  "keywords": ["كلمة1", "كلمة2", "كلمة3"]
}`,
          },
          {
            role: "user",
            content: `اشرح هذا الحديث النبوي بأسلوب مبسط:\n\n${text}`,
          },
        ],
        temperature: 0.3,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      return NextResponse.json(getDemoExplanation(text));
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
  } catch {
    return NextResponse.json(getDemoExplanation(text));
  }
}

function getDemoExplanation(text: string) {
  const truncated = text.slice(0, 50);
  return {
    summary: `هذا الحديث الشريف يتحدث عن مبدأ مهم في الإسلام. يُرشدنا النبي ﷺ إلى قيمة عظيمة في حياتنا اليومية.`,
    explanation: `في هذا الحديث النبوي الشريف "${truncated}..."، يوجّهنا رسول الله ﷺ إلى معنى عميق وقيمة أساسية في ديننا الحنيف. الحديث يحث المسلم على التحلي بالأخلاق الحسنة والعمل الصالح. وهذا من جوامع كلمه ﷺ التي تحمل معاني كثيرة في ألفاظ قليلة. والحديث يدل على أهمية تطبيق هذه القيم في حياتنا اليومية والتعامل مع الناس بالحسنى.`,
    keywords: ["الأخلاق", "العمل الصالح", "السنة النبوية", "الإيمان"],
  };
}
