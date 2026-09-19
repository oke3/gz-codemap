// Copyright (c) 2026 Ground Zero LLC. All rights reserved.

import { Command } from "commander";

const program = new Command();
program
  .name("my-cli")
  .description("A sample CLI tool")
  .version("1.0.0");

program.parse(process.argv);
