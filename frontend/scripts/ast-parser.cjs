#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const babelParser = require("@babel/parser");
const traverseModule = require("@babel/traverse");

const traverse = traverseModule.default || traverseModule;

const MAX_TEST_LINES = 50;
const MAX_ASSERTIONS = 7;
const MAX_TIMEOUT_MS = 100;

const FORBIDDEN_TOKENS = ["batch", "coverage", "cov", "deep"];
const GENERIC_JS_TITLES = new Set([
  "it works",
  "should work",
  "test",
  "works",
  "does something",
  "handles it",
  "is correct",
  "passes",
  "runs",
]);

const NON_TEST_TEST_MODIFIERS = new Set([
  "describe",
  "beforeEach",
  "afterEach",
  "beforeAll",
  "afterAll",
  "use",
  "setTimeout",
  "step",
  "each",
]);

const SKIPPED_TEST_MODIFIERS = new Set(["skip", "todo", "fixme"]);

function parseArgs(argv) {
  const args = argv.slice(2);
  const isE2E = args.includes("--e2e");
  const fileArg = args.find((item) => item !== "--e2e");
  if (!fileArg) {
    throw new Error("Missing test file path argument");
  }

  return {
    filePath: path.resolve(process.cwd(), fileArg),
    isE2E,
  };
}

function isDescribeCall(info) {
  if (!info) {
    return false;
  }

  if (info.name === "describe") {
    return true;
  }

  return info.name === "test" && info.modifier === "describe";
}

function isRunnableTestCall(info) {
  if (!info || (info.name !== "it" && info.name !== "test")) {
    return false;
  }

  if (!info.modifier) {
    return true;
  }

  return !NON_TEST_TEST_MODIFIERS.has(info.modifier);
}

function titleFromNode(node) {
  if (!node) {
    return "";
  }
  if (node.type === "StringLiteral") {
    return node.value || "";
  }
  if (node.type === "Literal" && typeof node.value === "string") {
    return node.value;
  }
  if (node.type === "TemplateLiteral" && node.expressions.length === 0) {
    return node.quasis.map((part) => part.value.cooked || "").join("");
  }
  if (node.type === "Identifier") {
    return node.name;
  }
  return "<dynamic-title>";
}

function callInfo(callee) {
  if (!callee) {
    return null;
  }

  if (callee.type === "Identifier") {
    if (callee.name === "describe" || callee.name === "it" || callee.name === "test") {
      return { name: callee.name, modifier: null };
    }
    return null;
  }

  if (callee.type === "MemberExpression" && !callee.computed) {
    const object = callee.object;
    const property = callee.property;
    if (object && object.type === "Identifier" && property && property.type === "Identifier") {
      if (object.name === "describe" || object.name === "it" || object.name === "test") {
        return { name: object.name, modifier: property.name };
      }
    }
  }

  if (callee.type === "CallExpression") {
    const innerInfo = callInfo(callee.callee);
    if (innerInfo && (innerInfo.name === "it" || innerInfo.name === "test") && innerInfo.modifier === "each") {
      return { name: innerInfo.name, modifier: null };
    }
  }

  return null;
}

function findNearestDescribe(pathRef) {
  let cursor = pathRef.parentPath;
  while (cursor) {
    if (cursor.isCallExpression()) {
      const info = callInfo(cursor.node.callee);
      if (isDescribeCall(info)) {
        return titleFromNode(cursor.node.arguments[0]);
      }
    }
    cursor = cursor.parentPath;
  }
  return null;
}

function callbackNodeForTest(callNode) {
  for (const arg of callNode.arguments || []) {
    if (!arg) {
      continue;
    }
    if (arg.type === "ArrowFunctionExpression" || arg.type === "FunctionExpression") {
      return arg;
    }
  }
  return null;
}

function countMatches(text, regex) {
  const matches = text.match(regex);
  return matches ? matches.length : 0;
}

