<script lang="ts">
  import { GridCell } from "..";
  import type { GridColDef } from "../../dataGrid";

  import { Autocomplete, TextInput } from "obsidian-svelte";
  import TextLabel from "./TextLabel.svelte";
  import type { Optional } from "src/lib/dataframe/dataframe";
  import { app } from "src/lib/stores/obsidian";
  import { get } from "svelte/store";
  import {
    normalizeRelationEditorTarget,
    serializeRelationTargets,
  } from "src/lib/relation";

  export let value: Optional<string>;
  export let onChange: (value: Optional<string>) => void;
  export let column: GridColDef;
  export let rowindex: number;
  export let colindex: number;
  export let selected: boolean;

  let edit: boolean = false;

  $: isRelationField = column.typeConfig?.relation === true;

  $: fieldOptions =
    column.typeConfig?.options?.map((option) => ({
      label: option,
      description: "",
    })) ?? [];

  $: relationOptions = buildRelationOptions(value ?? "");

  $: options = [...fieldOptions, ...relationOptions].filter(
    (item, index, all) => all.findIndex((x) => x.label === item.label) === index
  );

  function normalizeValueForSave(input: Optional<string>): Optional<string> {
    if (!isRelationField) {
      return input;
    }

    const target = normalizeRelationEditorTarget(input);
    const serialized = serializeRelationTargets(target ? [target] : [], {
      multiple: false,
    });

    return typeof serialized === "string" ? serialized : undefined;
  }

  function buildRelationOptions(input: string) {
    if (!isRelationField) {
      return [];
    }

    const marker = input.lastIndexOf("[[");
    if (marker < 0) {
      return [];
    }

    const query = input
      .slice(marker + 2)
      .trim()
      .toLowerCase();
    const vault = get(app)?.vault;

    if (!vault) {
      return [];
    }

    const targets = vault
      .getMarkdownFiles()
      .map((file) => file.path.replace(/\.md$/i, ""))
      .filter((target) => {
        if (!query) {
          return true;
        }

        const lowerTarget = target.toLowerCase();
        const basename = lowerTarget.split("/").pop() ?? lowerTarget;
        return lowerTarget.includes(query) || basename.includes(query);
      })
      .slice(0, 50);

    return targets.map((target) => ({
      label: `[[${target}]]`,
      description: target,
    }));
  }
</script>

<GridCell
  bind:edit
  bind:selected
  {column}
  {rowindex}
  {colindex}
  on:mousedown
  on:navigate
  onCopy={() => {
    navigator.clipboard.writeText(value?.toString() || "");
  }}
  onCut={() => {
    navigator.clipboard.writeText(value?.toString() || "");
    onChange(undefined);
  }}
  onPaste={async () => {
    onChange(normalizeValueForSave(await navigator.clipboard.readText()));
  }}
>
  <TextLabel
    slot="read"
    richText={column.typeConfig?.richText ?? false}
    value={value || ""}
  />
  <svelte:fragment slot="edit">
    {#if options.length > 0 || isRelationField}
      <Autocomplete
        value={value || ""}
        {options}
        embed
        autoFocus
        on:change={({ detail }) => (value = detail)}
        on:blur={({ detail: event }) => {
          if (
            event.currentTarget instanceof HTMLInputElement &&
            event.relatedTarget instanceof HTMLDivElement &&
            !event.relatedTarget.contains(event.currentTarget)
          ) {
            selected = false;
            edit = false;
          }

          onChange(normalizeValueForSave(value));
        }}
      />
    {:else}
      <TextInput
        autoFocus
        value={value || ""}
        embed
        width="100%"
        on:input={({ detail }) => (value = detail)}
        on:blur={(event) => {
          if (
            event.currentTarget instanceof HTMLInputElement &&
            event.relatedTarget instanceof HTMLDivElement &&
            !event.relatedTarget.contains(event.currentTarget)
          ) {
            selected = false;
            edit = false;
          }

          onChange(normalizeValueForSave(value));
        }}
      />
    {/if}
  </svelte:fragment>
</GridCell>
