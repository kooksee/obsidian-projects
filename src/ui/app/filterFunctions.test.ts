import { describe, expect, it } from "@jest/globals";
import { matchesCondition } from "./filterFunctions";

describe("relation-aware filtering", () => {
    it("matches relation string using plain target path", () => {
        const matched = matchesCondition(
            {
                field: "owner",
                operator: "is",
                value: "People/Alice",
                enabled: true,
            },
            {
                id: "Tasks/T1.md",
                values: {
                    owner: "[[People/Alice|Alice]]",
                },
            }
        );

        expect(matched).toBe(true);
    });

    it("supports relation contains with normalized target", () => {
        const matched = matchesCondition(
            {
                field: "owner",
                operator: "contains",
                value: "People",
                enabled: true,
            },
            {
                id: "Tasks/T1.md",
                values: {
                    owner: "[[People/Alice]]",
                },
            }
        );

        expect(matched).toBe(true);
    });

    it("supports relation list any/all/none with plain targets", () => {
        const record = {
            id: "Tasks/T1.md",
            values: {
                reviewers: ["[[People/Alice]]", "[[People/Bob]]"],
            },
        };

        expect(
            matchesCondition(
                {
                    field: "reviewers",
                    operator: "has-any-of",
                    value: JSON.stringify(["People/Bob"]),
                    enabled: true,
                },
                record
            )
        ).toBe(true);

        expect(
            matchesCondition(
                {
                    field: "reviewers",
                    operator: "has-all-of",
                    value: JSON.stringify(["People/Alice", "People/Bob"]),
                    enabled: true,
                },
                record
            )
        ).toBe(true);

        expect(
            matchesCondition(
                {
                    field: "reviewers",
                    operator: "has-none-of",
                    value: JSON.stringify(["People/Carol"]),
                    enabled: true,
                },
                record
            )
        ).toBe(true);
    });

    it("keeps non-relation exact matching behavior for plain strings", () => {
        expect(
            matchesCondition(
                {
                    field: "status",
                    operator: "is",
                    value: "todo",
                    enabled: true,
                },
                {
                    id: "Tasks/T1.md",
                    values: {
                        status: " todo ",
                    },
                }
            )
        ).toBe(false);
    });
});
