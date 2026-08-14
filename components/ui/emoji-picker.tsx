"use client";

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

const emojis = [
  "🐞",
  "✨",
  "💬",
  "⚠️",
  "❌",
  "📣",
  "📝",
  "📌",
  "🚀",
  "🔒",
  "🐛",
  "⭐",
  "🎨",
  "📊",
  "🤖",
  "🧠",
  "📈",
  "📂",
];

export function EmojiPicker({
  onSelect,
}: {
  onSelect: (emoji: string) => void;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="text-lg">
          😀
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-64 p-2 grid grid-cols-6 gap-2">
        {emojis.map((emoji) => (
          <button
            key={emoji}
            className="text-xl hover:bg-muted p-1 rounded transition"
            onClick={() => onSelect(emoji)}
          >
            {emoji}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}
