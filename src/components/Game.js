// @flow
import React, { useEffect, useState, useRef } from "react";
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
  lobbyServices,
  getName,
  listenToCreateRound,
  listenToGuesses,
  roundServices,
  guessServices,
  userServices,
  saveGame
} from "../services";

const useStyles = makeStyles(theme => ({
  root: {
    display: "flex",
    justifyContent: "space-between"
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

function canGuess(guesses, _userName, users) {
  if (!guesses || !users) {
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

function GuessStatus({ guesses, name }) {
  const guess = guesses.filter(({ userName }) => userName === name)[0];
  if (!guess) {
    return <span>Guessing</span>;
  }
  return <span>{guess.guessedRight ? "so good" : "so bad"}</span>;
}

function GameComponent({ history, onSaveCurrentGame }) {
  const lobbyId = window.location.hash.split("/")[2];
  if (!lobbyId) {
    history.push("/");
  }
  const [userName, setUserName] = useState(null);
  const [users, setUsers] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lobby, setLobby] = useState(null);
  const [roundLoading, setRoundLoading] = useState(false);
  const [round, setRound] = useState({
    movie: {},
    person: {},
    playsIn: false
  });
  const [guesses, setGuesses] = useState([]);
  const isMaster = useRef(false);
  const guessesListener = useRef(null);
  const classes = useStyles();
  // Data for timer
  const intervalId = useRef(null);
  const [time, setTime] = useState(0);

  const endGame = async (user, winner) => {
    const game = await saveGame({
      winner: winner.name,
      user: user.name,
      score: user.score,
      time,
      lobbyId
    });
    history.push(`/game-resume/${game.id}`);
  };

  const checkForNewRound = async (guesses, users) => {
    if (users && guesses) {
      const nbUsersAlive = users.filter(user => user.lives > 0).length;
      const shouldCreateNextRound = guesses.length >= nbUsersAlive;
      const isMulti = users.length > 1;
      const shouldEndGame =
        (isMulti && nbUsersAlive === 1) || (!isMulti && nbUsersAlive === 0);
      if (shouldEndGame) {
        const name = getName();
        endGame(
          users.find(user => user.name === name),
          isMulti ? users.find(user => user.lives > 0) : users[0]
        );
      } else if (isMaster.current && shouldCreateNextRound && !roundLoading) {
        const newRound = await roundServices.createNewRound(
          setRound,
          setRoundLoading,
          setError,
          lobbyId,
          time
        );
        createGuessesListener(newRound.id);
      }
    }
  };

  const createGuessesListener = async roundId => {
    if (guessesListener.current) {
      guessesListener.current();
      guessesListener.current = null;
    }
    if (lobbyId && roundId && !guessesListener.current) {
      guessesListener.current = listenToGuesses(roundId, async () => {
        const guesses = await guessServices.getGuesses(
          roundId,
          setGuesses,
          setLoading
        );
        const users = await userServices.getUsers(
          lobbyId,
          setUsers,
          setLoading
        );
        checkForNewRound(guesses, users);
      });
    }
  };

  // Load initial data.
  const loadData = async () => {
    // Load userName
    let name;
    if (!userName) {
      name = await getName();
      if (!name) {
        history.push("/");
      } else {
        setUserName(name);
      }
    }
    // Load lobby
    const lobby = await lobbyServices.getCurrentLobby(
      setLobby,
      setLoading,
      lobbyId
    );
    isMaster.current = lobby.master === name;
    let round;
    if (lobby.lastRound) {
      // If round, load it
      round = await roundServices.getRound(
        setRound,
        setRoundLoading,
        lobby.lastRound,
        lobbyId
      );
    } else if (isMaster.current) {
      // Else, if master, create a new one.
      round = await roundServices.createNewRound(
        setRound,
        setRoundLoading,
        setError,
        lobbyId,
        time
      );
    }

    // Load guesses
    if (round && round.id) {
      await guessServices.getGuesses(round.id, setGuesses, setLoading);
      createGuessesListener(round.id);
    }

    // Load users
    await userServices.getUsers(lobbyId, setUsers, setLoading);
  };

  // Save guess if correct.
  async function onMakeAGuess(guess: boolean) {
    const { playsIn, movie, person } = round;
    const guessedRight = guess === playsIn;
    if (round.id && lobbyId) {
      await guessServices.saveGuess(
        round.id,
        lobbyId,
        { guessedRight, userName, playsIn, movie, person, lobbyId, time },
        setLoading
      );
      // Update data and listen for future changes.
      const [guesses, users] = await Promise.all([
        guessServices.getGuesses(round.id, setGuesses, setLoading),
        userServices.getUsers(lobbyId, setUsers, setLoading)
      ]);
      checkForNewRound(guesses, users);
    }
  }

  // Load initial data.
  useEffect(() => {
    if (
      !userName &&
      !round.id &&
      !lobby &&
      !users &&
      !listenToGuesses.current &&
      !listenToCreateRound.current &&
      !loading &&
      !roundLoading
    ) {
      loadData();
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

  const shouldEnableButtons = canGuess(guesses, userName, users);

  return (
    <div>
      {error ? <p>{error}</p> : null}
      <div className={classes.gameHUD}>
        <Typography variant="h3">
          <Timer>{time}</Timer>
        </Typography>
      </div>
      <div className={classes.root}>
        <div>
          <div className={classes.picturesContainer}>
            <Poster
              loading={loading}
              path={round.person.profile_path}
              name={round.person.name}
            />
            <Typography variant="h2">?</Typography>
            <Poster
              loading={loading}
              path={round.movie.poster_path}
              name={round.movie.title}
            />
          </div>
          <div className={classes.actionsContainer}>
            <Button
              disabled={!shouldEnableButtons}
              size="large"
              variant="contained"
              color="primary"
              onClick={() => {
                if (!loading) {
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
                if (!loading) {
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
                <TableCell>Guessed</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users
                ? users.map(user => (
                    <TableRow key={user.id}>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.score}</TableCell>
                      <TableCell>{user.lives}</TableCell>
                      <TableCell>
                        <GuessStatus
                          name={user.name}
                          guesses={round.guesses || []}
                        />
                      </TableCell>
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
