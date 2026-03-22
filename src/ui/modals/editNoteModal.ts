import { App, Modal } from "obsidian";

import type { DataField, DataRecord } from "src/lib/dataframe/dataframe";
import { findIncomingRelations, type RelationRef } from "src/lib/relation";

import EditRecord from "./components/EditNote.svelte";

export class EditNoteModal extends Modal {
  component?: EditRecord;

  constructor(
    app: App,
    readonly fields: DataField[],
    readonly onSave: (record: DataRecord) => void,
    readonly defaults: DataRecord,
    readonly allRecords: DataRecord[] = []
  ) {
    super(app);
  }

  onOpen() {
    const relationFields = this.fields
      .filter((field) => field.typeConfig?.relation)
      .map((field) => field.name);

    const incomingRelations: RelationRef[] = relationFields.length
      ? findIncomingRelations(this.allRecords, relationFields, this.defaults.id)
      : [];

    this.component = new EditRecord({
      target: this.contentEl,
      props: {
        record: this.defaults,
        fields: this.fields,
        incomingRelations,
        onSave: (record: DataRecord) => {
          this.onSave(record);
          this.close();
        },
      },
    });
  }

  onClose() {
    if (this.component) {
      this.component.$destroy();
    }
  }
}
