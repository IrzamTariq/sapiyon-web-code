import { EditFilled } from "@ant-design/icons";
import { Button, Col, Divider, Empty, Row, Select, Tooltip } from "antd";
import { LabeledValue, SelectProps } from "antd/lib/select";
import CustomerEdit from "components/customers/CustomerEdit/CustomerEdit";
import logger from "logger";
import { debounce } from "rambdax";
import React, { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { Customer } from "types";
import UserContext from "UserContext";

import { CustomerService } from "../../services";
import { elasticQueryMaker, getCustomerSelectInfo } from "../helpers";

interface ElasticSearchFieldProps extends SelectProps<LabeledValue> {
  onCustomerSubmit: (customer: Customer) => void;
  allowEditing: boolean;
  customer: Customer;
}

const ElasticSearchField = ({
  className = "st-field-color st-placeholder-color tw-w-full",
  onCustomerSubmit,
  allowEditing = false,
  onChange,
  customer,
  ...rest
}: ElasticSearchFieldProps) => {
  const [t] = useTranslation();
  const { hasPermission }: any = useContext(UserContext);
  const [state, setState] = useState({
    searchResults: [] as Customer[],
    isLoading: false,
    searchTerm: "",
    localCustomerData: {},
    isEditingCustomer: false,
    isCustomerSelected: false,
  });
  const { searchResults, isLoading, searchTerm } = state;

  const searchEntity = (searchTerm: string) => {
    setState((old) => ({ ...old, isLoading: true }));
    CustomerService.find(
      elasticQueryMaker("customers", searchTerm, { $limit: 50 }),
    ).then(
      (res: any) => {
        setState((old) => ({
          ...old,
          searchResults: res.data,
          isLoading: false,
          searchTerm,
        }));
      },
      (error: Error) => {
        logger.error(`Error in searching customers: `, error);
        setState((old) => ({ ...old, isLoading: false }));
      },
    );
  };

  const handleNewCustomer = (newCustomer: Customer) => {
    onCustomerSubmit(newCustomer);
    setState((old) => ({
      ...old,
      isEditingCustomer: false,
      localCustomerData: {},
      searchResults: (searchResults || []).map((customer) =>
        customer?._id === newCustomer?._id ? newCustomer : customer,
      ),
    }));
  };
  const handleCustomerChange = (value: LabeledValue, option: any) => {
    const customer = option?.customer;
    setState((prev) => ({
      ...prev,
      isCustomerSelected: !!customer?._id,
    }));
    if (onChange) onChange(value, option);
  };

  const addCustomer = () =>
    setState((old) => ({
      ...old,
      localCustomerData: { contactPerson: searchTerm },
      isEditingCustomer: true,
    }));

  return (
    <>
      <Row>
        <Col span={23}>
          <Select
            {...rest}
            onSearch={debounce(searchEntity, 300)}
            onFocus={() => searchEntity("")}
            onChange={handleCustomerChange}
            dropdownRender={(menu) => (
              <div>
                {menu}
                {!isLoading &&
                hasPermission("canCreateCustomers") &&
                searchResults?.length > 0 &&
                !!searchTerm ? (
                  <div className="tw-px-3 tw-py-1 st-main-font">
                    <Divider plain style={{ margin: "5px 0px" }}>
                      {t("customerSelect.or")}
                    </Divider>
                    <Button
                      type="primary"
                      size="small"
                      className="tw-mr-2"
                      onClick={addCustomer}
                    >
                      {t("customerSelect.addNew")}
                    </Button>
                    <span className="s-semibold">{searchTerm}</span>
                  </div>
                ) : null}
              </div>
            )}
            notFoundContent={
              !isLoading &&
              hasPermission("canCreateCustomers") &&
              searchResults?.length === 0 &&
              !!searchTerm ? (
                <CustomerSelectNotFoundContent
                  customer={searchTerm}
                  addCustomer={addCustomer}
                />
              ) : (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    isLoading ? t("global.searching") : t("tables.noData")
                  }
                />
              )
            }
            filterOption={false}
            loading={isLoading}
            className={className}
            labelInValue
            showSearch
            allowClear
          >
            {searchResults.map((customer) => (
              <Select.Option
                key={customer._id}
                value={customer._id || ""}
                customer={customer}
              >
                {getCustomerSelectInfo(customer)}
              </Select.Option>
            ))}
          </Select>
        </Col>
        {allowEditing &&
        hasPermission("canCreateCustomers") &&
        !!customer?._id ? (
          <Col span={1}>
            <Tooltip title={t("customerSelect.editInfo")}>
              <Button
                icon={<EditFilled className="s-icon-color" />}
                className="tw-ml-1"
                onClick={() =>
                  setState((prev) => ({
                    ...prev,
                    localCustomerData: Object.assign({}, customer),
                    isEditingCustomer: true,
                  }))
                }
              />
            </Tooltip>
          </Col>
        ) : null}
      </Row>

      <CustomerEdit
        // @ts-ignore
        visible={state.isEditingCustomer}
        editedRecord={state.localCustomerData}
        updateCustomerLocally={(data: Customer) =>
          setState((old) => ({
            ...old,
            localCustomerData: { ...old.localCustomerData, ...data },
          }))
        }
        customerModified={handleNewCustomer}
        handleCancel={() =>
          setState((old) => ({
            ...old,
            localCustomerData: {} as Customer,
            isEditingCustomer: false,
          }))
        }
      />
    </>
  );
};

export default ElasticSearchField;

interface CustomerSelectNotFoundContentProps {
  customer: string;
  addCustomer: () => void;
}
const CustomerSelectNotFoundContent = ({
  customer,
  addCustomer,
}: CustomerSelectNotFoundContentProps) => {
  const [t] = useTranslation();
  return (
    <div className="s-main-font s-main-text-color tw-text-center tw-py-4 tw-px-2">
      <div className="s-semibold tw-text-gray-600 tw-text-lg tw-truncate">
        {customer}
      </div>
      <div>{t("customerSelect.help")}</div>
      <div className="tw-text-gray-500 s-semibold tw-my-3">
        {t("customerSelect.or")}
      </div>
      <Button size="small" type="primary" onClick={addCustomer}>
        {t("customerSelect.addNow")}
      </Button>
    </div>
  );
};
