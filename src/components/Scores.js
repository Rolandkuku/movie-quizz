// @flow
import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button
} from "@material-ui/core";
import moment from "moment";

import { getGames } from "../services";
import type { Game } from "../types";
import { Timer } from "../components";

async function fetchGames(setGames, setLoading, setError) {
  setLoading(true);
  setError(null);
  try {
    const games = await getGames();
    setGames(games);
  } catch (error) {
    setError(error);
  }
  setLoading(false);
}

function Scores({ history }: { history: any }) {
  const [games, setGames]: [Array<Game>, any] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  useEffect(() => {
    if (!games.length) {
      fetchGames(setGames, setLoading, setError);
    }
  }, [games]);
  return (
    <div>
      {error ? <p>{error}</p> : null}
      <Button
        color="primary"
        variant="contained"
        onClick={() => history.push("/")}
      >
        Go home
      </Button>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>#</TableCell>
            <TableCell>User</TableCell>
            <TableCell>Score</TableCell>
            <TableCell>Time</TableCell>
            <TableCell>Date</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {games.map(({ id, winner, score, timer, date }: Game, index) => (
            <TableRow key={id}>
              <TableCell>{index + 1}</TableCell>
              <TableCell>{winner}</TableCell>
              <TableCell>{score}</TableCell>
              <TableCell>
                <Timer>{timer}</Timer>
              </TableCell>
              <TableCell>{moment(date).fromNow()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export { Scores };
