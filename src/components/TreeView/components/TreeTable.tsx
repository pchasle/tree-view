import { useVirtualizer } from "@tanstack/react-virtual";
import {
  NoResultsIllustration,
  Placeholder,
  Table,
} from "akeneo-design-system";
import { useRef } from "react";
import type { AnnotatedRow, SortColumn } from "../types.ts";
import styled from "styled-components";
import { TreeRow } from "./TreeRow.tsx";

type TreeTableProps = {
  rows: AnnotatedRow[];
  debouncedQuery: string;
  highlightedTechnicalId: string;
  collapsedSubmodels: Set<string>;
  onToggle: (identifier: string) => void;
  getAxisTint: (attributeCode: string) => string;
  getSortDirection: (column: SortColumn) => "none" | "ascending" | "descending";
  onDirectionChange: (
    column: SortColumn,
    direction: "none" | "ascending" | "descending",
  ) => void;
};

export const TreeTable = ({
  rows,
  debouncedQuery,
  highlightedTechnicalId,
  collapsedSubmodels,
  onToggle,
  getAxisTint,
  getSortDirection,
  onDirectionChange,
}: TreeTableProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: () => 75,
    overscan: 10,
  });

  const virtualItems = rowVirtualizer.getVirtualItems();
  const paddingTop = virtualItems.length > 0 ? virtualItems[0].start : 0;
  const paddingBottom =
    virtualItems.length > 0
      ? rowVirtualizer.getTotalSize() -
        virtualItems[virtualItems.length - 1].end
      : 0;

  if (rows.length === 0) {
    return (
      <PlaceholderContainer>
        <Placeholder
          title="No results found"
          illustration={<NoResultsIllustration />}
          size="large"
        />
      </PlaceholderContainer>
    );
  }

  return (
    <ScrollContainer ref={scrollContainerRef}>
      <Table>
        <Table.Header sticky={0}>
          <Table.HeaderCell>Type</Table.HeaderCell>
          <Table.HeaderCell
            isSortable
            sortDirection={getSortDirection("identifier")}
            onDirectionChange={(direction) =>
              onDirectionChange("identifier", direction)
            }
          >
            ID
          </Table.HeaderCell>
          <Table.HeaderCell>Image</Table.HeaderCell>
          <Table.HeaderCell
            isSortable
            sortDirection={getSortDirection("label")}
            onDirectionChange={(direction) =>
              onDirectionChange("label", direction)
            }
          >
            Label
          </Table.HeaderCell>
          <Table.HeaderCell
            isSortable
            sortDirection={getSortDirection("variant")}
            onDirectionChange={(direction) =>
              onDirectionChange("variant", direction)
            }
          >
            Variant
          </Table.HeaderCell>
          <Table.HeaderCell>Variation axis</Table.HeaderCell>
        </Table.Header>
        <Table.Body>
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
        </Table.Body>
      </Table>
    </ScrollContainer>
  );
};

const ScrollContainer = styled.div`
  height: 80vh;
  overflow-y: auto;
  contain: strict;
`;

const PlaceholderContainer = styled.div`
  height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
`;
