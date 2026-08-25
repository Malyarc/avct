#!/usr/bin/env node
/**
 * Applies db/schema.sql to the Neon database in DATABASE_URL.
 * Idempotent: every statement is CREATE ... IF NOT EXISTS or CREATE OR REPLACE.
 *
 *   DATABASE_URL='postgresql://…' npm run db:migrate
 */

import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { neon } from "@neondatabase/serverless";

const here = dirname(fileURLToPath(import.meta.url));
const schemaPath = join(here, "..", "db", "schema.sql");

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}

/**
 * Splits SQL into statements on top-level semicolons only. `--` line comments,
 * single-quoted literals and $$ … $$ bodies are all skipped, so a semicolon
 * inside any of them cannot truncate a statement.
 */
function splitStatements(sqlText) {
  const statements = [];
  let buffer = "";
  let index = 0;

  while (index < sqlText.length) {
    const rest = sqlText.slice(index);

    if (rest.startsWith("--")) {
      const newline = sqlText.indexOf("\n", index);
      const stop = newline === -1 ? sqlText.length : newline;
      buffer += sqlText.slice(index, stop);
      index = stop;
      continue;
    }

    if (rest.startsWith("$$")) {
      const close = sqlText.indexOf("$$", index + 2);
      const stop = close === -1 ? sqlText.length : close + 2;
      buffer += sqlText.slice(index, stop);
      index = stop;
      continue;
    }

    if (rest.startsWith("'")) {
      let cursor = index + 1;
      while (cursor < sqlText.length) {
        if (sqlText[cursor] === "'" && sqlText[cursor + 1] === "'") {
          cursor += 2;
          continue;
        }
        if (sqlText[cursor] === "'") {
          cursor += 1;
          break;
        }
        cursor += 1;
      }
      buffer += sqlText.slice(index, cursor);
      index = cursor;
      continue;
    }

    if (sqlText[index] === ";") {
      if (buffer.trim()) statements.push(buffer.trim());
      buffer = "";
      index += 1;
      continue;
    }

    buffer += sqlText[index];
    index += 1;
  }

  if (buffer.trim()) statements.push(buffer.trim());
  return statements;
}

/** True when a chunk is nothing but comments and whitespace. */
function isExecutable(statement) {
  return statement
    .split("\n")
    .some((line) => line.trim() && !line.trim().startsWith("--"));
}

const schema = await readFile(schemaPath, "utf8");
const sql = neon(url);
const statements = splitStatements(schema).filter(isExecutable);

let applied = 0;
for (const statement of statements) {
  const label = statement.replace(/\s+/g, " ").slice(0, 72);
  try {
    await sql.query(statement);
    applied += 1;
    console.log(`  ok  ${label}…`);
  } catch (error) {
    console.error(`\nFailed on: ${label}…\n${error.message}`);
    process.exit(1);
  }
}

console.log(`\nSchema applied — ${applied} statement(s).`);
