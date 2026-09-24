#!/usr/bin/env node
// Reads Vitest V8 coverage output and prints a Markdown report ranking
// backend source files by how badly they need unit tests. Stdout is the
// contract; exit code is always 0 unless the summary file is missing.

import { readFileSync, existsSync } from 'node:fs';
import { resolve, relative, sep } from 'node:path';

const BACKEND_ROOT = resolve(new URL('..', import.meta.url).pathname);
const SUMMARY_PATH = resolve(BACKEND_ROOT, 'coverage/coverage-summary.json');
const FINAL_PATH = resolve(BACKEND_ROOT, 'coverage/coverage-final.json');

if (!existsSync(SUMMARY_PATH)) {
    console.error(
        `coverage-summary.json not found at ${SUMMARY_PATH}\n` +
        `Run "npm run test:coverage -w backend" first.`,
    );
    process.exit(1);
}

const summary = JSON.parse(readFileSync(SUMMARY_PATH, 'utf8'));
const final = existsSync(FINAL_PATH)
    ? JSON.parse(readFileSync(FINAL_PATH, 'utf8'))
    : null;

// Files whose coverage gap matters more (HTTP boundary + core business logic).
const PRIORITY_PATTERNS = [
    { pattern: /src\/routes\//, boost: 15, label: 'route' },
    { pattern: /src\/analytics\.ts$/, boost: 15, label: 'analytics' },
    { pattern: /src\/db\.ts$/, boost: 10, label: 'db' },
    { pattern: /src\/server\.ts$/, boost: 5, label: 'server' },
];

function priorityFor(relPath) {
    for (const p of PRIORITY_PATTERNS) {
        if (p.pattern.test(relPath)) return p;
    }
    return { boost: 0, label: '' };
}

function categorize(score) {
    if (score === 0) return 'untested';
    if (score < 50) return 'critical';
    if (score < 80) return 'weak';
    return 'ok';
}

function uncoveredRangesFor(absPath) {
    if (!final || !final[absPath]) return [];
    const fileData = final[absPath];
    const { statementMap = {}, s = {} } = fileData;
    const lines = new Set();
    for (const [id, hits] of Object.entries(s)) {
        if (hits === 0 && statementMap[id]) {
            const { start, end } = statementMap[id];
            for (let ln = start.line; ln <= end.line; ln++) lines.add(ln);
        }
    }
    const sorted = [...lines].sort((a, b) => a - b);
    const ranges = [];
    let runStart = null;
    let prev = null;
    for (const ln of sorted) {
        if (runStart === null) {
            runStart = ln;
            prev = ln;
        } else if (ln === prev + 1) {
            prev = ln;
        } else {
            ranges.push(runStart === prev ? `${runStart}` : `${runStart}-${prev}`);
            runStart = ln;
            prev = ln;
        }
    }
    if (runStart !== null) {
        ranges.push(runStart === prev ? `${runStart}` : `${runStart}-${prev}`);
    }
    return ranges;
}

const rows = [];
for (const [absPath, metrics] of Object.entries(summary)) {
    if (absPath === 'total') continue;
    const relPath = relative(BACKEND_ROOT, absPath).split(sep).join('/');
    const lines = metrics.lines?.pct ?? 0;
    const branches = metrics.branches?.pct ?? 0;
    const functions = metrics.functions?.pct ?? 0;
    const score = lines * 0.5 + branches * 0.3 + functions * 0.2;
    const { boost, label } = priorityFor(relPath);
    const priorityScore = (100 - score) + boost; // higher = needs tests more
    rows.push({
        relPath,
        absPath,
        lines,
        branches,
        functions,
        score,
        priorityScore,
        boost,
        label,
        category: categorize(score),
    });
}

rows.sort((a, b) => b.priorityScore - a.priorityScore);

const total = summary.total ?? {};
const totalLines = total.lines?.pct ?? 0;
const totalBranches = total.branches?.pct ?? 0;
const totalFunctions = total.functions?.pct ?? 0;

const buckets = { untested: [], critical: [], weak: [], ok: [] };
for (const r of rows) buckets[r.category].push(r);

const out = [];
out.push('# Backend Test Coverage Recommendations');
out.push('');
out.push(
    `**Totals** — lines: ${totalLines.toFixed(1)}% · branches: ${totalBranches.toFixed(1)}% · functions: ${totalFunctions.toFixed(1)}%`,
);
out.push('');
out.push(
    `Files ranked by need-for-tests (higher = more urgent). Priority boost applied to routes, analytics, db, server.`,
);
out.push('');

function renderBucket(title, items) {
    if (!items.length) return;
    out.push(`## ${title} (${items.length})`);
    out.push('');
    out.push('| Priority | File | Lines % | Branches % | Funcs % | Tag | Uncovered lines |');
    out.push('| --- | --- | --- | --- | --- | --- | --- |');
    for (const r of items) {
        const ranges = uncoveredRangesFor(r.absPath);
        const shown = ranges.slice(0, 6).join(', ');
        const more = ranges.length > 6 ? ` (+${ranges.length - 6} more)` : '';
        out.push(
            `| ${r.priorityScore.toFixed(1)} | \`${r.relPath}\` | ${r.lines.toFixed(0)} | ${r.branches.toFixed(0)} | ${r.functions.toFixed(0)} | ${r.label || '—'} | ${shown || '—'}${more} |`,
        );
    }
    out.push('');
}

renderBucket('Untested (0% coverage)', buckets.untested);
renderBucket('Critical (<50%)', buckets.critical);
renderBucket('Weak (50–80%)', buckets.weak);
renderBucket('OK (≥80%)', buckets.ok);

const top = rows.slice(0, 3);
if (top.length) {
    out.push('## Top recommendations');
    out.push('');
    for (const r of top) {
        out.push(
            `- **\`${r.relPath}\`** — ${r.category}, score ${r.score.toFixed(1)}/100${r.label ? ` (${r.label})` : ''}. Suggest adding tests covering uncovered branches and exported functions.`,
        );
    }
    out.push('');
}

process.stdout.write(out.join('\n'));
