import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const pluginId = "obsidian-projects";
const requiredFiles = ["main.js", "manifest.json", "styles.css"];

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const preferredDefaultVaultPath = "/Users/barry/git/siyuan/obsidian";

const exists = async (targetPath) => {
    try {
        await fs.access(targetPath);
        return true;
    } catch {
        return false;
    }
};

const runBuild = async () => {
    const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";

    await new Promise((resolve, reject) => {
        const child = spawn(npmCommand, ["run", "build"], {
            cwd: projectRoot,
            stdio: "inherit",
        });

        child.on("error", reject);
        child.on("exit", (code) => {
            if (code === 0) {
                resolve();
                return;
            }

            reject(new Error(`Build failed with exit code ${code ?? "unknown"}`));
        });
    });
};

const ensureBuildArtifacts = async () => {
    const missingFiles = [];

    for (const fileName of requiredFiles) {
        const source = path.join(projectRoot, fileName);
        if (!(await exists(source))) {
            missingFiles.push(fileName);
        }
    }

    if (missingFiles.length === 0) {
        return;
    }

    console.log(
        `ℹ️ Missing build artifacts (${missingFiles.join(", ")}), running npm run build first...`
    );

    try {
        await runBuild();
    } catch (error) {
        console.error("❌ Build failed before installation.");
        console.error(error instanceof Error ? error.message : String(error));
        process.exit(1);
    }
};

const cliVaultPath = process.argv[2];
const envVaultPath = process.env.OBSIDIAN_VAULT_PATH;
const preferredVaultPath = (await exists(path.join(preferredDefaultVaultPath, ".obsidian")))
    ? preferredDefaultVaultPath
    : null;
const vaultPath = cliVaultPath ?? envVaultPath ?? preferredVaultPath;

if (!vaultPath) {
    console.error("❌ Missing vault path.");
    console.error(
        "Usage: npm run install:obsidian -- \"/absolute/path/to/your/ObsidianVault\""
    );
    console.error(`Preferred default not found: ${preferredDefaultVaultPath}`);
    console.error("Or set OBSIDIAN_VAULT_PATH environment variable.");
    process.exit(1);
}

const resolvedVaultPath = path.resolve(vaultPath);
const obsidianConfigDir = path.join(resolvedVaultPath, ".obsidian");
const pluginDir = path.join(obsidianConfigDir, "plugins", pluginId);

try {
    await fs.access(obsidianConfigDir);
} catch {
    console.error(
        `❌ Couldn't find .obsidian directory in vault: ${resolvedVaultPath}`
    );
    console.error("Please pass the root folder of an existing Obsidian vault.");
    process.exit(1);
}

await fs.mkdir(pluginDir, { recursive: true });

await ensureBuildArtifacts();

for (const fileName of requiredFiles) {
    const source = path.join(projectRoot, fileName);
    const target = path.join(pluginDir, fileName);

    await fs.copyFile(source, target);
}

console.log("✅ Installed plugin into Obsidian vault");
console.log(`Vault:  ${resolvedVaultPath}`);
console.log(`Target: ${pluginDir}`);

if (!cliVaultPath && !envVaultPath && preferredVaultPath) {
    if (preferredVaultPath) {
        console.log("ℹ️ Using preferred default vault path.");
    }
}