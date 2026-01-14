"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
            <AnimatePresence>
                {!open && (
                    <motion.button
                        onClick={() => setOpen(true)}
                        className="fixed bottom-5 right-5 bg-black border border-white cursor-pointer text-white p-4 shadow-lg hover:bg-gray-800 transition-colors z-50"
                        aria-label="Open chat"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                    >
                        <MessageCircle size={22} />
                    </motion.button>
                )}

                {open && (
                    <motion.div 
                        className="fixed bottom-5 right-5 w-80 sm:w-96 bg-white shadow-2xl border overflow-hidden z-50"
                        initial={{ scale: 0, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0, opacity: 0, y: 20 }}
                        transition={{ duration: 0.3, type: "spring" }}
                    >
                        <motion.div 
                            className="bg-[#1a1a1a] text-white p-3 flex justify-between items-center"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.4, delay: 0.1 }}
                        >
                            <span className="text-sm font-semibold">Cosmo</span>
                            <motion.button 
                                onClick={() => setOpen(false)} 
                                aria-label="Close chat"
                                className="hover:bg-gray-800 p-1 transition-colors cursor-pointer"
                                whileHover={{ rotate: 90 }}
                                transition={{ duration: 0.2 }}
                            >
                                <X size={18} />
                            </motion.button>
                        </motion.div>

                        <motion.div 
                            className="h-80 overflow-y-auto p-3 space-y-2 bg-gray-50"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.4, delay: 0.2 }}
                        >
                            {messages.map((msg, i) => (
                                <motion.div
                                    key={i}
                                    className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                                    initial={{ opacity: 0, x: msg.sender === "user" ? 20 : -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <motion.div
                                        className={`px-3 py-2 text-sm max-w-[80%] ${
                                            msg.sender === "user"
                                                ? "bg-[#025b2e] text-white"
                                                : "bg-gray-800 text-white shadow-sm border"
                                        }`}
                                        whileHover={{ scale: 1.02 }}
                                    >
                                        {msg.text}
                                    </motion.div>
                                </motion.div>
                            ))}
                            {loading && (
                                <motion.div 
                                    className="flex justify-start"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <motion.div 
                                        className="px-3 py-2 text-sm bg-white shadow-sm border"
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="flex space-x-1">
                                            <motion.div 
                                              className="w-2 h-2 bg-gray-400"
                                              animate={{ y: [0, -8, 0] }}
                                              transition={{ duration: 0.6, repeat: Infinity }}
                                            />
                                            <motion.div 
                                              className="w-2 h-2 bg-gray-400"
                                              animate={{ y: [0, -8, 0] }}
                                              transition={{ duration: 0.6, repeat: Infinity, delay: 0.1 }}
                                            />
                                            <motion.div 
                                              className="w-2 h-2 bg-gray-400"
                                              animate={{ y: [0, -8, 0] }}
                                              transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                                            />
                                        </div>
                                    </motion.div>
                                </motion.div>
                            )}
                        </motion.div>

                        <motion.div 
                            className="p-3 border-t bg-white flex gap-2"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.4, delay: 0.3 }}
                        >
                            <input
                                className="flex-1 border p-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                                placeholder="Ask something..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                                disabled={loading}
                            />
                            <motion.button
                                onClick={sendMessage}
                                disabled={loading || !input.trim()}
                                className="bg-black text-white p-2 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                aria-label="Send message"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Send size={18} />
                            </motion.button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}