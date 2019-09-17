// @flow
import { saveGuess as dbSaveGuess } from "./firestore";
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

export const guessServices = { saveGuess };
