import { Command } from "commander";
import { devCommand } from "./commands/dev.js";
import { serveCommand } from "./commands/serve.js";
import { addCommand } from "./commands/add.js";

const program = new Command()
  .name("pdfn")
  .description("PDFN CLI - PDF generation tools\n\n  Alpha: 'serve' command works. 'dev' and 'add' coming soon.")
  .version("0.0.1-alpha.1");

program.addCommand(devCommand);
program.addCommand(serveCommand);
program.addCommand(addCommand);

program.parse();
