<script lang="ts">
  import {
    DataFieldType,
    type DataFrame,
    type DataRecord,
  } from "src/lib/dataframe/dataframe";
  import { createDataRecord } from "src/lib/dataApi";
  import { i18n } from "src/lib/stores/i18n";
  import { app } from "src/lib/stores/obsidian";
  import type { ViewApi } from "src/lib/viewApi";
  import { CreateNoteModal } from "src/ui/modals/createNoteModal";
  import { EditNoteModal } from "src/ui/modals/editNoteModal";

  import type {
    GridColDef,
    GridRowProps,
  } from "./components/DataGrid/dataGrid";
  import DataGrid from "./components/DataGrid/DataGrid.svelte";
  import SwitchSelect from "./components/SwitchSelect/SwitchSelect.svelte";
  import type { TableConfig } from "./types";

  import {
    ViewContent,
    ViewHeader,
    ViewLayout,
    ViewToolbar,
  } from "src/ui/components/Layout";
  import { ConfigureFieldModal } from "src/ui/modals/configureField";
  import { settings } from "src/lib/stores/settings";
  import { groupRowsByField, sortFields } from "./helpers";
  import type { ProjectDefinition } from "src/settings/settings";
  import { CreateFieldModal } from "src/ui/modals/createFieldModal";
  import { Icon } from "obsidian-svelte";
  import { TextLabel } from "./components/DataGrid/GridCell/GridTextCell";
  import { fieldIcon } from "../helpers";

  const EMPTY_GROUP = "(Empty)";

  export let project: ProjectDefinition;
  export let frame: DataFrame;
  export let readonly: boolean;
  export let api: ViewApi;
  export let getRecordColor: (record: DataRecord) => string | null;

  export let config: TableConfig | undefined;
  export let onConfigChange: (cfg: TableConfig) => void;

  let buttonEl: HTMLElement;

  function saveConfig(cfg: TableConfig) {
    config = cfg;
    onConfigChange(cfg);
  }

  export function getFieldTypeByName(name: string): DataFieldType | undefined {
    const field = fields.find((field) => name === field.name);
    return field?.type;
  }

  $: ({ fields, records } = frame);

  $: {
    fields = sortFields(fields, config?.orderFields ?? []);
  }

  $: fieldConfig = config?.fieldConfig ?? {};

  $: columns = fields
    .filter((field) => {
      // Table only supports repeated fields of type string.
      if (field.repeated) {
        return field.type === DataFieldType.String;
      }
      return true;
    })
    .map<GridColDef>((field) => {
      const colDef: GridColDef = {
        ...field,
        field: field.name,
        width: fieldConfig[field.name]?.width ?? 180,
        hide: fieldConfig[field.name]?.hide ?? false,
        pinned: fieldConfig[field.name]?.pinned ?? false,
        editable: !field.derived,
      };

      return colDef;
    });

  $: rows = records.map<GridRowProps>(({ id, values }) => ({
    rowId: id,
    row: values,
  }));

  $: groupByField = config?.groupByField ?? "";
  $: groupOrder = config?.groupOrder ?? [];
  $: groupedRows = groupRowsByField(rows, groupByField, groupOrder);

  $: if (groupByField) {
    normalizeGroupSettings();
  }

  function handleVisibilityChange(field: string, enabled: boolean) {
    saveConfig({
      ...config,
      fieldConfig: {
        ...fieldConfig,
        [field]: {
          ...fieldConfig[field],
          hide: !enabled,
        },
      },
    });
  }

  function handleWidthChange(field: string, width: number) {
    saveConfig({
      ...config,
      fieldConfig: {
        ...fieldConfig,
        [field]: {
          ...fieldConfig[field],
          width,
        },
      },
    });
  }

  function handleColumnPin(field: string) {
    saveConfig({
      ...config,
      fieldConfig: {
        ...fieldConfig,
        [field]: {
          ...fieldConfig[field],
          pinned: !fieldConfig[field]?.pinned,
        },
      },
    });
  }

  function handleColumnAppend() {
    new CreateFieldModal($app, fields, async (field, value) => {
      await api.addField(field, value);

      buttonEl.scrollIntoView({
        block: "nearest",
        inline: "nearest",
        behavior: "smooth",
      });

      if (field.typeConfig) {
        settings.updateFieldConfig(
          project.id,
          field.name,
          fields.map((f) => f.name),
          field.typeConfig
        );
      }
    }).open();
  }

  function handleColumnInsert(anchor: string, direction: number) {
    new CreateFieldModal($app, fields, async (field, value) => {
      const position = fields.findIndex((f) => anchor === f.name) + direction;
      await api.addField(field, value, position);

      if (field.typeConfig) {
        settings.updateFieldConfig(
          project.id,
          field.name,
          fields.map((f) => f.name),
          field.typeConfig
        );
      }

      const orderFields = fields
        .map((f) => f.name)
        .filter((f) => f !== field.name);
      if (position >= 0) orderFields.splice(position, 0, field.name);

      saveConfig({
        ...config,
        orderFields: orderFields,
      });
    }).open();
  }

  function deleteColumnConfig(fieldName: string) {
    const orderFields = fields
      .map((field) => field.name)
      .filter((f) => f !== fieldName);

    const tableFields = { ...config?.fieldConfig };
    delete tableFields[fieldName];

    saveConfig({
      ...config,
      orderFields: orderFields,
      fieldConfig: { ...tableFields },
    });
  }

  function handleGroupByFieldChange(field: string) {
    saveConfig({
      ...config,
      groupByField: field,
      groupOrder: [],
      collapsedGroups: [],
    });
  }

  function handleGroupByFieldSelect(evt: Event) {
    handleGroupByFieldChange((evt.currentTarget as HTMLSelectElement).value);
  }

  function createGroupedNote(groupValue?: string) {
    new CreateNoteModal($app, project, (name, templatePath, project) => {
      const values =
        groupByField && groupValue
          ? {
              [groupByField]:
                groupValue === EMPTY_GROUP ? undefined : groupValue,
            }
          : undefined;

      api.addRecord(
        createDataRecord(name, project, values),
        fields,
        templatePath
      );
    }).open();
  }

  function normalizeGroupSettings() {
    const keys = groupedRows.map((g) => g.key);
    const normalizedOrder = [
      ...groupOrder.filter((k) => keys.includes(k)),
      ...keys.filter((k) => !groupOrder.includes(k)),
    ];

    const collapsed = config?.collapsedGroups ?? [];
    const normalizedCollapsed = collapsed.filter((k) => keys.includes(k));

    if (
      normalizedOrder.join("|") !== groupOrder.join("|") ||
      normalizedCollapsed.join("|") !== collapsed.join("|")
    ) {
      saveConfig({
        ...config,
        groupOrder: normalizedOrder,
        collapsedGroups: normalizedCollapsed,
      });
    }
  }

  function isGroupCollapsed(key: string): boolean {
    return (config?.collapsedGroups ?? []).includes(key);
  }

  function toggleGroupCollapsed(key: string) {
    const collapsed = new Set(config?.collapsedGroups ?? []);

    if (collapsed.has(key)) {
      collapsed.delete(key);
    } else {
      collapsed.add(key);
    }

    saveConfig({
      ...config,
      collapsedGroups: [...collapsed],
    });
  }

  function moveGroup(key: string, direction: -1 | 1) {
    const current = groupedRows.map((g) => g.key);
    const ordered = [
      ...groupOrder.filter((k) => current.includes(k)),
      ...current.filter((k) => !groupOrder.includes(k)),
    ];

    const idx = ordered.indexOf(key);
    const target = idx + direction;

    if (idx < 0 || target < 0 || target >= ordered.length) {
      return;
    }

    const next = [...ordered];
    [next[idx], next[target]] = [next[target]!, next[idx]!];

    saveConfig({
      ...config,
      groupOrder: next,
    });
  }

  // update view-level config (width, hidden, order etc.) on column rename
  function renameColumnConfig(newName: string, oldName: string) {
    const orderFields = fields.map((field) => field.name);
    const idx = orderFields.findIndex((f) => f === oldName);
    if (idx >= 0) orderFields.splice(idx, 1, newName);

    const tableFields = { ...config?.fieldConfig };

    if (config?.fieldConfig) {
      const oldConfig = config?.fieldConfig[oldName];
      if (oldConfig) {
        tableFields[newName] = oldConfig;
        delete tableFields[oldName];
      }
    }

    saveConfig({
      ...config,
      orderFields: orderFields,
      fieldConfig: { ...tableFields },
    });
  }
