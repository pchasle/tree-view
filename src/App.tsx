import "./App.css";
import { ThemeProvider } from "styled-components";
import { pimTheme } from "akeneo-design-system";
import { TreeView } from "./components/TreeView";

function App() {
  return (
    <ThemeProvider theme={pimTheme}>
      <TreeView />
    </ThemeProvider>
  );
}

export default App;
