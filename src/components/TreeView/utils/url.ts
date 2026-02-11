import type { ProductModel } from "../types.ts";

export const getRowUrl = (row: ProductModel): string =>
  row.product_type === "variant"
    ? `/product/${row.technical_id}`
    : `/product-model/${row.technical_id}`;
