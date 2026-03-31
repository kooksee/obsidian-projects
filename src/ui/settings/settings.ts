import { App, Platform, PluginSettingTab, Setting } from "obsidian";
import Projects from "src/ui/settings/Projects.svelte";
import Archives from "src/ui/settings/Archives.svelte";
import { settings } from "src/lib/stores/settings";
import { get } from "svelte/store";
import type ProjectsPlugin from "src/main";
import type {
  FirstDayOfWeek,
  LinkBehavior,
  ProjectId,
  ProjectsPluginPreferences,
} from "src/settings/settings";
import { BUILTIN_TEMPLATE_TYPES } from "src/settings/settings";
import { i18n } from "src/lib/stores/i18n";

/**
 * ProjectsSettingTab builds the plugin settings tab.
 */
export class ProjectsSettingTab extends PluginSettingTab {
  constructor(app: App, readonly plugin: ProjectsPlugin) {
    super(app, plugin);
  }

  // display runs when the user opens the settings tab.
  display(): void {
    let { preferences } = get(settings);

    const save = (prefs: ProjectsPluginPreferences) => {
      preferences = prefs;
      settings.updatePreferences(prefs);
    };

    const { containerEl } = this;

    containerEl.empty();

    new Setting(containerEl)
      .setName(get(i18n).t("settings.general.size-limit.name"))
      .setDesc(get(i18n).t("settings.general.size-limit.desc"))
      .addText((text) =>
        text
          .setValue(preferences.projectSizeLimit.toString())
          .setPlaceholder("1000")
          .onChange((value) => {
            save({
              ...preferences,
              projectSizeLimit: parseInt(value) || 1000,
            });
          })
      );

    new Setting(containerEl)
      .setName(get(i18n).t("settings.general.link-behavior.name"))
      .setDesc(
        get(i18n).t("settings.general.link-behavior.desc", {
          modifier: Platform.isMacOS ? "Cmd" : "Ctrl",
        })
      )
      .addDropdown((dropdown) => {
        dropdown
          .addOptions({
            "open-editor": get(i18n).t(
              "settings.general.link-behavior.options.open-editor"
            ),
            "open-note": get(i18n).t(
              "settings.general.link-behavior.options.open-note"
            ),
          })
          .setValue(preferences.linkBehavior)
          .onChange((value) => {
            save({
              ...preferences,
              linkBehavior: value as LinkBehavior,
            });
          });
      });

    new Setting(containerEl)
      .setName(get(i18n).t("settings.general.start-of-week.name"))
      .addDropdown((dropdown) =>
        dropdown
          .addOption(
            "default",
            get(i18n).t("settings.general.start-of-week.options.default")
          )
          .addOption(
            "sunday",
            get(i18n).t("settings.general.start-of-week.options.sunday")
          )
          .addOption(
            "monday",
            get(i18n).t("settings.general.start-of-week.options.monday")
          )
          .setValue(
            preferences.locale.firstDayOfWeek
              ? preferences.locale.firstDayOfWeek.toString()
              : "default"
          )
          .onChange((value) => {
            save({
              ...preferences,
              locale: {
                firstDayOfWeek: value as FirstDayOfWeek,
              },
            });
          })
      );

    new Setting(containerEl)
      .setName(get(i18n).t("settings.front-matter.heading"))
      .setHeading();

    new Setting(containerEl)
      .setName(get(i18n).t("settings.front-matter.quote-strings.name"))
      .addDropdown((dropdown) =>
        dropdown
          .addOption(
            "PLAIN",
            get(i18n).t("settings.front-matter.quote-strings.options.plain")
          )
          .addOption(
            "QUOTE_DOUBLE",
            get(i18n).t(
              "settings.front-matter.quote-strings.options.quote-double"
            )
          )
          .setValue(preferences.frontmatter.quoteStrings)
          .onChange((value) => {
            if (value === "PLAIN" || value === "QUOTE_DOUBLE") {
              save({
                ...preferences,
                frontmatter: {
                  quoteStrings: value,
                },
              });
            }
          })
      );

    new Setting(containerEl)
      .setName(get(i18n).t("settings.commands.name"))
      .setDesc(get(i18n).t("settings.commands.desc"))
      .setHeading();

    new Setting(containerEl)
      .setName("Templates")
      .setDesc("Configure built-in template directory and type mapping")
      .setHeading();

    new Setting(containerEl)
      .setName("Template root directory")
      .setDesc("Path inside vault where template files are stored")
      .addText((text) =>
        text
          .setValue(preferences.templates.rootDir)
          .setPlaceholder("templates/system")
          .onChange((value) => {
            save({
              ...preferences,
              templates: {
                ...preferences.templates,
                rootDir: value.trim() || "templates/system",
              },
            });
          })
      );

    // Build a merged list: built-in + custom types for the default-type dropdown
    const allTypeEntries: Array<{ key: string; label: string }> = [
      ...BUILTIN_TEMPLATE_TYPES,
      ...Object.entries(preferences.templates.customTypes).map(
        ([key, label]) => ({ key, label })
      ),
    ];

    new Setting(containerEl)
      .setName("Default template type")
      .setDesc("Used when creating new notes")
      .addDropdown((dropdown) => {
        allTypeEntries.forEach(({ key, label }) => {
          dropdown.addOption(key, label);
        });
        dropdown
          .setValue(preferences.templates.defaultType)
          .onChange((value) => {
            save({
              ...preferences,
              templates: {
                ...preferences.templates,
                defaultType: value,
              },
            });
          });
      });

    // Built-in template type mappings
    new Setting(containerEl)
      .setName("Built-in types")
      .setDesc("File name for each built-in template type")
      .setHeading();

    BUILTIN_TEMPLATE_TYPES.forEach(({ key, label }) => {
      new Setting(containerEl)
        .setName(`${label} template file`)
        .setDesc("File name under template root directory")
        .addText((text) =>
          text
            .setValue(preferences.templates.typeMap[key] ?? "")
            .setPlaceholder(`${key}-template.md`)
            .onChange((value) => {
              save({
                ...preferences,
                templates: {
                  ...preferences.templates,
                  typeMap: {
                    ...preferences.templates.typeMap,
                    [key]: value.trim(),
                  },
                },
              });
            })
        );
    });

    // Custom template types
    new Setting(containerEl)
      .setName("Custom types")
      .setDesc("Add your own template types with custom file mappings")
      .setHeading();

    const renderCustomTypes = () => {
      // Remove previous custom type elements
      containerEl
        .querySelectorAll(".projects-custom-template-type")
        .forEach((el) => el.remove());

      const anchor = containerEl.querySelector(
        ".projects-custom-template-add"
      );

      Object.entries(preferences.templates.customTypes).forEach(
        ([key, label]) => {
          const setting = new Setting(containerEl)
            .setName(`${label} (${key})`)
            .setDesc("File name under template root directory")
            .addText((text) =>
              text
                .setValue(preferences.templates.typeMap[key] ?? "")
                .setPlaceholder(`${key}-template.md`)
                .onChange((value) => {
                  save({
                    ...preferences,
                    templates: {
                      ...preferences.templates,
                      typeMap: {
                        ...preferences.templates.typeMap,
                        [key]: value.trim(),
                      },
                    },
                  });
                })
            )
            .addExtraButton((btn) =>
              btn.setIcon("trash").setTooltip("Remove").onClick(() => {
                const { [key]: _label, ...restCustom } =
                  preferences.templates.customTypes;
                const { [key]: _file, ...restMap } =
                  preferences.templates.typeMap;
                save({
                  ...preferences,
                  templates: {
                    ...preferences.templates,
                    customTypes: restCustom,
                    typeMap: restMap,
                    defaultType:
                      preferences.templates.defaultType === key
                        ? "task"
                        : preferences.templates.defaultType,
                  },
                });
                renderCustomTypes();
              })
            );
          setting.settingEl.addClass("projects-custom-template-type");
          if (anchor) {
            anchor.before(setting.settingEl);
          }
        }
      );
    };

    const addSetting = new Setting(containerEl)
      .setName("Add custom type")
      .addText((text) => {
        text.setPlaceholder("key (e.g. epic)");
        text.inputEl.dataset["role"] = "custom-type-key";
      })
      .addText((text) => {
        text.setPlaceholder("label (e.g. Epic)");
        text.inputEl.dataset["role"] = "custom-type-label";
      })
      .addExtraButton((btn) =>
        btn.setIcon("plus").setTooltip("Add").onClick(() => {
          const keyInput = addSetting.settingEl.querySelector(
            'input[data-role="custom-type-key"]'
          ) as HTMLInputElement | null;
          const labelInput = addSetting.settingEl.querySelector(
            'input[data-role="custom-type-label"]'
          ) as HTMLInputElement | null;
          const key = keyInput?.value?.trim().replace(/\s+/g, "_") ?? "";
          const label = labelInput?.value?.trim() ?? "";
          if (!key || !label) return;
          // Avoid overwriting a built-in type
          if (BUILTIN_TEMPLATE_TYPES.some((t) => t.key === key)) return;

          save({
            ...preferences,
            templates: {
              ...preferences.templates,
              customTypes: {
                ...preferences.templates.customTypes,
                [key]: label,
              },
              typeMap: {
                ...preferences.templates.typeMap,
                [key]: preferences.templates.typeMap[key] ?? `${key}-template.md`,
              },
            },
          });
          if (keyInput) keyInput.value = "";
          if (labelInput) labelInput.value = "";
          renderCustomTypes();
        })
      );
    addSetting.settingEl.addClass("projects-custom-template-add");

    renderCustomTypes();

    const projectsManager = new Projects({
      target: containerEl,
      props: {
        save,
        preferences,
        projects: get(settings).projects,
      },
    });

    new Setting(containerEl)
      .setName(get(i18n).t("settings.archives.name"))
      .setDesc(get(i18n).t("settings.archives.desc"))
      .setHeading();

    const archivesManager = new Archives({
      target: containerEl,
      props: {
        archives: get(settings).archives,
        onRestore: (archiveId: ProjectId) => {
          settings.restoreArchive(archiveId);
          archivesManager.$set({ archives: get(settings).archives });
          projectsManager.$set({ projects: get(settings).projects });
        },
        onDelete: (archiveId: ProjectId) => {
          settings.deleteArchive(archiveId);
          archivesManager.$set({ archives: get(settings).archives });
        },
      },
    });
  }
}
