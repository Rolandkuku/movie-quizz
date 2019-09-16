// @flow
import React, { useEffect, useState, useRef } from "react";
import {
  Button,
  Typography,
  makeStyles,
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableHead
} from "@material-ui/core";
import CheckRoundedIcon from "@material-ui/icons/CheckRounded";
import CloseRoundedIcon from "@material-ui/icons/CloseRounded";

import { withRouter } from "react-router-dom";

import { Timer, Poster } from ".";
import { makeFreshGame } from "../utils";
import {
  saveGame,
  lobbyServices,
  getName,
  listenToCreateRound,
  listenToGuesses,
  roundServices,
  saveGuess,
  guessServices
} from "../services";
import type { Game as GameType } from "../types";

const useStyles = makeStyles(theme => ({
  root: {
    display: "flex",
    justifyContent: "space-between"
  },
  title: {
    textAlign: "center"
  },
  picturesContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center"
  },
  actionsContainer: {
    display: "flex",
    flexDirection: "row",
    padding: theme.spacing(2),
    justifyContent: "center"
  },
  action: {
    margin: theme.spacing(2)
  },
  gameHUD: {
    display: "flex",
    justifyContent: "space-between",
    padding: theme.spacing(2)
  }
}));

function GameComponent({ history, onSaveCurrentGame }) {
  const lobbyId = window.location.hash.split("/")[2];
  if (!lobbyId) {
    history.push("/");
  }
  const [userName, setUserName] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lobby, setLobby] = useState(null);
  const [roundLoading, setRoundLoading] = useState(false);
  const [round, setRound] = useState({
    movie: {},
    person: {},
    playsIn: false
  });
  const roundListener = useRef(null);
  const guessesListener = useRef(null);
  const classes = useStyles();
  // Data for timer
  const intervalId = useRef(null);
  const [time, setTime] = useState(0);
  // Load data for the next round.
  async function loadData() {
    // Load userName
    if (!userName) {
      const name = getName();
      if (!name) {
        history.push("/");
      } else {
        setUserName(name);
      }
    }
    // Load lobby
    const lobby = await lobbyServices.getCurrentLobby(
      setLobby,
      setLoading,
      lobbyId
    );
    let round;
    if (lobby.lastRound) {
      // If round, load it
      round = await roundServices.getRound(
        setRound,
        setRoundLoading,
        lobby.lastRound,
        lobbyId
      );
    } else if (lobby.master === userName) {
      // Else, if master, create a new one.
      round = await roundServices.createNewRound(
        setRound,
        setRoundLoading,
        setError,
        lobbyId,
        time
      );
    }

    // Update to new round upon creation
    if (!roundListener.current) {
      roundListener.current = listenToCreateRound(lobbyId, () => {
        roundServices.getRound(
          setRound,
          setRoundLoading,
          lobby.lastRound,
          lobbyId
        );
      });
    }

    // Listen to guesses and update lobby.
    if (!guessesListener.current && round) {
      guessesListener.current = listenToGuesses(lobbyId, round.id, () =>
        lobbyServices.getCurrentLobby(setLobby, setLoading, lobbyId)
      );
    }
  }

  // Save guess if correct.
  async function onMakeAGuess(guess: boolean) {
    const { playsIn } = round;
    const guessedRight = guess === playsIn;
    if (round.id && lobbyId) {
      guessServices.saveGuess(
        round.id,
        lobbyId,
        { guessedRight, userName },
        setLoading
      );
    }
  }

  // Load rounds if not master.
  useEffect(() => {
    if (
      !round.id &&
      !lobby &&
      !listenToGuesses.current &&
      !listenToCreateRound.current &&
      !loading &&
      !roundLoading
    ) {
      loadData();
    }
  });

  // Timer logic
  useEffect(() => {
    intervalId.current = setInterval(() => {
      setTime(t => t + 1);
    }, 1000);
    return () => {
      clearInterval(intervalId.current);
    };
  });

  return (
    <div>
      {error ? <p>{error}</p> : null}
      <div className={classes.gameHUD}>
        <Typography variant="h3">
          <Timer>{time}</Timer>
        </Typography>
      </div>
      <div className={classes.root}>
        <div>
          <div className={classes.picturesContainer}>
            <Poster
              loading={loading}
              path={round.person.profile_path}
              name={round.person.name}
            />
            <Typography variant="h2">?</Typography>
            <Poster
              loading={loading}
              path={round.movie.poster_path}
              name={round.movie.title}
            />
          </div>
          <div className={classes.actionsContainer}>
            <Button
              disabled={loading}
              size="large"
              variant="contained"
              color="primary"
              onClick={() => {
                onMakeAGuess(true);
              }}
              className={classes.action}
            >
              <CheckRoundedIcon />
            </Button>
            <Button
              size="large"
              variant="contained"
              color="secondary"
              onClick={() => {
                onMakeAGuess(false);
              }}
              disabled={loading}
              className={classes.action}
            >
              <CloseRoundedIcon />
            </Button>
          </div>
        </div>
        <div>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Player</TableCell>
                <TableCell>Score</TableCell>
                <TableCell>Lives</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {lobby
                ? lobby.users.map(user => (
                    <TableRow key={user.id}>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.score}</TableCell>
                      <TableCell>{user.lives}</TableCell>
                    </TableRow>
                  ))
                : null}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

const Game = withRouter(GameComponent);

export { Game };
