// @flow
import React, { useEffect, useState, useRef, useCallback } from "react";
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
import {
  getRandPopularMovie,
  getRandPopularPerson,
  getPerson
} from "../services/index";
import { getRandomInt, makeFreshGame } from "../utils";
import {
  saveGame,
  lobbyServices,
  getName,
  createRound,
  listenToCreateRound,
  roundServices,
  saveGuess
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

let game: GameType = makeFreshGame();

async function createNewRound(setRound, setLoading, setError, lobbyId, timer) {
  setLoading(true);
  try {
    setError(null);
    const shouldPickPersonFromCast = getRandomInt(2);
    const movie = await getRandPopularMovie();
    const person = shouldPickPersonFromCast
      ? await getPerson(movie.cast[getRandomInt(movie.cast.length)])
      : await getRandPopularPerson();
    const round = {
      movie,
      person,
      lobbyId,
      playsIn: movie.cast.indexOf(person.id) !== -1,
      timer
    };
    await createRound(round);
    setRound(round);
  } catch (e) {
    setError(e);
  }
  setLoading(false);
}

async function onSaveGame(game: Game, setLoading, setError) {
  setLoading(true);
  try {
    await saveGame(game);
    setError(null);
    return true;
  } catch (error) {
    setError(error.message);
  }
  setLoading(false);
  return false;
}

function GameComponent({ history, onSaveCurrentGame }) {
  const lobbyId = window.location.hash.split("/")[2];
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
  const classes = useStyles();
  // Data for timer
  const intervalId = useRef(null);
  const [time, setTime] = useState(0);
  // Load data for the next round.
  async function loadData() {
    createNewRound(setRound, setRoundLoading, setError, lobbyId, time);
  }

  const getRound = useCallback(
    roundId => {
      if (lobby && lobbyId && !roundLoading) {
        roundServices.getRound(
          setRound,
          setLoading,
          roundId || lobby.lastRound,
          lobbyId
        );
      }
    },
    [lobby, lobbyId, roundLoading]
  );

  // Save guess if correct.
  async function onMakeAGuess(guess: boolean) {
    const { playsIn, movie, person } = round;
    const guessedRight = guess === playsIn;
    console.log(round);
    if (round.id && lobbyId) {
      await saveGuess({
        roundId: round.id,
        lobbyId,
        guess: { guessedRight, userName }
      });
    }
    // game = updateGame(game, person, movie, time, guessedRight);
    // if (guessedRight) {
    //   loadData();
    // } else {
    //   if (await onSaveGame(game, setLoading, setError)) {
    //     onSaveCurrentGame(game);
    //     history.push("/game-resume");
    //     game = makeFreshGame();
    //   }
    // }
  }

  // Load userName
  // Redirect to home if not set.
  useEffect(() => {
    if (!userName) {
      const name = getName();
      if (!name) {
        history.push("/");
      } else {
        setUserName(name);
      }
    }
  }, [userName, history]);

  // Load lobby
  useEffect(() => {
    if (lobbyId && !lobby) {
      lobbyServices.getCurrentLobby(setLobby, setLoading, lobbyId);
    }
  }, [lobby, lobbyId]);

  // Load fresh data upon first load.
  useEffect(() => {
    const { movie, person } = round;
    if (
      !movie.id &&
      !person.id &&
      !roundLoading &&
      lobby &&
      lobby.master === userName
    ) {
      loadData();
    }
  });

  // Load rounds if not master.
  useEffect(() => {
    if (lobbyId && lobby && lobby.master !== userName) {
      getRound();
    }
  }, [lobbyId, userName, lobby, getRound]);

  // Listen to new rounds if not master.
  useEffect(() => {
    if (
      lobbyId &&
      lobby &&
      lobby.master !== userName &&
      !roundListener.current
    ) {
      roundListener.current = listenToCreateRound(lobbyId, getRound);
      return roundListener.current;
    }
  }, [lobbyId, getRound, lobby, roundListener, userName]);

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
