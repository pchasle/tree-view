import styled from "styled-components";

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

export const Highlight = styled.mark`
  background-color: yellow;
  font-weight: bold;
  border-radius: 2px;
`;

export const TypeCellWrapper = styled.span<{ $indent: number }>`
  padding-left: ${({ $indent }) => $indent}px;
  display: inline-block;
`;
