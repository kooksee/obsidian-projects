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
  TemplateType,
} from "src/settings/settings";
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

    new Setting(containerEl)
      .setName("Default template type")
      .setDesc("Used when creating new notes")
      .addDropdown((dropdown) => {
        dropdown
          .addOption("issue", "Issue")
          .addOption("task", "Task")
          .addOption("project", "Project")
          .addOption("team", "Team")
          .addOption("product", "Product")
          .addOption("member", "Member")
          .addOption("feature_unit", "Feature Unit")
          .setValue(preferences.templates.defaultType)
          .onChange((value) => {
            save({
              ...preferences,
              templates: {
                ...preferences.templates,
                defaultType: value as TemplateType,
              },
            });
          });
      });

    const templateTypes: Array<{ key: TemplateType; label: string }> = [
      { key: "issue", label: "Issue" },
      { key: "task", label: "Task" },
      { key: "project", label: "Project" },
      { key: "team", label: "Team" },
      { key: "product", label: "Product" },
      { key: "member", label: "Member" },
      { key: "feature_unit", label: "Feature Unit" },
    ];

    templateTypes.forEach((templateType) => {
      new Setting(containerEl)
        .setName(`${templateType.label} template file`)
        .setDesc("File name under template root directory")
        .addText((text) =>
          text
            .setValue(preferences.templates.typeMap[templateType.key])
            .setPlaceholder(`${templateType.key}-template.md`)
            .onChange((value) => {
              save({
                ...preferences,
                templates: {
                  ...preferences.templates,
                  typeMap: {
                    ...preferences.templates.typeMap,
                    [templateType.key]: value.trim(),
                  },
                },
              });
            })
        );
    });

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
