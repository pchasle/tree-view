import { Button, Checkbox, Search } from "akeneo-design-system";
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
    <Search
      placeholder="Search..."
      searchValue={searchQuery}
      onSearchChange={onSearchChange}
    >
      <Checkbox checked={showHidden} onChange={onShowHiddenChange}>
        Show hidden products
      </Checkbox>
    </Search>
    <Button ghost level="tertiary" size="small" onClick={onExpandAll}>
      Expand all
    </Button>
    <Button ghost level="tertiary" size="small" onClick={onCollapseAll}>
      Collapse all
    </Button>
  </Toolbar>
);
