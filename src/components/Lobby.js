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

import {
  listenLobbyUserChanges,
  setUserReady,
  saveGame,
  updateLobby,
  lobbyServices
} from "../services";
import { makeFreshGame } from "../utils";
import type { Lobby as LobbyType, User } from "../types";

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

function isEveryBodyReady(users: Array<User>): boolean {
  return users.every(user => user.ready);
}

async function createGame(lobbyId: string, setLoading: boolean => any, cb) {
  setLoading(true);
  try {
    const game = await saveGame(makeFreshGame());
    await updateLobby(lobbyId, { gameId: game.id });
    cb();
    return game;
  } catch (e) {
    setLoading(false);
    throw new Error(e);
  }
}

function LobbyComponent({
  history,
  userName
}: {
  history: History,
  userName: string
}) {
  const lobbyId = window.location.hash.split("/")[2];
  const [lobby, setLobby]: [LobbyType, any] = useState(null);
  const [lobbyLoading, setLobbyLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const unsubscribe = useRef(null);

  useEffect(() => {
    if (lobby && isEveryBodyReady(lobby.users) && !loading) {
      if (lobby.master === userName) {
        createGame(lobbyId, setLoading, () => history.push(`/game/${lobbyId}`));
      }
      history.push(`/game/${lobbyId}`);
    }
  }, [lobby, lobbyId, loading, history, userName]);

  useEffect(() => {
    if (!unsubscribe.current) {
      unsubscribe.current = listenLobbyUserChanges(lobbyId, () => {
        lobbyServices.getCurrentLobby(setLobby, setLobbyLoading, lobbyId);
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

const Lobby = withRouter(LobbyComponent);

export { Lobby };
