import axios from "axios";
import { BASE_TMDB_URL, TMDB_API_KEY } from "../config/constants";
import { getRandomInt } from "../utils";

export * from "./firestore";
export * from "./local";
export { lobbyServices } from "./lobby";
export { roundServices } from "./round";
export { guessServices } from "./guesse";
export * from "./listeners";

const buildGet = async url =>
  axios.get(
    `${BASE_TMDB_URL}${url}${
      url.indexOf("?") === -1 ? "?" : "&"
    }api_key=${TMDB_API_KEY}`
  );

async function getRandPopularMovie() {
  try {
    // Getting a random popular movie from the 5 firs pages.
    const popularMovies = await buildGet(
      `movie/popular?page=${getRandomInt(5) + 1}`
    );
    const results = popularMovies.data.results;
    const movie = results[getRandomInt(results.length)];
    movie.cast = [];
    // Adding cast ids
    const credits = await buildGet(`movie/${movie.id}/credits`);
    const cast = credits.data.cast;
    for (let person of cast) {
      movie.cast.push(person.id);
    }
    return movie;
  } catch (error) {
    throw new Error(error);
  }
}

async function getRandPopularPerson() {
  try {
    // Getting a random popular person from the 5 firs pages.
    const popularPerson = await buildGet(
      `person/popular?page=${getRandomInt(5) + 1}`
    );
    const results = popularPerson.data.results;
    return results[getRandomInt(results.length)];
  } catch (error) {
    throw new Error(error);
  }
}

async function getPerson(id) {
  try {
    const person = await buildGet(`person/${id}`);
    return person.data;
  } catch (error) {
    throw new Error(error);
  }
}

export { getRandPopularMovie, getRandPopularPerson, getPerson };
