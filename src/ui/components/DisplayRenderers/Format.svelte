<script lang="ts">
  export let value: string | number;
  export let format: string;

  $: formatted = format.replace(/\{value\}/g, String(value));
</script>

<span class="display-format">
  {formatted}
</span>

<style>
  .display-format {
    white-space: nowrap;
  }
</style>
