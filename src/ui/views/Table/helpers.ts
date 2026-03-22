import { produce } from "immer";
import type { DataField } from "src/lib/dataframe/dataframe";
import type { GridRowProps } from "./components/DataGrid/dataGrid";

export type ListGroupingMode = "joined" | "split" | "first";

export function sortFields(fields: DataField[], order: string[]) {
  if (!order.length) {
    return fields;
  }

  const test = produce(fields, (draft) => {
    draft.sort((left, right) => {
      if (!order.includes(left.name)) {
        return 1;
      }
      if (!order.includes(right.name)) {
        return -1;
      }
      return order.indexOf(left.name) - order.indexOf(right.name);
    });
  });

  return test;
}

export type GroupedRows = {
  key: string;
  label: string;
  rows: GridRowProps[];
};

export function groupRowsByField(
  rows: GridRowProps[],
  field: string,
  groupOrder: string[] = [],
  listGroupingMode: ListGroupingMode = "joined"
): GroupedRows[] {
  if (!field) {
    return [{ key: "all", label: "All", rows }];
  }

  const groups = new Map<string, GridRowProps[]>();

  for (const row of rows) {
    const raw = row.row?.[field];
    if (Array.isArray(raw) && listGroupingMode !== "joined") {
      const values = [...new Set(raw.map((v) => String(v ?? "").trim()))].filter(
        (v) => v !== ""
      );

      if (!values.length) {
        const current = groups.get("__EMPTY__") ?? [];
        current.push(row);
        groups.set("__EMPTY__", current);
      } else if (listGroupingMode === "first") {
        const first = values[0]!;
        const current = groups.get(first) ?? [];
        current.push(row);
        groups.set(first, current);
      } else {
        for (const value of values) {
          const current = groups.get(value) ?? [];
          current.push(row);
          groups.set(value, current);
        }
      }
      continue;
    }

    const value = Array.isArray(raw) ? raw.join(", ") : raw;
    const key =
      value === undefined || value === null || value === ""
        ? "__EMPTY__"
        : String(value);
    const current = groups.get(key) ?? [];
    current.push(row);
    groups.set(key, current);
  }

  const mapped = [...groups.entries()]
    .map(([key, grouped]) => ({
      key,
      label: key === "__EMPTY__" ? "(Empty)" : key,
      rows: grouped,
    }));

  if (!groupOrder.length) {
    return mapped.sort((a, b) => a.label.localeCompare(b.label));
  }

  return mapped.sort((a, b) => {
    const ai = groupOrder.indexOf(a.key);
    const bi = groupOrder.indexOf(b.key);

    if (ai >= 0 && bi >= 0) return ai - bi;
    if (ai >= 0) return -1;
    if (bi >= 0) return 1;

    return a.label.localeCompare(b.label);
  });
}
