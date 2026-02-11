import { useState, useMemo, useCallback } from "react";
import type { PersistedState, ProductType } from "./types.ts";
import { useAxisTint } from "./hooks/useAxisTint.ts";
import { useDebouncedValue } from "./hooks/useDebouncedValue.ts";
import { useTreeSort } from "./hooks/useTreeSort.ts";
import { useCollapseState } from "./hooks/useCollapseState.ts";
import { usePersistedTreeState } from "./hooks/usePersistedTreeState.ts";
import { useTreeData } from "./hooks/useTreeData.ts";
import { TreeToolbar } from "./components/TreeToolbar.tsx";
import { TreeTable } from "./components/TreeTable.tsx";
import { TreeViewModal } from "./components/TreeViewModal.tsx";
import { Helper } from "akeneo-design-system";

type TreeViewProps = {
  product: {
    product_type: ProductType;
    technical_id: string;
  };
};

export const TreeView = ({ product }: TreeViewProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showHidden, setShowHidden] = useState(false);
  const debouncedQuery = useDebouncedValue(searchQuery, 300);

  const {
    sortColumn,
    sortDirection,
    setSortColumn,
    setSortDirection,
    comparator,
    getSortDirection,
    handleDirectionChange,
  } = useTreeSort();

  const {
    collapsedSubmodels,
    setCollapsedSubmodels,
    toggle,
    expandAll,
    collapseAll,
  } = useCollapseState();

  const { data, rows, isLoading, isError } = useTreeData(
    comparator,
    debouncedQuery,
    showHidden,
    collapsedSubmodels,
  );

  const getAxisTint = useAxisTint(data);

  const rootProductModelLabel = useMemo(() => {
    return data?.find((item) => item.parent === null)?.label ?? "";
  }, [data]);

  const allSubmodelIds = useMemo(() => {
    if (!data) return [];
    return data
      .filter((item) => item.product_type === "submodel")
      .map((item) => item.identifier);
  }, [data]);

  const restore = useCallback(
    (persisted: PersistedState) => {
      setSortColumn(persisted.sortColumn);
      setSortDirection(persisted.sortDirection);
      setSearchQuery(persisted.searchQuery);
      setShowHidden(persisted.showHidden);
      setCollapsedSubmodels(new Set(persisted.collapsedSubmodels));
    },
    [setSortColumn, setSortDirection, setCollapsedSubmodels],
  );

  usePersistedTreeState(
    data,
    {
      sortColumn,
      sortDirection,
      searchQuery: debouncedQuery,
      showHidden,
      collapsedSubmodels,
    },
    restore,
  );

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Error loading data.</p>;

  return (
    <TreeViewModal title={rootProductModelLabel} onClose={() => {}}>
      <TreeToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        showHidden={showHidden}
        onShowHiddenChange={setShowHidden}
        onExpandAll={expandAll}
        onCollapseAll={() => collapseAll(allSubmodelIds)}
      />
      <TreeTable
        rows={rows}
        debouncedQuery={debouncedQuery}
        highlightedTechnicalId={product.technical_id}
        collapsedSubmodels={collapsedSubmodels}
        onToggle={toggle}
        getAxisTint={getAxisTint}
        getSortDirection={getSortDirection}
        onDirectionChange={handleDirectionChange}
      />
      <Helper level="warning">
        Some warning message, only in case the product model has more than 1000
        variants.
      </Helper>
    </TreeViewModal>
  );
};
