<script lang="ts">
  export let value: string;

  $: src = value;
</script>

<div class="display-image">
  <img {src} alt="" loading="lazy" on:error={() => (src = "")} />
</div>

<style>
  .display-image {
    display: flex;
    align-items: center;
  }
  .display-image img {
    max-width: 100%;
    max-height: 120px;
    border-radius: 4px;
    object-fit: contain;
  }
</style>
