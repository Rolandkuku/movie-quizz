// @flow
import React, { useState } from "react";
import { withRouter, Link } from "react-router-dom";
import { TextField, Button } from "@material-ui/core";

function HomeComponent({ history, onSetUserName }) {
  const [userName, setUserName] = useState("");
  function onNameSubmit() {
    if (userName) {
      onSetUserName(userName);
      history.push("/game");
    }
  }
  return (
    <div>
      <form
        onSubmit={e => {
          e.preventDefault();
          onNameSubmit();
        }}
      >
        <TextField
          id="name"
          value={userName}
          onChange={e => {
            setUserName(e.target.value);
          }}
        />
        <Button onClick={() => onNameSubmit()}>Go to game</Button>
      </form>
      <Link to="/scores">High scores</Link>
    </div>
  );
}

const Home = withRouter(HomeComponent);

export { Home };
