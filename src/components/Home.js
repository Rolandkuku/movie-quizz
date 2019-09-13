// @flow
import React, { useState } from "react";
import { withRouter } from "react-router-dom";
import { TextField, Button } from "@material-ui/core";

function HomeComponent({ history }) {
  const [userName, setUserName] = useState("");
  function onNameSubmit() {
    if (userName) {
      history.push("/game", { userName });
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
    </div>
  );
}

const Home = withRouter(HomeComponent);

export { Home };
