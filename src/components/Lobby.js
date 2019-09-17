// @flow
import React, { useState, useEffect, useRef } from "react";
import { withRouter } from "react-router-dom";
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

import { listenForLobbyChanges, setUserReady } from "../services";
import type { Lobby as LobbyType, User } from "../types";

async function setReady(lobbyId: string, userId: string, ready: boolean) {
  try {
    await setUserReady(lobbyId, userId, ready);
  } catch (error) {
    throw new Error(error);
  }
}

function isEveryBodyReady(users: Array<User>): boolean {
  return users.length > 0 && users.every(user => user.ready);
}

function LobbyComponent({
  history,
  userName
}: {
  history: History,
  userName: string
}) {
  const lobbyId = window.location.hash.split("/")[2];
  const [lobby, setLobby]: [LobbyType, any] = useState({
    users: []
  });
  const [loading, setLoading] = useState(false);
  const unsubscribe = useRef(null);

  useEffect(() => {
    if (lobby && lobby.users && isEveryBodyReady(lobby.users) && !loading) {
      history.push(`/game/${lobbyId}`);
    }
  }, [lobbyId, loading, history, userName, lobby]);

  useEffect(() => {
    if (!unsubscribe.current) {
      unsubscribe.current = listenForLobbyChanges(lobbyId, newLobby => {
        setLobby(newLobby);
      });
      return unsubscribe.current;
    }
  }, [lobbyId]);

  function onSetReady(userId: string, ready: boolean) {
    setReady(lobbyId, userName, ready);
  }

  return (
    <div>
      <p>
        Lobby invite friends with this link:{" "}
        {`${window.location.host}/#/?next=${lobbyId}`}
      </p>
      <List>
        {lobby.users
          ? lobby.users.map(user => (
              <ListItem key={user.name}>
                <ListItemIcon>
                  {user.ready ? <CheckRoundedIcon /> : <CloseRoundedIcon />}
                </ListItemIcon>
                <ListItemText primary={user.name} />
                {userName === user.name ? (
                  <ListItemSecondaryAction>
                    <Button
                      color="primary"
                      disabled={loading}
                      onClick={() => onSetReady(user.name, !user.ready)}
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

const Lobby = withRouter(LobbyComponent);

export { Lobby };
