import { SortOrder, SorterResult } from "antd/lib/table/interface";
import { Key } from "react";

export interface SortState {
  [fieldName: string]: 1 | -1;
}

export const getSortOrder = (
  sort = {} as SortState,
  key: string,
): SortOrder => {
  if (sort[key] === -1) {
    return "descend";
  } else if (sort[key] === 1) {
    return "ascend";
  } else {
    return null;
  }
};

const normalizeFieldName = (fieldName: Key | readonly Key[]) =>
  Array.isArray(fieldName) ? fieldName.join(".") : (fieldName as string);

export const setUpSorting = (
  sorts: SortState,
  fieldName: string,
  priority: number,
) => ({
  sorter: { multiple: priority },
  sortOrder: getSortOrder(sorts, normalizeFieldName(fieldName)),
  showSorterTooltip: false,
});

export const handleSorting = <T,>(
  sort = [] as SorterResult<T> | SorterResult<T>[],
  sorts = {} as SortState,
  setSorts: (sortingData: SortState) => void,
) => {
  let data = Array.isArray(sort) ? sort : [sort];
  const sortHold = data.reduce((acc, curr) => {
    const { field = "", order = "" } = curr;
    const fieldName = normalizeFieldName(field);
    return !order || !fieldName
      ? acc
      : ({
          [fieldName]: curr.order === "ascend" ? 1 : -1,
        } as SortState);
  }, {} as SortState);

  setSorts(sortHold);
};
