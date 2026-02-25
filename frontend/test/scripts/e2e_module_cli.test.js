/**
 * @jest-environment node
 */
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const childProcess = require("node:child_process");

const e2eModules = require("../../scripts/e2e-modules.cjs");
const e2eModule = require("../../scripts/e2e-module.cjs");
const e2eCoverageModule = require("../../scripts/e2e-coverage-module.cjs");

const tempDirs = [];

function createDefinitionsFile(data) {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "e2e-modules-"));
  const filePath = path.join(tempDir, "flow-definitions.json");
  fs.writeFileSync(filePath, JSON.stringify(data), "utf8");
  tempDirs.push(tempDir);
  return filePath;
}

function createNonExistentPath() {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "e2e-modules-"));
  tempDirs.push(tempDir);
  return path.join(tempDir, "does-not-exist.json");
}

afterEach(() => {
  tempDirs.splice(0).forEach((dir) => {
    fs.rmSync(dir, { recursive: true, force: true });
  });
});

describe("e2e module helpers", () => {
  test("loadModules returns sorted unique modules", () => {
    const filePath = createDefinitionsFile({
      version: "1.0.0",
      lastUpdated: "2026-02-24",
      flows: {
        "auth-login": { module: "auth" },
        "docs-create": { module: " documents " },
        "auth-logout": { module: "auth" },
      },
    });

    expect(e2eModule.loadModules(filePath)).toEqual(["auth", "documents"]);
  });

  test("loadModules throws when definitions file is not found", () => {
    expect(() => e2eModule.loadModules(createNonExistentPath())).toThrow(
      "Unable to read flow definitions"
    );
  });

  test("loadModules returns empty list when flows key is absent", () => {
    const filePath = createDefinitionsFile({ version: "1.0.0" });
    expect(e2eModule.loadModules(filePath)).toEqual([]);
  });

  test("loadModules skips flow entries without a string module property", () => {
    const filePath = createDefinitionsFile({
      flows: {
        "a": { module: "auth" },
        "b": { module: null },
        "c": {},
        "d": null,
      },
    });
    expect(e2eModule.loadModules(filePath)).toEqual(["auth"]);
  });

  test("loadModules skips flow entries with empty module string", () => {
    const filePath = createDefinitionsFile({
      flows: { "a": { module: "  " } },
    });
    expect(e2eModule.loadModules(filePath)).toEqual([]);
  });

  test("validateModuleName accepts known module", () => {
    const filePath = createDefinitionsFile({
      version: "1.0.0",
      lastUpdated: "2026-02-24",
      flows: {
        "auth-login": { module: "auth" },
        "docs-create": { module: "documents" },
      },
    });

    const modules = e2eModule.validateModuleName("auth", filePath);
    expect(modules).toEqual(["auth", "documents"]);
  });

  test("validateModuleName throws when no modules are defined", () => {
    const filePath = createDefinitionsFile({ flows: {} });
    expect(() => e2eModule.validateModuleName("auth", filePath)).toThrow(
      "Available modules: none"
    );
  });

  test("normalizeModuleName strips the @module: prefix", () => {
    expect(e2eModule.normalizeModuleName("@module:auth")).toBe("auth");
  });

  test("normalizeModuleName trims whitespace when no prefix is present", () => {
    expect(e2eModule.normalizeModuleName("  auth  ")).toBe("auth");
  });

  test("parseArgs extracts module name from a positional argument", () => {
    const result = e2eModule.parseArgs(["auth"]);
    expect(result.moduleName).toBe("auth");
    expect(result.clean).toBe(false);
    expect(result.extraArgs).toEqual([]);
  });

  test("parseArgs extracts module name from --module flag", () => {
    const result = e2eModule.parseArgs(["--module", "auth"]);
    expect(result.moduleName).toBe("auth");
  });

  test("parseArgs sets clean flag when --clean is present", () => {
    const result = e2eModule.parseArgs(["auth", "--clean"]);
    expect(result.clean).toBe(true);
  });

  test("parseArgs collects extra args after module name is resolved", () => {
    const result = e2eModule.parseArgs(["auth", '--project=Desktop Chrome']);
    expect(result.extraArgs).toEqual(['--project=Desktop Chrome']);
  });

  test("parseArgs throws when --module flag has no following value", () => {
    expect(() => e2eModule.parseArgs(["--module"])).toThrow(
      "Module name is required after --module."
    );
  });

  test("resolveOptions returns parsed options when module name is provided", () => {
    const result = e2eModule.resolveOptions(["auth"]);
    expect(result.moduleName).toBe("auth");
  });

  test("resolveOptions throws when no module name is provided", () => {
    expect(() => e2eModule.resolveOptions([])).toThrow("Module name is required.");
  });

  test("buildModuleArgs returns npm run e2e command with grep filter", () => {
    expect(e2eModule.buildModuleArgs("auth", [])).toEqual([
      "run", "e2e", "--", "--grep", "@module:auth",
    ]);
  });

  test("buildModuleArgs appends extra playwright args", () => {
    expect(e2eModule.buildModuleArgs("auth", ["--project=Chrome"])).toEqual([
      "run", "e2e", "--", "--grep", "@module:auth", "--project=Chrome",
    ]);
  });
});

