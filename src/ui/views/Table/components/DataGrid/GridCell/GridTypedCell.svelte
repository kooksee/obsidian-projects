<script lang="ts">
  import {
    isOptionalBoolean,
    isOptionalDate,
    isOptionalList,
    isOptionalNumber,
    isOptionalString,
    type Optional,
    type DataValue,
  } from "src/lib/dataframe/dataframe";

  import GridCell from "./GridCell.svelte";

  import type { GridColDef } from "../dataGrid";
  import { GridBooleanCell } from "./GridBooleanCell";
  import { GridDateCell } from "./GridDateCell";
  import { GridDatetimeCell } from "./GridDatetimeCell";
  import { GridNumberCell } from "./GridNumberCell";
  import { GridTextCell } from "./GridTextCell";
  import { GridListCell } from "./GridListCell";
  import {
    Badge,
    ProgressBar,
    Link,
    Image,
    Tag,
    Format,
  } from "src/ui/components/DisplayRenderers";

  export let value: Optional<DataValue>;
  export let onChange: (value: Optional<DataValue>) => void;
  export let column: GridColDef;
  export let rowindex: number;
  export let colindex: number;
  export let selected: boolean;

  $: display = column.typeConfig?.display;
</script>

{#if display === "badge" && typeof value === "string"}
  <GridCell {rowindex} {selected} {colindex} {column} on:mousedown on:navigate>
    <Badge {value} colorMap={column.typeConfig?.colorMap ?? {}} />
  </GridCell>
{:else if display === "progress-bar" && typeof value === "number"}
  <GridCell {rowindex} {selected} {colindex} {column} on:mousedown on:navigate>
    <ProgressBar {value} />
  </GridCell>
{:else if display === "link" && typeof value === "string"}
  <GridCell {rowindex} {selected} {colindex} {column} on:mousedown on:navigate>
    <Link {value} />
  </GridCell>
{:else if display === "image" && typeof value === "string"}
  <GridCell {rowindex} {selected} {colindex} {column} on:mousedown on:navigate>
    <Image {value} />
  </GridCell>
{:else if display === "tag" && typeof value === "string"}
  <GridCell {rowindex} {selected} {colindex} {column} on:mousedown on:navigate>
    <Tag {value} />
  </GridCell>
{:else if display === "format" && column.typeConfig?.format && (typeof value === "string" || typeof value === "number")}
  <GridCell {rowindex} {selected} {colindex} {column} on:mousedown on:navigate>
    <Format {value} format={column.typeConfig.format} />
  </GridCell>
{:else if column.repeated && isOptionalList(value)}
  <GridListCell
    {selected}
    {rowindex}
    {colindex}
    {value}
    {onChange}
    {column}
    on:mousedown
    on:navigate
  />
{:else if column.type === "string" && isOptionalString(value)}
  <GridTextCell
    {selected}
    {rowindex}
    {colindex}
    {value}
    {onChange}
    {column}
    on:mousedown
    on:navigate
  />
{:else if column.type === "boolean" && isOptionalBoolean(value)}
  <GridBooleanCell
    {selected}
    {rowindex}
    {colindex}
    {value}
    {onChange}
    {column}
    on:mousedown
    on:navigate
  />
{:else if column.type === "number" && isOptionalNumber(value)}
  <GridNumberCell
    {selected}
    {rowindex}
    {colindex}
    {value}
    {onChange}
    {column}
    on:mousedown
    on:navigate
  />
{:else if column.type === "date" && isOptionalDate(value)}
  {#if column.typeConfig?.time}
    <GridDatetimeCell
      {selected}
      {rowindex}
      {colindex}
      {value}
      {onChange}
      {column}
      on:mousedown
      on:navigate
    />
  {:else}
    <GridDateCell
      {selected}
      {rowindex}
      {colindex}
      {value}
      {onChange}
      {column}
      on:mousedown
      on:navigate
    />
  {/if}
{:else}
  <GridCell
    {rowindex}
    {selected}
    {colindex}
    {column}
    on:mousedown
    on:navigate
  />
{/if}
