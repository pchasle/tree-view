import { renderHook, act } from "@testing-library/react-hooks";
import { useTreeSort } from "../../src/components/TreeView/hooks/useTreeSort";
import { makeModel } from "../fixtures/product-rows";

describe("useTreeSort", () => {
  it("defaults to identifier ascending", () => {
    const { result } = renderHook(() => useTreeSort());
    expect(result.current.sortColumn).toBe("identifier");
    expect(result.current.sortDirection).toBe("asc");
  });

  it('getSortDirection returns "ascending" for the current column', () => {
    const { result } = renderHook(() => useTreeSort());
    expect(result.current.getSortDirection("identifier")).toBe("ascending");
  });

  it('getSortDirection returns "none" for a different column', () => {
    const { result } = renderHook(() => useTreeSort());
    expect(result.current.getSortDirection("label")).toBe("none");
  });

  it("handleDirectionChange updates column and direction", () => {
    const { result } = renderHook(() => useTreeSort());
    act(() => result.current.handleDirectionChange("label", "descending"));
    expect(result.current.sortColumn).toBe("label");
    expect(result.current.sortDirection).toBe("desc");
  });

  it('handleDirectionChange maps "none" to asc', () => {
    const { result } = renderHook(() => useTreeSort());
    act(() => result.current.handleDirectionChange("label", "none"));
    expect(result.current.sortDirection).toBe("asc");
  });

  it('handleDirectionChange maps "ascending" to asc', () => {
    const { result } = renderHook(() => useTreeSort());
    act(() => result.current.handleDirectionChange("label", "ascending"));
    expect(result.current.sortDirection).toBe("asc");
  });

  it("comparator sorts by identifier ascending (localeCompare)", () => {
    const { result } = renderHook(() => useTreeSort());
    const a = makeModel({ identifier: "apple" });
    const b = makeModel({ identifier: "banana" });
    expect(result.current.comparator(a, b)).toBeLessThan(0);
  });

  it("comparator sorts by identifier descending", () => {
    const { result } = renderHook(() => useTreeSort());
    act(() =>
      result.current.handleDirectionChange("identifier", "descending"),
    );
    const a = makeModel({ identifier: "apple" });
    const b = makeModel({ identifier: "banana" });
    expect(result.current.comparator(a, b)).toBeGreaterThan(0);
  });

  it("comparator is case-insensitive for string columns", () => {
    const { result } = renderHook(() => useTreeSort());
    const a = makeModel({ identifier: "Apple" });
    const b = makeModel({ identifier: "apple" });
    expect(result.current.comparator(a, b)).toBe(0);
  });

  it("comparator sorts by variant column using total", () => {
    const { result } = renderHook(() => useTreeSort());
    act(() => result.current.handleDirectionChange("variant", "ascending"));
    const a = makeModel({
      complete_variant_products: { total: 10, complete: 5 },
    });
    const b = makeModel({
      complete_variant_products: { total: 20, complete: 10 },
    });
    expect(result.current.comparator(a, b)).toBeLessThan(0);
  });

  it("comparator uses complete as tiebreaker for variant column", () => {
    const { result } = renderHook(() => useTreeSort());
    act(() => result.current.handleDirectionChange("variant", "ascending"));
    const a = makeModel({
      complete_variant_products: { total: 10, complete: 3 },
    });
    const b = makeModel({
      complete_variant_products: { total: 10, complete: 7 },
    });
    expect(result.current.comparator(a, b)).toBeLessThan(0);
  });

  it("comparator handles missing complete_variant_products", () => {
    const { result } = renderHook(() => useTreeSort());
    act(() => result.current.handleDirectionChange("variant", "ascending"));
    const withVariants = makeModel({
      complete_variant_products: { total: 10, complete: 5 },
    });
    const without = makeModel({ complete_variant_products: undefined });
    expect(result.current.comparator(without, withVariants)).toBeLessThan(0);
  });
});
