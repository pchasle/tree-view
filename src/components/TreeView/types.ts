export type ProductType = "model" | "submodel" | "variant";

export type ProductRow = {
  product_type: ProductType;
  identifier: string;
  technical_id: string;
  label: string;
  image: string;
  parent: string | null;
  axes?: {
    attribute_code: string;
    attribute_label: string;
    axis_value: string;
  }[];
  complete_variant_products?: { total: number; complete: number };
};

export type AnnotatedRow = ProductRow & {
  matches: boolean;
  visible: boolean;
};

export type SortColumn = "identifier" | "label" | "variant";
export type SortDirection = "asc" | "desc";

export type PersistedState = {
  sortColumn: SortColumn;
  sortDirection: SortDirection;
  searchQuery: string;
  showHidden: boolean;
  collapsedSubmodels: string[];
};
