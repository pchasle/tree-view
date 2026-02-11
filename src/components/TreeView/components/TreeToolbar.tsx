import { Toolbar } from "./styled.ts";

type TreeToolbarProps = {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  showHidden: boolean;
  onShowHiddenChange: (show: boolean) => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
};

export const TreeToolbar = ({
  searchQuery,
  onSearchChange,
  showHidden,
  onShowHiddenChange,
  onExpandAll,
  onCollapseAll,
}: TreeToolbarProps) => (
  <Toolbar>
    <input
      type="text"
      placeholder="Search..."
      value={searchQuery}
      onChange={(e) => onSearchChange(e.target.value)}
    />
    <label>
      <input
        type="checkbox"
        checked={showHidden}
        onChange={(e) => onShowHiddenChange(e.target.checked)}
      />{" "}
      Show hidden products
    </label>
    <button type="button" onClick={onExpandAll}>
      Expand all
    </button>
    <button type="button" onClick={onCollapseAll}>
      Collapse all
    </button>
  </Toolbar>
);
