// @flow
import firebase from "firebase/app";
import "firebase/firestore";
import moment from "moment";
import type { Game, Movie, Person, Guess } from "../types";

firebase.initializeApp({
  apiKey: "AIzaSyCaStI5D_GU0kN20ZBSwaFlzkoj0Xa6It8",
  authDomain: "movie-quizz-8b93e.firebaseapp.com",
  projectId: "movie-quizz-8b93e",
  databaseURL: "https://movie-quizz-8b93e.firebaseio.com"
});

export const db = firebase.firestore();

async function saveGame(game: Game) {
  try {
    return db.collection("games").add({
      ...game,
      date: moment().format()
    });
  } catch (e) {
    throw new Error(e);
  }
}

async function getGame(gameId: string) {
  try {
    const doc = await db
      .collection("games")
      .doc(gameId)
      .get();
    return doc.data();
  } catch (e) {
    throw new Error(e);
  }
}

async function getGames() {
  try {
    const querySnapshot = await db
      .collection("games")
      .orderBy("score", "desc")
      .orderBy("time")
      .limit(10)
      .get();
    return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
  } catch (e) {
    throw new Error(e);
  }
}

async function updateGame(game: Game) {
  try {
    const gameDoc = db.collection("games").doc(game.id);
    return gameDoc.update(game);
  } catch (error) {
    throw new Error(error);
  }
}

async function createRound({
  movie,
  person,
  lobbyId,
  playsIn,
  timer
}: {
  movie: Movie,
  person: Person,
  lobbyId: string,
  playsIn: boolean,
  timer: number
}) {
  try {
    return db
      .collection("lobbies")
      .doc(lobbyId)
      .update({
        nbRounds: firebase.firestore.FieldValue.increment(1),
        rounds: firebase.firestore.FieldValue.arrayUnion({
          movie,
          person,
          lobbyId,
          playsIn,
          timer,
          date: moment().format()
        })
      });
  } catch (e) {
    throw new Error(e);
  }
}

async function getRound(roundId: string, lobbyId: string) {
  try {
    const roundDoc = await db
      .collection("lobbies")
      .doc(lobbyId)
      .collection("rounds")
      .doc(roundId)
      .get();
    return {
      id: roundDoc.id,
      ...roundDoc.data()
    };
  } catch (e) {
    throw new Error(e);
  }
}

async function getGuessesFromRound(roundId: string): Promise<Array<Guess>> {
  try {
    const guessesSnapshot = await db
      .collection("guesses")
      .where("roundId", "==", roundId)
      .get();
    return guessesSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
  } catch (e) {
    throw new Error(e);
  }
}

async function saveGuess(lobbyId: string, guess: Guess, roundDate: string) {
  try {
    const { userName, guessedRight } = guess;
    const lobbyRef = db.collection("lobbies").doc(lobbyId);
    return db.runTransaction(async t => {
      const lobbyDoc = await t.get(lobbyRef);
      const lobby = lobbyDoc.data();
      const user = lobby.users.find(user => user.name === userName);
      user.score = guessedRight ? user.score + 1 : user.score;
      user.lives = guessedRight ? user.lives : user.lives - 1;
      await t.update(lobbyRef, {
        ...lobby,
        guesses: firebase.firestore.FieldValue.arrayUnion({
          roundDate,
          ...guess
        })
      });
    });
  } catch (e) {
    throw new Error(e);
  }
}

async function getGuessesFromLobby(lobbyId: string, userName: string) {
  try {
    const lobbyDoc = await db
      .collection("lobbies")
      .doc(lobbyId)
      .get();
    const lobby = lobbyDoc.data();
    return lobby.guesses
      .filter(guess => guess.userName === userName)
      .sort(guess => guess.time);
  } catch (e) {
    throw new Error(e);
  }
}

async function createLobby(userName: string, ready: boolean = false) {
  try {
    const lobby = await db.collection("lobbies").add({
      master: userName,
      date: moment().format(),
      users: [
        {
          lives: 3,
          name: userName,
          score: 0,
          ready
        }
      ],
      rounds: [],
      nbRounds: 0,
      guesses: []
    });
    return { ...lobby, id: lobby.id };
  } catch (e) {
    throw new Error(e);
  }
}

async function addUserToLobby(userName: string, lobbyId: string) {
  try {
    return await db
      .collection("lobbies")
      .doc(lobbyId)
      .update({
        users: firebase.firestore.FieldValue.arrayUnion({
          name: userName,
          score: 0,
          lives: 3,
          ready: false
        })
      });
  } catch (e) {
    throw new Error(e);
  }
}

async function getLobby(lobbyId: string) {
  try {
    const lobbyDoc = await db
      .collection("lobbies")
      .doc(lobbyId)
      .get();
    return {
      id: lobbyDoc.id,
      ...lobbyDoc.data()
    };
  } catch (e) {
    throw new Error(e);
  }
}

async function getUsers(lobbyId: string) {
  try {
    const usersSnapshot = await db
      .collection("lobbies")
      .doc(lobbyId)
      .collection("users")
      .get();
    return usersSnapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    }));
  } catch (e) {
    throw new Error(e);
  }
}

async function setUserReady(lobbyId: string, userName: string, ready: boolean) {
  try {
    const lobbyRef = db.collection("lobbies").doc(lobbyId);
    return db.runTransaction(async t => {
      const lobbyDoc = await t.get(lobbyRef);
      const lobby = lobbyDoc.data();
      const user = lobby.users.find(user => user.name === userName);
      user.ready = ready;
      await t.update(lobbyRef, lobby);
    });
  } catch (e) {
    throw new Error(e);
  }
}

async function updateLobby(lobbyId: string, data: any) {
  try {
    const lobbyDoc = db.collection("lobbies").doc(lobbyId);
    return lobbyDoc.update(data);
  } catch (e) {
    throw new Error(e);
  }
}

export {
  saveGame,
  getGames,
  getGame,
  createLobby,
  addUserToLobby,
  getLobby,
  setUserReady,
  updateGame,
  updateLobby,
  saveGuess,
  createRound,
  getRound,
  getUsers,
  getGuessesFromLobby,
  getGuessesFromRound
};
