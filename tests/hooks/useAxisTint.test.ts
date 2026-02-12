import { renderHook } from "@testing-library/react-hooks";
import { useAxisTint } from "../../src/components/TreeView/hooks/useAxisTint";
import { makeSubmodel, makeVariant } from "../fixtures/product-rows";

describe("useAxisTint", () => {
  it("maps attribute codes to palette colors in order", () => {
    const data = [
      makeSubmodel({
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
      }),
    ];
    const { result } = renderHook(() => useAxisTint(data));
    expect(result.current("color")).toBe("blue");
    expect(result.current("fabric")).toBe("orange");
  });

  it("assigns colors in order of first appearance across rows", () => {
    const data = [
      makeSubmodel({
        axes: [
          {
            attribute_code: "size",
            attribute_label: "Size",
            axis_value: "XL",
          },
        ],
      }),
      makeVariant({
        axes: [
          {
            attribute_code: "fit",
            attribute_label: "Fit",
            axis_value: "Slim",
          },
        ],
      }),
    ];
    const { result } = renderHook(() => useAxisTint(data));
    expect(result.current("size")).toBe("blue");
    expect(result.current("fit")).toBe("orange");
  });

  it("returns the first palette color for unknown attribute codes", () => {
    const { result } = renderHook(() => useAxisTint([]));
    expect(result.current("nonexistent")).toBe("blue");
  });

  it("handles undefined data", () => {
    const { result } = renderHook(() => useAxisTint(undefined));
    expect(result.current("anything")).toBe("blue");
  });

  it("does not duplicate colors for the same attribute code", () => {
    const data = [
      makeSubmodel({
        axes: [
          {
            attribute_code: "color",
            attribute_label: "Color",
            axis_value: "White",
          },
        ],
      }),
      makeVariant({
        axes: [
          {
            attribute_code: "color",
            attribute_label: "Color",
            axis_value: "Black",
          },
        ],
      }),
    ];
    const { result } = renderHook(() => useAxisTint(data));
    expect(result.current("color")).toBe("blue");
  });

  it("wraps around palette when more attributes than colors (14)", () => {
    const axes = Array.from({ length: 15 }, (_, i) => ({
      attribute_code: `attr_${i}`,
      attribute_label: `Attr ${i}`,
      axis_value: `val_${i}`,
    }));
    const data = [makeSubmodel({ axes })];
    const { result } = renderHook(() => useAxisTint(data));
    expect(result.current("attr_0")).toBe("blue");
    expect(result.current("attr_14")).toBe("blue"); // 14 % 14 = 0
  });
});
