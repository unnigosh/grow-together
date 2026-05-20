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

function formatMessageTime(date: string) {
  return new Date(date).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
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
    if (!text || sending) return;

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
      setMessages((prev) => {
        if (prev.some((m) => m.id === data.id)) return prev;
        return [...prev, data];
      });
      setContent("");
    }

    setSending(false);
  }

  return (
    <div className="flex h-[calc(100vh-16rem)] min-h-[34rem] flex-col overflow-hidden rounded-3xl border border-earth-200 bg-white shadow-sm">
      <div className="flex items-center gap-3 border-b border-earth-100 bg-white px-4 py-3">
        <Avatar
          src={otherUser.avatar_url}
          name={otherUser.full_name ?? otherUser.username}
        />
        <div className="min-w-0">
          <p className="truncate font-semibold text-earth-900">
            {otherUser.full_name ?? otherUser.username}
          </p>
          <p className="truncate text-xs text-earth-800/60">
            @{otherUser.username}
          </p>
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto bg-earth-50/40 p-4">
        {messages.length === 0 && (
          <div className="mx-auto mt-10 max-w-sm rounded-2xl bg-white p-5 text-center shadow-sm">
            <p className="font-semibold text-earth-900">Start the conversation</p>
            <p className="mt-1 text-sm text-earth-800/60">
              Ask about pickup, plant size, condition, or availability.
            </p>
          </div>
        )}

        {messages.map((msg) => {
          const isMine = msg.sender_id === currentUserId;

          return (
            <div
              key={msg.id}
              className={`flex items-end gap-2 ${
                isMine ? "justify-end" : "justify-start"
              }`}
            >
              {!isMine && (
                <Avatar
                  src={otherUser.avatar_url}
                  name={otherUser.full_name ?? otherUser.username}
                  size="sm"
                />
              )}

              <div
                className={`max-w-[78%] rounded-3xl px-4 py-2.5 text-sm shadow-sm sm:max-w-[65%] ${
                  isMine
                    ? "rounded-br-md bg-leaf-600 text-white"
                    : "rounded-bl-md bg-white text-earth-900"
                }`}
              >
                <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                <p
                  className={`mt-1 text-[10px] ${
                    isMine ? "text-leaf-100" : "text-earth-800/50"
                  }`}
                >
                  {formatMessageTime(msg.created_at)}
                </p>
              </div>
            </div>
          );
        })}

        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={sendMessage}
        className="sticky bottom-0 flex gap-2 border-t border-earth-100 bg-white p-3 sm:p-4"
      >
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Type a message..."
          className="min-w-0 flex-1 rounded-2xl border border-earth-200 px-4 py-3 text-sm focus:border-leaf-400 focus:outline-none focus:ring-2 focus:ring-leaf-200"
          maxLength={2000}
        />
        <Button type="submit" disabled={sending || !content.trim()}>
          {sending ? "Sending..." : "Send"}
        </Button>
      </form>
    </div>
  );
}