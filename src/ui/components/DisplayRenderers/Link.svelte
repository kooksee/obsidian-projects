<script lang="ts">
  export let value: string;

  $: href =
    value.startsWith("http://") || value.startsWith("https://")
      ? value
      : `https://${value}`;
  $: display = value.replace(/^https?:\/\//, "").replace(/\/$/, "");
</script>

<a
  class="display-link"
  {href}
  target="_blank"
  rel="noopener noreferrer"
  on:click|stopPropagation
>
  {display}
</a>

<style>
  .display-link {
    color: var(--text-accent);
    text-decoration: none;
    word-break: break-all;
  }
  .display-link:hover {
    text-decoration: underline;
  }
</style>
