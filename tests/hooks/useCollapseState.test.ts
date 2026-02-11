import { renderHook, act } from "@testing-library/react-hooks";
import { useCollapseState } from "../../src/components/TreeView/hooks/useCollapseState";

describe("useCollapseState", () => {
  it("starts with an empty set", () => {
    const { result } = renderHook(() => useCollapseState());
    expect(result.current.collapsedSubmodels.size).toBe(0);
  });

  it("toggle adds an identifier to the collapsed set", () => {
    const { result } = renderHook(() => useCollapseState());
    act(() => result.current.toggle("sub1"));
    expect(result.current.collapsedSubmodels.has("sub1")).toBe(true);
  });

  it("toggle removes an identifier if already collapsed", () => {
    const { result } = renderHook(() => useCollapseState());
    act(() => result.current.toggle("sub1"));
    act(() => result.current.toggle("sub1"));
    expect(result.current.collapsedSubmodels.has("sub1")).toBe(false);
  });

  it("toggle preserves other identifiers", () => {
    const { result } = renderHook(() => useCollapseState());
    act(() => result.current.toggle("sub1"));
    act(() => result.current.toggle("sub2"));
    act(() => result.current.toggle("sub1"));
    expect(result.current.collapsedSubmodels.has("sub1")).toBe(false);
    expect(result.current.collapsedSubmodels.has("sub2")).toBe(true);
  });

  it("expandAll clears the set", () => {
    const { result } = renderHook(() => useCollapseState());
    act(() => result.current.toggle("sub1"));
    act(() => result.current.toggle("sub2"));
    act(() => result.current.expandAll());
    expect(result.current.collapsedSubmodels.size).toBe(0);
  });

  it("collapseAll sets all provided IDs", () => {
    const { result } = renderHook(() => useCollapseState());
    act(() => result.current.collapseAll(["sub1", "sub2", "sub3"]));
    expect(result.current.collapsedSubmodels).toEqual(
      new Set(["sub1", "sub2", "sub3"]),
    );
  });

  it("collapseAll with empty array results in empty set", () => {
    const { result } = renderHook(() => useCollapseState());
    act(() => result.current.toggle("sub1"));
    act(() => result.current.collapseAll([]));
    expect(result.current.collapsedSubmodels.size).toBe(0);
  });

  it("setCollapsedSubmodels replaces the entire set", () => {
    const { result } = renderHook(() => useCollapseState());
    act(() => result.current.toggle("sub1"));
    act(() =>
      result.current.setCollapsedSubmodels(new Set(["x", "y"])),
    );
    expect(result.current.collapsedSubmodels).toEqual(new Set(["x", "y"]));
  });
});
