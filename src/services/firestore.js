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
    const doc = db
      .collection("games")
      .doc(gameId)
      .get();
    return doc.data();
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
    const lobbyRef = await db.collection("lobbies").doc(lobbyId);
    return db.runTransaction(async transaction => {
      const roundRef = await lobbyRef.collection("rounds").add({
        movie,
        person,
        timer,
        playsIn,
        date: moment().format()
      });
      lobbyRef.update({ lastRound: roundRef.id });
      const guessesSnapshot = await roundRef.collection("guesses").get();
      const roundDoc = await roundRef.get();
      return {
        id: roundDoc.id,
        ...roundDoc.data(),
        guesses: guessesSnapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id
        }))
      };
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
    // TODO: this should have its own service.
    const guessesSnapshot = await db
      .collection("lobbies")
      .doc(lobbyId)
      .collection("rounds")
      .doc(roundId)
      .collection("guesses")
      .get();
    return {
      id: roundDoc.id,
      ...roundDoc.data(),
      guesses: guessesSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }))
    };
  } catch (e) {
    throw new Error(e);
  }
}

async function saveGuess({
  lobbyId,
  roundId,
  guess
}: {
  lobbyId: string,
  roundId: string,
  guess: Guess
}) {
  try {
    const { userName, guessedRight } = guess;
    const batch = db.batch();
    const guessRef = db
      .collection("lobbies")
      .doc(lobbyId)
      .collection("rounds")
      .doc(roundId)
      .collection("guesses")
      .doc(userName);
    const userRef = db
      .collection("lobbies")
      .doc(lobbyId)
      .collection("users")
      .doc(userName);
    batch.set(guessRef, guess, { merge: true });
    return db.runTransaction(async transaction => {
      const userDoc = await transaction.get(userRef);
      const user = userDoc.data();
      transaction.set(guessRef, guess, { merge: true });
      return transaction.update(userRef, {
        score: guessedRight ? user.score + 1 : user.score,
        lives: guessedRight ? user.lives : user.lives - 1
      });
    });
  } catch (e) {
    throw new Error(e);
  }
}

async function getGames() {
  try {
    const querySnapshot = await db
      .collection("games")
      .orderBy("score", "desc")
      .orderBy("timer")
      .limit(10)
      .get();
    return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
  } catch (e) {
    throw new Error(e);
  }
}

async function createLobby(userName: string, ready: boolean = false) {
  try {
    const lobby = await db.collection("lobbies").add({
      master: userName,
      date: moment().format()
    });
    await db
      .collection("lobbies")
      .doc(lobby.id)
      .collection("users")
      .doc(userName)
      .set({
        name: userName,
        score: 0,
        lives: 3,
        ready
      });
    return lobby;
  } catch (e) {
    throw new Error(e);
  }
}

async function addUserToLobby(userName: string, lobbyId: string) {
  try {
    return await db
      .collection("lobbies")
      .doc(lobbyId)
      .collection("users")
      .doc(userName)
      .set({
        name: userName,
        score: 0,
        lives: 3,
        ready: false
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

async function setUserReady(lobbyId: string, userId: string, ready: boolean) {
  try {
    return db
      .collection("lobbies")
      .doc(lobbyId)
      .collection("users")
      .doc(userId)
      .update({ ready });
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
  getUsers
};
