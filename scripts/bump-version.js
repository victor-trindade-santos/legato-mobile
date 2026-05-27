const fs = require("fs");
const path = require("path");

const appJsonPath = path.resolve(__dirname, "../app.json");
const appJson = JSON.parse(fs.readFileSync(appJsonPath, "utf8"));

const current = appJson.expo.version;
const parts = current.split(".").map(Number);
parts[2] += 1; // incrementa patch: 1.0.0 → 1.0.1
const next = parts.join(".");

appJson.expo.version = next;
fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2) + "\n");

console.log(`Version bumped: ${current} → ${next}`);
