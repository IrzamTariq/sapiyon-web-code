import React from "react";
import { Select } from "antd";
import { debounce } from "rambdax";
import client from "../../services/client";
import i18next from "i18next";
import UserContext from "../../UserContext";

export default class AutocompleteField extends React.Component {
  state = { dataSource: [], hasFetchedDataOnce: false };
  static contextType = UserContext;

  render() {
    let {
      renderOptions,
      serviceUrl = "",
      defaultQuery = {},
      currentValue = [],
      searchFields = [],
      transformOptionsData = [],
      serializeOptionsData,
      filterOption = false,
      styleClasses = "st-field-color st-placeholder-color tw-w-full",
      ...restProps
    } = this.props;
    const { hasFeature } = this.context;

    if (serviceUrl.trim().length < 1) {
      throw new Error("serviceUrl prop is required");
    }

    let { dataSource } = this.state;

    const transformData = (items) => {
      items = transformOptionsData.reduce((p, c) => {
        return p.map(c);
      }, items);
      return items;
    };

    const setDataSource = (items = []) => {
      if (
        Array.isArray(transformOptionsData) &&
        transformOptionsData.length > 0
      ) {
        items = transformData(items);
      }

      if (serializeOptionsData) {
        items = items.map((item) => JSON.stringify(item));
      }
      this.setState({ dataSource: items, hasFetchedDataOnce: true });
    };

    let service = client.services[serviceUrl];

    const debouncedSearch = debounce((searchTerm = "") => {
      let searchQuery = {};

      if (searchTerm.trim().length > 0) {
        if (searchFields.length > 0) {
          searchQuery = searchFields.reduce((prev, curr) => {
            return { ...prev, [curr]: { $search: searchTerm } };
          }, {});
        } else {
          searchQuery = { $search: searchTerm };
        }
      }

      let query = {
        ...defaultQuery,
        ...searchQuery,
      };

      service.find({ query }).then((res) => {
        setDataSource(res.data);
      });
    }, 500);

    const handleSearch = (v) => {
      debouncedSearch(v);
    };

    const fetchResultsOnInitialFocus = () => {
      if (this.state.hasFetchedDataOnce) {
        return;
      }
      handleSearch();
    };

    if (!Array.isArray(currentValue)) {
      if (Object.keys(currentValue || {}).length > 0) {
        currentValue = [currentValue];
      } else {
        currentValue = [];
      }
    }

    dataSource = dataSource.filter((item) => {
      // if optionsData is serialized
      if (serializeOptionsData) {
        return !currentValue.includes(item);
      }

      // if optionsData is not serialized
      let index = currentValue.findIndex((currentItem) => {
        return currentItem._id === item._id;
      });

      return index === -1;
    });

    const open = `{"_id":"null","type":"system","title":"${i18next.t(
      "Open",
    )}"}`;
    const pending = `{"_id":"null","type":"system","title":"${i18next.t(
      "Pending",
    )}"}`;
    const quote = `{"_id":"convertedToQuote", "title":"${i18next.t(
      "Converted to quote",
    )}"}`;
    const invoice = `{"_id":"convertedToInvoice", "title":"${i18next.t(
      "Converted to invoice",
    )}"}`;
    const task = `{"_id":"convertedToTask", "title":"${i18next.t(
      "Converted to task",
    )}"}`;

    const taskDefaultStatuses = [
      open,
      ...(hasFeature("extendedTasks") ? [invoice] : []),
    ];
    const RFQDefaultStatuses = [
      pending,
      ...(hasFeature("extendedTasks") ? [quote, task] : []),
    ];
    const quoteDefaultStatuses = [
      pending,
      ...(hasFeature("extendedTasks") ? [invoice, task] : []),
    ];
    const invoiceDefaultStatuses = [pending];

    const getDefaultOptions = (inCurrent = []) => {
      if (serviceUrl === "firm/task-status") {
        if (defaultQuery.category === "task") {
          return taskDefaultStatuses
            .filter((item) => !inCurrent.includes(item))
            .map((item) => (
              <Select.Option key={item}>{JSON.parse(item).title}</Select.Option>
            ));
        } else if (defaultQuery.category === "rfq") {
          return RFQDefaultStatuses.filter(
            (item) => !inCurrent.includes(item),
          ).map((item) => (
            <Select.Option key={item}>{JSON.parse(item).title}</Select.Option>
          ));
        } else if (defaultQuery.category === "quote") {
          return quoteDefaultStatuses
            .filter((item) => !inCurrent.includes(item))
            .map((item) => (
              <Select.Option key={item}>{JSON.parse(item).title}</Select.Option>
            ));
        } else if (defaultQuery.category === "invoice") {
          return invoiceDefaultStatuses
            .filter((item) => !inCurrent.includes(item))
            .map((item) => (
              <Select.Option key={item}>{JSON.parse(item).title}</Select.Option>
            ));
        } else {
          return null;
        }
      } else {
        return null;
      }
    };

    return (
      <Select
        {...restProps}
        showSearch
        allowClear
        onSearch={handleSearch}
        onFocus={fetchResultsOnInitialFocus}
        filterOption={filterOption}
        className={styleClasses}
      >
        {renderOptions(currentValue, Select.Option)}
        {renderOptions(dataSource, Select.Option)}
        {getDefaultOptions(currentValue)}
      </Select>
    );
  }
}
