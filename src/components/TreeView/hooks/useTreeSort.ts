import { useState, useMemo } from "react";
import type { SortColumn, SortDirection, ProductModel } from "../types.ts";

export const useTreeSort = () => {
  const [sortColumn, setSortColumn] = useState<SortColumn>("identifier");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const comparator = useMemo(
    () => (a: ProductModel, b: ProductModel) => {
      if (sortColumn === "variant") {
        const aVariant = a.complete_variant_products;
        const bVariant = b.complete_variant_products;
        const aTotal = aVariant ? aVariant.total : -1;
        const bTotal = bVariant ? bVariant.total : -1;
        const cmp =
          aTotal - bTotal ||
          (aVariant?.complete ?? -1) - (bVariant?.complete ?? -1);
        return sortDirection === "asc" ? cmp : -cmp;
      }
      const aVal = a[sortColumn].toLowerCase();
      const bVal = b[sortColumn].toLowerCase();
      const cmp = aVal.localeCompare(bVal);
      return sortDirection === "asc" ? cmp : -cmp;
    },
    [sortColumn, sortDirection],
  );

  const handleSortClick = (column: SortColumn) => {
    if (sortColumn !== column) {
      setSortColumn(column);
      setSortDirection("asc");
    } else {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    }
  };

  const getSortIndicator = (column: SortColumn) => {
    if (sortColumn !== column) return "";
    return sortDirection === "asc" ? " ↑" : " ↓";
  };

  return {
    sortColumn,
    sortDirection,
    setSortColumn,
    setSortDirection,
    comparator,
    handleSortClick,
    getSortIndicator,
  };
};
