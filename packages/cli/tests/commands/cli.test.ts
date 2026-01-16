import { describe, it, expect } from "vitest";

describe("CLI", () => {
  it("has correct command structure", async () => {
    const { devCommand } = await import("../../src/commands/dev.js");
    const { addCommand } = await import("../../src/commands/add.js");

    expect(devCommand.name()).toBe("dev");
    expect(addCommand.name()).toBe("add");
  });

  it("dev command has correct options", async () => {
    const { devCommand } = await import("../../src/commands/dev.js");
    const options = devCommand.options;

    const portOption = options.find((o) => o.long === "--port");
    const openOption = options.find((o) => o.long === "--open");
    const modeOption = options.find((o) => o.long === "--mode");

    expect(portOption).toBeDefined();
    expect(openOption).toBeDefined();
    expect(modeOption).toBeDefined();
  });
});
