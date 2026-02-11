import { pimTheme } from "akeneo-design-system";
import { ThemeProvider } from "styled-components";
import "./App.css";
import { TreeView } from "./components/TreeView";

function App() {
  return (
    <ThemeProvider theme={pimTheme}>
      <div>
        Note for testers: Opened tree view from variant
        "tshirt_classic_white_tri_blend_m_tall" so it should be higlighted in
        blue.
      </div>
      <br />
      <TreeView product={{ product_type: "variant", technical_id: "62" }} />
    </ThemeProvider>
  );
}

export default App;
