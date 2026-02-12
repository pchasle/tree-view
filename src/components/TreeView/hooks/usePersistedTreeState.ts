import { useEffect, useRef, useState } from "react";
import type {
  ProductRow,
  SortColumn,
  SortDirection,
  PersistedState,
} from "../types.ts";
import { getRootIdentifier } from "../utils/tree.ts";

const saveState = (rootId: string, state: PersistedState): void => {
  try {
    sessionStorage.setItem(`tree-view:${rootId}`, JSON.stringify(state));
  } catch {
    // ignore quota errors
  }
};

const loadState = (rootId: string): PersistedState | null => {
  try {
    const raw = sessionStorage.getItem(`tree-view:${rootId}`);
    if (!raw) return null;
    return JSON.parse(raw) as PersistedState;
  } catch {
    return null;
  }
};

export const usePersistedTreeState = (
  data: ProductRow[] | undefined,
  state: {
    sortColumn: SortColumn;
    sortDirection: SortDirection;
    searchQuery: string;
    showHidden: boolean;
    collapsedSubmodels: Set<string>;
  },
  restore: (persisted: PersistedState) => void,
): { isReady: boolean } => {
  const restoredRef = useRef(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!data || restoredRef.current) return;
    restoredRef.current = true;
    const rootId = getRootIdentifier(data);
    const stored = loadState(rootId);
    if (stored) {
      restore(stored);
    }
    setIsReady(true);
  }, [data, restore]);

  useEffect(() => {
    if (!data) return;
    const rootId = getRootIdentifier(data);
    saveState(rootId, {
      sortColumn: state.sortColumn,
      sortDirection: state.sortDirection,
      searchQuery: state.searchQuery,
      showHidden: state.showHidden,
      collapsedSubmodels: [...state.collapsedSubmodels],
    });
  }, [
    data,
    state.sortColumn,
    state.sortDirection,
    state.searchQuery,
    state.showHidden,
    state.collapsedSubmodels,
  ]);

  return { isReady };
};
