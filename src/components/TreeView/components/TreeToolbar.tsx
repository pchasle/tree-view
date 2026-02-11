import { Button, Checkbox, Search } from "akeneo-design-system";
import styled from "styled-components";

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

const Toolbar = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;

  > :first-child {
    width: 100%;
  }
`;
