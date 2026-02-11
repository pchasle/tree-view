import type { ProductRow, AnnotatedRow } from "../types.ts";

export const buildTreeOrder = (
  items: ProductRow[],
  comparator?: (a: ProductRow, b: ProductRow) => number,
): ProductRow[] => {
  const childrenByParent = new Map<string | null, ProductRow[]>();
  for (const item of items) {
    const key = item.parent ?? null;
    if (!childrenByParent.has(key)) {
      childrenByParent.set(key, []);
    }
    childrenByParent.get(key)!.push(item);
  }

  const result: ProductRow[] = [];
  const walk = (parentId: string | null) => {
    const children = childrenByParent.get(parentId);
    if (!children) return;
    const sorted = comparator ? [...children].sort(comparator) : children;
    for (const child of sorted) {
      result.push(child);
      walk(child.identifier);
    }
  };
  walk(null);
  return result;
};

export const matchesSearch = (row: ProductRow, query: string): boolean => {
  if (!query) return true;
  const q = query.toLowerCase();
  if (row.identifier.toLowerCase().includes(q)) return true;
  if (row.label.toLowerCase().includes(q)) return true;
  if (
    row.axes?.some((axis) =>
      `${axis.attribute_label}:${axis.axis_value}`.toLowerCase().includes(q),
    )
  )
    return true;
  return false;
};

export const annotateRows = (rows: ProductRow[], query: string): AnnotatedRow[] => {
  if (!query) {
    return rows.map((row) => ({ ...row, matches: true, visible: true }));
  }

  const annotated: AnnotatedRow[] = rows.map((row) => ({
    ...row,
    matches: matchesSearch(row, query),
    visible: false,
  }));

  const byId = new Map<string, AnnotatedRow>();
  for (const row of annotated) {
    byId.set(row.identifier, row);
  }

  for (const row of annotated) {
    if (row.matches) {
      row.visible = true;
      let current: AnnotatedRow | undefined = row;
      while (current?.parent) {
        const parent = byId.get(current.parent);
        if (parent) {
          parent.visible = true;
        }
        current = parent;
      }
    }
  }

  return annotated;
};

export const getRootIdentifier = (data: ProductRow[]): string => {
  const root = data.find((item) => item.parent === null);
  if (!root) throw new Error("Root product model not found in data");
  return root.identifier;
};
