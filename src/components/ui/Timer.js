import React from "react";
import moment from "moment";

const momentInstance = moment();

function Timer({ children }: { children: number }) {
  return (
    <span>
      {momentInstance
        .minute(0)
        .second(children)
        .format("mm:ss")}
    </span>
  );
}

export { Timer };
