'use client'

import SudokuBoard from "@/components/ui/sudoku_board";
import { invoke } from "@tauri-apps/api/tauri";
import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react"

export default function Start() {
  const [board, setBoard] = useState();
  const currentGridRef = useRef();

  useEffect(() => {
    invoke('get_sudoku_puzzle').then((board) => {
      let b = board.map((row) => row.map((val) => ({ value: val, candidates: [], mutable: val == 0, valid: true })));
      setBoard(b);
    });
  }, []);

  const onKeyDown = useCallback((event) => {
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
    board[r][c].value = new_value;
    invoke('judge_sudoku', { board: board.map((row) => row.map((grid) => grid.value)) })
      .then((validCond) => {
        setBoard((prev) => {
          if (prev[r][c].mutable) {
            prev[r][c].value = new_value;
            return prev.map((row, r) => row.map((grid, c) => ({ ...grid, valid: validCond[r][c] })))
          }
          return prev;
        });
      });
  }, [board]);

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

  return (
    <div className="h-screen w-screen flex items-center justify-center">
      {
        board ?
          <SudokuBoard board={board} handleMouseEnter={handleMouseEnter} handleMouseLeave={handleMouseLeave} /> : <Loader2 />
      }
    </div>
  )
}