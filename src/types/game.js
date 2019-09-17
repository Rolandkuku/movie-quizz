// @flow
import type { Answer } from ".";

export type Game = {
  winner: string,
  score: string,
  time: number,
  date: string,
  +id: string
};
