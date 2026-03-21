import type { FilterCondition, FilterDefinition } from "src/settings/settings";

export type QuickFilterPreset =
    | "none"
    | "current-sprint"
    | "my-tasks"
    | "blocked"
    | "my-sprint";

export function buildQuickFilter(
    preset: QuickFilterPreset,
    values: { sprint: string; owner: string }
): FilterDefinition {
    const sprint = values.sprint.trim();
    const owner = values.owner.trim();

    const ownerCond: FilterCondition = {
        field: "owner",
        operator: "is",
        value: owner,
        enabled: true,
    };

    const sprintCond: FilterCondition = {
        field: "sprint",
        operator: "is",
        value: sprint,
        enabled: true,
    };

    switch (preset) {
        case "current-sprint":
            return {
                conjunction: "and",
                conditions: sprint ? [sprintCond] : [],
            };

        case "my-tasks":
            return {
                conjunction: "and",
                conditions: owner ? [ownerCond] : [],
            };

        case "blocked":
            return {
                conjunction: "and",
                conditions: [
                    { field: "status", operator: "is", value: "blocked", enabled: true },
                ],
            };

        case "my-sprint":
            return {
                conjunction: "and",
                conditions: [
                    ...(owner ? [ownerCond] : []),
                    ...(sprint ? [sprintCond] : []),
                ],
            };

        case "none":
        default:
            return {
                conjunction: "and",
                conditions: [],
            };
    }
}
