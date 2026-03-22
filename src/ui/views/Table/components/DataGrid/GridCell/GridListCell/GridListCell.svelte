<script lang="ts">
  import { TagList } from "src/ui/components/TagList";
  import type { DataValue, Optional } from "src/lib/dataframe/dataframe";
  import {
    normalizeRelationEditorTargets,
    serializeRelationTargets,
  } from "src/lib/relation";
  import { GridCell } from "..";
  import type { GridColDef } from "../../dataGrid";

  export let value: Optional<Optional<DataValue>[]>;
  export let onChange: (values: Optional<DataValue>[]) => void;
  export let column: GridColDef;
  export let rowindex: number;
  export let colindex: number;
  export let selected: boolean;

  $: isRelationField = column.typeConfig?.relation === true;

  function handleChange(values: Optional<DataValue>[]) {
    if (!isRelationField) {
      onChange(values);
      return;
    }

    const normalizedTargets = normalizeRelationEditorTargets(values);
    const serialized = serializeRelationTargets(normalizedTargets, {
      multiple: true,
    });

    onChange(Array.isArray(serialized) ? serialized : []);
  }
</script>

<GridCell {selected} {rowindex} {colindex} {column} on:mousedown on:navigate>
  <TagList
    slot="read"
    edit={false}
    values={value || []}
    richText={column.typeConfig?.richText ?? false}
  />
  <TagList
    slot="edit"
    edit={true}
    values={value || []}
    onChange={handleChange}
  />
</GridCell>
