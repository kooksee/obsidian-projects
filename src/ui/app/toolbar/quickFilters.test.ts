import { expect, test } from "@jest/globals";
import { buildQuickFilter } from "./quickFilters";

test("blocked preset creates status filter", () => {
    const filter = buildQuickFilter("blocked", { sprint: "", owner: "" });

    expect(filter.conditions).toHaveLength(1);
    expect(filter.conditions[0]?.field).toBe("status");
    expect(filter.conditions[0]?.value).toBe("blocked");
});

test("my-tasks preset uses owner", () => {
    const filter = buildQuickFilter("my-tasks", {
        sprint: "",
        owner: "barry",
    });

    expect(filter.conditions).toHaveLength(1);
    expect(filter.conditions[0]?.field).toBe("owner");
    expect(filter.conditions[0]?.value).toBe("barry");
});

test("my-sprint preset combines owner and sprint", () => {
    const filter = buildQuickFilter("my-sprint", {
        sprint: "Sprint 2026-03",
        owner: "barry",
    });

    expect(filter.conditions).toHaveLength(2);
    expect(filter.conditions.map((x) => x.field)).toEqual(["owner", "sprint"]);
});
