// @flow
import firebase from "firebase/app";
import "firebase/firestore";
import moment from "moment";
import type { Game, Lobby } from "../types";

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
    return db.collection("lobbies").add({
      users: [
        {
          name: userName,
          score: 0,
          lives: 3,
          ready: false
        }
      ],
      date: moment().format()
    });
  } catch (e) {
    throw new Error(e);
  }
}

async function addUserToLobby(userName: string, lobbyId: string) {
  try {
    const lobbyDoc = await db.collection("lobbies").doc(lobbyId);
    return lobbyDoc.update({
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
    return lobbyDoc.data();
  } catch (e) {
    throw new Error(e);
  }
}

export { saveGame, getGames, createLobby, addUserToLobby, getLobby };
