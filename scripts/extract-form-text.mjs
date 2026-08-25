#!/usr/bin/env node
/**
 * Extracts the wording of the official application form from the source
 * .docx into tests/fixtures/official-form.txt, which the fidelity suite
 * asserts the rendered document against.
 *
 *   node scripts/extract-form-text.mjs "<path to the .docx>"
 *
 * Re-run this only when Tzu Chi issues a new edition of the form — and
 * expect the fidelity test to fail until the renderer is updated to match.
 */

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { inflateRawSync } from "node:zlib";

const here = dirname(fileURLToPath(import.meta.url));
const source = process.argv[2];
if (!source) {
  console.error('Usage: node scripts/extract-form-text.mjs "<form.docx>"');
  process.exit(1);
}

/** Minimal ZIP reader — enough to pull one stored/deflated entry out. */
function readZipEntry(buffer, name) {
  const target = Buffer.from(name, "utf8");
  let offset = buffer.length - 22;
  while (offset >= 0 && buffer.readUInt32LE(offset) !== 0x06054b50) offset -= 1;
  if (offset < 0) throw new Error("not a zip file");
  const entryCount = buffer.readUInt16LE(offset + 10);
  let cursor = buffer.readUInt32LE(offset + 16);

  for (let index = 0; index < entryCount; index += 1) {
    const nameLength = buffer.readUInt16LE(cursor + 28);
    const extraLength = buffer.readUInt16LE(cursor + 30);
    const commentLength = buffer.readUInt16LE(cursor + 32);
    const localOffset = buffer.readUInt32LE(cursor + 42);
    const entryName = buffer.subarray(cursor + 46, cursor + 46 + nameLength);

    if (entryName.equals(target)) {
      const method = buffer.readUInt16LE(localOffset + 8);
      const compressedSize = buffer.readUInt32LE(cursor + 20);
      const localNameLength = buffer.readUInt16LE(localOffset + 26);
      const localExtraLength = buffer.readUInt16LE(localOffset + 28);
      const start = localOffset + 30 + localNameLength + localExtraLength;
      const raw = buffer.subarray(start, start + compressedSize);
      return method === 0 ? raw : inflateRawSync(raw);
    }
    cursor += 46 + nameLength + extraLength + commentLength;
  }
  throw new Error(`${name} not found in the archive`);
}

const docx = await readFile(source);
const xml = readZipEntry(docx, "word/document.xml").toString("utf8");

const lines = [];
let buffer = "";
const flush = () => {
  const line = buffer.replace(/ /g, " ").trim();
  if (line) lines.push(line);
  buffer = "";
};

// Walk the runs in document order: <w:t> is text, <w:br>/<w:p> break lines.
const token = /<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>|<w:br\s*\/?>|<\/w:p>|<w:tab\s*\/?>/g;
let match;
while ((match = token.exec(xml)) !== null) {
  if (match[1] !== undefined) {
    buffer += match[1]
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/&amp;/g, "&");
  } else {
    flush();
  }
}
flush();

const out = join(here, "..", "tests", "fixtures", "official-form.txt");
await writeFile(out, `${lines.join("\n")}\n`, "utf8");
console.log(`Extracted ${lines.length} line(s) from ${source}\n  -> ${out}`);
