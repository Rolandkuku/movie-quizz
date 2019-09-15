// @flow
import type { Answer } from ".";

export type Game = {
  score: number,
  answers: Array<Answer>,
  timer: string,
  winner: string,
  date: string,
  +id: string
};
