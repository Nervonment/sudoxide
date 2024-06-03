import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export const difficultyDesc = [
  "🤪无脑",
  "😃简单",
  "🤔普通",
  "😖困难",
  "🤯地狱",
  "🎣钓鱼"
];