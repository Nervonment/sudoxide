import { useCallback, useRef } from "react";

export function useMaxCandidates() {
  const rowContainsRef = useRef(Array.from({ length: 9 }, (v) => Array.from({ length: 10 }, (v) => false)));
  const colContainsRef = useRef(Array.from({ length: 9 }, (v) => Array.from({ length: 10 }, (v) => false)));
  const blkContainsRef = useRef(Array.from({ length: 9 }, (v) => Array.from({ length: 10 }, (v) => false)));

  const getMaxCandidates = useCallback((grid) => {
    rowContainsRef.current.forEach((row) => row.fill(false));
    colContainsRef.current.forEach((col) => col.fill(false));
    blkContainsRef.current.forEach((blk) => blk.fill(false));
    let rc2b = (r, c) => parseInt(r / 3) * 3 + parseInt(c / 3);
    if (grid) {
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
    }
  }, []);
  return getMaxCandidates;
};