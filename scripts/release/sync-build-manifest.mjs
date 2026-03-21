import { copyFileSync, mkdirSync } from "fs";

mkdirSync("build", { recursive: true });
copyFileSync("manifest.json", "build/manifest.json");