</script>

<ViewLayout>
  <ViewHeader>
    <ViewToolbar variant="secondary">
      <svelte:fragment slot="left">
        <label class="group-by-field">
          <span class="group-by-label"
            >{$i18n.t("views.table.group-by") || "Group by"}</span
          >
          <select value={groupByField} on:change={handleGroupByFieldSelect}>
            <option value=""
              >{$i18n.t("views.table.group-none") || "None"}</option
            >
            {#each fields as field}
              <option value={field.name}>{field.name}</option>
            {/each}
          </select>
        </label>
      </svelte:fragment>

      <svelte:fragment slot="right">
        <SwitchSelect
          label={$i18n.t("views.table.hide-fields")}
          items={columns.map((column) => ({
            label: column.field,
            icon: fieldIcon(column),
            value: column.field,
            enabled: !column.hide,
          }))}
          onChange={handleVisibilityChange}
        />
      </svelte:fragment>
    </ViewToolbar>
  </ViewHeader>
  <ViewContent>
    <div class="table-root">
      {#if groupByField}
        <div class="table-groups">
          {#each groupedRows as group (group.key)}
            <section class="table-group">
              <header>
                <button
                  class="group-toggle"
                  on:click={() => toggleGroupCollapsed(group.key)}
                  aria-label={isGroupCollapsed(group.key)
                    ? `Expand group ${group.label}`
                    : `Collapse group ${group.label}`}
                >
                  {isGroupCollapsed(group.key) ? "▸" : "▾"}
                </button>
                <strong>{group.label}</strong>
                <div class="table-group-actions">
                  <small>{group.rows.length}</small>
                  <button
                    class="group-move"
                    aria-label={`Move group ${group.label} up`}
                    on:click={() => moveGroup(group.key, -1)}>↑</button
                  >
                  <button
                    class="group-move"
                    aria-label={`Move group ${group.label} down`}
                    on:click={() => moveGroup(group.key, 1)}>↓</button
                  >
                </div>
              </header>

              {#if !isGroupCollapsed(group.key)}
                <DataGrid
                  {columns}
                  rows={group.rows}
                  {readonly}
                  colorModel={(rowId) => {
                    const record = frame.records.find(
                      (record) => record.id === rowId
                    );
                    if (record) {
                      return getRecordColor(record);
                    }
                    return null;
                  }}
                  onRowAdd={() => createGroupedNote(group.label)}
                  onRowEdit={(id, values) => {
                    new EditNoteModal(
                      $app,
                      fields,
                      (record) => {
                        api.updateRecord(record, fields);
                      },
                      {
                        id,
                        values,
                      },
                      records
                    ).open();
                  }}
                  onRowDelete={(id) => api.deleteRecord(id)}
                  onColumnHide={(column) =>
                    handleVisibilityChange(column.field, false)}
                  onColumnPin={(column) => handleColumnPin(column.field)}
                  onColumnConfigure={(column, editable) => {
                    const field = fields.find(
                      (field) => field.name === column.field
                    );

                    if (field) {
                      new ConfigureFieldModal(
                        $app,
                        $i18n.t("modals.field.configure.title"),
                        field,
                        fields.filter((f) => f.name !== field.name),
                        editable,
                        (field) => {
                          if (editable) {
                            if (field.name !== column.field) {
                              api.updateField(field, column.field);
                              renameColumnConfig(field.name, column.field);
                              settings.deleteFieldConfig(
                                project.id,
                                column.field
                              );
                            } else {
                              api.updateField(field);
                            }
                          }

                          if (field.typeConfig) {
                            settings.updateFieldConfig(
                              project.id,
                              field.name,
                              fields.map((f) => f.name),
                              field.typeConfig
                            );
                          }

                          saveConfig({ ...config });
                        }
                      ).open();
                    }
                  }}
                  onColumnInsert={handleColumnInsert}
                  onColumnDelete={(field) => {
                    api.deleteField(field);
                    settings.deleteFieldConfig(project.id, field);
                    deleteColumnConfig(field);
                  }}
                  onRowChange={(rowId, row) => {
                    api.updateRecord({ id: rowId, values: row }, fields);
                  }}
                  onColumnResize={handleWidthChange}
                  onColumnSort={(fields) => {
                    saveConfig({
                      ...config,
                      orderFields: fields,
                    });
                  }}
                />
              {/if}
            </section>
          {/each}
        </div>
      {:else}
        <DataGrid
          {columns}
          {rows}
          {readonly}
          colorModel={(rowId) => {
            const record = frame.records.find((record) => record.id === rowId);
            if (record) {
              return getRecordColor(record);
            }
            return null;
          }}
          onRowAdd={() => createGroupedNote()}
          onRowEdit={(id, values) => {
            new EditNoteModal(
              $app,
              fields,
              (record) => {
                api.updateRecord(record, fields);
              },
              {
                id,
                values,
              },
              records
            ).open();
          }}
          onRowDelete={(id) => api.deleteRecord(id)}
          onColumnHide={(column) => handleVisibilityChange(column.field, false)}
          onColumnPin={(column) => handleColumnPin(column.field)}
          onColumnConfigure={(column, editable) => {
            const field = fields.find((field) => field.name === column.field);

            if (field) {
              new ConfigureFieldModal(
                $app,
                $i18n.t("modals.field.configure.title"),
                field,
                fields.filter((f) => f.name !== field.name),
                editable,
                (field) => {
                  if (editable) {
                    if (field.name !== column.field) {
                      api.updateField(field, column.field);
                      renameColumnConfig(field.name, column.field);
                      settings.deleteFieldConfig(project.id, column.field);
                    } else {
                      api.updateField(field);
                    }
                  }

                  if (field.typeConfig) {
                    settings.updateFieldConfig(
                      project.id,
                      field.name,
                      fields.map((f) => f.name),
                      field.typeConfig
                    );
                  }

                  saveConfig({ ...config });
                }
              ).open();
            }
          }}
          onColumnInsert={handleColumnInsert}
          onColumnDelete={(field) => {
            api.deleteField(field);
            settings.deleteFieldConfig(project.id, field);
            deleteColumnConfig(field);
          }}
          onRowChange={(rowId, row) => {
            api.updateRecord({ id: rowId, values: row }, fields);
          }}
          onColumnResize={handleWidthChange}
          onColumnSort={(fields) => {
            saveConfig({
              ...config,
              orderFields: fields,
            });
          }}
        />
      {/if}

      {#if !readonly}
        <span
          tabindex="0"
          role="button"
          aria-label={$i18n.t("components.data-grid.column.add")}
          bind:this={buttonEl}
          on:click={handleColumnAppend}
          on:keydown={(evt) => {
            if (evt.key === "Enter") handleColumnAppend();
          }}
        >
          <Icon name="plus" />
          <TextLabel value={$i18n.t("components.data-grid.column.add")} />
        </span>
      {/if}
    </div>
  </ViewContent>
</ViewLayout>

<style>
  .table-root {
    display: flex;
    width: 100%;
    flex-direction: column;
    align-items: stretch;
  }

  .table-groups {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .table-group {
    border: 1px solid var(--background-modifier-border);
    border-radius: 8px;
    overflow: hidden;
  }

  .table-group > header {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: 8px;
    background: var(--background-primary-alt);
    border-bottom: 1px solid var(--background-modifier-border);
    padding: 6px 10px;
  }

  .table-group-actions {
    margin-left: auto;
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .group-toggle {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border: 1px solid var(--interactive-accent);
    background: color-mix(in srgb, var(--interactive-accent) 12%, transparent);
    color: var(--text-normal);
    font-size: 15px;
    font-weight: 700;
    border-radius: 6px;
    padding: 0;
    cursor: pointer;
    line-height: 1;
    transition:
      background-color 120ms ease,
      transform 120ms ease,
      border-color 120ms ease;
  }

  .group-move {
    border: 1px solid var(--background-modifier-border);
    background: var(--background-primary);
    color: var(--text-muted);
    border-radius: 4px;
    padding: 0 6px;
    cursor: pointer;
    line-height: 1.4;
  }

  .group-toggle:hover {
    background: color-mix(in srgb, var(--interactive-accent) 22%, transparent);
    border-color: var(--interactive-accent-hover);
  }

  .group-toggle:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px
      color-mix(in srgb, var(--interactive-accent) 45%, transparent);
  }

  .group-toggle:active {
    transform: scale(0.95);
  }

  .group-move:hover {
    color: var(--text-normal);
  }

  .table-group > header small {
    color: var(--text-muted);
  }

  .group-by-field {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin-right: 8px;
    color: var(--text-muted);
    font-size: var(--font-ui-smaller);
    font-weight: 500;
  }

  .group-by-label {
    white-space: nowrap;
  }

  .group-by-field select {
    min-width: 160px;
    max-width: 240px;
  }

  /* styled as a column header*/
  span {
    position: sticky;
    top: 0;
    z-index: 6;

    display: flex;
    align-items: center;
    justify-content: space-between;
    text-align: center;

    background-color: var(--background-primary-alt);
    border-right: 1px solid var(--background-modifier-border);
    border-left-color: var(--background-modifier-border);
    border-bottom: 1px solid var(--background-modifier-border);

    height: fit-content;
    min-height: 30px;

    color: var(--text-muted);
    font-weight: 500;
    padding: 0 12px;

    cursor: default;
  }

  span:focus {
    border-radius: var(--button-radius);
    box-shadow: 0 0 0 2px var(--background-modifier-border-focus);
  }

  span:hover {
    color: var(--text-normal);
  }
</style>
