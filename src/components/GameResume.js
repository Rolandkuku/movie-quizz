// @flow
import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  makeStyles
} from "@material-ui/core";
import { withRouter } from "react-router-dom";

import { Timer } from ".";
import {
  getGame as _getGame,
  getName as _getName,
  getGuessesFromLobby
} from "../services";
import type { Guess } from "../types";

const useStyles = makeStyles(theme => ({
  button: {
    margin: theme.spacing(2)
  }
}));

function GameResumeComponent({ history }) {
  const gameId = window.location.hash.split("/")[2];
  const [game, setGame] = useState(null);
  const [userName, setUserName] = useState(null);
  const [guesses, setGuesses] = useState([]);
  const [loading, setLoading] = useState(false);

  const classes = useStyles();

  function getName() {
    const name = _getName();
    if (!name) {
      history.push("/");
    } else {
      setUserName(name);
    }
  }

  async function getGame() {
    setLoading(true);
    try {
      const _game = await _getGame(gameId);
      const _guesses = await getGuessesFromLobby(_game.lobbyId);
      setGuesses(_guesses);
      setGame(_game);
    } catch (error) {
      throw new Error(error);
    }
    setLoading(false);
  }

  useEffect(() => {
    if (!game && !loading) {
      getGame();
    }
  });

  useEffect(() => {
    if (!userName) {
      getName();
    }
  });

  if (game && userName) {
    const { score, winner } = game;
    return (
      <div>
        <h2>{`Winner: ${winner}`}</h2>
        <h2>Your game:</h2>
        <h2>{`Score: ${score}`}</h2>
        <Timer>{guesses[0].time}</Timer>
        <Button
          color="primary"
          variant="contained"
          onClick={() => history.push("/")}
          className={classes.button}
        >
          Go home
        </Button>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Time</TableCell>
              <TableCell>Person</TableCell>
              <TableCell>Movie</TableCell>
              <TableCell>Plays in</TableCell>
              <TableCell>Guessed right</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {guesses.length
              ? guesses.map((guess: Guess) => {
                  return (
                    <TableRow key={guess.id}>
                      <TableCell>{guess.time}</TableCell>
                      <TableCell>{guess.person.name}</TableCell>
                      <TableCell>{guess.movie.title}</TableCell>
                      <TableCell>{guess.playsIn ? "yes" : "no"}</TableCell>
                      <TableCell>{guess.guessedRight ? "yes" : "no"}</TableCell>
                    </TableRow>
                  );
                })
              : null}
          </TableBody>
        </Table>
      </div>
    );
  }

  return <p>loading...</p>;
}

const GameResume = withRouter(GameResumeComponent);

export { GameResume };
