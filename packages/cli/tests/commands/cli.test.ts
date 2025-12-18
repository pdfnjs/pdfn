import { describe, it, expect } from "vitest";

describe("CLI", () => {
  it("has correct command structure", async () => {
    const { devCommand } = await import("../../src/commands/dev.js");
    const { serveCommand } = await import("../../src/commands/serve.js");
    const { addCommand } = await import("../../src/commands/add.js");

    expect(devCommand.name()).toBe("dev");
    expect(serveCommand.name()).toBe("serve");
    expect(addCommand.name()).toBe("add");
  });

  it("dev command has correct options", async () => {
    const { devCommand } = await import("../../src/commands/dev.js");
    const options = devCommand.options;

    const portOption = options.find((o) => o.long === "--port");
    const templatesOption = options.find((o) => o.long === "--templates");

    expect(portOption).toBeDefined();
    expect(templatesOption).toBeDefined();
  });

  it("serve command has correct options", async () => {
    const { serveCommand } = await import("../../src/commands/serve.js");
    const options = serveCommand.options;

    const portOption = options.find((o) => o.long === "--port");
    const timeoutOption = options.find((o) => o.long === "--timeout");

    expect(portOption).toBeDefined();
    expect(timeoutOption).toBeDefined();
  });
});
