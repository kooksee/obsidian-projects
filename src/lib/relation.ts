import type { DataRecord, DataValue, Optional } from "./dataframe/dataframe";

export interface RelationFieldOptions {
    readonly multiple?: boolean;
}

export interface RelationRef {
    readonly sourceRecordId: string;
    readonly fieldName: string;
    readonly targetPath: string;
}

export interface RelationIndex {
    readonly outgoing: RelationRef[];
    readonly outgoingByRecordId: Record<string, RelationRef[]>;
    readonly incomingByTargetPath: Record<string, RelationRef[]>;
}

const WIKILINK_REGEX = /^\[\[([^\]]+)\]\]$/;

export function parseWikilinkTarget(value: string): string | null {
    const trimmed = value.trim();
    if (!trimmed) {
        return null;
    }

    const match = trimmed.match(WIKILINK_REGEX);
    if (!match?.[1]) {
        return null;
    }

    const targetPart = match[1].split("|")[0]?.trim();
    if (!targetPart) {
        return null;
    }

    const noSubpath = targetPart.split("#")[0]?.split("^")[0]?.trim();
    return noSubpath || null;
}

export function normalizeRelationTargets(value: unknown): string[] {
    if (typeof value === "string") {
        const target = parseWikilinkTarget(value);
        return target ? [target] : [];
    }

    if (Array.isArray(value)) {
        const targets = value
            .filter((v): v is string => typeof v === "string")
            .map((v) => parseWikilinkTarget(v))
            .filter((v): v is string => Boolean(v));

        return [...new Set(targets)];
    }

    return [];
}

export function normalizeRelationEditorTarget(value: unknown): string | null {
    if (typeof value !== "string") {
        return null;
    }

    const trimmed = value.trim();
    if (!trimmed) {
        return null;
    }

    const parsed = parseWikilinkTarget(trimmed);
    if (parsed) {
        return parsed;
    }

    return trimmed;
}

export function normalizeRelationEditorTargets(value: unknown): string[] {
    if (typeof value === "string") {
        const target = normalizeRelationEditorTarget(value);
        return target ? [target] : [];
    }

    if (Array.isArray(value)) {
        const targets = value
            .map((v) => normalizeRelationEditorTarget(v))
            .filter((v): v is string => Boolean(v));

        return [...new Set(targets)];
    }

    return [];
}

export function serializeRelationTargets(
    targets: string[],
    options: RelationFieldOptions = {}
): Optional<DataValue> {
    const normalized = [...new Set(targets.map((v) => v.trim()).filter(Boolean))];
    const asLinks = normalized.map((target) => `[[${target}]]`);

    if (options.multiple) {
        return asLinks;
    }

    return asLinks[0] ?? null;
}

export function buildRelationIndex(
    records: DataRecord[],
    relationFields: string[]
): RelationIndex {
    const outgoing: RelationRef[] = [];

    for (const record of records) {
        for (const fieldName of relationFields) {
            const targets = normalizeRelationTargets(record.values[fieldName]);
            for (const targetPath of targets) {
                outgoing.push({
                    sourceRecordId: record.id,
                    fieldName,
                    targetPath,
                });
            }
        }
    }

    const outgoingByRecordId = groupBy(outgoing, (ref) => ref.sourceRecordId);
    const incomingByTargetPath = groupBy(outgoing, (ref) => ref.targetPath);

    return {
        outgoing,
        outgoingByRecordId,
        incomingByTargetPath,
    };
}

export function findIncomingRelations(
    records: DataRecord[],
    relationFields: string[],
    targetRecordId: string
): RelationRef[] {
    const index = buildRelationIndex(records, relationFields);
    const targetKey = relationPathKey(targetRecordId);

    return index.outgoing.filter(
        (ref) => relationPathKey(ref.targetPath) === targetKey
    );
}

function groupBy<T>(items: T[], keyFn: (item: T) => string): Record<string, T[]> {
    const grouped: Record<string, T[]> = {};

    for (const item of items) {
        const key = keyFn(item);
        if (!grouped[key]) {
            grouped[key] = [];
        }
        grouped[key]?.push(item);
    }

    return grouped;
}

function relationPathKey(path: string): string {
    return path.endsWith(".md") ? path.slice(0, -3) : path;
}
