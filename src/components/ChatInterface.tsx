"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { apiUrl } from "@/lib/api";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatInterfaceProps {
  hadithText: string;
  onClose: () => void;
}

export default function ChatInterface({ hadithText, onClose }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = inputValue.trim();
    setInputValue("");
    setError(null);

    // Add user message to conversation
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const res = await fetch(apiUrl("/api/chat"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hadithText,
          userQuestion: userMessage,
          conversationHistory: messages,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "حدث خطأ في جلب الإجابة");
        return;
      }

      // Add assistant response to conversation
      setMessages((prev) => [...prev, { role: "assistant", content: data.answer }]);
    } catch (err) {
      setError("خطأ في الاتصال بالخادم");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-8 bg-white rounded-2xl border border-gold/20 p-6 flex flex-col"
      style={{ maxHeight: "500px" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-gold/10">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-text/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <h3 className="font-bold text-text">اسأل عن هذا الحديث</h3>
        </div>
        <button
          onClick={onClose}
          className="text-text/50 hover:text-text text-xl transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-3 py-2">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center py-6">
            <p className="text-text/50 text-sm">
              اطرح أسئلتك عن الحديث هنا وسيجيبك الذكاء الاصطناعي
            </p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: msg.role === "user" ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs px-4 py-2 rounded-lg text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-gold text-navy font-semibold"
                    : "bg-cream-light border border-gold/20 text-text"
                }`}
                dir="rtl"
              >
                {msg.content}
              </div>
            </motion.div>
          ))
        )}

        {/* Loading State */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-cream-light border border-gold/20 text-text px-4 py-2 rounded-lg flex items-center gap-2">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-text/50 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-text/50 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                <div className="w-2 h-2 bg-text/50 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
              </div>
              <span className="text-xs text-text">جاري الكتابة...</span>
            </div>
          </motion.div>
        )}

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center"
          >
            <div className="bg-red-50 text-red-700 px-4 py-2 rounded-lg text-xs border border-red-200">
              {error}
            </div>
          </motion.div>
        )}
      </div>

      {/* Input Area */}
      <div className="flex gap-2 pt-4 border-t border-gold/10">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          placeholder="لديك سؤال؟ اكتبه هنا..."
          className="flex-1 px-3 py-2 bg-cream-light rounded-lg border border-gold/20 focus:border-gold focus:outline-none text-sm placeholder:text-text/40 text-text"
          disabled={loading}
          dir="rtl"
        />
        <button
          onClick={handleSendMessage}
          disabled={loading || !inputValue.trim()}
          className="px-4 py-2 bg-gold hover:bg-gold-hover disabled:bg-gold/50 text-navy font-bold rounded-lg transition-all disabled:cursor-not-allowed flex flex-row-reverse items-center gap-2 text-sm whitespace-nowrap"
        >
          {loading ? "جاري..." : "أرسل"}
          {loading ? (
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            <svg className="w-4 h-4 stroke-navy flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          )}
        </button>
      </div>
    </motion.div>
  );
}
