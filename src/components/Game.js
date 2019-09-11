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

async function getRoundData(setMovie, setPerson) {
  const shouldPickPersonFromCast = getRandomInt(2);
  const movie = await getRandPopularMovie();
  console.log(movie);
  setMovie(movie);
  const person = shouldPickPersonFromCast
    ? await getPerson(getRandomInt(movie.cast.length))
    : await getRandPopularPerson();
  console.log(person);
  setPerson(person);
}

function Game() {
  const [person, setPerson] = useState({});
  const [movie, setMovie] = useState({});
  function loadData() {
    getRoundData(setMovie, setPerson);
  }
  console.log(`${BASE_TMDB_POSTER_URL}${person.profile_path}`);
  return (
    <div>
      <h1>Game</h1>
      <img
        src={`${BASE_TMDB_POSTER_URL}${movie.poster_path}`}
        alt={`${movie.name} poster`}
      />
      <img
        src={`${BASE_TMDB_POSTER_URL}${person.profile_path}`}
        alt={`${movie.name} poster`}
      />
      <Button onClick={loadData}>Load fresh data</Button>
    </div>
  );
}

export { Game };
