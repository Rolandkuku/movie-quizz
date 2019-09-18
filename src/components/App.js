import React, { useState, useEffect } from "react";
import { HashRouter as Router, Route } from "react-router-dom";
import { makeStyles } from "@material-ui/styles";
import { Container } from "@material-ui/core";

import { Home, GameResume, Scores, Lobby } from "./";
import { Game } from "./game/";
import "../styles/App.css";
import { setName as setLocalName, getName, unsetName } from "../services";

const useStyles = makeStyles(theme => ({
  root: {
    color: "white",
    padding: "1em",
    position: "relative"
  },
  gradientBackground: {
    background: "linear-gradient(45deg, #7986cb 30%, #ff4081 90%)",
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    position: "fixed"
  }
}));

function App() {
  const classes = useStyles();
  const [userName, setUserName] = useState(null);

  useEffect(() => {
    if (!userName) {
      setUserName(getName());
    }
  }, [userName]);

  const onUnsetUserName = () => {
    setUserName(null);
    unsetName();
  };

  const onSetUserName = userName => {
    setUserName(userName);
    setLocalName(userName);
  };
  return (
    <Container>
      <div className={classes.gradientBackground} />
      <div className={classes.root}>
        <Router>
          <Route
            path="/"
            exact
            component={() => (
              <Home
                userName={userName}
                onUnsetUserName={onUnsetUserName}
                onSetUserName={onSetUserName}
              />
            )}
          />
          <Route path="/game/:id" component={Game} />
          <Route path="/game-resume/:id" component={GameResume} />
          <Route path="/scores" component={Scores} />
          <Route path="/lobby/:id" component={Lobby} />
        </Router>
      </div>
    </Container>
  );
}

export { App };
