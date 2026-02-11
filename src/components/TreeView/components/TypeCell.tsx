import {
  ArrowDownIcon,
  ArrowRightIcon,
  IconButton,
  Tag,
} from "akeneo-design-system";
import type { ProductType } from "../types.ts";
import styled from "styled-components";
import { useTranslate } from "@akeneo-pim/shared";

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
  const translate = useTranslate();

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
          {hasChildren ? (
            <>
              {isCollapsed ? (
                <IconButton
                  icon={<ArrowRightIcon />}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggle?.();
                  }}
                  title={translate("Expand")}
                  size="small"
                  ghost="borderless"
                  level="tertiary"
                />
              ) : (
                <IconButton
                  icon={<ArrowDownIcon />}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggle?.();
                  }}
                  title={translate("Collapse")}
                  size="small"
                  ghost="borderless"
                  level="tertiary"
                />
              )}
            </>
          ) : (
            <ArrowPlaceholder />
          )}{" "}
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

const ArrowPlaceholder = styled.span`
  display: inline-block;
  width: 24px;
`;
