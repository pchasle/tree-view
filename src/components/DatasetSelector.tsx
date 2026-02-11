import styled from "styled-components";
import { useDataset } from "../context/DatasetContext";

const Panel = styled.div`
  position: fixed;
  bottom: 16px;
  right: 16px;
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 6px;
  padding: 8px 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 9999;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
`;

const Label = styled.label`
  font-weight: 600;
  color: #333;
`;

const Select = styled.select`
  padding: 4px 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
`;

export const DatasetSelector = () => {
  const { datasetKey, setDatasetKey, availableDatasets } = useDataset();

  return (
    <Panel>
      <Label htmlFor="dataset-select">Dataset:</Label>
      <Select
        id="dataset-select"
        value={datasetKey}
        onChange={(e) => setDatasetKey(e.target.value)}
      >
        {availableDatasets.map((ds) => (
          <option key={ds.key} value={ds.key}>
            {ds.label}
          </option>
        ))}
      </Select>
    </Panel>
  );
};
