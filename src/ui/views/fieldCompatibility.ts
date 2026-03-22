import type { DataRecord } from "src/lib/dataframe/dataframe";

export interface FieldCompatibilityStats {
  readonly total: number;
  readonly populated: number;
  readonly compatible: number;
  readonly incompatible: number;
}

type TranslateFn = (key: string, vars?: Record<string, unknown>) => string;

export function evaluateFieldCompatibility(
  records: DataRecord[],
  fieldName: string,
  isCompatible: (value: unknown) => boolean
): FieldCompatibilityStats {
  let populated = 0;
  let compatible = 0;

  for (const record of records) {
    const value = record.values[fieldName];
    if (!hasValue(value)) {
      continue;
    }

    populated += 1;
    if (isCompatible(value)) {
      compatible += 1;
    }
  }

  return {
    total: records.length,
    populated,
    compatible,
    incompatible: populated - compatible,
  };
}

export function isBoardStatusCompatible(value: unknown): boolean {
  if (typeof value === "string") {
    return value.trim().length > 0;
  }

  if (typeof value === "number") {
    return Number.isFinite(value);
  }

  return false;
}

export function formatFieldCompatibilityOptionLabel(
  fieldName: string,
  stats: FieldCompatibilityStats | undefined,
  t: TranslateFn
): string {
  if (!stats || stats.populated === 0) {
    return fieldName;
  }

  return t("views.field-compatibility.option", {
    name: fieldName,
    compatible: stats.compatible,
    populated: stats.populated,
  });
}

export function formatFieldCompatibilityHint(
  stats: FieldCompatibilityStats | undefined,
  t: TranslateFn
): string {
  if (!stats) {
    return "";
  }

  if (stats.populated === 0) {
    return t("views.field-compatibility.hint-empty");
  }

  if (stats.incompatible > 0) {
    return t("views.field-compatibility.hint-issues", {
      incompatible: stats.incompatible,
      compatible: stats.compatible,
      populated: stats.populated,
    });
  }

  return t("views.field-compatibility.hint-good", {
    compatible: stats.compatible,
    populated: stats.populated,
  });
}

function hasValue(value: unknown): boolean {
  if (value === null || value === undefined) {
    return false;
  }

  if (typeof value === "string") {
    return value.trim().length > 0;
  }

  return true;
}
