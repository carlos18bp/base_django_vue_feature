import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import coverageLib from 'istanbul-lib-coverage';
import reportLib from 'istanbul-lib-report';
import reports from 'istanbul-reports';
import v8ToIstanbul from 'v8-to-istanbul';

const { createCoverageMap } = coverageLib;
const { createContext } = reportLib;

const rootDir = path.resolve(process.cwd());
const coverageDir = path.join(rootDir, 'coverage-e2e');
const v8CoverageDir = path.join(coverageDir, '.v8-coverage');
const sourceRoot = path.join(rootDir, 'src');

const allowedOrigins = new Set([
  'http://127.0.0.1:5173',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://localhost:3000',
]);

const ensureCoverageDir = () => {
  fs.mkdirSync(coverageDir, { recursive: true });
};

const isInSourceRoot = (filePath) => {
  const normalized = path.normalize(filePath);
  return normalized.startsWith(`${sourceRoot}${path.sep}`);
};

const resolveSourcePath = (urlString) => {
  if (!urlString || urlString === 'about:blank') {
    return null;
  }

  if (urlString.startsWith('data:') || urlString.startsWith('blob:')) {
    return null;
  }

  if (urlString.startsWith('file://')) {
    return fileURLToPath(urlString);
  }

  if (urlString.startsWith('http://') || urlString.startsWith('https://')) {
    try {
      const parsedUrl = new URL(urlString);
      if (!allowedOrigins.has(parsedUrl.origin)) {
        return null;
      }

      let pathname = decodeURIComponent(parsedUrl.pathname);
      if (pathname.startsWith('/@fs/')) {
        pathname = pathname.slice('/@fs/'.length);
        return pathname;
      }

      if (
        pathname.startsWith('/@id/') ||
        pathname.startsWith('/@vite/') ||
        pathname.startsWith('/@react-refresh') ||
        pathname.startsWith('/node_modules/')
      ) {
        return null;
      }

      if (pathname.startsWith('/src/')) {
        return path.join(rootDir, pathname.slice(1));
      }
    } catch (error) {
      return null;
    }
  }

  return null;
};

const loadV8CoverageEntries = () => {
  if (!fs.existsSync(v8CoverageDir)) {
    return [];
  }

  const files = fs.readdirSync(v8CoverageDir).filter((file) => file.endsWith('.json'));
  const entries = [];

  for (const file of files) {
    const content = fs.readFileSync(path.join(v8CoverageDir, file), 'utf8');
    const parsed = JSON.parse(content);
    entries.push(...parsed);
  }

  return entries;
};

const writeEmptyCoverage = () => {
  ensureCoverageDir();
  fs.writeFileSync(path.join(coverageDir, 'coverage.txt'), 'No coverage data collected.\n');
  fs.writeFileSync(
    path.join(coverageDir, 'coverage-summary.json'),
    JSON.stringify({ total: {} }, null, 2),
  );
};

const buildCoverageMap = async (entries) => {
  const coverageMap = createCoverageMap({});

  for (const entry of entries) {
    const filePath = resolveSourcePath(entry.url);
    if (!filePath || !isInSourceRoot(filePath) || !fs.existsSync(filePath)) {
      continue;
    }

    const converter = v8ToIstanbul(filePath, 0, { source: entry.source });
    await converter.load();
    converter.applyCoverage(entry.functions);
    coverageMap.merge(converter.toIstanbul());
  }

  return coverageMap;
};

const main = async () => {
  const entries = loadV8CoverageEntries();

  if (entries.length === 0) {
    writeEmptyCoverage();
    return;
  }

  const coverageMap = await buildCoverageMap(entries);

  if (coverageMap.files().length === 0) {
    writeEmptyCoverage();
    return;
  }

  ensureCoverageDir();
  const context = createContext({ dir: coverageDir, coverageMap });

  const summary = coverageMap.getCoverageSummary();
  const formatLine = (label, metric) => {
    const pct = metric.pct.toFixed(2).padStart(6, ' ');
    return `✅ ${label.padEnd(12)}: ${pct}% ( ${metric.covered}/${metric.total} )`;
  };

  console.log('=============================== Coverage summary ===============================');
  console.log(formatLine('Statements', summary.statements));
  console.log(formatLine('Branches', summary.branches));
  console.log(formatLine('Functions', summary.functions));
  console.log(formatLine('Lines', summary.lines));
  console.log('================================================================================');

  reports.create('html').execute(context);
  reports.create('json-summary', { file: 'coverage-summary.json' }).execute(context);
  reports.create('text').execute(context);
  reports.create('text', { file: 'coverage.txt' }).execute(context);
};

await main();
