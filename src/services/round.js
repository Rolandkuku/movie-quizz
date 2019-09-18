// @flow
import moment from "moment";
import { getRandPopularMovie, getRandPopularPerson, createRound } from ".";
import { getRandomInt } from "../utils";
import type { Round } from "../types";

async function createNewRound(lobbyId: string, timer: number) {
  try {
    const shouldPickPersonFromCast = getRandomInt(2);
    const movie = await getRandPopularMovie();
    const person = shouldPickPersonFromCast
      ? movie.cast[getRandomInt(10)]
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
