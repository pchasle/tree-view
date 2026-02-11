import { useQuery } from "react-query";
import styled from "styled-components";

type ProductType = "model" | "submodel" | "variant";

type ProductModel = {
  type: ProductType;
  identifier: string;
  label: string;
  image: string;
  parent: string | null;
  axes?: string[];
  variant_count?: number;
};

const fetchProductModels = (): Promise<ProductModel[]> =>
  import("./product-models.json").then((m) => m.default as ProductModel[]);

const buildTreeOrder = (items: ProductModel[]): ProductModel[] => {
  const childrenByParent = new Map<string | null, ProductModel[]>();
  for (const item of items) {
    const key = item.parent ?? null;
    if (!childrenByParent.has(key)) {
      childrenByParent.set(key, []);
    }
    childrenByParent.get(key)!.push(item);
  }

  const result: ProductModel[] = [];
  const walk = (parentId: string | null) => {
    const children = childrenByParent.get(parentId) ?? [];
    for (const child of children) {
      result.push(child);
      walk(child.identifier);
    }
  };
  walk(null);
  return result;
};

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;

  th,
  td {
    border: 1px solid #ccc;
    padding: 8px;
    text-align: left;
    vertical-align: middle;
  }

  th {
    background-color: #f5f5f5;
    font-weight: 600;
  }
`;

const ProductImage = styled.img`
  width: 48px;
  height: 48px;
  object-fit: cover;
  display: block;
`;

const AxesList = styled.ul`
  margin: 0;
  padding-left: 18px;
`;

export const TreeView = () => {
  const { data, isLoading, isError } = useQuery(
    "product-models",
    fetchProductModels,
  );

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Error loading data.</p>;

  const rows = buildTreeOrder(data!);

  return (
    <Table>
      <thead>
        <tr>
          <th>Type</th>
          <th>ID</th>
          <th>Image</th>
          <th>Label</th>
          <th>Variant</th>
          <th>Variation axis</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.identifier}>
            <td>
              <TypeCell type={row.type} />
            </td>
            <td>{row.identifier}</td>
            <td>
              <ProductImage src={row.image} alt={row.label} />
            </td>
            <td>{row.label}</td>
            <td>{row.variant_count ?? ""}</td>
            <td>
              {row.axes && row.axes.length > 0 && (
                <AxesList>
                  {row.axes.map((axis) => (
                    <li key={axis}>{axis}</li>
                  ))}
                </AxesList>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

const TypeCellWrapper = styled.span<{ $indent: number }>`
  padding-left: ${({ $indent }) => $indent}px;
  display: inline-block;
`;

const TypeCell = ({ type }: { type: ProductType }) => {
  switch (type) {
    case "model":
      return <TypeCellWrapper $indent={0}>{type}</TypeCellWrapper>;
    case "submodel":
      return <TypeCellWrapper $indent={20}>▼ {type}</TypeCellWrapper>;
    case "variant":
      return <TypeCellWrapper $indent={40}>{type}</TypeCellWrapper>;
  }
};
