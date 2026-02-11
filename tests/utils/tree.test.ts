import {
  buildTreeOrder,
  matchesSearch,
  annotateRows,
  getRootIdentifier,
} from "../../src/components/TreeView/utils/tree";
import { ProductRow } from "../../src/components/TreeView/types";
import {
  makeModel,
  makeSubmodel,
  makeVariant,
  makeSimpleTree,
} from "../fixtures/product-rows";

describe("buildTreeOrder", () => {
  it("returns items in parent-first depth-first order", () => {
    const items = [makeVariant(), makeModel(), makeSubmodel()];
    const result = buildTreeOrder(items);
    expect(result.map((r) => r.identifier)).toEqual([
      "tshirt_classic",
      "tshirt_classic_white_cotton",
      "tshirt_classic_white_cotton_3xl",
    ]);
  });

  it("returns empty array for empty input", () => {
    expect(buildTreeOrder([])).toEqual([]);
  });

  it("applies comparator to sort siblings", () => {
    const root = makeModel({ identifier: "root" });
    const sub1 = makeSubmodel({ identifier: "b_sub", parent: "root" });
    const sub2 = makeSubmodel({ identifier: "a_sub", parent: "root" });
    const comparator = (a: ProductRow, b: ProductRow) =>
      a.identifier.localeCompare(b.identifier);

    const result = buildTreeOrder([sub1, root, sub2], comparator);
    expect(result.map((r) => r.identifier)).toEqual([
      "root",
      "a_sub",
      "b_sub",
    ]);
  });

  it("handles multiple children under the same parent", () => {
    const root = makeModel({ identifier: "root" });
    const child1 = makeSubmodel({ identifier: "child1", parent: "root" });
    const child2 = makeSubmodel({ identifier: "child2", parent: "root" });
    const result = buildTreeOrder([root, child1, child2]);
    expect(result).toHaveLength(3);
    expect(result[0].identifier).toBe("root");
  });

  it("excludes orphan nodes whose parent is not in items", () => {
    const orphan = makeVariant({
      identifier: "orphan",
      parent: "nonexistent",
    });
    const root = makeModel();
    const result = buildTreeOrder([root, orphan]);
    expect(result.map((r) => r.identifier)).toEqual(["tshirt_classic"]);
  });

  it("works without a comparator (preserves insertion order)", () => {
    const root = makeModel({ identifier: "root" });
    const child1 = makeSubmodel({ identifier: "first", parent: "root" });
    const child2 = makeSubmodel({ identifier: "second", parent: "root" });
    const result = buildTreeOrder([root, child1, child2]);
    expect(result.map((r) => r.identifier)).toEqual([
      "root",
      "first",
      "second",
    ]);
  });
});

describe("matchesSearch", () => {
  it("returns true for empty query", () => {
    expect(matchesSearch(makeModel(), "")).toBe(true);
  });

  it("matches against identifier (case-insensitive)", () => {
    const row = makeModel({ identifier: "TShirt_Classic" });
    expect(matchesSearch(row, "tshirt")).toBe(true);
    expect(matchesSearch(row, "TSHIRT")).toBe(true);
  });

  it("matches against label", () => {
    const row = makeModel({ label: "Classic T-Shirt" });
    expect(matchesSearch(row, "classic")).toBe(true);
  });

  it("matches against axes attribute_label:axis_value", () => {
    const row = makeSubmodel({
      axes: [
        {
          attribute_code: "color",
          attribute_label: "Color",
          axis_value: "White",
        },
      ],
    });
    expect(matchesSearch(row, "color:white")).toBe(true);
  });

  it("returns false when nothing matches", () => {
    const row = makeModel({ identifier: "abc", label: "def" });
    expect(matchesSearch(row, "zzz")).toBe(false);
  });

  it("handles row with no axes", () => {
    const row = makeModel();
    expect(matchesSearch(row, "color")).toBe(false);
  });

  it("matches partial strings", () => {
    const row = makeModel({ identifier: "tshirt_classic", label: "Classic" });
    expect(matchesSearch(row, "shirt")).toBe(true);
    expect(matchesSearch(row, "las")).toBe(true);
  });
});

describe("annotateRows", () => {
  it("marks all rows as matches=true, visible=true when query is empty", () => {
    const rows = makeSimpleTree();
    const result = annotateRows(rows, "");
    expect(result).toHaveLength(3);
    expect(result.every((r) => r.matches && r.visible)).toBe(true);
  });

  it("marks matching rows and their ancestors as visible", () => {
    const rows = makeSimpleTree();
    const result = annotateRows(rows, "3xl");

    const model = result.find((r) => r.identifier === "tshirt_classic")!;
    const submodel = result.find(
      (r) => r.identifier === "tshirt_classic_white_cotton",
    )!;
    const variant = result.find(
      (r) => r.identifier === "tshirt_classic_white_cotton_3xl",
    )!;

    expect(variant.matches).toBe(true);
    expect(variant.visible).toBe(true);
    expect(submodel.matches).toBe(false);
    expect(submodel.visible).toBe(true);
    expect(model.matches).toBe(false);
    expect(model.visible).toBe(true);
  });

  it("marks non-matching rows without matching descendants as not visible", () => {
    const root = makeModel();
    const sub1 = makeSubmodel({
      identifier: "sub_match",
      label: "Match Me",
      parent: "tshirt_classic",
    });
    const sub2 = makeSubmodel({
      identifier: "sub_nomatch",
      label: "Nothing Here",
      parent: "tshirt_classic",
    });
    const result = annotateRows([root, sub1, sub2], "Match Me");

    const noMatch = result.find((r) => r.identifier === "sub_nomatch")!;
    expect(noMatch.matches).toBe(false);
    expect(noMatch.visible).toBe(false);
  });

  it("preserves original row data in annotated output", () => {
    const rows = [makeModel()];
    const result = annotateRows(rows, "");
    expect(result[0].identifier).toBe("tshirt_classic");
    expect(result[0].product_type).toBe("model");
  });
});

describe("getRootIdentifier", () => {
  it("returns the identifier of the root item (parent === null)", () => {
    const data = makeSimpleTree();
    expect(getRootIdentifier(data)).toBe("tshirt_classic");
  });

  it("throws if no root item exists", () => {
    const noRoot = [makeSubmodel()];
    expect(() => getRootIdentifier(noRoot)).toThrow(
      "Root product model not found in data",
    );
  });

  it("returns the first root if multiple roots exist", () => {
    const root1 = makeModel({ identifier: "first_root" });
    const root2 = makeModel({ identifier: "second_root" });
    expect(getRootIdentifier([root1, root2])).toBe("first_root");
  });
});
