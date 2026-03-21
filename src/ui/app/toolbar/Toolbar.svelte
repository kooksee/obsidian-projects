<script lang="ts">
  import ViewToolbar from "src/ui/components/Layout/ViewToolbar.svelte";
  import { createProject } from "src/lib/dataApi";
  import { i18n } from "src/lib/stores/i18n";
  import { app } from "src/lib/stores/obsidian";
  import { dataFrame } from "src/lib/stores/dataframe";
  import { settings } from "src/lib/stores/settings";
  import { AddViewModal } from "src/ui/modals/addViewModal";
  import { ConfirmDialogModal } from "src/ui/modals/confirmDialog";
  import { CreateProjectModal } from "src/ui/modals/createProjectModal";
  import { Flair } from "src/ui/components/Flair";

  import ProjectSelect from "./ProjectSelect.svelte";
  import ViewSelect from "./ViewSelect.svelte";
  import { InspectorModal } from "src/ui/modals/inspector";
  import type {
    ProjectDefinition,
    ProjectId,
    ViewId,
  } from "src/settings/settings";
  import { produce } from "immer";
  import ProjectViewOptions from "./viewOptions/ProjectViewOptions.svelte";
  import { buildQuickFilter, type QuickFilterPreset } from "./quickFilters";

  let quickFilterPreset: QuickFilterPreset = "none";
  let quickSprint = "";
  let quickOwner = "me";

  export let projects: ProjectDefinition[];

  export let projectId: ProjectId | undefined;
  export let onProjectChange: (projectId: ProjectId) => void;

  export let viewId: ViewId | undefined;
  export let onViewChange: (viewId: ViewId) => void;

  $: project = projects.find((project) => project.id === projectId);
  $: views = project?.views ?? [];

  $: errors = $dataFrame.errors ?? [];

  $: view = projects
    .find((project) => project.id === projectId)
    ?.views?.find((view) => view.id === viewId);

  function applyQuickFilterPreset() {
    if (!projectId || !view) return;

    const filter = buildQuickFilter(quickFilterPreset, {
      sprint: quickSprint,
      owner: quickOwner,
    });

    settings.updateView(
      projectId,
      produce(view, (draft) => {
        draft.filter = filter;
      })
    );
  }
</script>

<!--
	@component

	Toolbar lets the user manage projects and views.
-->
<ViewToolbar variant="primary">
  <svelte:fragment slot="info">
    {#if errors.length}
      <Flair
        variant="error"
        on:click={() => {
          new InspectorModal($app, "Project inspector", errors).open();
        }}
        >{`${errors.length} ${errors.length === 1 ? "error" : "errors"}`}</Flair
      >
    {/if}
  </svelte:fragment>

  <ProjectSelect
    slot="left"
    {projectId}
    {projects}
    {onProjectChange}
    onProjectAdd={() =>
      new CreateProjectModal(
        $app,
        $i18n.t("modals.project.create.title"),
        $i18n.t("modals.project.create.cta"),
        (project) => {
          settings.addProject(project);
          projectId = project.id;
          onProjectChange(project.id);
        },
        createProject()
      ).open()}
  />

  <div slot="middle">
    {#if project}
      <ViewSelect
        {viewId}
        {views}
        viewExists={(name) =>
          !!project?.views.find((view) => view.name === name)}
        onViewSort={(viewIds) => {
          if (projectId) {
            settings.sortViews(projectId, viewIds);
          }
        }}
        onViewAdd={() => {
          if (project) {
            new AddViewModal($app, project, (projectId, view) => {
              settings.addView(projectId, view);
              onViewChange(view.id);
            }).open();
          }
        }}
        onViewRename={(viewId, name) => {
          if (projectId) {
            settings.renameView(projectId, viewId, name);
          }
        }}
        {onViewChange}
        onViewDuplicate={(viewId) => {
          if (projectId) {
            const id = settings.duplicateView(projectId, viewId);
            onViewChange(id);
          }
        }}
        onViewDelete={(viewId) => {
          new ConfirmDialogModal(
            $app,
            $i18n.t("modals.view.delete.title"),
            $i18n.t("modals.view.delete.message", {
              view: view?.name ?? "",
            }),
            $i18n.t("modals.view.delete.cta"),
            () => {
              if (projectId) {
                settings.deleteView(projectId, viewId);
              }
            }
          ).open();
        }}
      />
    {/if}
  </div>
  <svelte:fragment slot="right">
    {#if view}
      <div class="quick-filter-toolbar">
        <label>
          Quick
          <select bind:value={quickFilterPreset}>
            <option value="none">All</option>
            <option value="current-sprint">Current Sprint</option>
            <option value="my-tasks">My Tasks</option>
            <option value="blocked">Blocked</option>
            <option value="my-sprint">My Sprint</option>
          </select>
        </label>

        {#if quickFilterPreset === "current-sprint" || quickFilterPreset === "my-sprint"}
          <label>
            Sprint
            <input bind:value={quickSprint} placeholder="Sprint 2026-03" />
          </label>
        {/if}

        {#if quickFilterPreset === "my-tasks" || quickFilterPreset === "my-sprint"}
          <label>
            Owner
            <input bind:value={quickOwner} placeholder="me" />
          </label>
        {/if}

        <button on:click={applyQuickFilterPreset}>Apply</button>
      </div>

      <ProjectViewOptions
        {view}
        fields={$dataFrame.fields}
        onFilterChange={(filter) => {
          if (projectId && view) {
            settings.updateView(
              projectId,
              produce(view, (draft) => {
                draft.filter = filter;
              })
            );
          }
        }}
        onColorChange={(filter) => {
          if (projectId && view) {
            settings.updateView(
              projectId,
              produce(view, (draft) => {
                draft.colors = filter;
              })
            );
          }
        }}
        onSortChange={(filter) => {
          if (projectId && view) {
            settings.updateView(
              projectId,
              produce(view, (draft) => {
                draft.sort = filter;
              })
            );
          }
        }}
      />
    {/if}
  </svelte:fragment>
</ViewToolbar>

<style>
  .quick-filter-toolbar {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-right: 10px;
  }

  .quick-filter-toolbar label {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: var(--font-ui-smaller);
    color: var(--text-muted);
  }

  .quick-filter-toolbar select,
  .quick-filter-toolbar input,
  .quick-filter-toolbar button {
    font-size: var(--font-ui-small);
    border: 1px solid var(--background-modifier-border);
    border-radius: 6px;
    background: var(--background-primary-alt);
    color: var(--text-normal);
    padding: 3px 6px;
  }

  .quick-filter-toolbar button {
    cursor: pointer;
  }
</style>
