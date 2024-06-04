import { cn } from "@/lib/utils"
import { Reddit_Mono } from "next/font/google";

const font = Reddit_Mono({ subsets: ["latin"], weight: ["500", "700"] });

function SudokuGrid({ grid, candidatesOfGrid, r, c, handleMouseEnter, handleMouseLeave }) {
  return (
    <div className="h-[72px] w-[72px] relative">
      <div className={cn(
        "h-full w-full absolute text-4xl flex items-center justify-center cursor-default transition-colors",
        !grid.mutable && "font-bold",
        !grid.valid ? "text-destructive" : (grid.mutable && "text-primary"),
        !grid.valid && grid.mutable && "line-through",
        font.className
      )}>
        {
          grid.value > 0
            ? grid.value
            : candidatesOfGrid ? <div className="grid grid-cols-3">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <div
                  className={cn(
                    "h-[20px] w-[20px] text-xs flex items-center justify-center brightness-50 transition-colors",
                    candidatesOfGrid[num] ? "text-primary" : "text-transparent"
                  )}
                  key={num}
                >
                  {num}
                </div>
              ))}
            </div> : <></>
        }
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

export default function SudokuBoard({ board, candidates, handleMouseEnter, handleMouseLeave }) {
  return (
    <>
      <div className="flex flex-col">
        {board.map((row, r) => (
          <div className="flex" key={r}>
            {row.map((grid, c) => (
              <SudokuGrid grid={grid} candidatesOfGrid={candidates ? candidates[r][c] : null} key={c} r={r} c={c} handleMouseEnter={handleMouseEnter} handleMouseLeave={handleMouseLeave} />
            ))}
          </div>))}
      </div>
    </>
  )
}