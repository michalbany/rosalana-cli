import { ref, computed, defineComponent, h, Ref } from 'vue';
import { type VTColumnProcessed, type VTConfig, type VTRowStyle } from "@/types";

export function useVisualTable(config: VTConfig) {
  // Inicializace dat
  const originalData = ref(config.data);
  const dataPrefix = config.options?.dataPrefix;

  // Funkce pro flatten objektu z hlubokého na plochý
  const flattenObject = (obj: any, path: string = ""): any => {
    let result: any = {};
    for (const key in obj) {
      const newPath = path ? `${path}.${key}` : key;
      if (typeof obj[key] === "object" && obj[key] !== null) {
        if (Array.isArray(obj[key])) {
          // Pokud je hodnota pole, zachováme ji jako pole
          result[newPath] = obj[key].map((item: any) => 
            typeof item === "object" && item !== null ? flattenObject(item) : item
          );
        } else {
          // Pokud je hodnota objekt (ne pole), provedeme flatten
          Object.assign(result, flattenObject(obj[key], newPath));
        }
      } else {
        result[newPath] = obj[key];
      }
    }
    return result;
  };

  if (dataPrefix) {
    const prefixedData = originalData.value.map((item) => item[dataPrefix]);
    originalData.value = prefixedData;
  }

  if (config.options?.flatData) {
    const flattenData = originalData.value.map((item) => flattenObject(item));
    originalData.value = flattenData;
  }

  // Funkce pro získání hodnoty z objektu na základě cesty (např. "user.name")
  const getValueByPath = (obj: any, path: string) => {
    return path.split(".").reduce((acc, part) => acc && acc[part], obj);
  };

  // Inicializace a rozšíření sloupců o výchozí hodnoty
  let columns: VTColumnProcessed[] = config.columns.map((column) => ({
    enableSort: true,
    enableSearch: true,
    enableFilter: false,
    enableToggle: true,
    hidden: false,
    relevant: false,
    content() {
      return this.renderAs ? this.renderAs : this.key;
    },
    ...column, // Přepíše výchozí hodnoty pokud jsou definovány v config.columns
  }));

  // Pokud je enabledColumns === true, přidáme další sloupce z originalData[0]
  if (config.options?.extendedColumns && originalData.value.length > 0) {
    const additionalColumns = Object.keys(originalData.value[0])
    .map((key) => {
        // Zkontrolujeme, jestli klíč již neexistuje v definovaných sloupcích
        const existingColumn = columns.find((col) => col.key === key);

        // Zkontrolujeme typ hodnoty, která odpovídá klíči
        const value = originalData.value[0][key];
        const valueType = typeof value;

        // Přidáme sloupec pouze pokud typ je string, number, boolean nebo další běžně zobrazitelné typy
        if (
          !existingColumn &&
          (valueType === "string" ||
            valueType === "number" ||
            valueType === "boolean" ||
            value == null) &&
          !key.includes(".")
        ) {
          return {
            key: key,
            header: key.charAt(0).toUpperCase() + key.slice(1), // Vytvoření základního headeru
            enableSort: true,
            enableFilter: false,
            renderAs() {
              return (item: any) => item[this.key] || "N/A";
            },
            enableSearch: true,
            enableToggle: true,
            hidden: true, // Nově přidané sloupce budou skryté
            additionalColumn: true,
            relevant: false,
            content() {
              return this.renderAs() || this.key;
            },
          };
        }
        return null;
      })
      .filter((col) => col !== null) as VTColumnProcessed[];

    columns = [...columns, ...additionalColumns];
  }

  const columnsRef: Ref<VTColumnProcessed[]> = ref(columns);

  // Stav třídění, filtrování, stránkování
  const sortState = ref(
    config.state?.sort || config.initialState?.sort || { key: null, direction: "asc" }
  );
  const filterState = ref(config.state?.filter || config.initialState?.filter || null);
  const currentPage = ref(config.state?.currentPage || config.initialState?.currentPage || 1);
  const pageSize = ref(config.state?.pageSize || config.initialState?.pageSize || 10);
  const selectState = ref<Set<string | number>>(new Set());

  const getRowStyle = (row: any) => {
    if (selectState.value.has(row.id)) {
      return stylesCase("checked");
    }
    //...
  }

  const stylesCase = (style: VTRowStyle | undefined) => {
    switch (style) {
      case "checked":
        return "bg-slate-200 hover:bg-slate-200";
      case "success":
        return "bg-green-100 hover:bg-green-200";
      case "warning":
        return "bg-yellow-100 hover:bg-yellow-200";
      case "destructive":
        return "bg-red-100 hover:bg-red-200";
      default:
        return "";
    }
  };

  // Třídění dat
  const sortedData = computed(() => {
    if (sortState.value.key) {
      return [...originalData.value].sort((a, b) => {
        const aVal = a[sortState.value.key!];
        const bVal = b[sortState.value.key!];

        // Ošetření null a undefined
        if (aVal == null && bVal == null) return 0;
        if (aVal == null) return 1;
        if (bVal == null) return -1;

        // Porovnání Arrays
        if (Array.isArray(aVal) && Array.isArray(bVal)) {
          // Snažíme se porovnat prvky pole
          for (let i = 0; i < Math.min(aVal.length, bVal.length); i++) {
            if (aVal[i] < bVal[i]) return sortState.value.direction === "asc" ? -1 : 1;
            if (aVal[i] > bVal[i]) return sortState.value.direction === "asc" ? 1 : -1;
          }
          return sortState.value.direction === "asc" ?
            aVal.length - bVal.length :
            bVal.length - aVal.length;
        }

        // Porovnávání ostatních typů
        if (aVal < bVal) return sortState.value.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortState.value.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return originalData.value;
  });

  // Filtrování dat
  const filteredData = computed(() => {
    if (filterState.value) {
      currentPage.value = 1; // Reset stránkování při změně filtru
      return sortedData.value.filter(filterState.value);
    }
    return sortedData.value;
  });

  // Stránkování dat
  const paginatedData = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value;
    return filteredData.value.slice(start, start + pageSize.value);
  });
  
  // Metody pro manipulaci s daty
  const setSort = (key: string) => {
    const column = columnsRef.value.find((col) => col.key === key);
    if (column && column.enableSort) {
      if (sortState.value.key === key) {
        sortState.value.direction = sortState.value.direction === "asc" ? "desc" : "asc";
      } else {
        sortState.value.key = key;
        sortState.value.direction = "asc";
      }
    }
  };

  // Generování filtrů vytváří Set i z Array hodnot
  const getFilterForColumn = (key: string) => {
    return Array.from(
      new Set(
        originalData.value.flatMap((item) => {
          const value = item[key];
          if (Array.isArray(value)) {
            return value.filter((v) => v !== null && v !== "" && v !== undefined);
          } else if (value !== null && value !== "" && value !== undefined) {
            return [value];
          }
          return [];
        })
      )
    );
  };

  const setFilter = (filterFn: (item: any) => boolean) => {
    filterState.value = filterFn;
  };

  // Getter pro viditelné sloupce
  const getVisibleColumns = () => {
    return columnsRef.value.filter((col) => col.hidden !== true);
  };

  // Getter pro všechny dostupné sloupce
  const getAllAvailableColumns = () => {
    return columnsRef.value;
  };

  // Getter pro všechny spoupce na toggle viditelnosti
  const getToggleableColumns = () => {
    return columnsRef.value.filter((col) => col.enableToggle);
  };

  const getFilterableColumns = () => {
    return columnsRef.value.filter((col) => col.enableFilter);
  };

  // Toggle visibility sloupce
  const toggleVisibility = (key: string) => {
    const column = columnsRef.value.find((col) => col.key === key);
    if (column && column.enableToggle) {
      column.hidden = !column.hidden;
    }
  };

  return {
    data: {
      get paginated() {
        return paginatedData.value;
      },
      get original() {
        return originalData.value;
      },
      get sorted() {
        return sortedData.value;
      },
      get filtered() {
        return filteredData.value;
      },
    },
    original: {
      columns: columnsRef.value,
    },
    columns: {
      get visible() {
        return getVisibleColumns();
      },
      get relevant() {
        return columnsRef.value.filter((col) => col.hidden !== true || col.relevant === true);
      },
      get unbinded() {
        return this.visible.filter((col) => !col.bindToPosition);
      },
      bind(bind: string): VTColumnProcessed | null {
        return this.visible.find((col) => col.bindToPosition === bind) || null;
      },
      toggleable: getToggleableColumns(),
      all: getAllAvailableColumns(),
      filterable: getFilterableColumns(),
    },
    select: {
      selected: selectState.value,
      isIndeterminate() {
        return selectState.value.size > 0 && selectState.value.size < originalData.value.length;
      },
      isAllSelected() {
        return selectState.value.size === filteredData.value.length;
      },
      isAllOnPageSelected() {
        return paginatedData.value.every((item: any) => selectState.value.has(item.id));
      },
      isSelected(id: string | number) {
        return selectState.value.has(id);
      },
      toggleAll(): void {
        if (!this.isAllSelected()) {
          if (this.isIndeterminate()) {
            if (this.isAllOnPageSelected()) {
              paginatedData.value.forEach((item: any) => selectState.value.delete(item.id));
            } else {
              paginatedData.value.forEach((item: any) => selectState.value.add(item.id));
            }
          } else {
            selectState.value = new Set(paginatedData.value.map((item: any) => item.id));
          }
        } else {
          selectState.value.clear();
        }
      },
      toggle(id: string | number): void {
        if (selectState.value.has(id)) {
          selectState.value.delete(id);
        } else {
          selectState.value.add(id);
        }
      },
    },
    state: {
      get sort() {
        return sortState.value;
      },
      get filter() {
        return filterState.value;
      },
      get select() {
        return selectState.value;
      },
    },
    paginator: {
      get first() {
        return currentPage.value === 1 || this.totalPages === 0;
      },
      get last() {
        return currentPage.value === this.totalPages || this.totalPages === 0;
      },
      get totalPages() {
        return Math.ceil(filteredData.value.length / pageSize.value);
      },
      get currentPage() {
        return currentPage.value;
      },
      set currentPage(value: number) {
        if (value < 1 || value > this.totalPages) {
          return;
        }
        currentPage.value = value;
      },
      get pageSize() {
        return pageSize.value;
      },
      set pageSize(value: number) {
        pageSize.value = value;

        if (this.currentPage > this.totalPages) {
          this.currentPage = this.totalPages;
        }
      },
      nextPage() {
        if (!this.last) {
          currentPage.value++;
        }
      },
      prevPage() {
        if (!this.first) {
          currentPage.value--;
        }
      },
    },
    setSort,
    setFilter,
    sortState,
    toggleVisibility,
    getFilterForColumn,
    getRowStyle,
  };
}

export const VTRender = defineComponent({
  props: ["content", "item"],
  setup(props: { content: any; item?: any }) {
    return () => {
      if (typeof props.content === "function") {
        return h(props.content, props.item);
      }
      if (props.item && typeof props.content === "string" && props.content in props.item) {
        const result = props.item[props.content];
        if (typeof result === "object") {
          console.warn(...VTErrors.vtrender.invalidType.object, `${props.content} reading`, result , props.item);
          return String(result);
        } else {
          return result;
        }
      }

      return props.content;
    };
  },
});

const VTErrors = {
  vtrender: {
    invalidType: {
      object: [
        "%cVTRender Warning: Trying to render object or null as string\n\n" +
          "%cIf you want to render Object, provide renderAs function as column propertie. Use renderAs also for values that can be null for better user experience.\n" +
          "%cBe aware that rendering is separated from data.\n\n" +
          "%cTip: %cWhen you expect object to be part of data use enableFlatData option in VTConfig.\n\n On:",
        "font-weight: bold; color: orange;",
        "",
        "font-style: italic;",
        "font-weight: bold; color: black;",
        "",
      ],
    },
  },
};
