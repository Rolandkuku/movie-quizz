// @flow
import moment from "moment";
import type { Game, Answer } from "../types";

function getRandomInt(max: number) {
  return Math.floor(Math.random() * Math.floor(max));
}

const makeFreshGame: () => Game = () => ({
  score: 0,
  timer: 0,
  answers: [],
  winner: null,
  date: moment().format()
});

export { getRandomInt, makeFreshGame };
