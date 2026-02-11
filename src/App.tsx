import "./App.css";
import { ThemeProvider } from "styled-components";
import { pimTheme } from "akeneo-design-system";
import { TreeView } from "./components/TreeView";

function App() {
  return (
    <ThemeProvider theme={pimTheme}>
      <TreeView product={{ product_type: "variant", technical_id: "35" }} />
    </ThemeProvider>
  );
}

export default App;
