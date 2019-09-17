// @flow
import { db } from "./firestore";
import type { User, Round, Game } from "../types";

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
  listenLobbyUserChanges,
  listenToCreateRound,
  listenToGuesses,
  listenForGameCreation
};
