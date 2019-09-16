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
    setLobbyLoading(false);
    return lobby;
  } catch (error) {
    setLobbyLoading(false);
    throw new Error(error);
  }
}

export const lobbyServices = { getCurrentLobby };
