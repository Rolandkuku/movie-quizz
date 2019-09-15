// @flow
import React, { useState, useEffect, useRef } from "react";
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

import { getLobby, listenLobbyUserChanges, setUserReady } from "../services";
import type { Lobby as LobbyType } from "../types";

async function getCurrentLobby(setLobby, setLobbyLoading, lobbyId) {
  try {
    setLobbyLoading(true);
    const lobby = await getLobby(lobbyId);
    setLobby(lobby);
  } catch (error) {
    throw new Error(error);
  }
  setLobbyLoading(false);
}

async function setReady(
  lobbyId: string,
  userId: string,
  ready: boolean,
  setLoading: boolean => any
) {
  try {
    setLoading(true);
    await setUserReady(lobbyId, userId, ready);
  } catch (error) {
    throw new Error(error);
  }
  setLoading(false);
}

function Lobby({ history, userName }: { history: History, userName: string }) {
  const lobbyId = window.location.hash.split("/")[2];
  const [lobby, setLobby]: [LobbyType, any] = useState(null);
  const [lobbyLoading, setLobbyLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const unsubscribe = useRef(null);

  useEffect(() => {
    if (!unsubscribe.current) {
      unsubscribe.current = listenLobbyUserChanges(lobbyId, () => {
        getCurrentLobby(setLobby, setLobbyLoading, lobbyId);
      });
      return unsubscribe.current;
    }
  }, [lobbyId]);

  function onSetReady(userId: string, ready: boolean) {
    setReady(lobbyId, userId, ready, setLoading);
  }

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
                {userName === user.name ? (
                  <ListItemSecondaryAction>
                    <Button
                      color="primary"
                      disabled={loading}
                      onClick={() => onSetReady(user.id, !user.ready)}
                    >
                      {user.ready ? "Not ready" : "Go !"}
                    </Button>
                  </ListItemSecondaryAction>
                ) : null}
              </ListItem>
            ))
          : null}
      </List>
    </div>
  );
}

export { Lobby };
