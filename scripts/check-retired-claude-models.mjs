#!/usr/bin/env node

import { spawnSync } from "node:child_process"

const roots = process.argv.slice(2)
if (roots.length === 0) {
  console.error("usage: check-retired-claude-models.mjs <path> [...]")
  process.exit(2)
}

const retired = "anthropic/claude-sonnet-4[-.]5|claude-sonnet-4-5-[0-9]{8}"
const result = spawnSync(
  "git",
  ["grep", "-n", "-I", "-E", retired, "--", ...roots, ":(exclude)**/*.test.*", ":(exclude)**/*.spec.*"],
  { encoding: "utf8" },
)

if (result.status === 1) {
  console.log("[model-retirement] OK: nenhum Sonnet 4.5 executável")
  process.exit(0)
}

if (result.status === 0) {
  console.error("[model-retirement] BLOQUEADO: referência executável ao Sonnet 4.5")
  process.stderr.write(result.stdout)
  process.exit(1)
}

process.stderr.write(result.stderr || "[model-retirement] git grep falhou\n")
process.exit(result.status ?? 2)
