// @flow
import React, { useEffect, useState } from "react";
import Button from "@material-ui/core/Button";

import {
  getRandPopularMovie,
  getRandPopularPerson,
  getPerson
} from "../services/index";
import { getRandomInt } from "../utils";
import { BASE_TMDB_POSTER_URL } from "../config/constants";

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
  function loadData() {
    getRoundData(setMovie, setPerson, setPlaysIn);
  }
  return (
    <div>
      <h1>Game</h1>
      <h2>Plays in: {playsIn ? "yes" : "no"}</h2>
      <Button onClick={loadData}>Load fresh data</Button>
      <img
        src={`${BASE_TMDB_POSTER_URL}${movie.poster_path}`}
        alt={`${movie.name} poster`}
      />
      <img
        src={`${BASE_TMDB_POSTER_URL}${person.profile_path}`}
        alt={`${movie.name} poster`}
      />
    </div>
  );
}

export { Game };
