import { useCallback, useRef } from "react";

export default function useHistory() {
  const historyRef = useRef([]);
  const futureRef = useRef([]);

  const clearHistory = useCallback(() => {
    historyRef.current = [];
    futureRef.current = [];
  }, []);

  const pushHistory = useCallback((grid, markedCandidates) => {
    historyRef.current.push({
      grid: grid.map((row) => row.map((cell) => ({ ...cell }))),
      markedCandidates: markedCandidates.map((row) => row.map((cell) => cell.slice()))
    });
    futureRef.current = [];
  }, []);

  const undo = useCallback((grid, markedCandidates) => {
    if (historyRef.current.length != 0) {
      futureRef.current.push({
        grid: grid.map((row) => row.map((cell) => ({ ...cell }))),
        markedCandidates: markedCandidates.map((row) => row.map((cell) => cell.slice()))
      });
      return historyRef.current.pop();
    }
  }, []);

  const redo = useCallback((grid, markedCandidates) => {
    if (futureRef.current.length != 0) {
      historyRef.current.push({
        grid: grid.map((row) => row.map((cell) => ({ ...cell }))),
        markedCandidates: markedCandidates.map((row) => row.map((cell) => cell.slice()))
      });
      return futureRef.current.pop();
    }
  }, []);

  return {
    clearHistory,
    pushHistory,
    undo,
    redo
  }
}