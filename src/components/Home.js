// @flow
import React, { useState, useEffect, useRef } from "react";
import { withRouter, Link } from "react-router-dom";
import { TextField, Button, makeStyles, Typography } from "@material-ui/core";

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
  }
}));

function HomeComponent({ history, onSetUserName }) {
  const [userName, setUserName] = useState("");
  const [activeIcon, setActiveIcon] = useState(0);
  const intervalId = useRef(null);
  const icons = [
    "🦹🏿‍",
    "👨🏻‍🏭",
    "🕵️‍",
    "👨🏽‍🎤",
    "👨🏼‍🏫",
    "🧛🏻‍",
    "👩🏿‍🚒",
    "👩‍⚖️",
    "🧟‍",
    "👨‍💼"
  ];
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
  }, [activeIcon, icons.length]);
  const classes = useStyles();
  function onNameSubmit() {
    if (userName) {
      onSetUserName(userName);
      history.push("/game");
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
      <Typography className={classes.icon} variant="h1" component="h2">
        <span role="img" aria-label="movie icon">
          🎬
        </span>{" "}
        ?{" "}
        <span role="img" aria-label="movie icon">
          {icons[activeIcon]}
        </span>
      </Typography>
      <form
        onSubmit={e => {
          e.preventDefault();
          onNameSubmit();
        }}
        className={classes.form}
      >
        <TextField
          id="name"
          placeholder="Enter your name"
          value={userName}
          onChange={e => {
            setUserName(e.target.value);
          }}
        />
        <div className={classes.buttonContainer}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={() => onNameSubmit()}
          >
            PLAY !
          </Button>
        </div>
      </form>
      <div className={classes.footer}>
        <Link to="/scores">High scores</Link>
      </div>
    </div>
  );
}

const Home = withRouter(HomeComponent);

export { Home };
