<script lang="ts">
  import { produce } from "immer";
  import {
    Button,
    Callout,
    ModalButtonGroup,
    ModalContent,
    ModalLayout,
    SettingItem,
    Typography,
  } from "obsidian-svelte";

  import { FieldControl } from "src/ui/components/FieldControl";
  import type { DataField, DataRecord } from "src/lib/dataframe/dataframe";
  import { i18n } from "src/lib/stores/i18n";
  import { app } from "src/lib/stores/obsidian";
  import type { RelationRef } from "src/lib/relation";
  import { getDisplayName } from "src/ui/views/Board/components/Board/boardHelpers";

  export let fields: DataField[];
  export let record: DataRecord;
  export let incomingRelations: RelationRef[] = [];

  $: editableFields = fields.filter((field) => !field.derived);

  export let onSave: (record: DataRecord) => void;

  function openSourceRecord(path: string) {
    $app.workspace.openLinkText(path, record.id, true);
  }
</script>

<ModalLayout title={$i18n.t("modals.note.edit.title")}>
  {#if !editableFields.length}
    <Callout
      title={$i18n.t("modals.note.edit.no-editable-fields.title")}
      icon="info"
      variant="info"
    >
      <Typography variant="body">
        {$i18n.t("modals.note.edit.no-editable-fields.message")}
      </Typography>
    </Callout>
    <ModalContent>
      {#each fields as field (field.name)}
        <SettingItem name={field.name}>
          <FieldControl
            {field}
            value={record.values[field.name]}
            onChange={(value) => {
              record = produce(record, (draft) => {
                // @ts-ignore
                draft.values[field.name] = value;
              });
            }}
            readonly={true}
          />
        </SettingItem>
      {/each}
    </ModalContent>
  {/if}
  <ModalContent>
    {#if incomingRelations.length > 0}
      <SettingItem
        name={$i18n.t("modals.note.edit.linked-from") || "Linked from"}
      >
        <div class="incoming-relations">
          {#each incomingRelations as ref (ref.sourceRecordId + ":" + ref.fieldName)}
            <button
              type="button"
              class="incoming-relation-item"
              on:click={() => openSourceRecord(ref.sourceRecordId)}
              title={ref.sourceRecordId}
            >
              <span>{getDisplayName(ref.sourceRecordId)}</span>
              <small>{ref.fieldName}</small>
            </button>
          {/each}
        </div>
      </SettingItem>
    {/if}

    {#each editableFields as field (field.name)}
      <SettingItem name={field.name}>
        <FieldControl
          {field}
          value={record.values[field.name]}
          onChange={(value) => {
            record = produce(record, (draft) => {
              // @ts-ignore
              draft.values[field.name] = value;
            });
          }}
        />
      </SettingItem>
    {/each}
  </ModalContent>
  <ModalButtonGroup>
    <Button
      variant="primary"
      on:click={() => {
        onSave(record);
      }}
      >{editableFields.length
        ? $i18n.t("modals.note.edit.save")
        : $i18n.t("modals.note.edit.confirm")}</Button
    >
  </ModalButtonGroup>
</ModalLayout>

<style>
  .incoming-relations {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .incoming-relation-item {
    border: 1px solid var(--background-modifier-border);
    background: var(--background-primary-alt);
    color: var(--text-normal);
    border-radius: 6px;
    padding: 4px 8px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;
  }

  .incoming-relation-item small {
    color: var(--text-muted);
  }
</style>
