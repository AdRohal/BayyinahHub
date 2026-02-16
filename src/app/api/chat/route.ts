import { NextRequest, NextResponse } from "next/server";

// Lightweight in-memory rate limiter (per IP, reset every 24h)
const CHAT_RATE_LIMIT = parseInt(process.env.CHAT_RATE_LIMIT || "50", 10);
const CHAT_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours
const chatRateMap = new Map<string, { count: number; ts: number }>();

// Off-topic tracking per session
const offTopicTracking = new Map<string, { count: number; ts: number }>();
const OFF_TOPIC_THRESHOLD = 3; // Close chat after 3 off-topic messages
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

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

function trackOffTopic(sessionId: string): { shouldClose: boolean; count: number } {
  const now = Date.now();
  const existing = offTopicTracking.get(sessionId);
  
  if (existing && now - existing.ts > SESSION_TIMEOUT) {
    offTopicTracking.delete(sessionId);
  }
  
  const entry = offTopicTracking.get(sessionId) || { count: 0, ts: now };
  entry.count += 1;
  entry.ts = now;
  offTopicTracking.set(sessionId, entry);
  
  return {
    count: entry.count,
    shouldClose: entry.count >= OFF_TOPIC_THRESHOLD,
  };
}

// Detect if question is relevant to the hadith using keywords and semantic analysis
function isQuestionRelevant(question: string, hadithText: string): boolean {
  const questionLower = question.toLowerCase().trim();
  const hadithLower = hadithText.toLowerCase();
  
  // Block ONLY obvious off-topic patterns and clear spam
  const blockedPatterns = [
    /^(\d+\s*[\+\-\*\/]\s*\d+)$/i,  // Math equations ONLY (2+2=, not "explain 2 concepts")
    /^tell\s+(me\s+)?a\s+joke/i,
    /^(weather|temperature|climate)/i,
    /^(football|soccer|sports match|game result)/i,
    /^(recipe|cooking|food|restaurant|drink)/i,
    /^(movie|film|actor|actress|hollywood|cinema)/i,
    /^(password|login|hack|malware|virus)/i,
    /^(love (you|me)|marry|girlfriend|boyfriend|dating)/i,
    /^(random|blah|yapping|nonsense|stupid)/i,
    /^(hello|hi|how are you|good morning|good night)$/i,
  ];
  
  // Check against blocked patterns
  for (const pattern of blockedPatterns) {
    if (pattern.test(questionLower)) {
      return false;
    }
  }
  
  // ALLOWED: Questions asking to explain, clarify, or understand more
  const allowedTerms = [
    "اشرح", "شرح", "وضح", "بين", "أوضح", "اشرح لي", "شرح أكثر", "اشرح أكثر",
    "فسر", "تفسير", "معنى", "ما معنى", "كيف", "لماذا", "هل", "ما", "من", "أين",
    "explain", "clarify", "understand", "more", "please", "tell us", "elaborate",
    "عليك", "يمكنك", "هل يمكنك", "فضلاً", "أكثر", "قليلا"
  ];
  
  const hasAllowedTerm = allowedTerms.some(term => questionLower.includes(term));
  
  if (hasAllowedTerm) {
    return true;
  }
  
  // Extract key content words from hadith
  const hadithKeywords = [
    "حديث", "نبي", "رسول", "سنة", "إسلام", "دين", "شريف", "معنى", "تفسير"
  ];
  
  const hasHadithContext = hadithKeywords.some(keyword => hadithLower.includes(keyword));
  
  // If it's an Arabic hadith, be more lenient with questions
  if (hasHadithContext) {
    // Check if question has words from hadith
    const hadithWords = hadithLower
      .split(/[\s\-()،\.]+/)
      .filter(w => w.length > 2 && !['في', 'من', 'عن', 'إن', 'هو', 'هي', 'هم', 'و', 'ل', 'ال', 'أن', 'إلى'].includes(w));
    
    const questionWords = questionLower
      .split(/[\s\-()،\.]+/)
      .filter(w => w.length > 2);
    
    const matchingWords = questionWords.filter(qw =>
      hadithWords.some(hw => hw === qw || hw.includes(qw) || qw.includes(hw))
    );
    
    // Need at least 1 matching word
    if (matchingWords.length >= 1) {
      return true;
    }
    
    // If question is reasonably long (3+ words), it's probably about the hadith
    if (questionWords.length >= 3) {
      return true;
    }
  }
  
  return false;
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { hadithText, userQuestion, conversationHistory, sessionId } = body;

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

  // Check if question is relevant to the hadith
  const isRelevant = isQuestionRelevant(userQuestion, hadithText);
  
  if (!isRelevant) {
    const trackingResult = trackOffTopic(sessionId || clientIp);
    
    if (trackingResult.shouldClose) {
      return NextResponse.json({
        success: false,
        shouldCloseChat: true,
        error: "تم إغلاق الدردشة بسبب تكرار الأسئلة غير ذات الصلة. يرجى احترام قواعد الحوار والاقتصار على أسئلة الحديث الشريف فقط.",
      }, { status: 400 });
    }
    
    return NextResponse.json({
      success: false,
      isOffTopic: true,
      answer: `الرجاء طرح أسئلة ذات صلة بالحديث الشريف فقط 🤲\n\nهذا حوار مخصص لشرح ومناقشة الحديث المعروض. يرجى احترام قواعد الحوار وعدم الخروج عن الموضوع.\n\n${trackingResult.count > 1 ? `⚠️ تنبيه: لديك ${OFF_TOPIC_THRESHOLD - trackingResult.count} محاولات متبقية قبل إغلاق الدردشة.` : ''}`,
    }, { status: 400 });
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
    return NextResponse.json(
      { error: "خطأ في جلب الإجابة من API" },
      { status: 500 }
    );
  }
}
