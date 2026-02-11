import type { ProductRow } from "../types.ts";

export const getRowUrl = (row: ProductRow): string =>
  row.product_type === "variant"
    ? `/product/${row.technical_id}`
    : `/product-model/${row.technical_id}`;
