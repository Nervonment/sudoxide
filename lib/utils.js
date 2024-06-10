import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export const difficultyDesc = [
  "🤪休闲",
  "😃简单",
  "🤔普通",
  "😖困难",
  "🤯地狱",
  "🎣钓鱼"
];

export const hintColor = {
  "TextDefault": "",
  "House1": "#ffcf33",
  "House2": "#f67b46",
  "Cell1": "#ff4c8e",
  "NumToFill": "#ff4c8e",
  "CandidateToReserve": "#7cbd14",
  "CandidateToRemove": "hsl(var(--destructive))"
};
