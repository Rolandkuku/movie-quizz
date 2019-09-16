// @flow
import firebase from "firebase/app";
import "firebase/firestore";
import moment from "moment";
import type { Game, Lobby, User } from "../types";

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

async function createLobby(userName: string) {
  try {
    const lobby = await db.collection("lobbies").add({
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
        ready: false
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
  updateLobby
};
