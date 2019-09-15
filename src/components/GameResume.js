// @flow
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button
} from "@material-ui/core";
import { withRouter } from "react-router-dom";

import { Timer } from ".";
import type { Answer } from "../types";

function GameResumeComponent({ history, userName, game }) {
  if (!game || !userName) {
    history.push("/"); // TODO: proper error handling.
  }
  const { score, timer, answers } = game;
  return (
    <div>
      <h2>{userName}</h2>
      <h2>{`Score: ${score}`}</h2>
      <Timer>{timer}</Timer>
      <Button
        color="primary"
        variant="contained"
        onClick={() => history.push("/")}
      >
        Go home
      </Button>
      <Button
        color="secondary"
        variant="contained"
        onClick={() => history.push("/game")}
      >
        Play again
      </Button>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Time</TableCell>
            <TableCell>Person</TableCell>
            <TableCell>Movie</TableCell>
            <TableCell>Guessed right</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {answers.map((answer: Answer) => {
            return (
              <TableRow key={answer.time}>
                <TableCell>{answer.time}</TableCell>
                <TableCell>{answer.person.name}</TableCell>
                <TableCell>{answer.movie.name}</TableCell>
                <TableCell>
                  {answer.guesses[0].guessedRight ? "yes" : "no"}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

const GameResume = withRouter(GameResumeComponent);

export { GameResume };
