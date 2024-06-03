import { cn } from "@/lib/utils"
import { Reddit_Mono } from "next/font/google";

const font = Reddit_Mono({ subsets: ["latin"], weight: ["500", "700"] });

function SudokuGrid({ grid, r, c, handleMouseEnter, handleMouseLeave }) {
  return (
    <div className="h-[72px] w-[72px] relative">
      <div className={cn(
        "h-full w-full absolute text-4xl flex items-center justify-center cursor-default transition-colors",
        !grid.mutable && "font-bold",
        !grid.valid ? "text-destructive" : (grid.mutable && "text-primary"),
        !grid.valid && grid.mutable && "line-through",
        font.className
      )}>
        {grid.value > 0 ? grid.value : ""}
      </div>
      <div className={cn(
        "h-full w-full absolute border-border transition-colors",
        r % 3 == 0 ? "border-t-[6px]" : "border-t-[2px]",
        c % 3 == 0 ? "border-l-[6px]" : "border-l-[2px]",
        r == 8 && "border-b-[6px]",
        c == 8 && "border-r-[6px]",
        !grid.valid && grid.mutable && "border-[2px] border-destructive"
      )}

      >
      </div>
      <div
        className="h-full w-full absolute hover:border-[5px] hover:border-primary"
        onMouseEnter={() => { if (handleMouseEnter) handleMouseEnter(r, c) }}
        onMouseLeave={() => { if (handleMouseLeave) handleMouseLeave() }}>
      </div>
    </div>
  )
}

export default function SudokuBoard({ board, handleMouseEnter, handleMouseLeave }) {
  return (
    <>
      <div className="flex flex-col">
        {board.map((row, r) => (
          <div className="flex" key={r}>
            {row.map((grid, c) => (
              <SudokuGrid grid={grid} key={c} r={r} c={c} handleMouseEnter={handleMouseEnter} handleMouseLeave={handleMouseLeave} />
            ))}
          </div>))}
      </div>
    </>
  )
}