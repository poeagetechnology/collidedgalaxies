"use client";

import { useState, useEffect } from "react";
import { MessageCircle, X, Send } from "lucide-react";

type ChatMessage = {
    sender: "user" | "bot";
    text: string;
};

export default function Chatbot() {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open) {
            setMessages([
                {
                    sender: "bot",
                    text: "Hey 👋! I'm here to help you with sizes, outfits, colors, and orders. What are you looking for today?",
                },
            ]);
        }
    }, [open]);

    const sendMessage = async () => {
        if (!input.trim() || loading) return;

        const userMsg: ChatMessage = { sender: "user", text: input };
        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setLoading(true);

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: input }),
            });

            const data = await res.json();

            const botMsg: ChatMessage = { 
                sender: "bot", 
                text: data.reply || "Sorry, I couldn't process that. Please try again." 
            };
            setMessages((prev) => [...prev, botMsg]);
        } catch (error) {
            console.error("Chat error:", error);
            const errorMsg: ChatMessage = { 
                sender: "bot", 
                text: "Oops! Something went wrong. Please try again." 
            };
            setMessages((prev) => [...prev, errorMsg]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {!open && (
                <button
                    onClick={() => setOpen(true)}
                    className="fixed bottom-5 right-5 bg-black border border-white cursor-pointer text-white p-4 shadow-lg hover:bg-gray-800 transition-colors z-50"
                    aria-label="Open chat"
                >
                    <MessageCircle size={22} />
                </button>
            )}

            {open && (
                <div className="fixed bottom-5 right-5 w-80 sm:w-96 bg-white shadow-2xl border overflow-hidden z-50">
                    <div className="bg-[#1a1a1a] text-white p-3 flex justify-between items-center">
                        <span className="text-sm font-semibold">Cosmo</span>
                        <button 
                            onClick={() => setOpen(false)} 
                            aria-label="Close chat"
                            className="hover:bg-gray-800 p-1 transition-colors cursor-pointer"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    <div className="h-80 overflow-y-auto p-3 space-y-2 bg-gray-50">
                        {messages.map((msg, i) => (
                            <div
                                key={i}
                                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`px-3 py-2 text-sm max-w-[80%] ${
                                        msg.sender === "user"
                                            ? "bg-[#025b2e] text-white"
                                            : "bg-gray-800 text-white shadow-sm border"
                                    }`}
                                >
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="px-3 py-2 text-sm bg-white shadow-sm border">
                                    <div className="flex space-x-1">
                                        <div className="w-2 h-2 bg-gray-400 animate-bounce"></div>
                                        <div className="w-2 h-2 bg-gray-400 animate-bounce delay-100"></div>
                                        <div className="w-2 h-2 bg-gray-400 animate-bounce delay-200"></div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-3 border-t bg-white flex gap-2">
                        <input
                            className="flex-1 border p-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                            placeholder="Ask something..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                            disabled={loading}
                        />
                        <button
                            onClick={sendMessage}
                            disabled={loading || !input.trim()}
                            className="bg-black text-white p-2 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            aria-label="Send message"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}