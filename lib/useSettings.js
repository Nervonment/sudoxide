import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { BaseDirectory, createDir, exists, readTextFile, writeTextFile } from "@tauri-apps/api/fs";

export default function useSettings() {
  const [settings, setSettings] = useState({
    difficulty: 1,
    markingAssist: true,
    beginWithMarks: false
  });

  useEffect(() => {
    exists('', { dir: BaseDirectory.AppConfig })
      .then((exist) => {
        if (!exist) {
          createDir('', { dir: BaseDirectory.AppConfig, recursive: true });
        }
        else {
          readTextFile('sudoxide_conf.json', { dir: BaseDirectory.AppConfig })
            .then((conf) => {
              setSettings(JSON.parse(conf));
            });
        }
      });
  }, []);

  const saveSettings = (settings) => {
    writeTextFile('sudoxide_conf.json', JSON.stringify(settings), { dir: BaseDirectory.AppConfig });
  };

  return {
    ...settings,
    setDifficulty: (difficulty) => {
      setSettings((prev) => {
        const next = { ...prev, difficulty };
        saveSettings(next);
        invoke('set_difficulty', { newDifficulty: difficulty });
        return next;
      })
    },
    setMarkingAssist: (markingAssist) => {
      setSettings((prev) => {
        const next = { ...prev, markingAssist };
        saveSettings(next);
        return next;
      })
    },
    setBeginWithMarks: (beginWithMarks) => {
      setSettings((prev) => {
        const next = { ...prev, beginWithMarks };
        saveSettings(next);
        return next;
      })
    }
  }
}