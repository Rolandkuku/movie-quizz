// @flow
import { getRound as getRoundFromDB } from ".";
import type { Round } from "../types";

async function getRound(
  setRound: Round => any,
  setLoading: boolean => any,
  roundId: string,
  lobbyId: string
) {
  try {
    setLoading(true);
    const round = await getRoundFromDB(roundId, lobbyId);
    setRound(round);
  } catch (error) {
    throw new Error(error);
  }
  setLoading(false);
}

export const roundServices = { getRound };
