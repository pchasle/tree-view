import { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import type { AnnotatedRow, SortColumn } from "../types.ts";
import { Table, ScrollContainer, SortableHeader } from "./styled.ts";
import { TreeRow } from "./TreeRow.tsx";

type TreeTableProps = {
  rows: AnnotatedRow[];
  debouncedQuery: string;
  highlightedTechnicalId: string;
  collapsedSubmodels: Set<string>;
  onToggle: (identifier: string) => void;
  getAxisTint: (attributeCode: string) => string;
  onSortClick: (column: SortColumn) => void;
  getSortIndicator: (column: SortColumn) => string;
};

export const TreeTable = ({
  rows,
  debouncedQuery,
  highlightedTechnicalId,
  collapsedSubmodels,
  onToggle,
  getAxisTint,
  onSortClick,
  getSortIndicator,
}: TreeTableProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: () => 65,
    overscan: 5,
  });

  const virtualItems = rowVirtualizer.getVirtualItems();
  const paddingTop = virtualItems.length > 0 ? virtualItems[0].start : 0;
  const paddingBottom =
    virtualItems.length > 0
      ? rowVirtualizer.getTotalSize() -
        virtualItems[virtualItems.length - 1].end
      : 0;

  return (
    <ScrollContainer ref={scrollContainerRef}>
      <Table>
        <thead>
          <tr>
            <th>Type</th>
            <SortableHeader onClick={() => onSortClick("identifier")}>
              ID{getSortIndicator("identifier")}
            </SortableHeader>
            <th>Image</th>
            <SortableHeader onClick={() => onSortClick("label")}>
              Label{getSortIndicator("label")}
            </SortableHeader>
            <SortableHeader onClick={() => onSortClick("variant")}>
              Variant{getSortIndicator("variant")}
            </SortableHeader>
            <th>Variation axis</th>
          </tr>
        </thead>
        <tbody>
          {paddingTop > 0 && (
            <tr>
              <td
                colSpan={6}
                style={{ height: paddingTop, padding: 0, border: "none" }}
              />
            </tr>
          )}
          {virtualItems.map((virtualItem) => {
            const row = rows[virtualItem.index];
            return (
              <TreeRow
                key={row.identifier}
                ref={rowVirtualizer.measureElement}
                data-index={virtualItem.index}
                row={row}
                debouncedQuery={debouncedQuery}
                isHighlighted={row.technical_id === highlightedTechnicalId}
                isCollapsed={collapsedSubmodels.has(row.identifier)}
                onToggle={onToggle}
                getAxisTint={getAxisTint}
              />
            );
          })}
          {paddingBottom > 0 && (
            <tr>
              <td
                colSpan={6}
                style={{ height: paddingBottom, padding: 0, border: "none" }}
              />
            </tr>
          )}
        </tbody>
      </Table>
    </ScrollContainer>
  );
};
