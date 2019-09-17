// @flow
import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  Button,
  Typography,
  makeStyles,
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableHead
} from "@material-ui/core";
import CheckRoundedIcon from "@material-ui/icons/CheckRounded";
import CloseRoundedIcon from "@material-ui/icons/CloseRounded";

import { withRouter } from "react-router-dom";

import { Timer, Poster } from ".";
import {
  getName,
  listenForLobbyChanges,
  roundServices,
  saveGame,
  saveGuess
} from "../services";

const useStyles = makeStyles(theme => ({
  root: {
    display: "flex",
    justifyContent: "space-around"
  },
  title: {
    textAlign: "center"
  },
  picturesContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center"
  },
  actionsContainer: {
    display: "flex",
    flexDirection: "row",
    padding: theme.spacing(2),
    justifyContent: "center"
  },
  action: {
    margin: theme.spacing(2)
  },
  gameHUD: {
    display: "flex",
    justifyContent: "space-between",
    padding: theme.spacing(2)
  }
}));

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
  const [lobby, setLobby] = useState({
    users: [],
    rounds: [],
    guesses: [],
    nbRounds: 0,
    master: null
  });
  const [lobbyLoading, setLobbyLoading] = useState(false);
  const lobbyListener = useRef(null);
  const classes = useStyles();
  // Data for timer
  const intervalId = useRef(null);
  const [time, setTime] = useState(0);

  const { rounds, users, guesses, nbRounds } = lobby;
  const currentRound = rounds[nbRounds - 1];
  const shouldEnableButtons = canGuess(
    guesses.filter(guess => guess.roundIndex === nbRounds),
    getName(),
    users
  );

  // Save guess if correct.
  async function onMakeAGuess(guess: boolean) {
    const userName = getName();
    if (
      !lobby.guesses
        .filter(guess => guess.roundIndex === lobby.nbRounds)
        .some(guess => guess.userName === userName)
    ) {
      const round = lobby.rounds[0];
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

  const getNextRound = useCallback(async () => {
    await roundServices.createNewRound(lobbyId, time);
  }, [lobbyId, time]);

  const checkForNewRound = useCallback(
    async lobby => {
      const { users, guesses, nbRounds } = lobby;
      const nbUsersAlive = users.filter(user => user.lives > 0).length;
      if (
        guesses.filter(guess => guess.roundIndex === nbRounds).length ===
          nbUsersAlive &&
        users.length > 0 &&
        guesses.length > 0
      ) {
        return getNextRound();
      }
    },
    [getNextRound]
  );

  const checkForEndGame = useCallback(
    async lobby => {
      const { users } = lobby;
      const isMulti = users.length > 1;
      const nbPlayerAlive = users.filter(user => user.lives > 0).length;
      if (
        (isMulti && nbPlayerAlive === 1) ||
        (!isMulti && nbPlayerAlive === 0)
      ) {
        const winner = isMulti ? users.find(user => user.lives > 0) : users[0];
        const user = users.find(user => user.name === getName());
        const game = await saveGame({
          winner: winner.name,
          user: user.name,
          score: user.score,
          time,
          lobbyId
        });
        history.push(`/game-resume/${game.id}`);
      }
    },
    [history, lobbyId, time]
  );

  // Load initial data.
  useEffect(() => {
    let loading = false;
    if (!lobby.id) {
      if (!lobbyListener.current) {
        lobbyListener.current = listenForLobbyChanges(
          lobbyId,
          async newLobby => {
            setLobby(newLobby);
            const isMaster = newLobby.master === getName();
            if (
              newLobby.id &&
              !newLobby.rounds.length &&
              !loading &&
              isMaster
            ) {
              loading = true;
              setLobbyLoading(true);
              await getNextRound();
              setLobbyLoading(false);
              loading = false;
            }
            if (!loading && newLobby.rounds.length && isMaster) {
              loading = true;
              setLobbyLoading(true);
              await checkForNewRound(newLobby);
              setLobbyLoading(false);
              loading = false;
            }
            checkForEndGame(newLobby);
          }
        );
      }
    }
  });

  // Timer logic
  useEffect(() => {
    if (!intervalId.current) {
      intervalId.current = setInterval(() => {
        setTime(t => t + 1);
      }, 1000);
    }
  });

  const renderLives = nbLives => {
    const hearts = [];
    for (var i = 0; i < nbLives; i++) {
      hearts.push("❤️");
    }
    return hearts;
  };

  return (
    <div>
      <div className={classes.gameHUD}>
        <Typography variant="h3">
          <Timer>{time}</Timer>
        </Typography>
      </div>
      <div className={classes.root}>
        <div>
          <div className={classes.picturesContainer}>
            <Poster
              loading={lobbyLoading}
              path={currentRound ? currentRound.person.profile_path : null}
              name={currentRound ? currentRound.person.name : null}
            />
            <Typography variant="h2">?</Typography>
            <Poster
              loading={lobbyLoading}
              path={currentRound ? currentRound.movie.poster_path : null}
              name={currentRound ? currentRound.movie.title : null}
            />
          </div>
          <div className={classes.actionsContainer}>
            <Button
              disabled={!shouldEnableButtons}
              size="large"
              variant="contained"
              color="primary"
              onClick={() => {
                if (!lobbyLoading) {
                  onMakeAGuess(true);
                }
              }}
              className={classes.action}
            >
              <CheckRoundedIcon />
            </Button>
            <Button
              size="large"
              variant="contained"
              color="secondary"
              onClick={() => {
                if (!lobbyLoading) {
                  onMakeAGuess(false);
                }
              }}
              disabled={!shouldEnableButtons}
              className={classes.action}
            >
              <CloseRoundedIcon />
            </Button>
          </div>
        </div>
        <div>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Player</TableCell>
                <TableCell>Score</TableCell>
                <TableCell>Lives</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {lobby.users
                ? lobby.users.map(user => (
                    <TableRow key={user.name}>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.score}</TableCell>
                      <TableCell>{renderLives(user.lives)}</TableCell>
                    </TableRow>
                  ))
                : null}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

const Game = withRouter(GameComponent);

export { Game };
