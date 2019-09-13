import React, { useState, useEffect, useRef } from "react";
import moment from "moment";

const momentInstance = moment();

function Timer({ running }) {
  const intervalId = useRef(null);
  const [time, setTime] = useState(50);
  useEffect(() => {
    if (running) {
      intervalId.current = setInterval(() => {
        setTime(t => t + 1);
      }, 1000);
    } else {
      clearInterval(intervalId.current);
    }
  }, [running]);

  return (
    <p>
      {momentInstance
        .minute(0)
        .second(time)
        .format("mm:ss")}
    </p>
  );
}

export { Timer };