describe("e2e modules list helpers", () => {
  test("loadModules returns empty list when flows are missing", () => {
    const filePath = createDefinitionsFile({
      version: "1.0.0",
      lastUpdated: "2026-02-24",
      flows: {},
    });

    expect(e2eModules.loadModules(filePath)).toEqual([]);
  });

  test("loadModules throws when definitions file is not found", () => {
    expect(() => e2eModules.loadModules(createNonExistentPath())).toThrow(
      "Unable to read flow definitions"
    );
  });

  test("loadModules throws when definitions file contains invalid JSON", () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "e2e-modules-"));
    const filePath = path.join(tempDir, "flow-definitions.json");
    fs.writeFileSync(filePath, "{ invalid", "utf8");
    tempDirs.push(tempDir);
    expect(() => e2eModules.loadModules(filePath)).toThrow("Invalid JSON");
  });

  test("loadModules returns empty list when flows key is absent", () => {
    const filePath = createDefinitionsFile({ version: "1.0.0" });
    expect(e2eModules.loadModules(filePath)).toEqual([]);
  });

  test("loadModules skips flow entries without a string module property", () => {
    const filePath = createDefinitionsFile({
      flows: { "a": { module: "blog" }, "b": null, "c": {} },
    });
    expect(e2eModules.loadModules(filePath)).toEqual(["blog"]);
  });

  test("printModules warns when no modules are available", () => {
    const logger = {
      log: jest.fn(),
      warn: jest.fn(),
    };

    e2eModules.printModules([], logger);

    expect(logger.warn).toHaveBeenCalledWith(
      "[e2e:modules] No modules found in flow-definitions.json."
    );
    expect(logger.log).not.toHaveBeenCalled();
  });

  test("printModules warns when modules is null", () => {
    const logger = { log: jest.fn(), warn: jest.fn() };
    e2eModules.printModules(null, logger);
    expect(logger.warn).toHaveBeenCalledWith(
      "[e2e:modules] No modules found in flow-definitions.json."
    );
  });

  test("printModules logs each module name", () => {
    const logger = { log: jest.fn(), warn: jest.fn() };
    e2eModules.printModules(["auth", "blog"], logger);
    expect(logger.log).toHaveBeenCalledWith("auth");
    expect(logger.log).toHaveBeenCalledWith("blog");
    expect(logger.warn).not.toHaveBeenCalled();
  });
});

