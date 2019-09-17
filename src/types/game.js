// @flow
import type { Guess } from ".";

export type Game = {
  winner: string,
  user: string,
  score: string,
  time: number,
  guesses: Array<Guess>,
  date: string,
  lobbyId: string,
  +id: string
};
