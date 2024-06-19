import { useCallback, useEffect, useState } from "react";

export default function useTimer(pause) {
  const [time, setTime] = useState(0);

  useEffect(() => {
    let updateTime = !pause ?
      setInterval(() => {
        setTime((prev) => prev + 1);
      }, 1000) : null;
    return () => {
      if (updateTime)
        clearInterval(updateTime);
    };
  }, [pause]);

  const timeMin = parseInt(time / 60);
  const timeSec = (() => {
    let sec = time % 60;
    return sec < 10 ? `0${sec}` : sec;
  })();

  return { timeStr: `${timeMin}:${timeSec}`, reset: useCallback(() => { setTime(0); }, []) };
}