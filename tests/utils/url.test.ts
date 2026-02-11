import { getRowUrl } from "../../src/components/TreeView/utils/url";
import { makeModel, makeSubmodel, makeVariant } from "../fixtures/product-rows";

describe("getRowUrl", () => {
  it("returns /product/{technical_id} for a variant", () => {
    const variant = makeVariant({ technical_id: "42" });
    expect(getRowUrl(variant)).toBe("/product/42");
  });

  it("returns /product-model/{technical_id} for a model", () => {
    const model = makeModel({ technical_id: "10" });
    expect(getRowUrl(model)).toBe("/product-model/10");
  });

  it("returns /product-model/{technical_id} for a submodel", () => {
    const submodel = makeSubmodel({ technical_id: "20" });
    expect(getRowUrl(submodel)).toBe("/product-model/20");
  });
});
