// @flow
import React, { useState, useEffect, useRef } from "react";
import { withRouter, Link } from "react-router-dom";
import { TextField, Button, makeStyles, Typography } from "@material-ui/core";
import { createLobby, addUserToLobby } from "../services";

const useStyles = makeStyles(theme => ({
  title: {
    marginTop: "1em",
    textAlign: "center",
    fontWeight: "bold"
  },
  icon: {
    textAlign: "center",
    margin: theme.spacing(1)
  },
  form: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing(2),
    marginTop: theme.spacing(4)
  },
  buttonContainer: {
    padding: theme.spacing(2)
  },
  footer: {
    position: "fixed",
    bottom: "0px",
    padding: theme.spacing(2)
  },
  action: {
    margin: theme.spacing(1)
  }
}));

const icons = ["🦹🏿‍", "👨🏻‍🏭", "🕵️‍", "👨🏽‍🎤", "👨🏼‍🏫", "🧛🏻‍", "👩🏿‍🚒", "👩‍⚖️", "🧟‍", "👨‍💼"];

function getLobbyId() {
  const hash = window.location.hash;
  const start = hash.indexOf("next");
  if (start >= 0) {
    return hash.slice(start).split("=")[1];
  }
  return null;
}

function HomeComponent({ history, onSetUserName, userName, onUnsetUserName }) {
  const [userNameField, setUserNameField] = useState(userName);
  const [activeIcon, setActiveIcon] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const intervalId = useRef(null);
  const classes = useStyles();
  const lobbyId = getLobbyId();

  useEffect(() => {
    intervalId.current = setInterval(() => {
      if (activeIcon < icons.length - 1) {
        setActiveIcon(activeIcon + 1);
      } else {
        setActiveIcon(0);
      }
    }, 1000);
    return function cleanup() {
      clearInterval(intervalId.current);
    };
  }, [activeIcon]);

  async function onNameSubmit() {
    // TODO: factorize this.
    if (userNameField) {
      onSetUserName(userNameField);
      if (lobbyId) {
        try {
          await addUserToLobby(userNameField, lobbyId);
          history.push(`/lobby/${lobbyId}`);
        } catch (error) {
          setError(error);
        }
        setLoading(false);
      } else {
        try {
          setLoading(true);
          setError(null);
          const lobby = await createLobby(userNameField);
          history.push(`/lobby/${lobby.id}`);
        } catch (error) {
          setError(error);
        }
      }
    }
  }
  return (
    <div>
      <Typography
        className={classes.title}
        variant="h1"
        component="h1"
        gutterBottom
      >
        MOVIE QUIZZ
      </Typography>
      {error ? <Typography align="center">{error}</Typography> : null}
      <h1 className={classes.icon}>
        <span role="img" aria-label="movie icon">
          🎬
        </span>{" "}
        ?{" "}
        <span role="img" aria-label="movie icon">
          {icons[activeIcon]}
        </span>
      </h1>
      <form
        onSubmit={e => {
          e.preventDefault();
          onNameSubmit();
        }}
        className={classes.form}
      >
        {!userName ? (
          <TextField
            id="name"
            placeholder="Enter your name"
            value={userNameField || ""}
            onChange={e => {
              setUserNameField(e.target.value);
            }}
          />
        ) : (
          <Typography align="center">{`Hello ${userName}`}</Typography>
        )}
        <div className={classes.buttonContainer}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={() => onNameSubmit()}
            disabled={loading}
            className={classes.action}
          >
            {lobbyId ? "JOIN" : "PLAY !"}
          </Button>
        </div>
      </form>
      <div className={classes.footer}>
        <Link to="/scores">High scores</Link>
        {userName ? <Button onClick={onUnsetUserName}>Logout</Button> : null}
      </div>
    </div>
  );
}

const Home = withRouter(HomeComponent);

export { Home };
