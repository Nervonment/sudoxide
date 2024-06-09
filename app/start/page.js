'use client'

import { Label } from "@/components/ui/label";
import SudokuGrid from "@/components/sudoku_grid";
import { difficultyDesc, hintColor } from "@/lib/utils";
import { invoke } from "@tauri-apps/api/tauri";
import { HelpCircle, Lightbulb, Loader2, RefreshCcw, SquarePen, Tornado, Trash2, Undo2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useRouter } from "next/navigation";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export default function Start() {
  const [grid, setGrid] = useState();
  const currentCellRef = useRef();
  const [maxCandidates, setMaxCandidates] = useState([]); // 当前局面下所有格的所有候选数
  const [markedCandidates, setMarkedCandidates] = useState([]); // 用户标记的所有格的候选数
  // 掩码候选数，是上述两者按照各格的交集
  const maskedCandidates = markedCandidates.map((row, r) => row.map((candidatesOfCell, c) => candidatesOfCell.map((is, num) => is && maxCandidates[r][c][num])));
  const rowContainsRef = useRef(Array.from({ length: 9 }, (v) => Array.from({ length: 10 }, (v) => false)));
  const colContainsRef = useRef(Array.from({ length: 9 }, (v) => Array.from({ length: 10 }, (v) => false)));
  const blkContainsRef = useRef(Array.from({ length: 9 }, (v) => Array.from({ length: 10 }, (v) => false)));
  const [hint, setHint] = useState(null);
  const [showingHint, setShowingHint] = useState(false);
  const [time, setTime] = useState(0);
  const [finished, setFinished] = useState(false);

  const markingAssistRef = useRef(false); // 是否开启标记辅助

  const historyRef = useRef([]);
  const futureRef = useRef([]);

  const timeMin = parseInt(time / 60);
  const timeSec = (() => {
    let sec = time % 60;
    return sec < 10 ? `0${sec}` : sec;
  })();
  const rest = (() => {
    let res = 0;
    if (grid)
      grid.forEach(row => {
        row.forEach(cell => {
          if (cell.value == 0)
            res += 1;
        });
      });
    return res;
  })();

  const [difficulty, setDifficulty] = useState(2);

  useEffect(() => {
    invoke('get_difficulty').then((difficulty) => setDifficulty(difficulty));
    invoke('get_marking_assist').then((markingAssist) => markingAssistRef.current = markingAssist);
  }, []);

  const init = useCallback((grid) => {
    setGrid(grid);
    setMaxCandidates(getMaxCandidates(grid));
    if (markingAssistRef.current) {
      setMarkedCandidates(Array.from({ length: 9 }, (v) => Array.from({ length: 9 }, (v) => Array.from({ length: 10 }, (v) => true))));
    } else {
      setMarkedCandidates(Array.from({ length: 9 }, (v) => Array.from({ length: 9 }, (v) => Array.from({ length: 10 }, (v) => false))));
    }
    setTime(0);
    hideHint();
    historyRef.current = [];
    futureRef.current = [];
  }, []);

  const getPuzzle = useCallback(() => {
    invoke('get_sudoku_puzzle').then((grid) => {
      let g = grid.map((row) => row.map((val) => ({ value: val, mutable: val == 0, valid: true })));
      init(g);
    });
  }, [init]);

  const getMaxCandidates = (grid) => {
    rowContainsRef.current.forEach((row) => row.fill(false));
    colContainsRef.current.forEach((col) => col.fill(false));
    blkContainsRef.current.forEach((blk) => blk.fill(false));
    let rc2b = (r, c) => parseInt(r / 3) * 3 + parseInt(c / 3);
    grid.forEach((row, r) => {
      row.forEach((cell, c) => {
        let num = cell.value;
        rowContainsRef.current[r][num] = true;
        colContainsRef.current[c][num] = true;
        blkContainsRef.current[rc2b(r, c)][num] = true;
      });
    });
    return grid.map((row, r) => row.map((cell, c) => ([0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
      grid[r][c].value == 0
      && !rowContainsRef.current[r][num]
      && !colContainsRef.current[c][num]
      && !blkContainsRef.current[rc2b(r, c)][num]
    )))));
  };

  useEffect(() => {
    getPuzzle();
  }, [getPuzzle]);

  const newPuzzle = () => {
    setGrid(null);
    getPuzzle();
    setFinished(false);
  };

  const clear = () => {
    if (!finished && grid) {
      let g = grid.map((row, r) => row.map((cell, c) => ({ ...cell, valid: true, value: cell.mutable ? 0 : cell.value })));
      init(g);
    }
  };

  useEffect(() => {
    let updateTime = !finished ?
      setInterval(() => {
        setTime((prev) => prev + 1);
      }, 1000) : null;
    return () => {
      if (updateTime)
        clearInterval(updateTime);
    };
  }, [finished]);

  const pushHistory = useCallback((grid, markedCandidates) => {
    historyRef.current.push({
      grid: grid.map((row) => row.map((cell) => ({ ...cell }))),
      markedCandidates: markedCandidates.map((row) => row.map((cell) => cell.slice()))
    });
    futureRef.current = [];
  }, []);

  const fillGrid = useCallback((r, c, num) => {
    if (grid[r][c].value != num) {
      pushHistory(grid, markedCandidates);
      hideHint();
      grid[r][c].value = num;
      invoke('judge_sudoku', { grid: grid.map((row) => row.map((grid) => grid.value)) })
        .then(([finished, validCond]) => {
          setFinished(finished);
          setGrid((prev) => {
            prev[r][c].value = num;
            setMaxCandidates(getMaxCandidates(prev));
            return prev.map((row, r) => row.map((cell, c) => ({
              ...cell,
              valid: validCond[r][c],
            })))
          });
        });
    }
  }, [grid, markedCandidates, pushHistory]);

  const removeCandidates = (candidates) => {
    pushHistory(grid, markedCandidates);
    hideHint();
    setMarkedCandidates((prev) => {
      candidates.forEach(([r, c, num]) => {
        prev[r][c][num] = false;
      });
      return prev.map((row) => row.map((cell) => cell.slice()));
    })
  };

  const onKeyDown = useCallback((event) => {
    if (!finished && grid && markedCandidates) {
      // 撤销
      if (event.key == 'z') {
        if (historyRef.current.length != 0) {
          futureRef.current.push({
            grid: grid.map((row) => row.map((cell) => ({ ...cell }))),
            markedCandidates: markedCandidates.map((row) => row.map((cell) => cell.slice()))
          });
          let { grid: g, markedCandidates: m } = historyRef.current.pop();
          setGrid(g);
          setMaxCandidates(getMaxCandidates(g));
          setMarkedCandidates(m);
          hideHint();
        }
      }
      // 重做
      else if (event.key == 'x') {
        if (futureRef.current.length != 0) {
          historyRef.current.push({
            grid: grid.map((row) => row.map((cell) => ({ ...cell }))),
            markedCandidates: markedCandidates.map((row) => row.map((cell) => cell.slice()))
          });
          let { grid: g, markedCandidates: m } = futureRef.current.pop();
          setGrid(g);
          setMaxCandidates(getMaxCandidates(g));
          setMarkedCandidates(m);
          hideHint();
        }
      }
      // 填数或标记候选数
      else if (currentCellRef.current) {
        let nummap = { '!': 1, '@': 2, '#': 3, '$': 4, '%': 5, '^': 6, '&': 7, '*': 8, '(': 9, ' ': 0 };
        let num;
        if (event.key in nummap)
          num = nummap[event.key];
        else
          num = parseInt(event.key);
        if (!num && event.key !== ' ')
          return;
        let [r, c] = currentCellRef.current;
        if (grid[r][c].mutable) {
          // 填数
          if (!event.shiftKey) {
            fillGrid(r, c, num);
          }
          // 标记候选数
          else {
            // 只能标记 maxCandidates[r][c] 中的数字
            if (grid[r][c].value == 0 && (maxCandidates[r][c][num] || event.key == ' ')) {
              if (event.key == ' ') { // 按空格键 
                if (!markedCandidates[r][c].every((is, num) => num == 0 || !is)) {
                  pushHistory(grid, markedCandidates);
                  hideHint();
                  setMarkedCandidates((prev) => {
                    prev[r][c].fill(false);
                    return prev.map((row) => row.map((cell) => cell.slice()));
                  })
                }
              }
              else {
                pushHistory(grid, markedCandidates);
                hideHint();
                setMarkedCandidates((prev) => {
                  prev[r][c][num] = !prev[r][c][num];
                  return prev.map((row) => row.map((cell) => cell.slice()));
                })
              }
            }
          }
        }
      }
    }
  }, [grid, finished, maxCandidates, markedCandidates, pushHistory, fillGrid]);

  useEffect(() => {
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [onKeyDown]);

  const handleMouseEnter = (r, c) => {
    currentCellRef.current = [r, c];
  }
  const handleMouseLeave = () => {
    currentCellRef.current = null;
  }

  const getHintAndShow = () => {
    invoke('get_hint', {
      grid: grid.map((row) => row.map((cell) => cell.value)),
      candidates: maskedCandidates
    }).then((hint) => {
      setHint(hint);
      console.log(hint);
      setShowingHint(true);
    });
  }

  const hideHint = () => {
    setHint(null);
    setShowingHint(false);
  }

  const applyHintOption = () => {
    if (hint) {
      let option = hint.option;
      if ("Direct" in option) {
        fillGrid(option.Direct[0], option.Direct[1], option.Direct[2]);
      }
      else if ("ReducingCandidates" in option) {
        let toRemove = option.ReducingCandidates.map(
          (pair) => pair[0].map(([r, c]) => pair[1].map((num) => [r, c, num])).flat()
        ).flat();
        removeCandidates(toRemove);
      }
    }
  }

  const router = useRouter();

  return (
    <div className="h-screen w-screen p-8 flex items-center justify-stretch">
      {
        grid && maskedCandidates ?
          <>
            <SudokuGrid
              grid={grid}
              candidates={maskedCandidates}
              handleMouseEnter={handleMouseEnter}
              handleMouseLeave={handleMouseLeave}
              visualElements={hint ? hint.visual_elements : null}
            />
            <div className="flex-1 flex flex-col gap-6 items-center">
              <div className="flex flex-col gap-1 items-center w-full">
                <div className="relative text-4xl font-bold">
                  {difficultyDesc[difficulty]}
                  {
                    markingAssistRef.current ?
                      <div className="absolute top-[-10px] right-[-64px] text-xs">(已开启辅助)</div> : <></>
                  }
                </div>
                <Label className="text-muted-foreground">难度</Label>
              </div>
              <div className="flex flex-col gap-1 items-center w-full">
                <p className="text-4xl font-bold">{timeMin}:{timeSec}</p>
                <Label className="text-muted-foreground">用时</Label>
              </div>
              <div className="flex flex-col gap-1 items-center w-full h-20">
                {
                  !finished ?
                    <>
                      <p className="text-4xl font-bold">{rest}</p>
                      <Label className="text-muted-foreground">剩余</Label>
                    </> :
                    <>
                      <p className="text-4xl font-bold mb-1">已完成!</p>
                      <Button onClick={newPuzzle}>下一个</Button>
                    </>
                }
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <div className="text-muted-foreground flex items-center gap-1 cursor-pointer">
                    <Label >操作说明</Label>
                    <HelpCircle size={16} />
                  </div>
                </PopoverTrigger>
                <PopoverContent>
                  <div className="w-96 text-muted-foreground text-sm">
                    <p>将光标移动到格子上，即可操作对应格子。</p>
                    <p><span className="font-bold">数字键 1~9</span>：填数</p>
                    <p><span className="font-bold">空格</span>：清除当前格</p>
                    <p><span className="font-bold">Shift + 数字键 1~9</span>：标记/删除候选数</p>
                    <p><span className="font-bold">Shift + 空格</span>：删除当前格所有候选数</p>
                    <p><span className="font-bold">Z</span>：撤销</p>
                    <p><span className="font-bold">X</span>：重做</p>
                  </div>
                </PopoverContent>
              </Popover>

              {
                showingHint ?
                  (hint ?
                    <div className="flex flex-col items-center gap-2">
                      <Label>{hint.name}</Label>
                      <p>
                        {hint.description.map((seg, idx) => (
                          <span
                            style={{ color: hintColor[seg.color] }}
                            key={idx}
                          >
                            {seg.text}
                          </span>
                        ))}
                      </p>
                    </div>
                    : <p>无可用提示</p>)
                  : <></>
              }
            </div>
          </>
          :
          <div className="w-full h-full flex flex-col gap-2 items-center justify-center">
            <p>正在生成题目…</p>
            <Loader2 size={40} className="turn" />
          </div>
      }

      <div className="absolute right-0 flex flex-col gap-1">
        <TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="link" onClick={showingHint && hint ? applyHintOption : getHintAndShow}>
                  {showingHint && hint ? <SquarePen /> : <Lightbulb />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{showingHint && hint ? "执行" : "提示"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="link" onClick={newPuzzle}>
                <RefreshCcw />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>换一道题</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="link" onClick={clear}>
                <Trash2 />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>清空</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="link" onClick={() => router.replace("/")}>
                <Undo2 />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>退出</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  )
}