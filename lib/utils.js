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

export function restBlankCount(grid) {
  let res = 0;
    if (grid)
      grid.forEach(row => {
        row.forEach(cell => {
          if (cell.value == 0)
            res += 1;
        });
      });
    return res;
} 