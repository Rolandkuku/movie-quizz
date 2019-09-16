// @flow
import { db } from "./firestore";
import type { User, Round, Guess } from "../types";

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

function listenToGuesses(lobbyId: string, roundId: string, cb: () => any) {
  return db
    .collection("lobbies")
    .doc(lobbyId)
    .collection("rounds")
    .doc(roundId)
    .collection("guesses")
    .onSnapshot(snapshot => {
      cb();
    });
}

export { listenLobbyUserChanges, listenToCreateRound, listenToGuesses };
