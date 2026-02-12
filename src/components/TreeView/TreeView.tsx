import {
  Helper,
  Modal,
  Placeholder,
  ServerErrorIllustration,
  useDebounce,
} from "akeneo-design-system";
import { useCallback, useMemo, useState } from "react";
import { TreeTable } from "./components/TreeTable.tsx";
import { TreeToolbar } from "./components/TreeToolbar.tsx";
import { TreeViewModal } from "./components/TreeViewModal.tsx";
import { useAxisTint } from "./hooks/useAxisTint.ts";
import { useCollapseState } from "./hooks/useCollapseState.ts";
import { usePersistedTreeState } from "./hooks/usePersistedTreeState.ts";
import { useTranslate } from "@akeneo-pim/shared";
import { useTreeData } from "./hooks/useTreeData.ts";
import { useTreeSort } from "./hooks/useTreeSort.ts";
import type { PersistedState, ProductType } from "./types.ts";

const VARIANT_LIMIT = 1000;

type TreeViewProps = {
  product: {
    product_type: ProductType;
    technical_id: string;
  };
};

export const TreeView = ({ product }: TreeViewProps) => {
  const translate = useTranslate();
  const [searchQuery, setSearchQuery] = useState("");
  const [showHidden, setShowHidden] = useState(false);
  const debouncedQuery = useDebounce(searchQuery, 300);

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

  const { isReady } = usePersistedTreeState(
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

  if (isLoading)
    return <Modal closeTitle={translate("Close")} onClose={() => {}}></Modal>;
  if (isError)
    return (
      <Modal closeTitle={translate("Close")} onClose={() => {}}>
        <Placeholder
          title={translate("An error occurred")}
          illustration={<ServerErrorIllustration />}
          size="large"
        />
      </Modal>
    );

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
        isReady={isReady}
        onToggle={toggle}
        getAxisTint={getAxisTint}
        getSortDirection={getSortDirection}
        onDirectionChange={handleDirectionChange}
      />
      {data && data.length >= VARIANT_LIMIT && (
        <Helper level="warning">
          {translate(
            `This product model has more than ${VARIANT_LIMIT} variants. Only the first ${VARIANT_LIMIT} are displayed and available for search.`,
          )}
        </Helper>
      )}
    </TreeViewModal>
  );
};
