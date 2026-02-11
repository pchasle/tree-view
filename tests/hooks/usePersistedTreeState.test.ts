import { renderHook } from "@testing-library/react-hooks";
import { usePersistedTreeState } from "../../src/components/TreeView/hooks/usePersistedTreeState";
import { makeSimpleTree } from "../fixtures/product-rows";
import { PersistedState } from "../../src/components/TreeView/types";

const mockStorage: Record<string, string> = {};

beforeEach(() => {
  Object.keys(mockStorage).forEach((key) => delete mockStorage[key]);
  jest
    .spyOn(Storage.prototype, "getItem")
    .mockImplementation((key: string) => mockStorage[key] ?? null);
  jest
    .spyOn(Storage.prototype, "setItem")
    .mockImplementation((key: string, value: string) => {
      mockStorage[key] = value;
    });
});

afterEach(() => jest.restoreAllMocks());

const defaultState = {
  sortColumn: "identifier" as const,
  sortDirection: "asc" as const,
  searchQuery: "",
  showHidden: false,
  collapsedSubmodels: new Set<string>(),
};

describe("usePersistedTreeState", () => {
  it("saves state to sessionStorage when data is available", () => {
    const data = makeSimpleTree();
    const restore = jest.fn();
    renderHook(() => usePersistedTreeState(data, defaultState, restore));

    expect(Storage.prototype.setItem).toHaveBeenCalledWith(
      "tree-view:tshirt_classic",
      expect.any(String),
    );
    const saved: PersistedState = JSON.parse(
      mockStorage["tree-view:tshirt_classic"],
    );
    expect(saved.sortColumn).toBe("identifier");
    expect(saved.sortDirection).toBe("asc");
    expect(saved.collapsedSubmodels).toEqual([]);
  });

  it("restores state from sessionStorage on first data load", () => {
    const data = makeSimpleTree();
    const stored: PersistedState = {
      sortColumn: "label",
      sortDirection: "desc",
      searchQuery: "hello",
      showHidden: true,
      collapsedSubmodels: ["sub1"],
    };
    mockStorage["tree-view:tshirt_classic"] = JSON.stringify(stored);

    const restore = jest.fn();
    renderHook(() => usePersistedTreeState(data, defaultState, restore));
    expect(restore).toHaveBeenCalledWith(stored);
  });

  it("does not restore if no stored state exists", () => {
    const data = makeSimpleTree();
    const restore = jest.fn();
    renderHook(() => usePersistedTreeState(data, defaultState, restore));
    expect(restore).not.toHaveBeenCalled();
  });

  it("does not save or restore when data is undefined", () => {
    const restore = jest.fn();
    renderHook(() =>
      usePersistedTreeState(undefined, defaultState, restore),
    );
    expect(Storage.prototype.setItem).not.toHaveBeenCalled();
    expect(restore).not.toHaveBeenCalled();
  });

  it("only restores once even if re-rendered", () => {
    const data = makeSimpleTree();
    const stored: PersistedState = {
      sortColumn: "label",
      sortDirection: "desc",
      searchQuery: "",
      showHidden: false,
      collapsedSubmodels: [],
    };
    mockStorage["tree-view:tshirt_classic"] = JSON.stringify(stored);

    const restore = jest.fn();
    const { rerender } = renderHook(() =>
      usePersistedTreeState(data, defaultState, restore),
    );
    rerender();
    rerender();
    expect(restore).toHaveBeenCalledTimes(1);
  });

  it("serializes collapsedSubmodels Set to array", () => {
    const data = makeSimpleTree();
    const state = {
      ...defaultState,
      collapsedSubmodels: new Set(["sub1", "sub2"]),
    };
    const restore = jest.fn();
    renderHook(() => usePersistedTreeState(data, state, restore));

    const saved: PersistedState = JSON.parse(
      mockStorage["tree-view:tshirt_classic"],
    );
    expect(saved.collapsedSubmodels).toEqual(["sub1", "sub2"]);
  });
});
