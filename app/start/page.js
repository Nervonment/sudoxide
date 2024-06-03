'use client'

import { Label } from "@/components/ui/label";
import SudokuBoard from "@/components/sudoku_board";
import { difficultyDesc } from "@/lib/utils";
import { invoke } from "@tauri-apps/api/tauri";
import { HelpCircle, Loader2, RefreshCcw, Trash2, Undo2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useRouter } from "next/navigation";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export default function Start() {
  const [board, setBoard] = useState();
  const currentGridRef = useRef();
  const [time, setTime] = useState(0);
  const [finished, setFinished] = useState(false);

  const timeMin = parseInt(time / 60);
  const timeSec = (() => {
    let sec = time % 60;
    return sec < 10 ? `0${sec}` : sec;
  })();
  const rest = (() => {
    let res = 0;
    if (board)
      board.forEach(row => {
        row.forEach(grid => {
          if (grid.value == 0)
            res += 1;
        });
      });
    return res;
  })();

  const [difficulty, setDifficulty] = useState(2);

  useEffect(() => {
    invoke('get_difficulty').then((difficulty) => setDifficulty(difficulty));
  }, []);

  const getPuzzle = () => {
    invoke('get_sudoku_puzzle').then((board) => {
      let b = board.map((row) => row.map((val) => ({ value: val, candidates: [], mutable: val == 0, valid: true })));
      setBoard(b);
      setTime(0);
    });
  };

  useEffect(() => {
    getPuzzle();
  }, []);

  const newPuzzle = () => {
    getPuzzle();
    setFinished(false);
  };

  const clear = () => {
    if (!finished)
      setBoard(board.map((row, r) => row.map((grid, c) => ({ ...grid, valid: true, value: grid.mutable ? 0 : grid.value, candidates: [], }))));
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

  const onKeyDown = useCallback((event) => {
    if (currentGridRef.current && !finished) {
      let num = parseInt(event.key);
      let new_value;
      if (event.key == ' ') {
        new_value = 0;
      } else if (num) {
        new_value = num;
      } else {
        return;
      }
      let [r, c] = currentGridRef.current;
      if (board[r][c].mutable) {
        board[r][c].value = new_value;
        invoke('judge_sudoku', { board: board.map((row) => row.map((grid) => grid.value)) })
          .then(([finished, validCond]) => {
            setFinished(finished);
            setBoard((prev) => {
              if (prev[r][c].mutable) {
                prev[r][c].value = new_value;
                return prev.map((row, r) => row.map((grid, c) => ({ ...grid, valid: validCond[r][c] })))
              }
              return prev;
            });
          });
      }
    }
  }, [board, finished]);

  useEffect(() => {
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [onKeyDown]);

  const handleMouseEnter = (r, c) => {
    currentGridRef.current = [r, c];
  }
  const handleMouseLeave = () => {
    currentGridRef.current = null;
  }

  const router = useRouter();

  return (
    <div className="h-screen w-screen p-8 flex items-center justify-stretch">
      {
        board ?
          <>
            <SudokuBoard board={board} handleMouseEnter={handleMouseEnter} handleMouseLeave={handleMouseLeave} />
            <div className="flex-1 flex flex-col gap-6 items-center">
              <div className="flex flex-col gap-1 items-center w-full">
                <p className="text-4xl font-bold">{difficultyDesc[difficulty]}</p>
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
                    <p >操作说明</p>
                    <HelpCircle size={16} />
                  </div>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <p className="text-muted-foreground">将光标移动到格子上，使用数字键1~9填数，使用数字键0或空格清除。</p>
                </PopoverContent>
              </Popover>
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
          <Tooltip>
            <TooltipTrigger>
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
            <TooltipTrigger>
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
            <TooltipTrigger>
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