import { useMemo } from "react";
import { useQuery } from "react-query";
import type { AnnotatedRow, ProductRow } from "../types.ts";
import { annotateRows, buildTreeOrder } from "../utils/tree.ts";

const BAPID = "iq299ro4tlbmh1qbbm8stpmdej";

const fetchTree = async (
  productType: "model" | "product",
  technicalId: string,
): Promise<ProductRow[]> => {
  const url = `/enrich/product-model/rest/tree?product_type=${productType}&technical_id=${technicalId}`;
  const response = await fetch(url, {
    headers: {
      "X-Requested-With": "XMLHttpRequest",
      Cookie: `BAPID=${BAPID}`,
    },
    credentials: "include",
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
};

export const useTreeData = (
  productType: "model" | "product",
  technicalId: string,
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
  const { data, isLoading, isError } = useQuery(
    ["product-models", productType, technicalId],
    () => fetchTree(productType, technicalId),
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
