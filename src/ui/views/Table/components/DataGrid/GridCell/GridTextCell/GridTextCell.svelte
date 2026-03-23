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
  let autocompleteValue: string = "";
  let wikilinkMode: boolean = false;
  let wikilinkPrefix: string = "";

  $: isRelationField = column.typeConfig?.relation === true;

  $: fieldOptions =
    column.typeConfig?.options?.map((option) => ({
      label: option,
      description: "",
    })) ?? [];

  $: relationOptions = buildRelationOptions(autocompleteValue);
  $: shouldSuggestWikilinks = wikilinkMode;

  $: options = shouldSuggestWikilinks ? relationOptions : fieldOptions;

  $: if (!edit) {
    resetEditState(value || "");
  }

  $: if (edit && !wikilinkMode && autocompleteValue.includes("[[")) {
    const context = getWikilinkContext(autocompleteValue);
    if (context.active) {
      wikilinkMode = true;
      wikilinkPrefix = context.prefix;
      autocompleteValue = context.query;
    }
  }

  function resetEditState(input: string) {
    const context = getWikilinkContext(input);
    if (context.active) {
      wikilinkMode = true;
      wikilinkPrefix = context.prefix;
      autocompleteValue = context.query;
      return;
    }

    wikilinkMode = false;
    wikilinkPrefix = "";
    autocompleteValue = input;
  }

  function getCurrentInput(): string {
    if (wikilinkMode) {
      return `${wikilinkPrefix}[[${autocompleteValue}`;
    }
    return autocompleteValue;
  }

  function normalizeValueForSave(input: Optional<string>): Optional<string> {
    if (!isRelationField) {
      return input;
    }

    const unfinished = input?.trim().match(/^\[\[([^\]]+)$/);
    if (unfinished?.[1]) {
      input = unfinished[1].trim();
    }

    const target = normalizeRelationEditorTarget(input);
    const serialized = serializeRelationTargets(target ? [target] : [], {
      multiple: false,
    });

    return typeof serialized === "string" ? serialized : undefined;
  }

  function buildRelationOptions(queryInput: string) {
    if (!wikilinkMode && !isRelationField) {
      return [];
    }

    const query = queryInput.trim().toLowerCase();
    const obsidianApp = get(app);
    const vault = obsidianApp?.vault;

    if (!vault) {
      return [];
    }

    const metadataCache = obsidianApp.metadataCache;

    const candidateLinks = vault
      .getMarkdownFiles()
      .flatMap((file) => {
        const filePath = file.path.replace(/\.md$/i, "");
        const basename = file.basename.toLowerCase();
        const lowerPath = filePath.toLowerCase();

        const fileScore = rankFileTarget({ basename, lowerPath, query });

        const fileCandidates: Array<{ target: string; score: number }> =
          fileScore > 0 || !query
            ? [{ target: filePath, score: fileScore || 1 }]
            : [];

        const headings =
          metadataCache
            ?.getFileCache(file)
            ?.headings?.map((item) => item?.heading?.trim())
            .filter((heading): heading is string => Boolean(heading)) ?? [];

        const headingCandidates = headings
          .filter((heading) => {
            if (!query) {
              return false;
            }
            return heading.toLowerCase().includes(query);
          })
          .slice(0, 5)
          .map((heading) => ({
            target: `${filePath}#${heading}`,
            score: 170,
          }));

        return [...fileCandidates, ...headingCandidates];
      })
      .sort((a, b) => b.score - a.score || a.target.localeCompare(b.target))
      .slice(0, 500);

    return candidateLinks.map(({ target }) => ({
      label: target,
      description: target,
    }));
  }

  function rankFileTarget({
    basename,
    lowerPath,
    query,
  }: {
    basename: string;
    lowerPath: string;
    query: string;
  }): number {
    if (!query) {
      return 0;
    }

    if (basename === query) return 120;
    if (basename.startsWith(query)) return 100;
    if (lowerPath === query) return 90;
    if (lowerPath.startsWith(query)) return 80;
    if (basename.includes(query)) return 60;
    if (lowerPath.includes(query)) return 30;

    return 0;
  }

  function getWikilinkContext(input: string): {
    active: boolean;
    prefix: string;
    query: string;
  } {
    const marker = input.lastIndexOf("[[");

    if (marker < 0) {
      return {
        active: false,
        prefix: "",
        query: "",
      };
    }

    return {
      active: true,
      prefix: input.slice(0, marker),
      query: input.slice(marker + 2),
    };
  }

  function handleAutocompleteChange(detail: string) {
    if (!wikilinkMode) {
      autocompleteValue = detail;
      return;
    }

    if (relationOptions.some((item) => item.label === detail)) {
      autocompleteValue = `${detail}]]`;
      return;
    }

    autocompleteValue = detail;
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
    const pasted = await navigator.clipboard.readText();
    resetEditState(pasted);
    onChange(normalizeValueForSave(getCurrentInput()));
  }}
>
  <TextLabel
    slot="read"
    richText={column.typeConfig?.richText ?? false}
    value={value || ""}
  />
  <svelte:fragment slot="edit">
    {#if options.length > 0 || isRelationField || shouldSuggestWikilinks}
      <Autocomplete
        bind:value={autocompleteValue}
        {options}
        maxItems={500}
        embed
        autoFocus
        on:change={({ detail }) => {
          handleAutocompleteChange(detail);
        }}
        on:blur={() => {
          onChange(normalizeValueForSave(getCurrentInput()));
        }}
      />
    {:else}
      <TextInput
        autoFocus
        value={autocompleteValue}
        embed
        width="100%"
        on:input={({ detail }) => {
          autocompleteValue = detail;
        }}
        on:blur={(event) => {
          if (
            event.currentTarget instanceof HTMLInputElement &&
            event.relatedTarget instanceof HTMLDivElement &&
            !event.relatedTarget.contains(event.currentTarget)
          ) {
            selected = false;
            edit = false;
          }

          onChange(normalizeValueForSave(getCurrentInput()));
        }}
      />
    {/if}
  </svelte:fragment>
</GridCell>
