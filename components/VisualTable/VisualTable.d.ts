export type VTDisplayOptions = "table" | "grid";

/**
 * VisualTable configuration
 */
export type VTConfig = {
  /** Your data to display */
  data: any[];
  /** Columns definition */
  columns: VTColumn[];
  /** Initial state of VisualTable */
  initialState?: {
    sort?: { key: string; direction: "asc" | "desc" };
    filter?: (item: any) => boolean;
    pageSize?: number;
    currentPage?: number;
  };
  /** Current state of VisualTable */
  state?: {
    sort?: { key: string; direction: "asc" | "desc" };
    filter?: (item: any) => boolean;
    pageSize?: number;
    currentPage?: number;
  };
  /** Additional options */
  options?: {
    /** Table will automaticly add columns from data object if they are not defined in columns */
    extendedColumns?: boolean;
    /** Data will be flattened from immerse object. Use only for simple objects and when you really need it. */
    flatData?: boolean;
    /**
     * Use prefix to your data keys. You can use this option instead of `flatData` when you need to display only a part of your data.
     * Prefix will be added to your keys in columns definition automatically. Note that you can not access other keys in your data object.
     * Example:
     * Your data object:
     * ```ts
     * const data = {
     * type: "post",
     * id: 1,
     * attributes: {
     *  title: "Hello World",
     *  content: "This is a content of the post",
     * }
     * ```
     * With dataPrefix you can display only attributes:
     * ```ts
     * const config = {
     * //...
     *  options: {
     *    dataPrefix: "attributes",
     *  },
     * };
     *
     * const columns = [
     * { key: "title", header: "Title" },
     * { key: "content", header: "Content" },
     * ];
     * ```
     */
    dataPrefix?: string;
  };
};

/**
 * Column definition for VisualTable
 * You can define what columns with what data will be displayed in VisualTable
 *
 * Example for a simple column definition:
 * ```ts
 * const columns = [
 *  { key: "name", header: "Name" },
 * ]
 * ```
 */
export type VTColumn = {
  /** Key in your Data Object to bind column to. When data does not exist in this key the key will display */
  key: string;
  /** Header for the column */
  header: string | ((item: any) => any);
  /** Render your data in different format or as a component */
  renderAs?: (item: any) => any;
  /** Bind column to a specific position in different layouts. Table will separate binded items from unbinded. */
  bindToPosition?: "name" | "status" | "id" | "checkbox" | "action" | "none";
  /** Enable the option to automaticly sort by this column (default: true) */
  enableSort?: boolean;
  /** Enable the option to automaticly generate filters for this column. Dont use this when you render `Header` as a component (default: false) */
  enableFilter?: boolean;
  /** Enable the option to search in this column (default: true) */
  enableSearch?: boolean;
  /** Enable the option to toggle the column vissiblity (default: true) */
  enableToggle?: boolean;
  /** Make the column hidden as default */
  hidden?: boolean;
  /** This option is useful when combination of `enableToggle` and `hidden` is activated.
   * When `relevant` is set to `true` data in this column will be still relevant to work with.
   *
   * You can hide the column permanently but still use the data in it.
   * ```ts
   * const columns = [
   * { key: "name", header: "Name", hidden: true, enableToggle: false, relevent: true },
   * ];
   * ```
   */
  relevant?: boolean;
};

export type VTRowStyle =
  | "default"
  | "success"
  | "warning"
  | "destructive"
  | "checked";
/**
 * Processed column definition for VisualTable
 */
export type VTColumnProcessed = VTColumn & {
  /** Function that determines what content should be displayed in colum (data[key] or renderAs()) */
  content: () => string | ((item: any) => any);
  /** AdditionalColumn is column whitch was add by enabling `extendedColumns` config option */
  additionalColumn?: boolean;
};

export type VTFilter = {
  column: string;
  operator: "===" | "!==" | ">" | "<" | "#";
  value: any;
};
