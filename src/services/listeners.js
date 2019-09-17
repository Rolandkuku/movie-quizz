// @flow
import { db } from "./firestore";
import type { User, Round, Game, Lobby } from "../types";

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

function listenForLobbyChanges(lobbyId: string, cb: Lobby => any) {
  const unsubscribe = db
    .collection("lobbies")
    .doc(lobbyId)
    .onSnapshot(doc => {
      cb({ id: doc.id, ...doc.data() });
    });
  return unsubscribe;
}

function listenToGuesses(roundId: string, cb: Round => any) {
  return db
    .collection("guesses")
    .where("roundId", "==", roundId)
    .onSnapshot(snapshot => {
      cb();
    });
}

function listenForGameCreation(lobbyId: string, cb: Game => any) {
  return db.collection
    .where("lobbyId", "==", lobbyId)
    .onSnapshot(querySnapshot => {
      cb(querySnapshot.docChanges()[0].doc.data());
    });
}

export {
  listenForLobbyChanges,
  listenToCreateRound,
  listenToGuesses,
  listenForGameCreation
};
