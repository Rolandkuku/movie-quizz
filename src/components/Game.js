// @flow
import React, { useEffect, useState, useRef } from "react";
import { Button, Typography, makeStyles } from "@material-ui/core";
import CheckRoundedIcon from "@material-ui/icons/CheckRounded";
import CloseRoundedIcon from "@material-ui/icons/CloseRounded";

import { withRouter } from "react-router-dom";

import { Timer, Poster } from ".";
import {
  getRandPopularMovie,
  getRandPopularPerson,
  getPerson
} from "../services/index";
import { getRandomInt } from "../utils";
import { saveGame } from "../services";
import type { Game as GameType } from "../types";

const useStyles = makeStyles(theme => ({
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

const freshGame: GameType = {
  score: 0,
  timer: 0,
  answers: [],
  userName: null
};

let game: GameType = freshGame;

async function getRoundData(
  setMovie,
  setPerson,
  setPlaysIn,
  setLoading,
  setError
) {
  setLoading(true);
  try {
    const shouldPickPersonFromCast = getRandomInt(2);
    const movie = await getRandPopularMovie();
    setMovie(movie);
    const person = shouldPickPersonFromCast
      ? await getPerson(movie.cast[getRandomInt(movie.cast.length)])
      : await getRandPopularPerson();
    setPerson(person);
    setPlaysIn(movie.cast.indexOf(person.id) !== -1);
    setError(null);
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
    setError(error);
  }
  setLoading(false);
  return false;
}

function updateGame(
  { score, answers, userName },
  person,
  movie,
  time,
  guessedRight
) {
  return {
    userName,
    score: score + 1,
    timer: time,
    answers: [
      ...answers,
      {
        person: {
          name: person.name,
          picture: person.profile_path,
          id: person.id
        },
        movie: {
          name: movie.title,
          poster: movie.poster_path,
          id: movie.id
        },
        time: time,
        guessedRight
      }
    ]
  };
}

function GameComponent({ history, userName }) {
  if (!userName) {
    history.replace("/");
  }
  game.userName = userName;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [person, setPerson] = useState({});
  const [movie, setMovie] = useState({});
  const [playsIn, setPlaysIn] = useState(false);
  const classes = useStyles();
  // Data for timer
  const intervalId = useRef(null);
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(true);
  // Load data for the next round.
  function loadData() {
    getRoundData(setMovie, setPerson, setPlaysIn, setLoading, setError);
  }
  // Save guess if correct.
  async function onMakeAGuess(guess: boolean) {
    const guessedRight = guess === playsIn;
    game = updateGame(game, person, movie, time, guessedRight);
    if (guessedRight) {
      loadData();
    } else {
      if (await onSaveGame(game, setLoading, setError)) {
        history.push("/game-resume", { game });
        game = freshGame;
      }
    }
  }
  // Load fresh data upon first load.
  useEffect(() => {
    if (!movie.id && !person.id) {
      loadData();
    }
  });
  // Timer logic
  useEffect(() => {
    if (running) {
      intervalId.current = setInterval(() => {
        setTime(t => t + 1);
      }, 1000);
    } else {
      clearInterval(intervalId.current);
    }
    return () => {
      clearInterval(intervalId.current);
    };
  }, [running]);

  return (
    <div>
      {error ? <p>{error}</p> : null}
      <div className={classes.gameHUD}>
        <Typography variant="h3">
          <Timer>{time}</Timer>
        </Typography>
        <Typography variant="h3">{`Your score: ${game.score}`}</Typography>
      </div>
      <div className={classes.picturesContainer}>
        <Poster
          loading={loading}
          path={person.profile_path}
          name={person.name}
        />
        <Typography variant="h2">?</Typography>
        <Poster loading={loading} path={movie.poster_path} name={movie.title} />
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
  );
}

const Game = withRouter(GameComponent);

export { Game };