function firstMatchLine(snippet, baseLine, regex) {
  const lines = snippet.split(/\r?\n/);
  for (let index = 0; index < lines.length; index += 1) {
    if (regex.test(lines[index])) {
      return baseLine + index;
    }
  }
  return baseLine;
}

function buildTestIssues(testRecord, snippet, isE2E) {
  const issues = [];
  const loweredTitle = testRecord.name.trim().toLowerCase();

  if (testRecord.isEmpty) {
    issues.push({
      type: "EMPTY_TEST",
      message: "Test has no executable statements",
      line: testRecord.line,
      identifier: testRecord.fullContext,
      suggestion: "Add meaningful test logic and assertions",
    });
    return issues;
  }

  if (!testRecord.hasAssertions && !testRecord.isSkipped) {
    issues.push({
      type: "NO_ASSERTIONS",
      message: "Test has no assertions",
      line: testRecord.line,
      identifier: testRecord.fullContext,
      suggestion: "Add expect()/assert statements to verify behavior",
    });
  }

  if (GENERIC_JS_TITLES.has(loweredTitle)) {
    issues.push({
      type: "POOR_NAMING",
      message: `Generic test title: ${testRecord.name}`,
      line: testRecord.line,
      identifier: testRecord.fullContext,
      suggestion: "Use a descriptive title that explains behavior",
    });
  }

  for (const token of FORBIDDEN_TOKENS) {
    const tokenRegex = new RegExp(`(^|\\b|[_-])${token}($|\\b|[_-])`, "i");
    if (tokenRegex.test(testRecord.name)) {
      issues.push({
        type: "FORBIDDEN_TOKEN",
        message: `Forbidden token in test title: ${token}`,
        line: testRecord.line,
        identifier: testRecord.fullContext,
        suggestion: "Rename the test title without forbidden tokens",
      });
      break;
    }
  }

  if (testRecord.assertionCount > MAX_ASSERTIONS) {
    issues.push({
      type: "TOO_MANY_ASSERTIONS",
      message: `Too many assertions (${testRecord.assertionCount} > ${MAX_ASSERTIONS})`,
      line: testRecord.line,
      identifier: testRecord.fullContext,
      suggestion: "Split into multiple focused tests",
    });
  }

  if (testRecord.numLines > MAX_TEST_LINES) {
    issues.push({
      type: "TEST_TOO_LONG",
      message: `Test too long (${testRecord.numLines} lines > ${MAX_TEST_LINES})`,
      line: testRecord.line,
      identifier: testRecord.fullContext,
      suggestion: "Split long tests into smaller focused scenarios",
    });
  }

  if (testRecord.hasConsoleLog) {
    const consoleLine = firstMatchLine(snippet, testRecord.line, /console\.(log|debug|info|warn|error)\s*\(/);
    issues.push({
      type: "CONSOLE_LOG",
      message: "Test contains console logging",
      line: consoleLine,
      identifier: testRecord.fullContext,
      suggestion: "Remove debug logs from committed tests",
    });
  }

  if (testRecord.hasHardcodedTimeout && testRecord.timeoutValue > MAX_TIMEOUT_MS) {
    const timeoutLine = firstMatchLine(snippet, testRecord.line, /(waitForTimeout|setTimeout)\s*\(\s*\d+/);
    issues.push({
      type: isE2E ? "WAIT_FOR_TIMEOUT" : "HARDCODED_TIMEOUT",
      message: `Hardcoded timeout detected (${testRecord.timeoutValue}ms)`,
      line: timeoutLine,
      identifier: testRecord.fullContext,
      suggestion: "Use explicit wait conditions instead of fixed timeouts",
    });
  }

  return issues;
}

function analyzeFile(filePath, isE2E) {
  const source = fs.readFileSync(filePath, "utf8");
  const ast = babelParser.parse(source, {
    sourceType: "unambiguous",
    plugins: [
      "jsx",
      "typescript",
      "classProperties",
      "dynamicImport",
      "optionalChaining",
      "nullishCoalescingOperator",
      "objectRestSpread",
      "topLevelAwait",
      "decorators-legacy",
    ],
    ranges: true,
    tokens: false,
    errorRecovery: false,
  });

  const tests = [];
  const issues = [];
  const seenTestKeys = new Map();

  traverse(ast, {
    CallExpression(callPath) {
      const info = callInfo(callPath.node.callee);
      if (!isRunnableTestCall(info)) {
        return;
      }

      const title = titleFromNode(callPath.node.arguments[0]);
      const callback = callbackNodeForTest(callPath.node);
      const describeTitle = findNearestDescribe(callPath);
      const fullContext = describeTitle ? `${describeTitle} > ${title}` : title;

      const line = (callPath.node.loc && callPath.node.loc.start && callPath.node.loc.start.line) || 1;
      const callbackLineStart = (callback && callback.loc && callback.loc.start && callback.loc.start.line) || line;
      const callbackLineEnd = (callback && callback.loc && callback.loc.end && callback.loc.end.line) || line;
      const numLines = Math.max(1, callbackLineEnd - callbackLineStart + 1);

      const callbackStart = (callback && typeof callback.start === "number") ? callback.start : callPath.node.start;
      const callbackEnd = (callback && typeof callback.end === "number") ? callback.end : callPath.node.end;
      const snippet = source.slice(callbackStart, callbackEnd);

      const assertionCount = countMatches(snippet, /\b(?:expect|assert(?:\.[A-Za-z_][\w]*)?)\s*\(/g);
      const hasAssertions = assertionCount > 0;
      const hasConsoleLog = /console\.(log|debug|info|warn|error)\s*\(/.test(snippet);

      let timeoutValue = 0;
      const timeoutMatch = snippet.match(/(?:waitForTimeout|setTimeout)\s*\(\s*(\d+)/);
      if (timeoutMatch) {
        timeoutValue = Number(timeoutMatch[1]) || 0;
      }
      const hasHardcodedTimeout = timeoutValue > 0;

      const isEmpty = Boolean(
        callback &&
        callback.body &&
        callback.body.type === "BlockStatement" &&
        callback.body.body.length === 0
      );

      const testRecord = {
        name: title,
        fullContext,
        line,
        endLine: callbackLineEnd,
        numLines,
        type: info.name,
        isSkipped: Boolean(info.modifier && SKIPPED_TEST_MODIFIERS.has(info.modifier)),
        isOnly: info.modifier === "only",
        hasAssertions,
        assertionCount,
        hasConsoleLog,
        hasHardcodedTimeout,
        timeoutValue,
        isEmpty,
        describeBlock: describeTitle,
      };

      const duplicateKey = `${describeTitle || "<root>"}::${title}`;
      if (seenTestKeys.has(duplicateKey)) {
        issues.push({
          type: "DUPLICATE_NAME",
          message: `Duplicate test title: ${title}`,
          line,
          identifier: fullContext,
          suggestion: "Rename duplicate tests to keep titles unique per scope",
        });
      } else {
        seenTestKeys.set(duplicateKey, line);
      }

      tests.push(testRecord);
      issues.push(...buildTestIssues(testRecord, snippet, isE2E));
    },
  });

  return {
    file: filePath,
    tests,
    issues,
    summary: {
      testCount: tests.length,
      issueCount: issues.length,
      hasParseError: false,
    },
  };
}

function main() {
  let args;
  try {
    args = parseArgs(process.argv);
  } catch (error) {
    console.error(JSON.stringify({ error: error.message || String(error) }));
    process.exit(1);
  }

  try {
    const report = analyzeFile(args.filePath, args.isE2E);
    process.stdout.write(`${JSON.stringify(report)}\n`);
  } catch (error) {
    console.error(JSON.stringify({ error: error.message || String(error) }));
    process.exit(1);
  }
}

main();
