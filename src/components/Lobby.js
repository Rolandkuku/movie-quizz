// @flow
import React, { useState, useEffect } from "react";
import type { History } from "react-router-dom";
import {
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Button
} from "@material-ui/core";
import CheckRoundedIcon from "@material-ui/icons/CheckRounded";
import CloseRoundedIcon from "@material-ui/icons/CloseRounded";

import { getLobby, listenLobbyUserChanges } from "../services";
import type { Lobby as LobbyType } from "../types";

async function getCurrentLobby(setLobby, lobbyId) {
  try {
    const lobby = await getLobby(lobbyId);
    setLobby(lobby);
  } catch (error) {
    throw new Error(error);
  }
}

function Lobby({ history }: { history: History }) {
  const lobbyId = window.location.hash.split("/")[2];
  const [lobby, setLobby]: [LobbyType, any] = useState(null);
  useEffect(() => {
    if (!lobby) {
      getCurrentLobby(setLobby, lobbyId);
    }
  }, [lobby, lobbyId]);
  useEffect(() => {
    const unsubscribe = listenLobbyUserChanges(lobbyId, users =>
      setLobby({ ...lobby, users })
    );
    return unsubscribe;
  }, [lobbyId, lobby]);
  return (
    <div>
      <p>
        Lobby invite friends with this link:{" "}
        {`${window.location.host}/#/?next=${lobbyId}`}
      </p>
      <List>
        {lobby
          ? lobby.users.map(user => (
              <ListItem key={user.id}>
                <ListItemIcon>
                  {user.ready ? <CheckRoundedIcon /> : <CloseRoundedIcon />}
                </ListItemIcon>
                <ListItemText primary={user.name} />
                <ListItemSecondaryAction>
                  <Button color="primary" onClick={() => {}}>
                    Ready
                  </Button>
                </ListItemSecondaryAction>
              </ListItem>
            ))
          : null}
      </List>
    </div>
  );
}

export { Lobby };
