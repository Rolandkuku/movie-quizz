// @flow

import React from "react";
import {
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableHead
} from "@material-ui/core";
import type { User } from "../../types";

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
  return (
    <div>
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
            ? users.map(user => (
                <TableRow key={user.name}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.score}</TableCell>
                  <TableCell>{renderLives(user.lives)}</TableCell>
                </TableRow>
              ))
            : null}
        </TableBody>
      </Table>
    </div>
  );
}

export { Scores };
