#!/usr/bin/env node
import program from "commander";
import Ynrm from "../lib/index";
import osenv from "osenv";
import PKG from "../../package.json";

const ynrm = new Ynrm();
const home = osenv.home();
process.env.HOME = process.env.HOME || home;
program.version(PKG.version);

program
  .command("ls")
  .description("List all the registries")
  .action(ynrm.onList);

program
  .command("current")
  .description("Show current registry name")
  .action(ynrm.showCurrent);

program
  .command("use <registry>")
  .description("Change registry to registry")
  .action(ynrm.onUse);

program
  .command("add <registry> <url> [home]")
  .description("Add one custom registry")
  .action(ynrm.onAdd);

program
  .command("del <registry>")
  .description("Delete one custom registry")
  .action(ynrm.onDel);

program
  .command("home <registry> [browser]")
  .description("Open the homepage of registry with optional browser")
  .action(ynrm.onHome);

program
  .command("test [registry]")
  .description("Show response time for specific or all registries")
  .action(ynrm.onTest);

program.command("help").description("Print this help").action(program.help);

program.parse(process.argv);

if (process.argv.length === 2) {
  program.outputHelp();
}
