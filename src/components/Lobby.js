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
  Button,
  Typography,
  makeStyles
} from "@material-ui/core";
import CheckRoundedIcon from "@material-ui/icons/CheckRounded";
import CloseRoundedIcon from "@material-ui/icons/CloseRounded";

import { listenForLobbyChanges, setUserReady } from "../services";
import type { Lobby as LobbyType, User } from "../types";

const useStyles = makeStyles(theme => ({
  button: {
    margin: theme.spacing(1)
  }
}));

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
  const classes = useStyles();
  const lobbyId = window.location.hash.split("/")[2];
  const [lobby, setLobby]: [LobbyType, any] = useState({
    users: []
  });
  const [loading] = useState(false);
  const unsubscribe = useRef(null);

  useEffect(() => {
    if (lobby && lobby.users && isEveryBodyReady(lobby.users)) {
      history.push(`/game/${lobbyId}`);
    }
  }, [lobbyId, history, userName, lobby]);

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

  const link = `${window.location.host}/#/?next=${lobbyId}`;

  const [btnLabel, setBtnLabel] = useState("Copy");

  return (
    <div>
      <h2>Lobby</h2>
      <Typography>
        {`Invite friends with this link: ${link}`}
        <Button
          className={classes.button}
          color="default"
          variant="contained"
          size="small"
          onClick={async () => {
            await navigator.clipboard.writeText(link);
            setBtnLabel("Copied");
          }}
        >
          {btnLabel}
        </Button>
      </Typography>
      <List subheader="Players">
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
                      color={user.ready ? "default" : "primary"}
                      disabled={loading}
                      variant="contained"
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
