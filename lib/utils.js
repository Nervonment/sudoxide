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
  "House1": "#ffee58",
  "House2": "#ffa742",
  "Cell1": "#ff3880",
  "NumToFill": "#ff3880",
  "CandidateToReserve": "#71ff87",
  "CandidateToRemove": "#ff5c5e"
};
