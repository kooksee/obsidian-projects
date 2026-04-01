import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const requiredFiles = [
    { source: "build/main.js", target: "main.js" },
    { source: "build/manifest.json", target: "manifest.json" },
    { source: "build/styles.css", target: "styles.css" },
];

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const preferredDefaultVaultPath = "/Users/barry/git/siyuan/obsidian";
const preferredDefaultTemplatesPath = "/Users/barry/git/siyuan/obsidian/templates/system";
const legacyPluginIds = ["obsidian-projects", "pprojects"];
const defaultTemplatesSourceDir = path.join(projectRoot, "templates", "system");

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

    for (const file of requiredFiles) {
        const source = path.join(projectRoot, file.source);
        if (!(await exists(source))) {
            missingFiles.push(file.source);
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

const readJson = async (filePath) => {
    try {
        const raw = await fs.readFile(filePath, "utf8");
        return JSON.parse(raw);
    } catch {
        return null;
    }
};

const getProjectCount = (data) => {
    if (!data || !Array.isArray(data.projects)) {
        return 0;
    }
    return data.projects.length;
};

const resolvePluginId = async () => {
    const manifestPath = path.join(projectRoot, "build", "manifest.json");
    const manifest = await readJson(manifestPath);

    const id = manifest?.id;
    if (typeof id === "string" && id.trim().length > 0) {
        return id.trim();
    }

    console.error(`❌ Missing or invalid plugin id in ${manifestPath}`);
    process.exit(1);
};

const migrateDataIfNeeded = async (pluginsRootDir, pluginId) => {
    const targetDataPath = path.join(pluginsRootDir, pluginId, "data.json");
    const targetData = await readJson(targetDataPath);
    const targetCount = getProjectCount(targetData);

    let bestSource = null;
    let bestCount = targetCount;

    for (const id of legacyPluginIds) {
        if (id === pluginId) {
            continue;
        }

        const sourceDataPath = path.join(pluginsRootDir, id, "data.json");
        const sourceData = await readJson(sourceDataPath);
        const sourceCount = getProjectCount(sourceData);

        if (sourceCount > bestCount) {
            bestSource = sourceDataPath;
            bestCount = sourceCount;
        }
    }

    if (!bestSource) {
        return;
    }

    await fs.mkdir(path.join(pluginsRootDir, pluginId), { recursive: true });

    try {
        await fs.access(targetDataPath);
        const backupPath = `${targetDataPath}.bak.${Date.now()}`;
        await fs.copyFile(targetDataPath, backupPath);
        console.log(`ℹ️ Backed up existing data.json to ${backupPath}`);
    } catch {
        // no existing data.json, nothing to backup
    }

    await fs.copyFile(bestSource, targetDataPath);
    console.log(`✅ Migrated data.json from ${bestSource}`);
};

const syncDefaultTemplates = async (sourceDir, targetDir) => {
    if (!(await exists(sourceDir))) {
        console.warn(`⚠️ Templates source directory not found: ${sourceDir}`);
        return [];
    }

    await fs.mkdir(targetDir, { recursive: true });

    const entries = await fs.readdir(sourceDir, { withFileTypes: true });
    const copiedPaths = [];

    for (const entry of entries) {
        if (!entry.isFile()) {
            continue;
        }

        const source = path.join(sourceDir, entry.name);
        const target = path.join(targetDir, entry.name);
        await fs.copyFile(source, target);
        copiedPaths.push(target);
    }

    return copiedPaths;
};

const cliVaultPath = process.argv[2];
const cliTemplatesPath = process.argv[3];
const envVaultPath = process.env.OBSIDIAN_VAULT_PATH;
const envTemplatesPath = process.env.OBSIDIAN_TEMPLATES_PATH;
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
const templatesPath = path.resolve(
    cliTemplatesPath ??
    envTemplatesPath ??
    (resolvedVaultPath === preferredDefaultVaultPath
        ? preferredDefaultTemplatesPath
        : path.join(resolvedVaultPath, "templates", "system"))
);
const obsidianConfigDir = path.join(resolvedVaultPath, ".obsidian");
const pluginsRootDir = path.join(obsidianConfigDir, "plugins");

try {
    await fs.access(obsidianConfigDir);
} catch {
    console.error(
        `❌ Couldn't find .obsidian directory in vault: ${resolvedVaultPath}`
    );
    console.error("Please pass the root folder of an existing Obsidian vault.");
    process.exit(1);
}

await ensureBuildArtifacts();

const pluginId = await resolvePluginId();
const pluginDir = path.join(pluginsRootDir, pluginId);
await fs.mkdir(pluginDir, { recursive: true });

await migrateDataIfNeeded(pluginsRootDir, pluginId);

for (const fileName of requiredFiles) {
    const source = path.join(projectRoot, fileName.source);
    const target = path.join(pluginDir, fileName.target);

    await fs.copyFile(source, target);
}

const syncedTemplateFiles = await syncDefaultTemplates(
    defaultTemplatesSourceDir,
    templatesPath
);

console.log("✅ Installed plugin into Obsidian vault");
console.log(`Vault:  ${resolvedVaultPath}`);
console.log(`Target: ${pluginDir}`);
console.log(`Templates: ${templatesPath}`);
if (syncedTemplateFiles.length > 0) {
    console.log(`✅ Synced ${syncedTemplateFiles.length} default templates`);
}

if (!cliVaultPath && !envVaultPath && preferredVaultPath) {
    if (preferredVaultPath) {
        console.log("ℹ️ Using preferred default vault path.");
    }
}