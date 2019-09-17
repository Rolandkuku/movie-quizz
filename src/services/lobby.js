// @flow
import { getLobby } from ".";
import type { Lobby } from "../types";

async function getCurrentLobby(lobbyId: string): Promise<Lobby> {
  try {
    const lobby = await getLobby(lobbyId);
    return lobby;
  } catch (error) {
    throw new Error(error);
  }
}

export const lobbyServices = { getCurrentLobby };
