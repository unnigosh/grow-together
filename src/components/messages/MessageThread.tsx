"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import type { Message, Profile } from "@/lib/types/database";

interface MessageThreadProps {
  conversationId: string;
  currentUserId: string;
  initialMessages: Message[];
  otherUser: Pick<Profile, "id" | "username" | "full_name" | "avatar_url">;
}

export function MessageThread({
  conversationId,
  currentUserId,
  initialMessages,
  otherUser,
}: MessageThreadProps) {
  const [messages, setMessages] = useState(initialMessages);
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const msg = payload.new as Message;
          setMessages((prev) => {
            if (prev.some((m) => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, supabase]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    const text = content.trim();
    if (!text) return;

    setSending(true);
    const { data, error } = await supabase
      .from("messages")
      .insert({
        conversation_id: conversationId,
        sender_id: currentUserId,
        content: text,
      })
      .select()
      .single();

    if (!error && data) {
      setMessages((prev) => [...prev, data]);
      setContent("");
    }
    setSending(false);
  }

  return (
    <div className="flex h-[calc(100vh-12rem)] flex-col rounded-2xl border border-earth-200 bg-white">
      <div className="flex items-center gap-3 border-b border-earth-100 px-4 py-3">
        <Avatar
          src={otherUser.avatar_url}
          name={otherUser.full_name ?? otherUser.username}
        />
        <div>
          <p className="font-medium text-earth-900">
            {otherUser.full_name ?? otherUser.username}
          </p>
          <p className="text-xs text-earth-800/60">@{otherUser.username}</p>
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((msg) => {
          const isMine = msg.sender_id === currentUserId;
          return (
            <div
              key={msg.id}
              className={`flex ${isMine ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                  isMine
                    ? "bg-leaf-600 text-white"
                    : "bg-earth-100 text-earth-900"
                }`}
              >
                {msg.content}
                <p
                  className={`mt-1 text-[10px] ${isMine ? "text-leaf-100" : "text-earth-800/50"}`}
                >
                  {new Date(msg.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={sendMessage}
        className="flex gap-2 border-t border-earth-100 p-4"
      >
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 rounded-xl border border-earth-200 px-4 py-2.5 text-sm focus:border-leaf-400 focus:outline-none focus:ring-2 focus:ring-leaf-200"
          maxLength={2000}
        />
        <Button type="submit" disabled={sending || !content.trim()}>
          Send
        </Button>
      </form>
    </div>
  );
}
