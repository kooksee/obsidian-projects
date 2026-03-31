import { derived } from "svelte/store";

import { app } from "./obsidian";

export const capabilities = derived(app, ($app) => {
  return {
    dataview: !!$app?.plugins?.getPlugin?.("dataview"),
  };
});
