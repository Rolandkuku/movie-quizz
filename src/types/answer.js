// @flow

export type Answer = {
  person: {
    name: string,
    picture: string,
    id: number
  },
  movie: {
    id: number,
    poster: string,
    name: string
  },
  guesses: Array<{ userName: string, guessedRight: boolean }>,
  time: string
};
