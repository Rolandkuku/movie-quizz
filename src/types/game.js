// @flow
import type { Answer } from ".";

export type Game = {
  score: number,
  answers: Array<Answer>,
  timer: string
};
