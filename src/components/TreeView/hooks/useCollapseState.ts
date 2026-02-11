import { useState, useCallback } from "react";

export const useCollapseState = () => {
  const [collapsedSubmodels, setCollapsedSubmodels] = useState<Set<string>>(
    new Set(),
  );

  const toggle = useCallback((identifier: string) => {
    setCollapsedSubmodels((prev) => {
      const next = new Set(prev);
      if (next.has(identifier)) {
        next.delete(identifier);
      } else {
        next.add(identifier);
      }
      return next;
    });
  }, []);

  const expandAll = useCallback(() => {
    setCollapsedSubmodels(new Set());
  }, []);

  const collapseAll = useCallback((submodelIds: string[]) => {
    setCollapsedSubmodels(new Set(submodelIds));
  }, []);

  return {
    collapsedSubmodels,
    setCollapsedSubmodels,
    toggle,
    expandAll,
    collapseAll,
  };
};
