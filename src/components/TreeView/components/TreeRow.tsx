import { forwardRef } from "react";
import { Badge, Image, Table, Tag, Tags } from "akeneo-design-system";
import type { AnnotatedRow } from "../types.ts";
import { HighlightText } from "./HighlightText.tsx";
import { TypeCell } from "./TypeCell.tsx";
import { getRowUrl } from "../utils/url.ts";

type TreeRowProps = {
  row: AnnotatedRow;
  debouncedQuery: string;
  isHighlighted: boolean;
  isCollapsed: boolean;
  onToggle: (identifier: string) => void;
  getAxisTint: (attributeCode: string) => string;
  "data-index": number;
};

export const TreeRow = forwardRef<HTMLTableRowElement, TreeRowProps>(
  (
    {
      row,
      debouncedQuery,
      isHighlighted,
      isCollapsed,
      onToggle,
      getAxisTint,
      "data-index": dataIndex,
    },
    ref,
  ) => (
    <Table.Row
      ref={ref}
      data-index={dataIndex}
      isSelected={isHighlighted}
      style={debouncedQuery && !row.matches ? { opacity: 0.35 } : undefined}
      onClick={() => {
        window.alert(`Navigate to ${getRowUrl(row)}`);
      }}
    >
      <Table.Cell>
        <TypeCell
          type={row.product_type}
          isCollapsed={isCollapsed}
          onToggle={() => onToggle(row.identifier)}
        />
      </Table.Cell>
      <Table.Cell title={row.identifier}>
        <HighlightText text={row.identifier} query={debouncedQuery} />
      </Table.Cell>
      <Table.Cell>
        <Image
          src={row.image}
          alt={row.label}
          width={48}
          height={48}
          isStacked={row.product_type !== "variant"}
        />
      </Table.Cell>
      <Table.Cell title={row.label}>
        <HighlightText text={row.label} query={debouncedQuery} />
      </Table.Cell>
      <Table.Cell>
        {row.complete_variant_products && (
          <Badge
            level={
              row.complete_variant_products.complete === 0
                ? "danger"
                : row.complete_variant_products.complete ===
                    row.complete_variant_products.total
                  ? "primary"
                  : "warning"
            }
          >
            {row.complete_variant_products.complete}/
            {row.complete_variant_products.total}
          </Badge>
        )}
      </Table.Cell>
      <Table.Cell>
        {row.axes && row.axes.length > 0 && (
          <Tags>
            {row.axes.map((axis) => {
              const text = `${axis.attribute_label}:${axis.axis_value}`;
              return (
                <Tag key={text} tint={getAxisTint(axis.attribute_code)}>
                  <HighlightText text={text} query={debouncedQuery} />
                </Tag>
              );
            })}
          </Tags>
        )}
      </Table.Cell>
    </Table.Row>
  ),
);
