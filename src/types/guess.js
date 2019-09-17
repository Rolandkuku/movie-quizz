// flow
import type { Movie, Person } from ".";
export type Guess = {
  userName: string,
  guessedRight: boolean,
  movie: Movie,
  person: Person,
  playsIn: boolean,
  lobbyId: string
};
