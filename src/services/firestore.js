// @flow
import firebase from "firebase/app";
import "firebase/firestore";
import moment from "moment";
import type { Game, Round, User, Movie, Person, Guess } from "../types";

firebase.initializeApp({
  apiKey: "AIzaSyCaStI5D_GU0kN20ZBSwaFlzkoj0Xa6It8",
  authDomain: "movie-quizz-8b93e.firebaseapp.com",
  projectId: "movie-quizz-8b93e",
  databaseURL: "https://movie-quizz-8b93e.firebaseio.com"
});

const db = firebase.firestore();

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
    await db.runTransaction(async transaction => {
      const roundRef = await lobbyRef.collection("rounds").add({
        movie,
        person,
        timer,
        playsIn,
        guesses: []
      });
      lobbyRef.update({ lastRound: roundRef.id });
    });
  } catch (e) {
    throw new Error(e);
  }
}

function listenToCreateRound(lobbyId: string, cb: (round: Round) => any) {
  try {
    return db
      .collection("lobbies")
      .doc(lobbyId)
      .collection("rounds")
      .onSnapshot(snapshot => {
        snapshot.docChanges().forEach(change => {
          if (change.type === "added") {
            cb(change.doc.id);
          }
        });
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
    return roundDoc.data();
  } catch (e) {
    throw new Error(e);
  }
}

async function saveGuess({
  roundId,
  guess
}: {
  roundId: string,
  guess: Guess
}) {
  try {
    return db
      .collection("rounds")
      .doc(roundId)
      .collection("guesses")
      .doc(guess.userName)
      .set(guess, { merge: true });
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
      .add({
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
      .add({
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
    const usersSnapshot = await db
      .collection("lobbies")
      .doc(lobbyId)
      .collection("users")
      .get();
    return {
      ...lobbyDoc.data(),
      users: usersSnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      }))
    };
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

function listenLobbyUserChanges(lobbyId: string, cb: (Array<User>) => any) {
  const unsubscribe = db
    .collection("lobbies")
    .doc(lobbyId)
    .collection("users")
    .onSnapshot(snapshot => {
      cb(
        snapshot
          .docChanges()
          .map(change => ({ id: change.doc.id, ...change.doc.data() }))
      );
    });
  return unsubscribe;
}

export {
  saveGame,
  getGames,
  getGame,
  createLobby,
  addUserToLobby,
  getLobby,
  setUserReady,
  listenLobbyUserChanges,
  updateGame,
  updateLobby,
  saveGuess,
  createRound,
  listenToCreateRound,
  getRound
};
