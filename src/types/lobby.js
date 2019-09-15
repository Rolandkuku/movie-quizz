// @flow
import type { Answer, User } from ".";

export type Lobby = {
  users: Array<User>,
  answers: Array<Answer>,
  winner: User
};
