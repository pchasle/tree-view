import { ArrowDownIcon, ArrowRightIcon, Tag } from "akeneo-design-system";
import type { ProductType } from "../types.ts";
import styled from "styled-components";

export const TypeCell = ({
  type,
  isCollapsed,
  hasChildren,
  onToggle,
}: {
  type: ProductType;
  isCollapsed?: boolean;
  hasChildren?: boolean;
  onToggle?: () => void;
}) => {
  switch (type) {
    case "model":
      return (
        <TypeCellWrapper $indent={0}>
          <Tag tint="olive_green">{type}</Tag>
        </TypeCellWrapper>
      );
    case "submodel":
      return (
        <TypeCellWrapper $indent={0}>
          {hasChildren && (
            <>
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  onToggle?.();
                }}
              >
                {isCollapsed ? <ArrowRightIcon /> : <ArrowDownIcon />}
              </span>{" "}
            </>
          )}
          <Tag tint="dark_cyan">{type}</Tag>
        </TypeCellWrapper>
      );
    case "variant":
      return (
        <TypeCellWrapper $indent={50}>
          <Tag tint="blue">{type}</Tag>
        </TypeCellWrapper>
      );
  }
};

const TypeCellWrapper = styled.span<{ $indent: number }>`
  padding-left: ${({ $indent }) => $indent}px;
  display: inline-block;
`;
