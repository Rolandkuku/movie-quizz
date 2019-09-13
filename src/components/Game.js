// @flow
import React, { useEffect, useState } from "react";
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
import type { Answer, Game as GameType } from "../types";

const { innerHeight } = window;
console.log(innerHeight);

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

async function getRoundData(setMovie, setPerson, setPlaysIn) {
  const shouldPickPersonFromCast = getRandomInt(2);
  const movie = await getRandPopularMovie();
  console.log(movie);
  setMovie(movie);
  const person = shouldPickPersonFromCast
    ? await getPerson(movie.cast[getRandomInt(movie.cast.length)])
    : await getRandPopularPerson();
  console.log(person);
  setPerson(person);
  setPlaysIn(movie.cast.indexOf(person.id) !== -1);
}

function Game() {
  const [person, setPerson] = useState({});
  const [movie, setMovie] = useState({});
  const [playsIn, setPlaysIn] = useState(false);
  const classes = useStyles();
  function loadData() {
    getRoundData(setMovie, setPerson, setPlaysIn);
  }
  useEffect(() => {
    if (!movie.id && !person.id) {
      loadData();
    }
  });
  return (
    <div className={classes.root}>
      <h1>Game</h1>
      <h2>Plays in: {playsIn ? "yes" : "no"}</h2>
      <Timer running />
      <Button onClick={loadData}>Load fresh data</Button>
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
        <Button size="large" variant="contained" color="primary">
          Yes
        </Button>
        <Button size="large" variant="contained" color="secondary">
          No
        </Button>
      </div>
    </div>
  );
}

export { Game };
