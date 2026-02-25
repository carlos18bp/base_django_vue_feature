'use strict';

const fs = require('fs');
const path = require('path');

const RESET  = '\x1b[0m';
const BOLD   = '\x1b[1m';
const GREEN  = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RED    = '\x1b[31m';

function colorFor(pct) {
  if (pct > 80)  return GREEN;
  if (pct >= 50) return YELLOW;
  return RED;
}

function progressBar(pct, width = 30) {
  const filled = Math.round((pct / 100) * width);
  return '█'.repeat(filled) + '░'.repeat(width - filled);
}

function fmt(pct) {
  if (pct == null || isNaN(pct)) return '  N/A%';
  return `${pct.toFixed(1).padStart(5)}%`;
}

const summaryPath = path.resolve(__dirname, '../coverage/coverage-summary.json');
if (!fs.existsSync(summaryPath)) {
  console.log('\nNo coverage/coverage-summary.json found — run with --coverage first.\n');
  process.exit(0);
}

const raw   = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
const total = raw.total;

const files = Object.entries(raw)
  .filter(([k]) => k !== 'total')
  .map(([filePath, data]) => {
    const stmtsTotal    = data.statements.total;
    const stmtsCovered  = data.statements.covered;
    const branchTotal   = data.branches.total;
    const branchCovered = data.branches.covered;
    const funcsTotal    = data.functions.total;
    const funcsCovered  = data.functions.covered;
    const linesTotal    = data.lines.total;
    const linesCovered  = data.lines.covered;
    const missing = stmtsTotal - stmtsCovered;
    const pct     = stmtsTotal > 0 ? (stmtsCovered / stmtsTotal) * 100 : 100;
    const rel     = filePath.replace(/.*\/src\//, 'src/');
    return {
      path:          rel,
      filename:      rel.split('/').pop(),
      dirPath:       rel.split('/').slice(0, -1).join('/'),
      stmts:         stmtsTotal,
      missing,
      pct,
      branch:        data.branches.pct,
      funcs:         data.functions.pct,
      lines:         data.lines.pct,
      stmtsTotal,
      stmtsCovered,
      branchTotal,
      branchCovered,
      funcsTotal,
      funcsCovered,
      linesTotal,
      linesCovered,
    };
  });

const totalPct   = total.statements.pct;
const totalMiss  = total.statements.total - total.statements.covered;
const totalStmts = total.statements.total;

const greenCount  = files.filter(f => f.pct > 80).length;
const yellowCount = files.filter(f => f.pct >= 50 && f.pct <= 80).length;
const redCount    = files.filter(f => f.pct < 50).length;

const top10 = [...files]
  .filter(f => f.missing > 0)
  .sort((a, b) => b.missing - a.missing)
  .slice(0, 10);

// ── Section A: Coverage summary totals (text-summary format) ──
const RULE80 = '='.repeat(80);
console.log(`\n${'='.repeat(31)} Coverage summary ${'='.repeat(31)}`);
console.log(`Statements   : ${colorFor(total.statements.pct)}${total.statements.pct}%${RESET} ( ${total.statements.covered}/${total.statements.total} )`);
console.log(`Branches     : ${colorFor(total.branches.pct)}${total.branches.pct}%${RESET} ( ${total.branches.covered}/${total.branches.total} )`);
console.log(`Functions    : ${colorFor(total.functions.pct)}${total.functions.pct}%${RESET} ( ${total.functions.covered}/${total.functions.total} )`);
console.log(`Lines        : ${colorFor(total.lines.pct)}${total.lines.pct}%${RESET} ( ${total.lines.covered}/${total.lines.total} )`);
console.log(RULE80);
console.log('');

// ── Section B: Per-file table (text reporter format) ──
function aggPct(items, tKey, cKey) {
  const t = items.reduce((s, f) => s + f[tKey], 0);
  const c = items.reduce((s, f) => s + f[cKey], 0);
  return t > 0 ? (c / t) * 100 : 100;
}

function jestNum(pct) {
  const s = Number.isInteger(pct) ? String(pct) : parseFloat(pct.toFixed(2)).toString();
  return s.padStart(7);
}

function coloredNum(pct) {
  const s = Number.isInteger(pct) ? String(pct) : parseFloat(pct.toFixed(2)).toString();
  return `${colorFor(pct)}${s.padStart(7)}${RESET}`;
}

const sortedFiles = [...files].sort((a, b) => a.path.localeCompare(b.path));

const dirMap = new Map();
sortedFiles.forEach(f => {
  if (!dirMap.has(f.dirPath)) dirMap.set(f.dirPath, []);
  dirMap.get(f.dirPath).push(f);
});
const sortedDirs = [...dirMap.keys()].sort();

const maxFileLen = Math.max(
  9,
  ...sortedDirs.map(d => (' ' + d).length),
  ...sortedFiles.map(f => ('  ' + f.filename).length)
);
const FILE_W = Math.min(maxFileLen + 2, 54);

const colDash  = `${'-'.repeat(FILE_W)}|---------|----------|---------|---------|`;
const colHdr   = `${'File'.padEnd(FILE_W)}| % Stmts | % Branch | % Funcs | % Lines |`;
console.log(colDash);
console.log(colHdr);
console.log(colDash);

function tableRow(label, sp, bp, fp, lp) {
  return `${label.padEnd(FILE_W)}|${coloredNum(sp)} |${coloredNum(bp)} |${coloredNum(fp)} |${coloredNum(lp)} |`;
}

console.log(tableRow('All files', total.statements.pct, total.branches.pct, total.functions.pct, total.lines.pct));

sortedDirs.forEach(dir => {
  const dirFiles = dirMap.get(dir);
  const dSp = aggPct(dirFiles, 'stmtsTotal', 'stmtsCovered');
  const dBp = aggPct(dirFiles, 'branchTotal', 'branchCovered');
  const dFp = aggPct(dirFiles, 'funcsTotal', 'funcsCovered');
  const dLp = aggPct(dirFiles, 'linesTotal', 'linesCovered');
  console.log(tableRow(' ' + dir, dSp, dBp, dFp, dLp));
  dirFiles.forEach(f => {
    console.log(tableRow('  ' + f.filename, f.stmtsPct || f.pct, f.branchPct || f.branch, f.funcsPct || f.funcs, f.linesPct || f.lines));
  });
});
console.log(colDash);
console.log('');

// ── Section C: Custom COVERAGE SUMMARY ──
const sep = '─'.repeat(78);
const c   = colorFor(totalPct);
const bar = progressBar(totalPct);

console.log(`\n${BOLD}${'='.repeat(30)} COVERAGE SUMMARY ${'='.repeat(30)}${RESET}`);
console.log(`\n  Total   ${totalStmts} stmts   ${totalMiss} missing   ${c}[${bar}]  ${totalPct.toFixed(2)}%${RESET}\n`);
console.log(
  `  ${GREEN}${String(greenCount).padStart(3)} files${RESET} > 80%` +
  `     ${YELLOW}${String(yellowCount).padStart(3)} files${RESET} 50-80%` +
  `     ${RED}${String(redCount).padStart(3)} files${RESET} < 50%\n`
);

console.log(`  ${BOLD}${sep}${RESET}`);
console.log(`  ${BOLD}Top 10 — files with most uncovered statements${RESET}`);
console.log(`  ${BOLD}${sep}${RESET}`);

if (top10.length === 0) {
  console.log(`  ${GREEN}All files fully covered.${RESET}\n`);
} else {
  const hdr =
    `  ${'#'.padEnd(4)} ${'File'.padEnd(46)} ` +
    `${'Stmts'.padStart(5)} ${'Miss'.padStart(5)} ${'Stmts%'.padStart(7)} ${'Branch%'.padStart(8)} ${'Lines%'.padStart(7)}`;
  console.log(`${BOLD}${hdr}${RESET}`);
  console.log(`  ${sep}`);
  top10.forEach((f, i) => {
    const fc = colorFor(f.pct);
    const row =
      `  ${String(i + 1).padEnd(4)} ${f.path.padEnd(46)} ` +
      `${String(f.stmts).padStart(5)} ` +
      `${fc}${String(f.missing).padStart(5)} ${fmt(f.pct)} ${fmt(f.branch)} ${fmt(f.lines)}${RESET}`;
    console.log(row);
  });
  console.log('');
}
