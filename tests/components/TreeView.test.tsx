import { render, screen, fireEvent } from "@testing-library/react";
import type { ReactNode } from "react";
import { ThemeProvider } from "styled-components";
import { pimTheme } from "akeneo-design-system";
import { useQuery } from "react-query";
import { TreeView } from "../../src/components/TreeView/TreeView";
import type { ProductRow } from "../../src/components/TreeView/types";
import {
  makeModel,
  makeSubmodel,
  makeVariant,
} from "../fixtures/product-rows";

const renderWithProviders = (ui: ReactNode) =>
  render(<ThemeProvider theme={pimTheme}>{ui}</ThemeProvider>);

jest.mock("react-query", () => ({
  ...jest.requireActual("react-query"),
  useQuery: jest.fn(),
}));
const mockedUseQuery = useQuery as jest.Mock;

jest.mock("../../src/context/DatasetContext", () => ({
  useDataset: () => ({
    datasetKey: "test",
    loadDataset: jest.fn(),
  }),
}));

jest.mock("@tanstack/react-virtual", () => ({
  useVirtualizer: (opts: { count: number }) => ({
    getVirtualItems: () =>
      Array.from({ length: opts.count }, (_, i) => ({
        index: i,
        start: i * 75,
        end: (i + 1) * 75,
        size: 75,
        key: i,
      })),
    getTotalSize: () => opts.count * 75,
    measureElement: jest.fn(),
  }),
}));

jest.mock("akeneo-design-system", () => {
  const actual = jest.requireActual("akeneo-design-system");
  return { ...actual, useDebounce: (value: string) => value };
});

const defaultProduct = {
  product_type: "model" as const,
  technical_id: "1",
};

const makeRichTree = (): ProductRow[] => [
  makeModel({ identifier: "root_model", label: "Root Model", parent: null }),
  makeSubmodel({
    identifier: "sub_color",
    label: "Color Submodel",
    parent: "root_model",
    axes: [
      {
        attribute_code: "color",
        attribute_label: "Color",
        axis_value: "Red",
      },
    ],
    complete_variant_products: { total: 10, complete: 5 },
  }),
  makeVariant({
    identifier: "variant_red_s",
    label: "Red Small",
    parent: "sub_color",
    axes: [
      { attribute_code: "size", attribute_label: "Size", axis_value: "S" },
    ],
  }),
  makeVariant({
    identifier: "variant_red_m",
    label: "Red Medium",
    parent: "sub_color",
    axes: [
      { attribute_code: "size", attribute_label: "Size", axis_value: "M" },
    ],
  }),
  makeSubmodel({
    identifier: "sub_fabric",
    label: "Fabric Submodel",
    parent: "root_model",
    axes: [
      {
        attribute_code: "fabric",
        attribute_label: "Fabric",
        axis_value: "Cotton",
      },
    ],
    complete_variant_products: { total: 5, complete: 5 },
  }),
  makeVariant({
    identifier: "variant_cotton_l",
    label: "Cotton Large",
    parent: "sub_fabric",
    axes: [
      { attribute_code: "size", attribute_label: "Size", axis_value: "L" },
    ],
  }),
];

beforeEach(() => {
  mockedUseQuery.mockReturnValue({
    data: makeRichTree(),
    isLoading: false,
    isError: false,
  });
  sessionStorage.clear();
});

afterEach(() => jest.restoreAllMocks());

describe("TreeView", () => {
  it("shows error state when data fetch fails", () => {
    mockedUseQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    });
    renderWithProviders(<TreeView product={defaultProduct} />);
    expect(screen.getByText("An error occurred")).toBeDefined();
  });

  it("renders all tree rows after data loads", () => {
    renderWithProviders(<TreeView product={defaultProduct} />);
    expect(screen.getByText("root_model")).toBeDefined();
    expect(screen.getByText("sub_color")).toBeDefined();
    expect(screen.getByText("sub_fabric")).toBeDefined();
    expect(screen.getByText("variant_red_s")).toBeDefined();
    expect(screen.getByText("variant_red_m")).toBeDefined();
    expect(screen.getByText("variant_cotton_l")).toBeDefined();
  });

  it("displays the root product model label as the modal title", () => {
    renderWithProviders(<TreeView product={defaultProduct} />);
    // "Root Model" appears both in the modal title and in the table row
    const elements = screen.getAllByText("Root Model");
    expect(elements.length).toBeGreaterThanOrEqual(2);
  });

  it("shows no-results placeholder when search matches nothing", () => {
    renderWithProviders(<TreeView product={defaultProduct} />);
    const searchInput = screen.getByPlaceholderText("Search...");
    fireEvent.change(searchInput, {
      target: { value: "nonexistent_query_xyz" },
    });
    expect(screen.getByText("No results found")).toBeDefined();
  });

  it("filters rows to matching results and their ancestors", () => {
    renderWithProviders(<TreeView product={defaultProduct} />);
    const searchInput = screen.getByPlaceholderText("Search...");
    fireEvent.change(searchInput, { target: { value: "Red Small" } });

    // Match and its ancestors should remain
    expect(screen.getByText("root_model")).toBeDefined();
    expect(screen.getByText("sub_color")).toBeDefined();
    expect(screen.getByText("variant_red_s")).toBeDefined();

    // Other branch should be filtered out
    expect(screen.queryByText("sub_fabric")).toBeNull();
    expect(screen.queryByText("variant_cotton_l")).toBeNull();
  });

  it("hides variant rows when 'Collapse all' is clicked", () => {
    renderWithProviders(<TreeView product={defaultProduct} />);
    expect(screen.getByText("variant_red_s")).toBeDefined();

    fireEvent.click(screen.getByText("Collapse all"));

    // Variants should be hidden
    expect(screen.queryByText("variant_red_s")).toBeNull();
    expect(screen.queryByText("variant_red_m")).toBeNull();
    expect(screen.queryByText("variant_cotton_l")).toBeNull();

    // Submodels and model should remain visible
    expect(screen.getByText("root_model")).toBeDefined();
    expect(screen.getByText("sub_color")).toBeDefined();
    expect(screen.getByText("sub_fabric")).toBeDefined();
  });

  it("restores variant rows when 'Expand all' is clicked after collapsing", () => {
    renderWithProviders(<TreeView product={defaultProduct} />);

    fireEvent.click(screen.getByText("Collapse all"));
    expect(screen.queryByText("variant_red_s")).toBeNull();

    fireEvent.click(screen.getByText("Expand all"));
    expect(screen.getByText("variant_red_s")).toBeDefined();
    expect(screen.getByText("variant_red_m")).toBeDefined();
    expect(screen.getByText("variant_cotton_l")).toBeDefined();
  });
});
