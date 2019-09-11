// @flow
import React, { useEffect } from "react";
import { getRandPopularMovie } from "../services/index";

function Game() {
  useEffect(() => {
    getRandPopularMovie();
  });
  return (
    <div>
      <h1>Game</h1>
    </div>
  );
}

export { Game };
