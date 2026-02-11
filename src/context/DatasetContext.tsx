import { createContext, useContext, useState, useCallback } from "react";
import type { ReactNode } from "react";
import type { ProductRow } from "../components/TreeView/types";

type DatasetEntry = { key: string; label: string };

type DatasetContextValue = {
  datasetKey: string;
  setDatasetKey: (key: string) => void;
  availableDatasets: DatasetEntry[];
  loadDataset: () => Promise<ProductRow[]>;
};

const dataModules = import.meta.glob<{ default: ProductRow[] }>(
  "../data/*.json",
);

const availableDatasets: DatasetEntry[] = Object.keys(dataModules)
  .sort()
  .map((path) => {
    const filename = path.split("/").pop()!;
    const match = filename.match(/product-models-(\d+)\.json/);
    const label = match ? `${match[1]} rows` : filename;
    return { key: path, label };
  });

const defaultKey =
  availableDatasets.find((d) => d.label === "1000 rows")?.key ??
  availableDatasets[0]?.key ??
  "";

const DatasetContext = createContext<DatasetContextValue | null>(null);

export const useDataset = (): DatasetContextValue => {
  const ctx = useContext(DatasetContext);
  if (!ctx) throw new Error("useDataset must be used within DatasetProvider");
  return ctx;
};

export const DatasetProvider = ({ children }: { children: ReactNode }) => {
  const [datasetKey, setDatasetKey] = useState(defaultKey);

  const loadDataset = useCallback(
    () => dataModules[datasetKey]().then((m) => m.default),
    [datasetKey],
  );

  return (
    <DatasetContext.Provider
      value={{ datasetKey, setDatasetKey, availableDatasets, loadDataset }}
    >
      {children}
    </DatasetContext.Provider>
  );
};
