import { ProductRow } from "../../src/components/TreeView/types";

export const makeModel = (
  overrides: Partial<ProductRow> = {},
): ProductRow => ({
  product_type: "model",
  identifier: "tshirt_classic",
  technical_id: "1",
  label: "Classic T-Shirt",
  image: "https://example.com/model.jpg",
  parent: null,
  hasChildren: false,
  complete_variant_products: { total: 500, complete: 277 },
  ...overrides,
});

export const makeSubmodel = (
  overrides: Partial<ProductRow> = {},
): ProductRow => ({
  product_type: "submodel",
  identifier: "tshirt_classic_white_cotton",
  technical_id: "2",
  label: "Classic T-Shirt White Cotton",
  image: "https://example.com/submodel.jpg",
  parent: "tshirt_classic",
  hasChildren: false,
  complete_variant_products: { total: 24, complete: 11 },
  axes: [
    {
      attribute_code: "color",
      attribute_label: "Color",
      axis_value: "White",
    },
    {
      attribute_code: "fabric",
      attribute_label: "Fabric",
      axis_value: "Cotton",
    },
  ],
  ...overrides,
});

export const makeVariant = (
  overrides: Partial<ProductRow> = {},
): ProductRow => ({
  product_type: "variant",
  identifier: "tshirt_classic_white_cotton_3xl",
  technical_id: "3",
  label: "Classic T-Shirt White Cotton 3XL",
  image: "https://example.com/variant.jpg",
  parent: "tshirt_classic_white_cotton",
  hasChildren: false,
  axes: [
    {
      attribute_code: "size",
      attribute_label: "Size",
      axis_value: "3XL",
    },
  ],
  ...overrides,
});

/** A minimal 3-level tree: model -> submodel -> variant */
export const makeSimpleTree = (): ProductRow[] => [
  makeModel(),
  makeSubmodel(),
  makeVariant(),
];
