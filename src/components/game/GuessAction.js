// @flow

import React from "react";
import { makeStyles, Typography, Button } from "@material-ui/core";
import CheckRoundedIcon from "@material-ui/icons/CheckRounded";
import CloseRoundedIcon from "@material-ui/icons/CloseRounded";

import { Poster } from "../ui";
import type { Round } from "../../types";

const useStyles = makeStyles(theme => ({
  picturesContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center"
  },
  actionsContainer: {
    display: "flex",
    flexDirection: "row",
    padding: theme.spacing(2),
    justifyContent: "center"
  },
  action: {
    margin: theme.spacing(2)
  },
  question: {
    marginBottom: theme.spacing(2)
  }
}));

type Props = {
  loading: boolean,
  round: Round,
  shouldEnableButtons: boolean,
  onMakeAGuess: boolean => mixed
};

function GuessAction({
  loading,
  round,
  shouldEnableButtons,
  onMakeAGuess
}: Props) {
  const classes = useStyles();
  return (
    <div>
      <div className={classes.picturesContainer}>
        <Poster
          loading={loading}
          path={round ? round.person.profile_path : null}
          name={round ? round.person.name : null}
        />
        <Typography variant="h2">?</Typography>
        <Poster
          loading={loading}
          path={round ? round.movie.poster_path : null}
          name={round ? round.movie.title : null}
        />
      </div>
      <Typography className={classes.question} align="center" variant="h4">
        {round
          ? `Did ${round.person.name} play in ${round.movie.title}?`
          : "Loading"}
      </Typography>
      <div className={classes.actionsContainer}>
        <Button
          disabled={!shouldEnableButtons}
          size="large"
          variant="contained"
          color="primary"
          onClick={() => {
            if (!loading) {
              onMakeAGuess(true);
            }
          }}
          className={classes.action}
        >
          <CheckRoundedIcon />
        </Button>
        <Button
          size="large"
          variant="contained"
          color="secondary"
          onClick={() => {
            if (!loading) {
              onMakeAGuess(false);
            }
          }}
          disabled={!shouldEnableButtons}
          className={classes.action}
        >
          <CloseRoundedIcon />
        </Button>
      </div>
    </div>
  );
}

export { GuessAction };
