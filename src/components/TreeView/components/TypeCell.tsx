import { ArrowDownIcon, ArrowRightIcon, Tag } from "akeneo-design-system";
import type { ProductType } from "../types.ts";
import { TypeCellWrapper } from "./styled.ts";

export const TypeCell = ({
  type,
  isCollapsed,
  onToggle,
}: {
  type: ProductType;
  isCollapsed?: boolean;
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
          <span
            onClick={(e) => {
              e.stopPropagation();
              onToggle?.();
            }}
          >
            {isCollapsed ? <ArrowRightIcon /> : <ArrowDownIcon />}
          </span>{" "}
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
