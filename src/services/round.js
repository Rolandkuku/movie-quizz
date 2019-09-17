// @flow
import moment from "moment";
import {
  getRound as getRoundFromDB,
  getRandPopularMovie,
  getRandPopularPerson,
  createRound
} from ".";
import { getRandomInt } from "../utils";
import type { Round, Lobby } from "../types";

async function createNewRound(lobbyId: string, timer: number) {
  try {
    const shouldPickPersonFromCast = getRandomInt(2);
    const movie = await getRandPopularMovie();
    const person = shouldPickPersonFromCast
      ? await movie.cast[getRandomInt(movie.cast.length)]
      : await getRandPopularPerson();
    const round: Round = {
      movie,
      person,
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
