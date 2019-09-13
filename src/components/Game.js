// @flow
import React, { useEffect, useState, useRef } from "react";
import Button from "@material-ui/core/Button";
import { makeStyles } from "@material-ui/styles";

import { Timer } from ".";
import {
  getRandPopularMovie,
  getRandPopularPerson,
  getPerson
} from "../services/index";
import { getRandomInt } from "../utils";
import { BASE_TMDB_POSTER_URL } from "../config/constants";
import type { Game as GameType } from "../types";

const { innerHeight } = window;
// console.log(innerHeight);

const useStyles = makeStyles({
  root: {
    background: "linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)",
    color: "white",
    padding: "1em",
    position: "relative",
    minHeight: innerHeight
  },
  picturesContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center"
  },
  picture: {
    padding: "1em",
    width: "40%"
  },
  actionsContainer: {
    display: "flex",
    flexDirection: "row",
    padding: "1em",
    justifyContent: "space-around"
  }
});

const freshGame: GameType = {
  score: 0,
  answers: []
};

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

function Game() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [person, setPerson] = useState({});
  const [movie, setMovie] = useState({});
  const [playsIn, setPlaysIn] = useState(false);
  const [game, setGame]: [GameType, (GameType) => any] = useState(freshGame);
  const classes = useStyles();
  // Data for timer
  const intervalId = useRef(null);
  const [time, setTime] = useState(50);
  const [running, setRunning] = useState(true);
  // Load data for the next round.
  function loadData() {
    getRoundData(setMovie, setPerson, setPlaysIn, setLoading, setError);
  }
  // Save guess if correct.
  function onMakeAGuess(guess: boolean) {
    if (guess === playsIn) {
      setGame(({ score, answers }) => ({
        score: score + 1,
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
            timer: time
          }
        ]
      }));
      loadData();
    } else {
      // Todo
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
  }, [running]);

  return (
    <div className={classes.root}>
      <h1>Game</h1>
      {error ? <p>{error}</p> : null}
      <h2>Plays in: {playsIn ? "yes" : "no"}</h2>
      <Timer>{time}</Timer>
      <h3>{`Your score: ${game.score}`}</h3>
      <div className={classes.picturesContainer}>
        <img
          src={`${BASE_TMDB_POSTER_URL}${movie.poster_path}`}
          alt={`${movie.title} poster`}
          className={classes.picture}
        />
        <img
          src={`${BASE_TMDB_POSTER_URL}${person.profile_path}`}
          alt={`${person.name} poster`}
          className={classes.picture}
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
        >
          Yes
        </Button>
        <Button
          size="large"
          variant="contained"
          color="secondary"
          onClick={() => {
            onMakeAGuess(false);
          }}
          disabled={loading}
        >
          No
        </Button>
      </div>
    </div>
  );
}

export { Game };
