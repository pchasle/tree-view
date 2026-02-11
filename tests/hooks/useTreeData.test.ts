import { renderHook } from "@testing-library/react-hooks";
import { useQuery } from "react-query";
import { useTreeData } from "../../src/components/TreeView/hooks/useTreeData";
import { makeSimpleTree } from "../fixtures/product-rows";

jest.mock("react-query", () => ({
  ...jest.requireActual("react-query"),
  useQuery: jest.fn(),
}));

jest.mock("../../src/context/DatasetContext", () => ({
  useDataset: () => ({
    datasetKey: "test",
    loadDataset: jest.fn(),
  }),
}));

const mockedUseQuery = useQuery as jest.Mock;

const identityComparator = () => 0;

beforeEach(() => {
  mockedUseQuery.mockReturnValue({
    data: makeSimpleTree(),
    isLoading: false,
    isError: false,
  });
});

afterEach(() => jest.restoreAllMocks());

describe("useTreeData", () => {
  it("returns rows after data loads", () => {
    const { result } = renderHook(() =>
      useTreeData(identityComparator, "", false, new Set()),
    );
    expect(result.current.rows.length).toBe(3);
    expect(result.current.isError).toBe(false);
    expect(result.current.data).toBeDefined();
  });

  it("returns all rows when no filters are applied", () => {
    const { result } = renderHook(() =>
      useTreeData(identityComparator, "", false, new Set()),
    );
    expect(result.current.rows.map((r) => r.identifier)).toEqual([
      "tshirt_classic",
      "tshirt_classic_white_cotton",
      "tshirt_classic_white_cotton_3xl",
    ]);
  });

  it("filters out variants under collapsed submodels", () => {
    const collapsed = new Set(["tshirt_classic_white_cotton"]);
    const { result } = renderHook(() =>
      useTreeData(identityComparator, "", false, collapsed),
    );
    const identifiers = result.current.rows.map((r) => r.identifier);
    expect(identifiers).toContain("tshirt_classic");
    expect(identifiers).toContain("tshirt_classic_white_cotton");
    expect(identifiers).not.toContain("tshirt_classic_white_cotton_3xl");
  });

  it("hides non-visible rows when showHidden is false and query is set", () => {
    const { result } = renderHook(() =>
      useTreeData(identityComparator, "nonexistent_query", false, new Set()),
    );
    expect(result.current.rows).toHaveLength(0);
  });

  it("shows all rows when showHidden is true even with non-matching query", () => {
    const { result } = renderHook(() =>
      useTreeData(identityComparator, "nonexistent_query", true, new Set()),
    );
    expect(result.current.rows.length).toBe(3);
  });

  it("filters by search query and shows matching rows + ancestors", () => {
    const { result } = renderHook(() =>
      useTreeData(identityComparator, "3xl", false, new Set()),
    );
    const identifiers = result.current.rows.map((r) => r.identifier);
    expect(identifiers).toContain("tshirt_classic");
    expect(identifiers).toContain("tshirt_classic_white_cotton");
    expect(identifiers).toContain("tshirt_classic_white_cotton_3xl");
  });

  it("returns empty rows when data is undefined (loading)", () => {
    mockedUseQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    });
    const { result } = renderHook(() =>
      useTreeData(identityComparator, "", false, new Set()),
    );
    expect(result.current.rows).toEqual([]);
    expect(result.current.isLoading).toBe(true);
  });

  it("returns isError when query fails", () => {
    mockedUseQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    });
    const { result } = renderHook(() =>
      useTreeData(identityComparator, "", false, new Set()),
    );
    expect(result.current.isError).toBe(true);
    expect(result.current.rows).toEqual([]);
  });
});
