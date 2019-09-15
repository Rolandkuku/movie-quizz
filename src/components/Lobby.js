// @flow
import React, { useState, useEffect } from "react";
import type { History } from "react-router-dom";

import { getLobby } from "../services";
import type { Lobby as LobbyType } from "../types";

const lobbyId = window.location.hash.split("/")[2];

async function getCurrentLobby(setLobby) {
  try {
    const lobby = await getLobby(lobbyId);
    setLobby(lobby);
  } catch (error) {
    throw new Error(error);
  }
}

function Lobby({ history }: { history: History }) {
  const [lobby, setLobby]: [LobbyType, any] = useState(null);
  useEffect(() => {
    if (!lobby) {
      getCurrentLobby(setLobby);
    }
  }, [lobby]);
  return (
    <div>
      <p>
        Lobby invite friends with this link:{" "}
        {`${window.location.host}/#/?next=${lobbyId}`}
      </p>
      {lobby ? lobby.users.map(user => <p>{user.name}</p>) : null}
    </div>
  );
}

export { Lobby };
