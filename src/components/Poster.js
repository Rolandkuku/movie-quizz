// @flow
import React from "react";
import Skeleton from "@material-ui/lab/Skeleton";
import { Paper, makeStyles } from "@material-ui/core";
import { BASE_TMDB_POSTER_URL } from "../config/constants";

const { innerHeight } = window;

const placeholderDimensions = {
  height: innerHeight * 0.4,
  width: (innerHeight * 0.4) / 1.5
};

const useStyles = makeStyles(theme => ({
  pictureContainer: {
    overflow: "hidden",
    margin: theme.spacing(2),
    height: `${innerHeight * 0.4}px`
  },
  picture: {
    height: "100%",
    minHeight: `${placeholderDimensions.height}px`,
    minWidth: `${placeholderDimensions.width}px`
  },
  actionsContainer: {
    display: "flex",
    flexDirection: "row",
    padding: theme.spacing(2),
    justifyContent: "center"
  }
}));

function Poster({
  path,
  loading,
  name
}: {
  path: string,
  loading: boolean,
  name: string
}) {
  const classes = useStyles();
  return loading || (!path || !name) ? (
    <Skeleton
      className={classes.pictureContainer}
      variant="rect"
      height={placeholderDimensions.height}
      width={placeholderDimensions.width}
    />
  ) : (
    <Paper elevation={4} className={classes.pictureContainer}>
      <img
        src={`${BASE_TMDB_POSTER_URL}${path}`}
        alt={`${name} poster`}
        className={classes.picture}
      />
    </Paper>
  );
}

export { Poster };
