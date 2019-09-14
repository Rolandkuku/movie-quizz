import React, { useState } from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import { makeStyles } from "@material-ui/styles";

import { Game, Home, GameResume, Scores } from "./";
import "../styles/App.css";

const { innerHeight } = window;

const useStyles = makeStyles({
  root: {
    background: "linear-gradient(45deg, #7986cb 30%, #ff4081 90%)",
    color: "white",
    padding: "1em",
    position: "relative",
    minHeight: innerHeight
  }
});

function App() {
  const classes = useStyles();
  const [userName, setUserName] = useState(null);
  return (
    <div className={classes.root}>
      <Router>
        <Route
          path="/"
          exact
          component={() => (
            <Home
              userName={userName}
              onSetUserName={name => setUserName(name)}
            />
          )}
        />
        <Route path="/game" component={() => <Game userName={userName} />} />
        <Route
          path="/game-resume"
          component={() => <GameResume userName={userName} />}
        />
        <Route path="/scores" component={Scores} />
      </Router>
    </div>
  );
}

export { App };
