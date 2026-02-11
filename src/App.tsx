import { pimTheme } from "akeneo-design-system";
import { ThemeProvider } from "styled-components";
import "./App.css";
import { TreeView } from "./components/TreeView";
import { DatasetProvider } from "./context/DatasetContext";
import { DatasetSelector } from "./components/DatasetSelector";

function App() {
  return (
    <ThemeProvider theme={pimTheme}>
      <DatasetProvider>
        <TreeView product={{ product_type: "variant", technical_id: "64" }} />
        <DatasetSelector />
      </DatasetProvider>
    </ThemeProvider>
  );
}

export default App;
