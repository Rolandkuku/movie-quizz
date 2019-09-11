// @flow
import axios from "axios";
import type { Movie } from "../types/";
import { BASE_TMDB_URL, TMDB_API_KEY } from "../config/constants";

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

const appendKey = url =>
  `${url}${url.indexOf("?") === -1 ? "?" : "&"}api_key=${TMDB_API_KEY}`;

async function getRandPopularMovie(): Promise<Movie> {
  try {
    const popularMovies = await axios.get(
      appendKey(`${BASE_TMDB_URL}movie/popular?page=${getRandomInt(5) + 1}`)
    );
    console.log(popularMovies);
    const results = popularMovies.data.results;
    console.log(results[getRandomInt(results.length)]);
    return results[getRandomInt(results.length)];
  } catch (error) {
    throw new Error(error);
  }
}

export { getRandPopularMovie };
