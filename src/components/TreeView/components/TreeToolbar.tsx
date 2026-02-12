import { useRef, useEffect } from "react";
import { Button, Checkbox, Search } from "akeneo-design-system";
import styled from "styled-components";
import { useTranslate } from "@akeneo-pim/shared";

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
}: TreeToolbarProps) => {
  const translate = useTranslate();
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    requestAnimationFrame(() => {
      searchInputRef.current?.focus();
    });
  }, []);

  return (
    <Toolbar>
      <Search
        placeholder={translate(
          "Search by label, identifier and variation axis",
        )}
        searchValue={searchQuery}
        onSearchChange={onSearchChange}
        inputRef={searchInputRef}
      >
        <Checkbox checked={showHidden} onChange={onShowHiddenChange}>
          {translate("Show hidden products")}
        </Checkbox>
      </Search>
      <Button ghost level="tertiary" size="small" onClick={onExpandAll}>
        {translate("Expand all")}
      </Button>
      <Button ghost level="tertiary" size="small" onClick={onCollapseAll}>
        {translate("Collapse all")}
      </Button>
    </Toolbar>
  );
};

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
