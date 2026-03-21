import type { FieldConfig, ProjectDefinition } from "src/settings/settings";

export type ProjectBlueprintId =
    | "blank"
    | "product-dev"
    | "requirements-pool"
    | "sprint-board";

export type ProjectBlueprint = {
    id: ProjectBlueprintId;
    label: string;
    description: string;
    defaultName?: string;
    fieldConfig: Record<string, FieldConfig>;
};

const productDevBlueprint: ProjectBlueprint = {
    id: "product-dev",
    label: "Product Development",
    description: "Product + release + sprint + feature + task",
    defaultName: "{{date:YYYY-MM-DD}} {{title}}",
    fieldConfig: {
        type: {
            options: ["requirement", "feature", "task", "bug", "release"],
        },
        status: {
            options: ["todo", "doing", "blocked", "done"],
        },
        priority: {
            options: ["P0", "P1", "P2", "P3"],
        },
        product: {
            options: [],
        },
        release: {
            options: [],
        },
        sprint: {
            options: [],
        },
        owner: {
            options: [],
        },
        due: {
            time: false,
        },
    },
};

const requirementsPoolBlueprint: ProjectBlueprint = {
    id: "requirements-pool",
    label: "Requirements Pool",
    description: "Collect, review and prioritize requirements",
    defaultName: "REQ-{{date:YYYYMMDD}} {{title}}",
    fieldConfig: {
        type: {
            options: ["requirement"],
        },
        status: {
            options: ["idea", "analysis", "approved", "rejected"],
        },
        priority: {
            options: ["P0", "P1", "P2"],
        },
        product: {
            options: [],
        },
        owner: {
            options: [],
        },
        release: {
            options: [],
        },
    },
};

const sprintBoardBlueprint: ProjectBlueprint = {
    id: "sprint-board",
    label: "Sprint Todo",
    description: "Sprint planning and execution",
    defaultName: "{{date:MMDD}} {{title}}",
    fieldConfig: {
        type: {
            options: ["task", "bug", "chore"],
        },
        status: {
            options: ["todo", "doing", "done"],
        },
        sprint: {
            options: [],
        },
        storyPoint: {
            options: ["1", "2", "3", "5", "8", "13"],
        },
        owner: {
            options: [],
        },
        requirementId: {
            options: [],
        },
        due: {
            time: false,
        },
    },
};

const blankBlueprint: ProjectBlueprint = {
    id: "blank",
    label: "Blank",
    description: "Start with an empty project",
    fieldConfig: {},
};

export const projectBlueprints: ProjectBlueprint[] = [
    blankBlueprint,
    productDevBlueprint,
    requirementsPoolBlueprint,
    sprintBoardBlueprint,
];

export function getProjectBlueprint(id: ProjectBlueprintId): ProjectBlueprint {
    return projectBlueprints.find((blueprint) => blueprint.id === id) ?? blankBlueprint;
}

export function applyProjectBlueprint(
    project: ProjectDefinition,
    id: ProjectBlueprintId
): ProjectDefinition {
    const blueprint = getProjectBlueprint(id);

    return {
        ...project,
        defaultName: blueprint.defaultName ?? project.defaultName,
        fieldConfig: {
            ...blueprint.fieldConfig,
            ...project.fieldConfig,
        },
    };
}
