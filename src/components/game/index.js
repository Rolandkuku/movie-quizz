// @flow
import React, { useState, useRef } from "react";
import { Typography, makeStyles, Grid } from "@material-ui/core";

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
  title: {
    marginBottom: theme.spacing(4)
  },
  gameHUD: {
    marginBottom: theme.spacing(2)
  }
}));

const emptyLobby = {
  users: [],
  rounds: [],
  guesses: [],
  nbRounds: 0,
  master: null
};

function canGuess(guesses = [], users, _userName, guessed, hasRounds) {
  if (!hasRounds || !users.length) {
    return false;
  }
  if (guessed) {
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
  const [lobby, setLobby] = useState(emptyLobby);
  const [loading, setLoading] = useState(false);
  const [guessed, setGuessed] = useState(false);
  const lobbyListener = useRef(null);
  const classes = useStyles();
  // Data for timer
  const intervalId = useRef(null);
  const [time, setTime] = useState(0);

  // Setup current round.
  const { rounds, users, guesses, nbRounds } = lobby;
  const currentRound = rounds[nbRounds - 1];
  const shouldEnableButtons =
    canGuess(
      guesses.filter(guess => guess.roundIndex === nbRounds),
      users,
      getName(),
      guessed,
      rounds.length > 0
    ) &&
    !loading &&
    !guessed;

  const checkGuessed = (guesses, nbRounds) => {
    setGuessed(
      guesses.filter(
        ({ userName, roundIndex }) =>
          userName === getName() && roundIndex === nbRounds
      ).length > 0
    );
  };

  // Save guess if correct.
  function onMakeAGuess(guess: boolean) {
    const userName = getName();
    setGuessed(true);
    if (
      !lobby.guesses
        .filter(guess => guess.roundIndex === lobby.nbRounds)
        .some(guess => guess.userName === userName)
    ) {
      const { nbRounds, rounds } = lobby;
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
          roundIndex: lobby.nbRounds
        },
        date
      );
    }
  }

  const getNextRound = async () => {
    setLoading(true);
    await roundServices.createNewRound(lobbyId, time);
    setLoading(false);
  };

  // Create a new round if needed.
  const checkForNewRound = lobby => {
    const { users, guesses, nbRounds } = lobby;
    const nbUsersAlive = users.filter(user => user.lives > 0).length;
    const nbGuesses = guesses.filter(guess => guess.roundIndex === nbRounds)
      .length;
    if (nbGuesses >= nbUsersAlive && users.length > 0 && guesses.length > 0) {
      getNextRound();
    }
  };

  // End game if needed
  const checkForEndGame = async lobby => {
    const { users } = lobby;
    const isMulti = users.length > 1;
    const playersAlive = users.filter(user => user.lives > 0);
    const nbPlayerAlive = playersAlive.length;
    if ((isMulti && nbPlayerAlive === 1) || (!isMulti && nbPlayerAlive === 0)) {
      const winner = isMulti ? playersAlive[0] : users[0];
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
      setLobby(newLobby);

      const { master, rounds, id, guesses, nbRounds } = newLobby;
      checkGuessed(guesses, nbRounds);
      const isMaster = master === getName();
      // Load first round if master.
      if (id && !rounds.length && isMaster) {
        getNextRound();
      }
      // Check for a new round if master
      if (rounds.length && isMaster) {
        checkForNewRound(newLobby);
      }
      // Always check for the end of the game.
      checkForEndGame(newLobby);
    });
  }

  // Timer logic
  if (!intervalId.current) {
    intervalId.current = setInterval(() => {
      setTime(t => t + 1);
    }, 1000);
  }

  return (
    <div>
      <Typography className={classes.title} variant="h2" align="center">
        Movie Quizz
      </Typography>
      <Grid container justify="center">
        <Grid item md={8}>
          <GuessAction
            round={currentRound}
            loading={loading}
            shouldEnableButtons={shouldEnableButtons}
            onMakeAGuess={onMakeAGuess}
          />
        </Grid>
        <Grid alignItems="center" item sm={8} md={4}>
          <div className={classes.gameHUD}>
            <Typography>
              Timer: <Timer>{time}</Timer>
            </Typography>
          </div>
          <Scores users={lobby.users} />
        </Grid>
      </Grid>
    </div>
  );
}

const Game = withRouter(GameComponent);

export { Game };
