import { Command } from "commander";
import { devCommand } from "./commands/dev.js";
import { addCommand } from "./commands/add.js";

const program = new Command()
  .name("pdfn")
  .description("PDFN CLI - PDF generation from React components")
  .version("0.0.1-alpha.1");

program.addCommand(devCommand);
program.addCommand(addCommand);

program.parse();
