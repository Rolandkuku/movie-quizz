// @flow

import React from "react";
import {
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  Paper,
  makeStyles
} from "@material-ui/core";
import { getName } from "../../services";
import type { User } from "../../types";

const useStyles = makeStyles(theme => ({
  root: {
    paddingBottom: theme.spacing(2)
  }
}));

const renderLives = nbLives => {
  const hearts = [];
  for (var i = 0; i < nbLives; i++) {
    hearts.push("❤️");
  }
  return hearts;
};

type Props = {
  users: Array<User>
};

function Scores({ users }: Props) {
  const classes = useStyles();
  const userName = getName();
  return (
    <Paper className={classes.root}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Player</TableCell>
            <TableCell>Score</TableCell>
            <TableCell>Lives</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users
            ? users.map((user, index) => (
                <TableRow selected={user.name === userName} key={user.name}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.score}</TableCell>
                  <TableCell>{renderLives(user.lives)}</TableCell>
                </TableRow>
              ))
            : null}
        </TableBody>
      </Table>
    </Paper>
  );
}

export { Scores };
