import { Command } from "commander";
import { devCommand } from "./commands/dev.js";
import { serveCommand } from "./commands/serve.js";
import { addCommand } from "./commands/add.js";

const program = new Command()
  .name("pdfx")
  .description("PDFX CLI - PDF generation tools")
  .version("0.0.0");

program.addCommand(devCommand);
program.addCommand(serveCommand);
program.addCommand(addCommand);

program.parse();
