// @flow
import moment from "moment";
import { getRandPopularMovie, getRandPopularPerson, createRound } from ".";
import { getRandomInt } from "../utils";
import type { Round } from "../types";

// We want to find a popular person that has a profile picture.
function getPersonFromCast(cast) {
  // Look for the most popular persons in cast.
  // TMDb gives them in order of popularity.
  const castMax = cast.length < 10 ? cast.length : 11;
  const importantPersons = cast.slice(0, castMax);
  let hasPicture = false;
  const isPictureInCast = importantPersons.some(
    person => person.profile_path !== null
  );
  // If at least on person among the 10 most popular ones has a picture.
  if (isPictureInCast) {
    // Initialize the person.
    let person = importantPersons[getRandomInt(castMax)];
    while (!hasPicture) {
      person = importantPersons[getRandomInt(castMax)];
      hasPicture = person.profile_path !== null;
    }
    return person;
  }
  return importantPersons[getRandomInt(castMax)];
}

async function createNewRound(lobbyId: string, timer: number) {
  try {
    const shouldPickPersonFromCast = getRandomInt(2);
    const movie = await getRandPopularMovie();
    const person = shouldPickPersonFromCast
      ? getPersonFromCast(movie.cast)
      : await getRandPopularPerson();
    const round: Round = {
      movie: {
        title: movie.title,
        poster_path: movie.poster_path,
        id: movie.id
      },
      person: {
        name: person.name,
        profile_path: person.profile_path,
        id: person.id
      },
      lobbyId,
      timer,
      timestamp: moment().format(),
      playsIn: movie.cast.some(({ id }) => person.id === id)
    };
    const lobby = await createRound(round);
    return lobby;
  } catch (e) {
    throw new Error(e);
  }
}

export const roundServices = { createNewRound };
