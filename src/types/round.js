// @flow
import type { Guess } from ".";

export type Round = {
  person: {
    name: string,
    picture: string,
    id: number
  },
  movie: {
    id: number,
    poster: string,
    name: string
  },
  playsIn: boolean,
  timer: boolean,
  guesses: Array<Guess>,
  nbRounds: number,
  +id: string
};
