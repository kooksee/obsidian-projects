<script lang="ts">
  export let value: number;
  export let max: number = 100;

  $: percent = Math.min(Math.max((value / max) * 100, 0), 100);
  $: hue = (percent / 100) * 120; // 0=red, 60=yellow, 120=green
</script>

<div class="display-progress">
  <div class="progress-track">
    <div
      class="progress-fill"
      style:width="{percent}%"
      style:background-color="hsl({hue}, 60%, 50%)"
    />
  </div>
  <span class="progress-label">{Math.round(percent)}%</span>
</div>

<style>
  .display-progress {
    display: flex;
    align-items: center;
    gap: 6px;
    width: 100%;
  }
  .progress-track {
    flex: 1;
    height: 6px;
    border-radius: 3px;
    background-color: var(--background-modifier-border);
    overflow: hidden;
  }
  .progress-fill {
    height: 100%;
    border-radius: 3px;
    transition: width 0.2s ease;
  }
  .progress-label {
    font-size: 0.8em;
    color: var(--text-muted);
    min-width: 36px;
    text-align: right;
  }
</style>
