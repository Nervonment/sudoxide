import { createContext } from "react";

export const SettingsContext = createContext({
  difficulty: 1,
  markingAssist: true,
  beginWithMarks: false,
  setDifficulty: () => { },
  setMarkingAssist: () => { },
  setBeginWithMarks: () => { }
});