// @flow
import type { User } from ".";

export type Lobby = {
  users: Array<User>,
  gameId: string
};
