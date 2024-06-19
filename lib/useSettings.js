import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";

export default function useSettings() {
  const [difficulty, setDifficulty] = useState(2);
  const [markingAssist, setMarkingAssist] = useState(false);
  const [beginWithMarks, setBeginWithMarks] = useState(false);

  useEffect(() => {
    invoke('get_difficulty').then((difficulty) => setDifficulty(difficulty));
    invoke('get_marking_assist').then((markingAssist) => setMarkingAssist(markingAssist));
    invoke('get_begin_with_marks').then((beginWithMarks) => setBeginWithMarks(beginWithMarks));
  }, []);

  return {
    difficulty,
    markingAssist,
    beginWithMarks,
    setDifficulty: (difficulty) => {
      setDifficulty(difficulty);
      invoke('set_difficulty', { newDifficulty: difficulty });
    },
    setMarkingAssist: (markingAssist) => {
      setMarkingAssist(markingAssist);
      invoke('set_marking_assist', { markingAssist });
    },
    setBeginWithMarks: (beginWithMarks) => {
      setBeginWithMarks(beginWithMarks);
      invoke('set_begin_with_marks', { beginWithMarks });
    }
  }
}