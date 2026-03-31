<script lang="ts">
  import { normalizePath, TFile } from "obsidian";
  import {
    Button,
    ModalButtonGroup,
    ModalContent,
    ModalLayout,
    Select,
    SettingItem,
    TextInput,
  } from "obsidian-svelte";

  import { isValidPath } from "src/lib/obsidian";
  import { i18n } from "src/lib/stores/i18n";
  import { app } from "src/lib/stores/obsidian";
  import { settings } from "src/lib/stores/settings";
  import type { ProjectDefinition } from "src/settings/settings";
  import { BUILTIN_TEMPLATE_TYPES } from "src/settings/settings";
  import { onMount } from "svelte";

  let inputRef: HTMLInputElement;

  export let name: string;
  export let project: ProjectDefinition;
  export let onSave: (
    name: string,
    templatePath: string,
    project: ProjectDefinition
  ) => void;

  let templatePath = "";

  /** Build a label map: key → display label (built-in + custom) */
  function buildLabelMap(
    customTypes: Record<string, string>
  ): Record<string, string> {
    const map: Record<string, string> = {};
    BUILTIN_TEMPLATE_TYPES.forEach(({ key, label }) => {
      map[key] = label;
    });
    Object.entries(customTypes).forEach(([key, label]) => {
      map[key] = label;
    });
    return map;
  }

  $: templateConfig = $settings.preferences.templates;
  $: templateRootDir = normalizePath((templateConfig?.rootDir ?? "").trim());
  $: labelMap = buildLabelMap(templateConfig?.customTypes ?? {});
  $: templateOptions = Object.entries(templateConfig?.typeMap ?? {})
    .map(([type, fileName]) => {
      const trimmed = fileName?.trim() ?? "";
      if (!trimmed) return null;

      const path = templateRootDir
        ? normalizePath(`${templateRootDir}/${trimmed}`)
        : normalizePath(trimmed);

      return {
        label: `${labelMap[type] ?? type} · ${path}`,
        value: path,
      };
    })
    .filter((item): item is { label: string; value: string } => !!item);
  $: hasMultipleTemplates = templateOptions.length > 1;
  $: {
    if (templateOptions.length === 0) {
      templatePath = "";
    } else if (templateOptions.length === 1) {
      templatePath = templateOptions[0]?.value ?? "";
    } else {
      const defaultType = templateConfig?.defaultType;
      const defaultFile = defaultType
        ? templateConfig?.typeMap?.[defaultType]?.trim()
        : "";
      const defaultPath = defaultFile
        ? templateRootDir
          ? normalizePath(`${templateRootDir}/${defaultFile}`)
          : normalizePath(defaultFile)
        : "";

      if (
        defaultPath &&
        templateOptions.find((option) => option.value === defaultPath)
      ) {
        templatePath = defaultPath;
      } else if (
        !templateOptions.find((option) => option.value === templatePath)
      ) {
        templatePath = templateOptions[0]?.value ?? "";
      }
    }
  }

  $: nameError = validateName(name);

  function getNewNotesFolder(project: ProjectDefinition) {
    if (project.newNotesFolder) {
      return project.newNotesFolder;
    }

    if (project.dataSource.kind === "folder") {
      return project.dataSource.config.path;
    }

    return "";
  }

  function validateName(name: string) {
    if (name.trim() === "") {
      return $i18n.t("modals.note.create.empty-name-error");
    }

    const existingFile = $app.vault.getAbstractFileByPath(
      normalizePath(getNewNotesFolder(project) + "/" + name + ".md")
    );

    if (existingFile instanceof TFile) {
      return $i18n.t("modals.note.create.name-taken-error");
    }

    if (!isValidPath(name)) {
      return $i18n.t("modals.project.defaultName.invalid");
    }

    if (name.startsWith(".")) {
      return $i18n.t("modals.note.create.dot-start-error");
    }

    return "";
  }

  onMount(() => {
    if (inputRef) inputRef.select();
  });
</script>

<ModalLayout title={$i18n.t("modals.note.create.title")}>
  <ModalContent>
    <SettingItem
      name={$i18n.t("modals.note.create.name.name")}
      description={$i18n.t("modals.note.create.name.description") ?? ""}
    >
      <TextInput
        bind:ref={inputRef}
        value={name}
        on:input={({ detail: value }) => (name = value)}
        autoFocus
        error={!!nameError}
        helperText={nameError}
        on:keydown={(ev) => {
          if (ev.key === "Enter" && !nameError) {
            ev.preventDefault();
            onSave(name, templatePath, project);
          }
        }}
      />
    </SettingItem>

    <SettingItem
      name={$i18n.t("modals.note.create.project.name")}
      description={$i18n.t("modals.note.create.project.description") ?? ""}
    >
      <Select
        value={project.id}
        on:change={({ detail: id }) => {
          const res = $settings.projects.find((w) => w.id === id);
          if (res) {
            project = res;
          }
        }}
        options={$settings.projects.map((project) => ({
          label: project.name,
          value: project.id,
        }))}
      />
    </SettingItem>

    {#if hasMultipleTemplates}
      <SettingItem
        name={$i18n.t("modals.note.create.templatePath.name")}
        description={$i18n.t("modals.note.create.templatePath.description") ??
          ""}
      >
        <Select
          value={templatePath}
          on:change={({ detail: value }) => (templatePath = value)}
          options={templateOptions}
          placeholder={$i18n.t("modals.note.create.templatePath.none") ?? ""}
          allowEmpty
        />
      </SettingItem>
    {/if}
  </ModalContent>
  <ModalButtonGroup>
    <Button
      variant={"primary"}
      disabled={!!nameError}
      on:click={() => {
        onSave(name, templatePath, project);
      }}
    >
      {$i18n.t("modals.note.create.create")}
    </Button>
  </ModalButtonGroup>
</ModalLayout>
