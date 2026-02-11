import { pimTheme } from "akeneo-design-system";
import { ThemeProvider } from "styled-components";
import "./App.css";
import { TreeView } from "./components/TreeView";

function App() {
  return (
    <ThemeProvider theme={pimTheme}>
      <TreeView product={{ product_type: "variant", technical_id: "64" }} />
    </ThemeProvider>
  );
}

export default App;
