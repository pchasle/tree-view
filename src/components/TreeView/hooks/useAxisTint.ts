import { useMemo, useCallback } from "react";
import type { ProductModel } from "../types.ts";

const AXIS_TINT_PALETTE = [
  "green",
  "dark_blue",
  "purple",
  "dark_purple",
  "yellow",
  "red",
  "forest_green",
  "hot_pink",
  "coral_red",
  "orange",
  "chocolate",
] as const;

export const useAxisTint = (data: ProductModel[] | undefined) => {
  const tintMap = useMemo(() => {
    if (!data) return {};
    const map: Record<string, string> = {};
    let nextIndex = 0;

    for (const row of data) {
      for (const axis of row.axes ?? []) {
        if (!(axis.attribute_code in map)) {
          map[axis.attribute_code] =
            AXIS_TINT_PALETTE[nextIndex % AXIS_TINT_PALETTE.length];
          nextIndex++;
        }
      }
    }

    return map;
  }, [data]);

  return useCallback(
    (attributeCode: string) => tintMap[attributeCode] ?? AXIS_TINT_PALETTE[0],
    [tintMap],
  );
};
