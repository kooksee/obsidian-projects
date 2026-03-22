export interface FieldConfig {
  readonly [key: string]: {
    readonly width?: number;
    readonly hide?: boolean;
    readonly pinned?: boolean;
  };
}

export type TableGroupMultiValueMode = "split" | "first";

export interface TableConfig {
  readonly fieldConfig?: FieldConfig;
  readonly sortField?: string;
  readonly sortAsc?: boolean;
  readonly orderFields?: string[];
  readonly groupByField?: string;
  readonly groupMultiValueMode?: TableGroupMultiValueMode;
  readonly groupOrder?: string[];
  readonly collapsedGroups?: string[];
}
