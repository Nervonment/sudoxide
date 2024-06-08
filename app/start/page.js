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
  const [maxCandidates, setMaxCandidates] = useState([]); // 当前局面下所有格的所有候选数
  const [markedCandidates, setMarkedCandidates] = useState([]); // 用户标记的所有格的候选数
  // 掩码候选数，是上述两者按照各格的交集
  const maskedCandidates = markedCandidates.map((row, r) => row.map((candidatesOfGrid, c) => candidatesOfGrid.map((is, num) => is && maxCandidates[r][c][num])));
  const rowContainsRef = useRef(Array.from({ length: 9 }, (v) => Array.from({ length: 10 }, (v) => false)));
  const colContainsRef = useRef(Array.from({ length: 9 }, (v) => Array.from({ length: 10 }, (v) => false)));
  const blkContainsRef = useRef(Array.from({ length: 9 }, (v) => Array.from({ length: 10 }, (v) => false)));
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
    invoke('get_marking_assist').then((markingAssist) => markingAssistRef.current = markingAssist);
  }, []);

  const init = useCallback((board) => {
    setBoard(board);
    setMaxCandidates(getMaxCandidates(board));
    if (markingAssistRef.current) {
      setMarkedCandidates(Array.from({ length: 9 }, (v) => Array.from({ length: 9 }, (v) => Array.from({ length: 10 }, (v) => true))));
    } else {
      setMarkedCandidates(Array.from({ length: 9 }, (v) => Array.from({ length: 9 }, (v) => Array.from({ length: 10 }, (v) => false))));
    }
    setTime(0);
    historyRef.current = [];
    futureRef.current = [];
  }, []);

  const getPuzzle = useCallback(() => {
    invoke('get_sudoku_puzzle').then((board) => {
      let b = board.map((row) => row.map((val) => ({ value: val, mutable: val == 0, valid: true })));
      init(b);
    });
  }, [init]);

  const getMaxCandidates = (board) => {
    rowContainsRef.current.forEach((row) => row.fill(false));
    colContainsRef.current.forEach((col) => col.fill(false));
    blkContainsRef.current.forEach((blk) => blk.fill(false));
    let rc2b = (r, c) => parseInt(r / 3) * 3 + parseInt(c / 3);
    board.forEach((row, r) => {
      row.forEach((grid, c) => {
        let num = grid.value;
        rowContainsRef.current[r][num] = true;
        colContainsRef.current[c][num] = true;
        blkContainsRef.current[rc2b(r, c)][num] = true;
      });
    });
    return board.map((row, r) => row.map((grid, c) => ([0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
      board[r][c].value == 0
      && !rowContainsRef.current[r][num]
      && !colContainsRef.current[c][num]
      && !blkContainsRef.current[rc2b(r, c)][num]
    )))));
  };

  useEffect(() => {
    getPuzzle();
  }, [getPuzzle]);

  const newPuzzle = () => {
    setBoard(null);
    getPuzzle();
    setFinished(false);
  };

  const clear = () => {
    if (!finished && board) {
      let b = board.map((row, r) => row.map((grid, c) => ({ ...grid, valid: true, value: grid.mutable ? 0 : grid.value })));
      init(b);
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

  const pushHistory = useCallback((board, markedCandidates) => {
    historyRef.current.push({
      board: board.map((row) => row.map((grid) => ({ ...grid }))),
      markedCandidates: markedCandidates.map((row) => row.map((grid) => grid.slice()))
    });
    futureRef.current = [];
  }, []);

  const onKeyDown = useCallback((event) => {
    if (!finished && board && markedCandidates) {
      // 撤销
      if (event.key == 'z') {
        if (historyRef.current.length != 0) {
          futureRef.current.push({
            board: board.map((row) => row.map((grid) => ({ ...grid }))),
            markedCandidates: markedCandidates.map((row) => row.map((grid) => grid.slice()))
          });
          let { board: b, markedCandidates: m } = historyRef.current.pop();
          setBoard(b);
          setMaxCandidates(getMaxCandidates(b));
          setMarkedCandidates(m);
        }
      }
      // 重做
      else if (event.key == 'x') {
        if (futureRef.current.length != 0) {
          historyRef.current.push({
            board: board.map((row) => row.map((grid) => ({ ...grid }))),
            markedCandidates: markedCandidates.map((row) => row.map((grid) => grid.slice()))
          });
          let { board: b, markedCandidates: m } = futureRef.current.pop();
          setBoard(b);
          setMaxCandidates(getMaxCandidates(b));
          setMarkedCandidates(m);
        }
      }
      // 填数或标记候选数
      else if (currentGridRef.current) {
        let nummap = { '!': 1, '@': 2, '#': 3, '$': 4, '%': 5, '^': 6, '&': 7, '*': 8, '(': 9, ' ': 0 };
        let num;
        if (event.key in nummap)
          num = nummap[event.key];
        else
          num = parseInt(event.key);
        if (!num && event.key !== ' ')
          return;
        console.log(num);
        let [r, c] = currentGridRef.current;
        if (board[r][c].mutable) {
          // 填数
          if (!event.shiftKey) {
            if (board[r][c].value != num) {
              pushHistory(board, markedCandidates);
              board[r][c].value = num;
              invoke('judge_sudoku', { board: board.map((row) => row.map((grid) => grid.value)) })
                .then(([finished, validCond]) => {
                  setFinished(finished);
                  setBoard((prev) => {
                    prev[r][c].value = num;
                    setMaxCandidates(getMaxCandidates(prev));
                    return prev.map((row, r) => row.map((grid, c) => ({
                      ...grid,
                      valid: validCond[r][c],
                    })))
                  });
                });
            }
          }
          // 标记候选数
          else {
            // 只能标记 maxCandidates[r][c] 中的数字
            if (board[r][c].value == 0 && (maxCandidates[r][c][num] || event.key == ' ')) {
              if (event.key == ' ') { // 按空格键 
                if (!markedCandidates[r][c].every((is, num) => num == 0 || !is)) {
                  pushHistory(board, markedCandidates);
                  setMarkedCandidates((prev) => {
                    prev[r][c].fill(false);
                    return prev.map((row) => row.map((grid) => grid.slice()));
                  })
                }
              }
              else {
                pushHistory(board, markedCandidates);
                setMarkedCandidates((prev) => {
                  prev[r][c][num] = !prev[r][c][num];
                  return prev.map((row) => row.map((grid) => grid.slice()));
                })
              }
            }
          }
        }
      }
    }
  }, [board, finished, maxCandidates, markedCandidates, pushHistory]);

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
        board && maskedCandidates ?
          <>
            <SudokuBoard
              board={board}
              candidates={maskedCandidates}
              handleMouseEnter={handleMouseEnter}
              handleMouseLeave={handleMouseLeave}
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