import styled from "styled-components";

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;

  th,
  td {
    border: 1px solid #ccc;
    padding: 8px;
    text-align: left;
    vertical-align: middle;
  }

  th {
    background-color: #f5f5f5;
    font-weight: 600;
    position: sticky;
    top: 0;
    z-index: 1;
  }
`;

export const ProductImage = styled.img`
  width: 48px;
  height: 48px;
  object-fit: cover;
  display: block;
`;

export const Toolbar = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
`;

export const ScrollContainer = styled.div`
  height: 80vh;
  overflow-y: auto;
  contain: strict;
`;

export const ArrowButton = styled.span`
  cursor: pointer;
  user-select: none;
`;

export const SortableHeader = styled.th`
  cursor: pointer;
  user-select: none;

  &:hover {
    background-color: #e8e8e8;
  }
`;

export const TableRow = styled.tr<{
  $greyed?: boolean;
  $highlighted?: boolean;
}>`
  opacity: ${({ $greyed }) => ($greyed ? 0.35 : 1)};
  cursor: pointer;
  background-color: ${({ $highlighted }) =>
    $highlighted ? "#e3f2fd" : "transparent"};

  &:hover {
    background-color: ${({ $highlighted }) =>
      $highlighted ? "#bbdefb" : "#f0f0f0"};
  }
`;

export const Highlight = styled.mark`
  background-color: yellow;
  font-weight: bold;
  border-radius: 2px;
`;

export const TypeCellWrapper = styled.span<{ $indent: number }>`
  padding-left: ${({ $indent }) => $indent}px;
  display: inline-block;
`;
