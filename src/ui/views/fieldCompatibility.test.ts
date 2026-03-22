import { describe, expect, it } from "@jest/globals";
import type { DataRecord } from "src/lib/dataframe/dataframe";
import {
    evaluateFieldCompatibility,
    isBoardStatusCompatible,
    normalizeBoardStatusValue,
} from "./fieldCompatibility";

describe("normalizeBoardStatusValue", () => {
    it("normalizes strings and numbers", () => {
        expect(normalizeBoardStatusValue("  todo  ")).toBe("todo");
        expect(normalizeBoardStatusValue("   ")).toBeNull();
        expect(normalizeBoardStatusValue(12)).toBe(12);
        expect(normalizeBoardStatusValue(Number.NaN)).toBeNull();
    });

    it("returns null for unsupported values", () => {
        expect(normalizeBoardStatusValue(true)).toBeNull();
        expect(normalizeBoardStatusValue(null)).toBeNull();
        expect(normalizeBoardStatusValue(undefined)).toBeNull();
        expect(normalizeBoardStatusValue(["todo"])).toBeNull();
    });
});

describe("isBoardStatusCompatible", () => {
    it("treats normalized board statuses as compatible", () => {
        expect(isBoardStatusCompatible(" doing ")).toBe(true);
        expect(isBoardStatusCompatible(3)).toBe(true);
        expect(isBoardStatusCompatible("   ")).toBe(false);
        expect(isBoardStatusCompatible(false)).toBe(false);
    });
});

describe("evaluateFieldCompatibility", () => {
    it("counts populated/compatible/incompatible correctly", () => {
        const records: DataRecord[] = [
            { id: "1.md", values: { status: " todo " } },
            { id: "2.md", values: { status: "" } },
            { id: "3.md", values: { status: null } },
            { id: "4.md", values: { status: 2 } },
            { id: "5.md", values: { status: true } },
        ];

        const stats = evaluateFieldCompatibility(
            records,
            "status",
            isBoardStatusCompatible
        );

        expect(stats).toStrictEqual({
            total: 5,
            populated: 3,
            compatible: 2,
            incompatible: 1,
        });
    });
});
