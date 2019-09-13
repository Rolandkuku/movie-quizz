import React from "react";
import moment from "moment";

const momentInstance = moment();

function Timer({ children }: { children: number }) {
  return (
    <p>
      {momentInstance
        .minute(0)
        .second(children)
        .format("mm:ss")}
    </p>
  );
}

export { Timer };
