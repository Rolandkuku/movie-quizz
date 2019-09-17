// @flow
import { getUsers as _getUsers } from "./firestore";
import type { User } from "../types";

async function getUsers(
  lobbyId: string,
  setUsers: (Array<User>) => any,
  setLoading: boolean => any
): Promise<Array<User>> {
  setLoading(true);
  try {
    const users = await _getUsers(lobbyId);
    setUsers(users);
    setLoading(false);
    return users;
  } catch (error) {
    setLoading(false);
    throw new Error(error);
  }
}

export const userServices = {
  getUsers
};