describe("e2e module report helpers", () => {
  test("validateModuleName throws for unknown module", () => {
    const filePath = createDefinitionsFile({
      version: "1.0.0",
      lastUpdated: "2026-02-24",
      flows: {
        "auth-login": { module: "auth" },
      },
    });

    expect(() => e2eCoverageModule.validateModuleName("unknown", filePath)).toThrow(
      "Unknown module"
    );
  });

  test("loadModules throws for invalid JSON", () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "e2e-modules-"));
    const filePath = path.join(tempDir, "flow-definitions.json");
    fs.writeFileSync(filePath, "{ invalid", "utf8");
    tempDirs.push(tempDir);

    expect(() => e2eCoverageModule.loadModules(filePath)).toThrow("Invalid JSON");
  });

  test("loadModules throws when definitions file is not found", () => {
    expect(() => e2eCoverageModule.loadModules(createNonExistentPath())).toThrow(
      "Unable to read flow definitions"
    );
  });

  test("loadModules returns empty list when flows key is absent", () => {
    const filePath = createDefinitionsFile({ version: "1.0.0" });
    expect(e2eCoverageModule.loadModules(filePath)).toEqual([]);
  });

  test("loadModules skips flow entries without a string module property", () => {
    const filePath = createDefinitionsFile({
      flows: { "a": { module: "auth" }, "b": null, "c": {} },
    });
    expect(e2eCoverageModule.loadModules(filePath)).toEqual(["auth"]);
  });

  test("validateModuleName accepts known module", () => {
    const filePath = createDefinitionsFile({
      flows: { "auth-login": { module: "auth" } },
    });
    expect(e2eCoverageModule.validateModuleName("auth", filePath)).toEqual(["auth"]);
  });

  test("validateModuleName throws when no modules are defined", () => {
    const filePath = createDefinitionsFile({ flows: {} });
    expect(() => e2eCoverageModule.validateModuleName("auth", filePath)).toThrow(
      "Available modules: none"
    );
  });

  test("normalizeModuleName strips the @module: prefix", () => {
    expect(e2eCoverageModule.normalizeModuleName("@module:auth")).toBe("auth");
  });

  test("normalizeModuleName trims whitespace when no prefix is present", () => {
    expect(e2eCoverageModule.normalizeModuleName("  auth  ")).toBe("auth");
  });

  test("parseArgs extracts module name from a positional argument", () => {
    const result = e2eCoverageModule.parseArgs(["auth"]);
    expect(result.moduleName).toBe("auth");
    expect(result.clean).toBe(false);
    expect(result.extraArgs).toEqual([]);
  });

  test("parseArgs extracts module name from --module flag", () => {
    const result = e2eCoverageModule.parseArgs(["--module", "auth"]);
    expect(result.moduleName).toBe("auth");
  });

  test("parseArgs sets clean flag when --clean is present", () => {
    const result = e2eCoverageModule.parseArgs(["auth", "--clean"]);
    expect(result.clean).toBe(true);
  });

  test("parseArgs collects extra args after module name is resolved", () => {
    const result = e2eCoverageModule.parseArgs(["auth", "--project=Chrome"]);
    expect(result.extraArgs).toEqual(["--project=Chrome"]);
  });

  test("parseArgs throws when --module flag has no following value", () => {
    expect(() => e2eCoverageModule.parseArgs(["--module"])).toThrow(
      "Module name is required after --module."
    );
  });

  test("resolveOptions returns parsed options when module name is provided", () => {
    const result = e2eCoverageModule.resolveOptions(["auth"]);
    expect(result.moduleName).toBe("auth");
  });

  test("resolveOptions throws when no module name is provided", () => {
    expect(() => e2eCoverageModule.resolveOptions([])).toThrow("Module name is required.");
  });

  test("buildCoverageArgs returns npm run e2e:coverage command with grep filter", () => {
    expect(e2eCoverageModule.buildCoverageArgs("auth", [])).toEqual([
      "run", "e2e:coverage", "--", "--grep", "@module:auth",
    ]);
  });

  test("buildCoverageArgs appends extra playwright args", () => {
    expect(e2eCoverageModule.buildCoverageArgs("auth", ["--project=Chrome"])).toEqual([
      "run", "e2e:coverage", "--", "--grep", "@module:auth", "--project=Chrome",
    ]);
  });
});

describe("run and runCommand via child process execution", () => {
  const scriptRoot = path.resolve(__dirname, "../../");

  test("e2e-module run exits with code 1 when no module name is provided", () => {
    const result = childProcess.spawnSync(
      "node",
      ["scripts/e2e-module.cjs"],
      { cwd: scriptRoot, encoding: "utf8" }
    );
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("Module name is required.");
  });

  test("e2e-module run exits with code 1 when module name is unknown", () => {
    const result = childProcess.spawnSync(
      "node",
      ["scripts/e2e-module.cjs", "unknown-module-xyz"],
      { cwd: scriptRoot, encoding: "utf8" }
    );
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("Unknown module");
  });

  test("e2e-coverage-module run exits with code 1 when no module name is provided", () => {
    const result = childProcess.spawnSync(
      "node",
      ["scripts/e2e-coverage-module.cjs"],
      { cwd: scriptRoot, encoding: "utf8" }
    );
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("Module name is required.");
  });

  test("e2e-coverage-module run exits with code 1 when module name is unknown", () => {
    const result = childProcess.spawnSync(
      "node",
      ["scripts/e2e-coverage-module.cjs", "unknown-module-xyz"],
      { cwd: scriptRoot, encoding: "utf8" }
    );
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("Unknown module");
  });

  test("e2e-modules run exits without error when flow-definitions.json is present", () => {
    const result = childProcess.spawnSync(
      "node",
      ["scripts/e2e-modules.cjs"],
      { cwd: scriptRoot, encoding: "utf8" }
    );
    expect(result.status).toBe(0);
  });
});
