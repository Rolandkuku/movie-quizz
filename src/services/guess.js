// @flow
import {
  saveGuess as dbSaveGuess,
  getGuessesFromRound as dbGetGuesses
} from "./firestore";
import type { Guess } from "../types";

async function saveGuess(
  roundId: string,
  lobbyId: string,
  guess: Guess,
  setLoading: boolean => any
) {
  setLoading(true);
  try {
    const newGuess = await dbSaveGuess({
      roundId,
      lobbyId,
      guess
    });
    setLoading(false);
    return newGuess;
  } catch (error) {
    setLoading(false);
    throw new Error(error);
  }
}

async function getGuesses(
  roundId: string,
  setGuesses: (Array<Guess>) => any,
  setLoading: boolean => any
) {
  setLoading(true);
  try {
    const guesses = await dbGetGuesses(roundId);
    setGuesses(guesses);
    setLoading(false);
    return guesses;
  } catch (error) {
    setLoading(false);
    throw new Error(error);
  }
}

export const guessServices = { saveGuess, getGuesses };
