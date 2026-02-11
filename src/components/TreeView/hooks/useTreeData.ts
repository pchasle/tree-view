import { useMemo } from "react";
import { useQuery } from "react-query";
import type { ProductRow, AnnotatedRow } from "../types.ts";
import { buildTreeOrder, annotateRows } from "../utils/tree.ts";
import { useDataset } from "../../../context/DatasetContext.tsx";

export const useTreeData = (
  comparator: (a: ProductRow, b: ProductRow) => number,
  debouncedQuery: string,
  showHidden: boolean,
  collapsedSubmodels: Set<string>,
): {
  data: ProductRow[] | undefined;
  rows: AnnotatedRow[];
  isLoading: boolean;
  isError: boolean;
} => {
  const { datasetKey, loadDataset } = useDataset();

  const { data, isLoading, isError } = useQuery(
    ["product-models", datasetKey],
    loadDataset,
  );

  const rows = useMemo(() => {
    if (!data) return [];
    const treeRows = buildTreeOrder(data, comparator);
    const annotated = annotateRows(treeRows, debouncedQuery);

    return annotated.filter((row) => {
      if (
        row.product_type === "variant" &&
        row.parent !== null &&
        collapsedSubmodels.has(row.parent)
      ) {
        return false;
      }
      if (debouncedQuery && !showHidden && !row.visible) {
        return false;
      }
      return true;
    });
  }, [data, comparator, debouncedQuery, showHidden, collapsedSubmodels]);

  return { data, rows, isLoading, isError };
};
