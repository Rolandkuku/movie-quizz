// @flow
import { Game } from "../types";
function getRandomInt(max: number) {
  return Math.floor(Math.random() * Math.floor(max));
}

const makeFreshGame: () => Game = () => ({
  score: 0,
  timer: 0,
  answers: [],
  userName: null
});

export { getRandomInt, makeFreshGame };
