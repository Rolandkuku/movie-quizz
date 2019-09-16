// @flow
import { getLobby } from ".";
import type { Lobby } from "../types";

async function getCurrentLobby(
  setLobby: Lobby => any,
  setLobbyLoading: boolean => any,
  lobbyId: string
) {
  try {
    setLobbyLoading(true);
    const lobby = await getLobby(lobbyId);
    setLobby(lobby);
  } catch (error) {
    throw new Error(error);
  }
  setLobbyLoading(false);
}

export const lobbyServices = { getCurrentLobby };
