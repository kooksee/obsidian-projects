import { expect, test } from "@jest/globals";

import { DEFAULT_PROJECT, type ProjectDefinition } from "../settings/settings";
import {
    applyProjectBlueprint,
    getProjectBlueprint,
} from "./projectBlueprints";

function createProject(): ProjectDefinition {
    return {
        ...DEFAULT_PROJECT,
        id: "p-1",
        name: "Test Project",
        views: [],
        fieldConfig: {
            customField: {
                options: ["custom"],
            },
        },
        defaultName: "custom-default",
    };
}

test("getProjectBlueprint falls back to blank", () => {
    const blueprint = getProjectBlueprint("blank");

    expect(blueprint.id).toBe("blank");
});

test("applyProjectBlueprint keeps custom field config", () => {
    const project = createProject();
    const updated = applyProjectBlueprint(project, "product-dev");

    expect(updated.fieldConfig["customField"]?.options).toEqual(["custom"]);
    expect(updated.fieldConfig["status"]?.options).toContain("todo");
    expect(updated.fieldConfig["priority"]?.options).toContain("P0");
});

test("applyProjectBlueprint updates default name", () => {
    const project = createProject();
    const updated = applyProjectBlueprint(project, "requirements-pool");

    expect(updated.defaultName).toContain("REQ-");
});
