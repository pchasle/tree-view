import "./App.css";
import { ThemeProvider } from "styled-components";
import { Helper, pimTheme } from "akeneo-design-system";
import { TreeView } from "./components/TreeView";

function App() {
  return (
    <ThemeProvider theme={pimTheme}>
      <Helper level="info">
        Opened tree view from variant "tshirt_classic_white_tri_blend_m_tall"
      </Helper>
      <br />
      <TreeView product={{ product_type: "variant", technical_id: "62" }} />
    </ThemeProvider>
  );
}

export default App;
