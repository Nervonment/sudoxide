import { cn, hintColor } from "@/lib/utils"
import { Reddit_Mono } from "next/font/google";

const font = Reddit_Mono({ subsets: ["latin"], weight: ["500", "700"] });

function SudokuCell({ cell, candidatesOfCell, r, c, handleMouseEnter, handleMouseLeave }) {
  return (
    <div className="h-[72px] w-[72px] relative">
      <div className={cn(
        "h-full w-full absolute text-4xl flex items-center justify-center cursor-default transition-colors",
        !cell.mutable && "font-bold",
        !cell.valid ? "text-destructive" : (cell.mutable && "text-primary"),
        !cell.valid && cell.mutable && "line-through",
        font.className
      )}>
        {
          cell.value > 0
            ? cell.value
            : candidatesOfCell ? <div className="grid grid-cols-3">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <div
                  className={cn(
                    "h-[20px] w-[20px] text-sm flex items-center justify-center transition-colors duration-500",
                    !candidatesOfCell[num].highlight && "opacity-55"
                  )}
                  style={{
                    color: candidatesOfCell[num].isCandidate ?
                      (candidatesOfCell[num].highlight ? candidatesOfCell[num].color : "hsl(var(--muted-foreground))")
                      : "transparent"
                  }}
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
        !cell.valid && cell.mutable && "border-[2px] border-destructive"
      )}
      >
      </div>
      <div
        className={cn(
          "absolute h-full w-full border-4 transition-opacity duration-500 z-20",
          cell.highlight ? "opacity-100" : "opacity-0"
        )}
        style={{ borderColor: cell.color }}
      >
      </div>
      <div
        className="h-full w-full absolute hover:border-[5px] hover:border-primary z-50"
        onMouseEnter={() => { if (handleMouseEnter) handleMouseEnter(r, c) }}
        onMouseLeave={() => { if (handleMouseLeave) handleMouseLeave() }}>
      </div>
    </div >
  )
}

export default function SudokuGrid({ grid, candidates, visualElements, handleMouseEnter, handleMouseLeave }) {
  const rows = [0, 1, 2, 3, 4, 5, 6, 7, 8].map((r) => ({ highlight: false, color: "" }));
  const cols = [0, 1, 2, 3, 4, 5, 6, 7, 8].map((r) => ({ highlight: false, color: "" }));
  const blks = [0, 1, 2, 3, 4, 5, 6, 7, 8].map((r) => ({ highlight: false, color: "" }));
  const cells = Array.from({ length: 9 }, (v) => Array.from({ length: 9 }, (v) => ({ highlight: false, color: "" })));
  const candidatesAttr = candidates ? candidates.map((row) => row.map((cell) => cell.map((isCandidate) => ({
    isCandidate: isCandidate,
    highlight: false,
    color: ""
  })))) : null;

  if (visualElements) {
    visualElements.forEach(({ color, kind }) => {
      if ("House" in kind) {
        if ("Row" in kind.House) {
          rows[kind.House.Row].highlight = true;
          rows[kind.House.Row].color = hintColor[color];
        }
        else if ("Column" in kind.House) {
          cols[kind.House.Column].highlight = true;
          cols[kind.House.Column].color = hintColor[color];
        }
        else if ("Block" in kind.House) {
          blks[kind.House.Block].highlight = true;
          blks[kind.House.Block].color = hintColor[color];
        }
      }
      else if ("Cell" in kind) {
        cells[kind.Cell[0]][kind.Cell[1]].highlight = true;
        cells[kind.Cell[0]][kind.Cell[1]].color = hintColor[color];
      }
      else if ("Candidate" in kind && candidatesAttr) {
        candidatesAttr[kind.Candidate[0]][kind.Candidate[1]][kind.Candidate[2]].highlight = true;
        candidatesAttr[kind.Candidate[0]][kind.Candidate[1]][kind.Candidate[2]].color = hintColor[color];
      }
    });
  }

  return (
    <>
      <div className="flex flex-col relative">
        {grid.map((row, r) => (
          <div className="flex" key={r}>
            {row.map((cell, c) => (
              <SudokuCell
                cell={{ ...cell, highlight: cells[r][c].highlight, color: cells[r][c].color }}
                candidatesOfCell={candidatesAttr ? candidatesAttr[r][c] : null}
                key={c} r={r} c={c}
                handleMouseEnter={handleMouseEnter}
                handleMouseLeave={handleMouseLeave}
              />
            ))}
          </div>))}

        {
          rows.map(({ highlight: show, color }, idx) => (
            <div
              key={idx}
              className={cn(
                "absolute left-0 w-[648px] h-[72px] z-10 border-4 transition-opacity duration-500",
                show ? "opacity-100" : "opacity-0",
              )}
              style={{
                top: `${idx * 72}px`,
                borderColor: color
              }}
            ></div>
          ))
        }
        {
          cols.map(({ highlight: show, color }, idx) => (
            <div
              key={idx}
              className={cn(
                "absolute top-0 w-[72px] h-[648px] z-10 border-4 transition-opacity duration-500",
                show ? "opacity-100" : "opacity-0",
              )}
              style={{
                left: `${idx * 72}px`,
                borderColor: color
              }}
            ></div>
          ))
        }
        {
          blks.map(({ highlight: show, color }, idx) => (
            <div
              key={idx}
              className={cn(
                "absolute w-[216px] h-[216px] z-10 border-4 transition-opacity duration-500",
                show ? "opacity-100" : "opacity-0",
              )}
              style={{
                top: `${parseInt(idx / 3) * 72 * 3}px`,
                left: `${idx % 3 * 72 * 3}px`,
                borderColor: color
              }}
            ></div>
          ))
        }
      </div>
    </>
  )
}