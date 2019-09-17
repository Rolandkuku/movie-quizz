// @flow
import type { User, Guess, Round } from ".";

export type Lobby = {
  users: Array<User>,
  guesses: Array<Guess>,
  rounds: Array<Round>,
  gameId: string,
  master: string,
  date: string,
  lastRound: string
};
