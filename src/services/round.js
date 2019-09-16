// @flow
import {
  getRound as getRoundFromDB,
  getRandPopularMovie,
  getPerson,
  getRandPopularPerson,
  createRound
} from ".";
import { getRandomInt } from "../utils";
import type { Round } from "../types";

async function getRound(
  setRound: Round => any,
  setLoading: boolean => any,
  roundId: string,
  lobbyId: string
) {
  try {
    setLoading(true);
    const round = await getRoundFromDB(roundId, lobbyId);
    setRound(round);
    setLoading(false);
    return round;
  } catch (error) {
    setLoading(false);
    throw new Error(error);
  }
}

async function createNewRound(
  setRound: Round => any,
  setLoading: boolean => any,
  setError: (null | string) => any,
  lobbyId: string,
  timer: number
) {
  setLoading(true);
  try {
    setError(null);
    const shouldPickPersonFromCast = getRandomInt(2);
    const movie = await getRandPopularMovie();
    const person = shouldPickPersonFromCast
      ? await getPerson(movie.cast[getRandomInt(movie.cast.length)])
      : await getRandPopularPerson();
    const round = {
      movie,
      person,
      lobbyId,
      playsIn: movie.cast.indexOf(person.id) !== -1,
      timer
    };
    await createRound(round);
    setRound(round);
  } catch (e) {
    setError(e);
  }
  setLoading(false);
}

export const roundServices = { getRound, createNewRound };
