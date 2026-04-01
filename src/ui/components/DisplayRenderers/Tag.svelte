<script lang="ts">
  export let value: string;
</script>

<span class="display-tag">
  {value}
</span>

<style>
  .display-tag {
    display: inline-block;
    padding: 1px 8px;
    border-radius: 4px;
    font-size: 0.85em;
    background-color: var(--tag-background);
    color: var(--tag-color);
    border: 1px solid var(--tag-border-color, transparent);
  }
</style>
