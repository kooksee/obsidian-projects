<script lang="ts">
  import { Menu } from "obsidian";
  interface SwitchItem {
    readonly label: string;
    readonly icon?: string;
    readonly value: string;
    readonly enabled: boolean;
  }

  export let items: SwitchItem[];
  export let label: string;
  export let onChange: (value: string, enabled: boolean) => void;

  function openMenu(event: MouseEvent) {
    if (!items.length) {
      return;
    }

    const menu = new Menu();

    for (const { label, icon, value, enabled } of items) {
      menu.addItem((item) => {
        item.setTitle(label).setChecked(enabled);
        if (icon) {
          item.setIcon(icon);
        }

        item.onClick(() => {
          onChange(value, !enabled);
        });
      });
    }

    menu.showAtMouseEvent(event);
  }
</script>

<button
  type="button"
  class="dropdown"
  class:disabled={!items.length}
  on:click={openMenu}
>
  {label}
</button>

<style>
  .dropdown {
    align-items: center;
    display: inline-flex;
    text-align: start;
    cursor: pointer;
    border: none;
    background: transparent;
    color: inherit;
    padding: 0;
  }

  .dropdown.disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
</style>
