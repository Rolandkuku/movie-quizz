// @flow
import type { Answer } from ".";

export type Game = {
  score: number,
  answers: Array<Answer>,
  timer: string,
  userName: string,
  date: string,
  +id: string
};
