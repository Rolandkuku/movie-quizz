import React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import { makeStyles } from "@material-ui/styles";
import "react-virtualized/styles.css";

import { Game, Home, GameResume } from "./";
import "../styles/App.css";

const { innerHeight } = window;

const useStyles = makeStyles({
  root: {
    background: "linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)",
    color: "white",
    padding: "1em",
    position: "relative",
    minHeight: innerHeight
  }
});

function App() {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <Router>
        <Route path="/" exact component={Home} />
        <Route path="/game" component={Game} />
        <Route path="/game-resume" component={GameResume} />
      </Router>
    </div>
  );
}

export { App };
