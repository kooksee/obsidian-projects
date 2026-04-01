<script lang="ts">
  import { Icon } from "obsidian-svelte";
  import {
    DataFieldType,
    type DataField,
    type DataRecord,
  } from "src/lib/dataframe/dataframe";
  import { setContext } from "svelte";
  import Checkbox from "./Checkbox.svelte";
  import Tags from "./Tags.svelte";
  import Text from "./Text.svelte";
  import Date from "./Date.svelte";
  import Datetime from "./Datetime.svelte";
  import Number from "./Number.svelte";
  import {
    Badge,
    ProgressBar,
    Link,
    Image,
    Tag,
    Format,
  } from "src/ui/components/DisplayRenderers";

  export let fields: DataField[];
  export let record: DataRecord;

  setContext<string>("sourcePath", record.id);
</script>

{#each fields as field (field.name)}
  {@const value = record.values[field.name]}
  {@const display = field.typeConfig?.display}
  {#if value !== undefined && value !== null}
    <div class="field-label">
      <div class="setting-item-description" style:margin-bottom={"4px"}>
        {field.name}
      </div>
      {#if display === "badge" && typeof value === "string"}
        <Badge {value} colorMap={field.typeConfig?.colorMap ?? {}} />
      {:else if display === "progress-bar" && typeof value === "number"}
        <ProgressBar {value} />
      {:else if display === "link" && typeof value === "string"}
        <Link {value} />
      {:else if display === "image" && typeof value === "string"}
        <Image {value} />
      {:else if display === "tag" && typeof value === "string"}
        <Tag {value} />
      {:else if display === "format" && field.typeConfig?.format && (typeof value === "string" || typeof value === "number")}
        <Format {value} format={field.typeConfig.format} />
      {:else if field.repeated}
        {#if field.type === DataFieldType.String}
          <Tags {field} {value} />
        {/if}
      {:else if field.type === DataFieldType.Boolean}
        <Checkbox {field} {value} />
      {:else if field.type === DataFieldType.String}
        <Text {field} {value} />
      {:else if field.type === DataFieldType.Number}
        <Number {field} {value} />
      {:else if field.type === DataFieldType.Date}
        {#if field.typeConfig?.time}
          <Datetime {value} {field} />
        {:else}
          <Date {value} {field} />
        {/if}
      {:else}
        <Icon name="slash" />
      {/if}
    </div>
  {/if}
{/each}

<style>
  .field-label {
    margin-bottom: 8px;
  }

  .field-label:last-child {
    margin-bottom: 0;
  }
</style>
