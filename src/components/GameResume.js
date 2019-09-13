// @flow
import React from "react";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import { withRouter } from "react-router-dom";

import { Timer } from ".";
import type { Game, Answer } from "../types";

function GameResumeComponent({ history }) {
  console.log(history);
  if (!history.location.state.game) {
    history.push("/"); // TODO: proper error handling.
  }
  const game: Game = history.location.state;
  const { score, timer, answers } = history.location.state.game;
  return (
    <div>
      <h2>{`Score: ${score}`}</h2>
      <h3>{`Time: ${timer}`}</h3>
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
          {answers.map((answer: Answer) => (
            <TableRow key={answer.time}>
              <TableCell>{answer.time}</TableCell>
              <TableCell>{answer.person.name}</TableCell>
              <TableCell>{answer.movie.name}</TableCell>
              <TableCell>{answer.guessedRight ? "yes" : "no"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

const GameResume = withRouter(GameResumeComponent);

export { GameResume };
