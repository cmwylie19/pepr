// SPDX-License-Identifier: Apache-2.0
// SPDX-FileCopyrightText: 2023-Present The Pepr Authors

import { resolve } from "path";
import { RootCmd } from "../root";
import { Log } from "../../lib";
import {
  genPeprTS,
  genPkgJSON,
  gitIgnore,
  prettierRC,
  readme,
  tsConfig,
} from "./templates";
import { createDir, sanitizeName, write } from "./utils";
import { confirm, walkthrough } from "./walkthrough";

export default function (program: RootCmd) {
  program
    .command("init")
    .description("Initialize a new Pepr Module")
    .action(async () => {
      const response = await walkthrough();
      const dirName = sanitizeName(response.name);
      const packageJSON = genPkgJSON(response);
      const peprTS = genPeprTS();

      const confirmed = await confirm(dirName, packageJSON, peprTS.path);

      if (confirmed) {
        console.log("Creating new Pepr module...");

        try {
          await createDir(dirName);

          await write(resolve(dirName, gitIgnore.path), gitIgnore.data);
          await write(resolve(dirName, prettierRC.path), prettierRC.data);
          await write(resolve(dirName, packageJSON.path), packageJSON.data);
          await write(resolve(dirName, readme.path), readme.data);
          await write(resolve(dirName, tsConfig.path), tsConfig.data);
          await write(resolve(dirName, peprTS.path), peprTS.data);

          console.log(`New Pepr module created at ${dirName}`);
          console.log(`Run "cd ${dirName} && npm install" to get started`);
        } catch (err) {
          Log.error(err);
          process.exit(1);
        }
      }
    });
}
