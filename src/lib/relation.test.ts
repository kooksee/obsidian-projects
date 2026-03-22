import { describe, expect, it } from "@jest/globals";
import type { DataRecord } from "./dataframe/dataframe";
import {
    buildRelationIndex,
    findIncomingRelations,
    normalizeRelationEditorTarget,
    normalizeRelationEditorTargets,
    normalizeRelationTargets,
    parseWikilinkTarget,
    serializeRelationTargets,
} from "./relation";

describe("parseWikilinkTarget", () => {
    it("parses wikilink target and strips alias/subpath", () => {
        expect(parseWikilinkTarget("[[Projects/Alpha]]")).toBe("Projects/Alpha");
        expect(parseWikilinkTarget("[[Projects/Alpha|Alpha]]")).toBe(
            "Projects/Alpha"
        );
        expect(parseWikilinkTarget("[[Projects/Alpha#Todo]]")).toBe(
            "Projects/Alpha"
        );
    });

    it("returns null for non-wikilink text", () => {
        expect(parseWikilinkTarget("Projects/Alpha")).toBeNull();
        expect(parseWikilinkTarget("[Alpha](Projects/Alpha)")).toBeNull();
        expect(parseWikilinkTarget("   ")).toBeNull();
    });
});

describe("normalizeRelationTargets", () => {
    it("normalizes single and repeated relation values", () => {
        expect(normalizeRelationTargets("[[People/Alice]]")).toStrictEqual([
            "People/Alice",
        ]);

        expect(
            normalizeRelationTargets([
                "[[People/Alice]]",
                "[[People/Bob]]",
                "[[People/Alice|Owner]]",
                "invalid",
            ])
        ).toStrictEqual(["People/Alice", "People/Bob"]);
    });
});

describe("normalizeRelationEditorTarget", () => {
    it("accepts plain text and wikilinks", () => {
        expect(normalizeRelationEditorTarget("People/Alice")).toBe("People/Alice");
        expect(normalizeRelationEditorTarget("[[People/Bob|Bob]]")).toBe(
            "People/Bob"
        );
        expect(normalizeRelationEditorTarget("  ")).toBeNull();
    });
});

describe("normalizeRelationEditorTargets", () => {
    it("normalizes list editor inputs", () => {
        expect(
            normalizeRelationEditorTargets([
                "People/Alice",
                "[[People/Bob]]",
                "[[People/Alice|Owner]]",
                "",
            ])
        ).toStrictEqual(["People/Alice", "People/Bob"]);
    });
});

describe("serializeRelationTargets", () => {
    it("serializes as single value for one-to-one / many-to-one fields", () => {
        expect(serializeRelationTargets(["People/Alice"], { multiple: false })).toBe(
            "[[People/Alice]]"
        );
        expect(serializeRelationTargets([], { multiple: false })).toBeNull();
    });

    it("serializes as list for many-to-many fields", () => {
        expect(
            serializeRelationTargets(["People/Alice", "People/Bob"], {
                multiple: true,
            })
        ).toStrictEqual(["[[People/Alice]]", "[[People/Bob]]"]);
    });
});

describe("buildRelationIndex", () => {
    it("builds outgoing and incoming relations for m2o and m2m", () => {
        const records: DataRecord[] = [
            {
                id: "Tasks/T1.md",
                values: {
                    owner: "[[People/Alice]]",
                    reviewers: ["[[People/Alice]]", "[[People/Bob]]"],
                },
            },
            {
                id: "Tasks/T2.md",
                values: {
                    owner: "[[People/Bob]]",
                    reviewers: ["[[People/Alice]]"],
                },
            },
        ];

        const index = buildRelationIndex(records, ["owner", "reviewers"]);

        expect(index.outgoing).toHaveLength(5);
        expect(index.outgoingByRecordId["Tasks/T1.md"]?.length).toBe(3);
        expect(index.incomingByTargetPath["People/Alice"]?.length).toBe(3);
        expect(index.incomingByTargetPath["People/Bob"]?.length).toBe(2);
    });
});

describe("findIncomingRelations", () => {
    it("finds incoming refs using record id and supports .md normalization", () => {
        const records: DataRecord[] = [
            {
                id: "Tasks/T1.md",
                values: {
                    owner: "[[People/Alice]]",
                    reviewers: ["[[People/Bob]]"],
                },
            },
            {
                id: "Tasks/T2.md",
                values: {
                    owner: "[[People/Alice.md]]",
                },
            },
        ];

        const incoming = findIncomingRelations(records, ["owner", "reviewers"], "People/Alice.md");

        expect(incoming).toHaveLength(2);
        expect(incoming.map((v) => v.sourceRecordId)).toStrictEqual([
            "Tasks/T1.md",
            "Tasks/T2.md",
        ]);
    });
});
