import { Select } from "antd";
import { SelectProps } from "antd/lib/select";
import logger from "logger";
import { debounce } from "rambdax";
import React, { ReactNode, useState } from "react";
import { WithTranslation, withTranslation } from "react-i18next";

import { ElasticSearch } from "../../services";
import { entitiesWithElasticSearch } from "../../types";
import { elasticQueryMaker } from "../helpers";

interface ElasticSearchFieldProps extends WithTranslation, SelectProps<string> {
  entity: entitiesWithElasticSearch;
  renderOptions: (options: any[]) => ReactNode[];
  currentValue: any;
  extraQuery?: any;
  stringifyJSON?: boolean;
}

const ElasticSearchField = ({
  t,
  entity,
  currentValue,
  className = "st-field-color st-placeholder-color tw-w-full",
  renderOptions,
  stringifyJSON = false,
  extraQuery = {},
  // following property destructured to avoid syntax warning
  tReady,
  ...rest
}: ElasticSearchFieldProps) => {
  const [state, setState] = useState({
    searchResults: [],
    isLoading: false,
  });
  const { searchResults, isLoading } = state;

  let selectedValues: any[] = [];
  if (Array.isArray(currentValue)) {
    selectedValues = currentValue;
  } else if (Object.keys(currentValue || {}).length > 0) {
    selectedValues = [currentValue];
  }

  const searchEntity = (searchTerm: string) => {
    setState((old) => ({ ...old, isLoading: true }));
    ElasticSearch.find(elasticQueryMaker(entity, searchTerm, extraQuery)).then(
      (res: any) => {
        setState((old) => ({
          ...old,
          searchResults: res.data,
          isLoading: false,
        }));
      },
      (error: Error) => {
        logger.error(`Error in searching ${entity}: `, error);
        setState((old) => ({ ...old, isLoading: false }));
      },
    );
  };

  let filteredSearchResults: any[] =
    searchResults?.filter(
      (item: any) =>
        selectedValues.findIndex((value) =>
          stringifyJSON
            ? value === JSON.stringify(item)
            : value._id === item._id,
        ) === -1,
    ) || [];
  if (stringifyJSON) {
    filteredSearchResults =
      filteredSearchResults?.map((item) => JSON.stringify(item)) || [];
  }

  return (
    <Select
      {...rest}
      onSearch={debounce(searchEntity, 300)}
      onFocus={() => searchEntity("")}
      filterOption={false}
      loading={isLoading}
      className={className}
      showSearch
      allowClear
    >
      {renderOptions(selectedValues)}
      {renderOptions(filteredSearchResults)}
    </Select>
  );
};

export default withTranslation()(ElasticSearchField);
