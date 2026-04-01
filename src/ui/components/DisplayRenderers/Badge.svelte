<script lang="ts">
  export let value: string;
  export let colorMap: Record<string, string> = {};

  $: color = colorMap[value] ?? "var(--text-muted)";
</script>

<span class="display-badge" style:--badge-color={color}>
  {value}
</span>

<style>
  .display-badge {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 0.85em;
    line-height: 1.4;
    background-color: color-mix(in srgb, var(--badge-color) 15%, transparent);
    color: var(--badge-color);
    border: 1px solid color-mix(in srgb, var(--badge-color) 30%, transparent);
    white-space: nowrap;
  }
</style>
