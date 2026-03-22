import { describe, expect, it } from "@jest/globals";
import {
  DataFieldType,
  type DataField,
} from "../../../lib/dataframe/dataframe";
import { groupRowsByField, sortFields } from "./helpers";

describe("sortFields", () => {
  it("sort single field", () => {
    const fields = [
      {
        name: "foo",
        type: DataFieldType.String,
        repeated: false,
        identifier: false,
        derived: false,
      },
    ];
    const order = ["foo"];

    const sorted = sortFields(fields, order);

    expect(sorted).toStrictEqual(fields);
  });

  it("sort fields where all are specified", () => {
    const defaultField: Omit<DataField, "name"> = {
      type: DataFieldType.String,
      repeated: false,
      identifier: false,
      derived: false,
    };

    const fields: DataField[] = [
      { name: "foo", ...defaultField },
      { name: "bar", ...defaultField },
      { name: "baz", ...defaultField },
    ];

    const want: DataField[] = [
      { name: "baz", ...defaultField },
      { name: "bar", ...defaultField },
      { name: "foo", ...defaultField },
    ];

    const order = ["baz", "bar", "foo"];

    const sorted = sortFields(fields, order);

    expect(sorted).toStrictEqual(want);
  });

  it("sorts unspecified fields last", () => {
    const defaultField: Omit<DataField, "name"> = {
      type: DataFieldType.String,
      repeated: false,
      identifier: false,
      derived: false,
    };

    const fields: DataField[] = [
      { name: "foo", ...defaultField },
      { name: "bar", ...defaultField },
      { name: "baz", ...defaultField },
    ];

    const want: DataField[] = [
      { name: "baz", ...defaultField },
      { name: "foo", ...defaultField },
      { name: "bar", ...defaultField },
    ];

    const order = ["baz", "foo"];

    const sorted = sortFields(fields, order);

    expect(sorted).toStrictEqual(want);
  });

  it("doesn't sort fields if order is empty", () => {
    const defaultField: Omit<DataField, "name"> = {
      type: DataFieldType.String,
      repeated: false,
      identifier: false,
      derived: false,
    };

    const fields: DataField[] = [
      { name: "foo", ...defaultField },
      { name: "baz", ...defaultField },
      { name: "bar", ...defaultField },
    ];

    const want: DataField[] = [
      { name: "foo", ...defaultField },
      { name: "baz", ...defaultField },
      { name: "bar", ...defaultField },
    ];

    const order: string[] = [];

    const sorted = sortFields(fields, order);

    expect(sorted).toStrictEqual(want);
  });
});

describe("groupRowsByField", () => {
  it("groups rows by selected field", () => {
    const grouped = groupRowsByField(
      [
        { rowId: "1", row: { SP: "SP1" } },
        { rowId: "2", row: { SP: "SP2" } },
        { rowId: "3", row: { SP: "SP1" } },
      ],
      "SP"
    );

    expect(grouped).toHaveLength(2);
    expect(grouped[0]?.label).toBe("SP1");
    expect(grouped[0]?.rows).toHaveLength(2);
    expect(grouped[1]?.label).toBe("SP2");
    expect(grouped[1]?.rows).toHaveLength(1);
  });

  it("puts empty values into (Empty) group", () => {
    const grouped = groupRowsByField(
      [
        { rowId: "1", row: { SP: "SP1" } },
        { rowId: "2", row: { SP: "" } },
        { rowId: "3", row: { SP: undefined } },
      ],
      "SP"
    );

    const emptyGroup = grouped.find((x) => x.label === "(Empty)");
    expect(emptyGroup?.rows).toHaveLength(2);
  });

  it("supports list values", () => {
    const grouped = groupRowsByField(
      [
        { rowId: "1", row: { tags: ["SP1", "frontend"] } },
        { rowId: "2", row: { tags: ["SP1", "frontend"] } },
      ],
      "tags"
    );

    expect(grouped).toHaveLength(1);
    expect(grouped[0]?.label).toBe("SP1, frontend");
  });

  it("splits list values into independent groups when enabled", () => {
    const grouped = groupRowsByField(
      [
        { rowId: "1", row: { sprint: ["S1", "S2"] } },
        { rowId: "2", row: { sprint: ["S2"] } },
        { rowId: "3", row: { sprint: [] } },
      ],
      "sprint",
      [],
      true
    );

    expect(grouped.map((x) => x.label)).toEqual(["(Empty)", "S1", "S2"]);
    expect(grouped.find((x) => x.label === "S1")?.rows.map((r) => r.rowId)).toEqual([
      "1",
    ]);
    expect(grouped.find((x) => x.label === "S2")?.rows.map((r) => r.rowId)).toEqual([
      "1",
      "2",
    ]);
  });

  it("supports custom group order", () => {
    const grouped = groupRowsByField(
      [
        { rowId: "1", row: { SP: "SP1" } },
        { rowId: "2", row: { SP: "SP2" } },
        { rowId: "3", row: { SP: "SP3" } },
      ],
      "SP",
      ["SP2", "SP1"]
    );

    expect(grouped.map((x) => x.key)).toEqual(["SP2", "SP1", "SP3"]);
  });
});
