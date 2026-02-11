import { useState, useMemo, useEffect } from "react";
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

type AnnotatedRow = ProductModel & {
  matches: boolean;
  visible: boolean;
};

const fetchProductModels = (): Promise<ProductModel[]> =>
  import("./product-models.json").then((m) => m.default as ProductModel[]);

const buildTreeOrder = (
  items: ProductModel[],
  comparator?: (a: ProductModel, b: ProductModel) => number,
): ProductModel[] => {
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
    const children = [...(childrenByParent.get(parentId) ?? [])];
    if (comparator) {
      children.sort(comparator);
    }
    for (const child of children) {
      result.push(child);
      walk(child.identifier);
    }
  };
  walk(null);
  return result;
};

const matchesSearch = (row: ProductModel, query: string): boolean => {
  if (!query) return true;
  const q = query.toLowerCase();
  if (row.identifier.toLowerCase().includes(q)) return true;
  if (row.label.toLowerCase().includes(q)) return true;
  if (row.axes?.some((axis) => axis.toLowerCase().includes(q))) return true;
  return false;
};

const annotateRows = (
  rows: ProductModel[],
  query: string,
): AnnotatedRow[] => {
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

// --- Styled Components ---

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

const Toolbar = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
`;

const ArrowButton = styled.span`
  cursor: pointer;
  user-select: none;
`;

const SortableHeader = styled.th`
  cursor: pointer;
  user-select: none;

  &:hover {
    background-color: #e8e8e8;
  }
`;

const TableRow = styled.tr<{ $greyed?: boolean }>`
  opacity: ${({ $greyed }) => ($greyed ? 0.35 : 1)};
`;

const Highlight = styled.mark`
  background-color: yellow;
  font-weight: bold;
  border-radius: 2px;
`;

// --- Sub-components ---

const HighlightText = ({ text, query }: { text: string; query: string }) => {
  if (!query) return <>{text}</>;
  const index = text.toLowerCase().indexOf(query.toLowerCase());
  if (index === -1) return <>{text}</>;

  return (
    <>
      {text.slice(0, index)}
      <Highlight>{text.slice(index, index + query.length)}</Highlight>
      {text.slice(index + query.length)}
    </>
  );
};

const TypeCellWrapper = styled.span<{ $indent: number }>`
  padding-left: ${({ $indent }) => $indent}px;
  display: inline-block;
`;

const TypeCell = ({
  type,
  isCollapsed,
  onToggle,
}: {
  type: ProductType;
  isCollapsed?: boolean;
  onToggle?: () => void;
}) => {
  switch (type) {
    case "model":
      return <TypeCellWrapper $indent={0}>{type}</TypeCellWrapper>;
    case "submodel":
      return (
        <TypeCellWrapper $indent={20}>
          <ArrowButton onClick={onToggle}>
            {isCollapsed ? "▶" : "▼"}
          </ArrowButton>{" "}
          {type}
        </TypeCellWrapper>
      );
    case "variant":
      return <TypeCellWrapper $indent={40}>{type}</TypeCellWrapper>;
  }
};

// --- Main Component ---

export const TreeView = () => {
  const { data, isLoading, isError } = useQuery(
    "product-models",
    fetchProductModels,
  );

  const [collapsedSubmodels, setCollapsedSubmodels] = useState<Set<string>>(
    new Set(),
  );
  const [sortColumn, setSortColumn] = useState<"identifier" | "label" | null>(
    null,
  );
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedQuery, setDebouncedQuery] = useState<string>("");
  const [showHidden, setShowHidden] = useState<boolean>(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const allSubmodelIds = useMemo(() => {
    if (!data) return [];
    return data
      .filter((item) => item.type === "submodel")
      .map((item) => item.identifier);
  }, [data]);

  const comparator = useMemo(() => {
    if (!sortColumn) return undefined;
    return (a: ProductModel, b: ProductModel) => {
      const aVal = a[sortColumn].toLowerCase();
      const bVal = b[sortColumn].toLowerCase();
      const cmp = aVal.localeCompare(bVal);
      return sortDirection === "asc" ? cmp : -cmp;
    };
  }, [sortColumn, sortDirection]);

  const rows = useMemo(() => {
    if (!data) return [];

    const treeRows = buildTreeOrder(data, comparator);
    const annotated = annotateRows(treeRows, debouncedQuery);

    return annotated.filter((row) => {
      if (row.type === "variant" && collapsedSubmodels.has(row.parent!)) {
        return false;
      }
      if (debouncedQuery && !showHidden && !row.visible) {
        return false;
      }
      return true;
    });
  }, [data, comparator, debouncedQuery, showHidden, collapsedSubmodels]);

  const handleSortClick = (column: "identifier" | "label") => {
    if (sortColumn !== column) {
      setSortColumn(column);
      setSortDirection("asc");
    } else if (sortDirection === "asc") {
      setSortDirection("desc");
    } else {
      setSortColumn(null);
      setSortDirection("asc");
    }
  };

  const getSortIndicator = (column: "identifier" | "label") => {
    if (sortColumn !== column) return "";
    return sortDirection === "asc" ? " ↑" : " ↓";
  };

  const handleToggleSubmodel = (identifier: string) => {
    setCollapsedSubmodels((prev) => {
      const next = new Set(prev);
      if (next.has(identifier)) {
        next.delete(identifier);
      } else {
        next.add(identifier);
      }
      return next;
    });
  };

  const handleViewChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === "open") {
      setCollapsedSubmodels(new Set());
    } else if (value === "close") {
      setCollapsedSubmodels(new Set(allSubmodelIds));
    }
  };

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Error loading data.</p>;

  return (
    <>
      <Toolbar>
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <label>
          <input
            type="checkbox"
            checked={showHidden}
            onChange={(e) => setShowHidden(e.target.checked)}
          />{" "}
          Show hidden products
        </label>
        <label>
          View:{" "}
          <select value={collapsedSubmodels.size === 0 ? "open" : "close"} onChange={handleViewChange}>
            <option value="open">Open</option>
            <option value="close">Close</option>
          </select>
        </label>
      </Toolbar>
      <Table>
        <thead>
          <tr>
            <th>Type</th>
            <SortableHeader onClick={() => handleSortClick("identifier")}>
              ID{getSortIndicator("identifier")}
            </SortableHeader>
            <th>Image</th>
            <SortableHeader onClick={() => handleSortClick("label")}>
              Label{getSortIndicator("label")}
            </SortableHeader>
            <th>Variant</th>
            <th>Variation axis</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <TableRow
              key={row.identifier}
              $greyed={!!debouncedQuery && !row.matches}
            >
              <td>
                <TypeCell
                  type={row.type}
                  isCollapsed={collapsedSubmodels.has(row.identifier)}
                  onToggle={() => handleToggleSubmodel(row.identifier)}
                />
              </td>
              <td>
                <HighlightText text={row.identifier} query={debouncedQuery} />
              </td>
              <td>
                <ProductImage src={row.image} alt={row.label} />
              </td>
              <td>
                <HighlightText text={row.label} query={debouncedQuery} />
              </td>
              <td>{row.variant_count ?? ""}</td>
              <td>
                {row.axes && row.axes.length > 0 && (
                  <AxesList>
                    {row.axes.map((axis) => (
                      <li key={axis}>
                        <HighlightText text={axis} query={debouncedQuery} />
                      </li>
                    ))}
                  </AxesList>
                )}
              </td>
            </TableRow>
          ))}
        </tbody>
      </Table>
    </>
  );
};
