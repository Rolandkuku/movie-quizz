// @flow
import React, { useEffect, useState, useRef, useCallback } from "react";
import { Typography, makeStyles } from "@material-ui/core";

import { withRouter } from "react-router-dom";

import { Timer } from "../ui";
import { GuessAction } from "./GuessAction";
import { Scores } from "./Scores";
import {
  getName,
  listenForLobbyChanges,
  roundServices,
  saveGame,
  saveGuess
} from "../../services";

const useStyles = makeStyles(theme => ({
  root: {
    display: "flex",
    justifyContent: "space-around"
  },
  title: {
    textAlign: "center"
  },
  gameHUD: {
    display: "flex",
    justifyContent: "space-between",
    padding: theme.spacing(2)
  }
}));

const emptyLobby = {
  users: [],
  rounds: [],
  guesses: [],
  nbRounds: 0,
  master: null
};

function canGuess(guesses = [], _userName, users) {
  if (!users) {
    return false;
  }
  if (guesses.filter(({ userName }) => userName === _userName).length) {
    return false;
  }
  const user = users.find(({ name }) => name === _userName);
  if (user && user.lives === 0) {
    return false;
  }
  return true;
}

function GameComponent({ history, onSaveCurrentGame }) {
  const lobbyId = window.location.hash.split("/")[2];
  if (!lobbyId) {
    history.push("/");
  }
  const lobby = useRef(emptyLobby);
  const loading = useRef(false);
  const lobbyListener = useRef(null);
  const classes = useStyles();
  // Data for timer
  const intervalId = useRef(null);
  const [time, setTime] = useState(0);

  // Setup current round.
  const { rounds, users, guesses, nbRounds } = lobby.current;
  const currentRound = rounds[nbRounds - 1];
  const shouldEnableButtons =
    canGuess(
      guesses.filter(guess => guess.roundIndex === nbRounds),
      getName(),
      users
    ) && !loading.current;

  // Save guess if correct.
  function onMakeAGuess(guess: boolean) {
    const userName = getName();
    if (
      !lobby.current.guesses
        .filter(guess => guess.roundIndex === lobby.current.nbRounds)
        .some(guess => guess.userName === userName)
    ) {
      const { nbRounds, rounds } = lobby.current;
      const round = rounds[nbRounds - 1];
      const { playsIn, date } = round;
      const guessedRight = guess === playsIn;
      saveGuess(
        lobbyId,
        {
          userName: getName(),
          guessedRight,
          movie: currentRound.movie,
          person: currentRound.person,
          playsIn,
          time,
          roundIndex: lobby.current.nbRounds
        },
        date
      );
    }
  }

  const getNextRound = async () => {
    loading.current = true;
    await roundServices.createNewRound(lobbyId, time);
    loading.current = false;
  };

  // Create a new round if needed.
  const checkForNewRound = () => {
    const { users, guesses, nbRounds } = lobby.current;
    const nbUsersAlive = users.filter(user => user.lives > 0).length;
    if (
      guesses.filter(guess => guess.roundIndex === nbRounds).length ===
        nbUsersAlive &&
      users.length > 0 &&
      guesses.length > 0
    ) {
      getNextRound();
    }
  };

  // End game if needed
  const checkForEndGame = async () => {
    const { users } = lobby.current;
    const isMulti = users.length > 1;
    const nbPlayerAlive = users.filter(user => user.lives > 0).length;
    if ((isMulti && nbPlayerAlive === 1) || (!isMulti && nbPlayerAlive === 0)) {
      const winner = isMulti ? users.find(user => user.lives > 0) : users[0];
      const user = users.find(user => user.name === getName());
      if (winner && user) {
        const game = await saveGame({
          winner: winner.name,
          user: user.name,
          score: user.score,
          time,
          lobbyId
        });
        history.push(`/game-resume/${game.id}`);
      }
    }
  };

  // Load initial data && manage the game upon lobby changes.
  if (!lobbyListener.current) {
    lobbyListener.current = listenForLobbyChanges(lobbyId, newLobby => {
      // Update ui as soon as possible.
      console.log(newLobby);
      const { master, rounds, id } = newLobby;
      lobby.current = newLobby;
      const isMaster = lobby.current && master === getName();
      // Load first round if master.
      if (id && !rounds.length && isMaster) {
        getNextRound();
      }
      // Check for a new round if master
      if (rounds.length && isMaster) {
        checkForNewRound();
      }
      // Always check for the end of the game.
      checkForEndGame();
    });
  }

  // Timer logic
  useEffect(() => {
    if (!intervalId.current) {
      intervalId.current = setInterval(() => {
        setTime(t => t + 1);
      }, 1000);
    }
  });

  return (
    <div>
      <div className={classes.gameHUD}>
        <Typography variant="h3">
          <Timer>{time}</Timer>
        </Typography>
      </div>
      <div className={classes.root}>
        <GuessAction
          round={currentRound}
          loading={loading.current}
          shouldEnableButtons={shouldEnableButtons}
          onMakeAGuess={onMakeAGuess}
        />
        <Scores users={lobby.current.users} />
      </div>
    </div>
  );
}

const Game = withRouter(GameComponent);

export { Game };
