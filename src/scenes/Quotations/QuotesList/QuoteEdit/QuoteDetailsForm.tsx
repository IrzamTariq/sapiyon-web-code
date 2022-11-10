import { faPencilAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Col,
  Divider,
  Form,
  FormInstance,
  FormItemProps,
  Input,
  Row,
  Select,
} from "antd";
import { LabeledValue } from "antd/lib/select";
import CustomerAddressEdit from "components/customers/CustomerList/CustomerAddressEdit";
import moment from "moment";
import { debounce } from "rambdax";
import React, { useContext } from "react";
import { useTranslation } from "react-i18next";
import { Address, CustomField, Customer, Quote, UserContextType } from "types";
import UserContext from "UserContext";
import CustomerElasticSearchField from "utils/components/CustomerElasticSearchField";
import RTE, { isRTEValueValid } from "utils/components/RTE/RTE";
import {
  getCustomFieldRules,
  getCustomerName,
  getCustomerSelectInfo,
  getHomeAddressLabel,
  hasAddresses,
  mapFormFieldValuesToCustomFields,
} from "utils/helpers";
import getFieldInput from "utils/helpers/getFieldInput";

import CustomerDetailsDrawer from "../../../../components/customers/CustomerDetails/CustomerDetailDrawer";
import { QuoteEditState } from "./QuoteEdit";

interface QuoteDetailsFormProps {
  form: FormInstance<Quote>;
  editedRecord: Quote;
  state: QuoteEditState;
  initialTitle: string;
  updateChanges: (changes: Partial<Quote>) => void;
  updateState: (changes: any) => void;
  updateEditedQuote: (changes: Partial<Quote>) => void;
}

const QuoteDetailsForm = ({
  form,
  state,
  editedRecord,
  initialTitle,
  updateChanges,
  updateEditedQuote,
  updateState,
}: QuoteDetailsFormProps) => {
  const [t] = useTranslation();
  const { firm } = useContext(UserContext) as UserContextType;
  const firmCustomFields: CustomField[] = React.useMemo(
    () =>
      (firm?.forms?.quotes || []).sort((a, b) => (a?.rank > b?.rank ? 1 : -1)),
    [firm?.forms?.quotes],
  );
  const isEditingQuote = !!editedRecord._id;
  const { customer, addressId } = editedRecord;
  const { phone, email, address = {} as Address, addresses = [] } =
    customer || {};
  const isCustomerSelected = !!customer?._id;

  const handleRTEChange = (value = "") => {
    updateState({ rteState: { touched: true, value } });
    if (isRTEValueValid(value)) {
      updateChanges({ title: value });
    }
  };
  const handleCustomerChange = (
    selection = {} as LabeledValue,
    option: any,
  ) => {
    const newCustomer: Customer = option?.customer;
    const customerId = newCustomer?._id || "";
    const update = {
      customerId,
      customer: newCustomer,
      addressId: null,
    };

    if (customerId) {
      updateEditedQuote({
        ...update,
      });
      updateChanges(Object.assign({}, { customerId, addressId: null }));
      updateState({
        customerFieldVisible: false,
      });
      form.setFieldsValue({
        //@ts-ignore
        customerId: {
          key: customerId,
          value: customerId,
          label: getCustomerSelectInfo(newCustomer),
        },
        addressId: "home",
      });
    } else {
      updateEditedQuote({
        customerId: "",
        customer: {} as Customer,
        addressId: null,
        address: {} as Address,
      });
    }
  };

  const handleFormValuesChange = (changed: Quote, all: Quote) => {
    const { customerId, ...rest } = changed;
    const keys = Object.keys(changed) as (keyof Quote)[];
    let change = { ...rest } as Partial<Quote>;
    if (keys.includes("fields")) {
      const fields = all.fields || ([] as CustomField[]);
      const fieldsData = mapFormFieldValuesToCustomFields(
        firmCustomFields,
        fields,
      );
      change = Object.assign({}, { fields: fieldsData });
    }
    if (keys.includes("addressId")) {
      const addressData = {
        addressId: changed?.addressId === "home" ? null : changed?.addressId,
      };
      change = Object.assign({}, change, addressData);
    }
    updateEditedQuote(change);
    updateChanges(change);
  };

  const changeRequests = Array.isArray(editedRecord.changeRequests)
    ? editedRecord.changeRequests
    : [];

  return (
    <>
      <Form
        form={form}
        onValuesChange={debounce(handleFormValuesChange, 300)}
        labelCol={{ span: 24 }}
        requiredMark={false}
      >
        <Form.Item name="_id" hidden noStyle>
          <Input />
        </Form.Item>
        <Row
          gutter={26}
          style={{
            display:
              !isEditingQuote || state.customerFieldVisible ? "flex" : "none",
          }}
        >
          <Col span={16}>
            <Form.Item
              name="customerId"
              rules={[
                {
                  required: true,
                  message: t("taskEdit.customerReq"),
                },
              ]}
              label={
                <span className="s-main-font s-main-text-color">
                  {t("taskEdit.searchCustomer")}
                </span>
              }
              className="tw-mb-0"
            >
              <CustomerElasticSearchField
                onCustomerSubmit={(customer) =>
                  handleCustomerChange(undefined, { customer })
                }
                onChange={(value, option) =>
                  handleCustomerChange(undefined, option)
                }
                customer={customer}
                allowEditing
                className="st-field-color st-placeholder-color"
                placeholder={t("customerSelect.placeholder")}
              />
            </Form.Item>
          </Col>
          {isCustomerSelected && hasAddresses(customer) && (
            <Col span={8}>
              <Form.Item
                name="addressId"
                label={t("taskEdit.selectAddress")}
                className="tw-mb-0"
              >
                <Select
                  placeholder={t("taskEdit.selectAddress")}
                  className="st-field-color st-placeholder-color"
                  filterOption={(input, option: any) =>
                    option.props.children
                      .toLowerCase()
                      .indexOf(input.toLowerCase()) >= 0
                  }
                  showSearch
                >
                  <Select.Option value="home" key="home">
                    {getHomeAddressLabel(customer)}
                  </Select.Option>
                  {Array.isArray(addresses) &&
                    addresses.map((option: Address) => (
                      <Select.Option key={option._id} value={option._id || ""}>
                        {option.tag}
                      </Select.Option>
                    ))}
                </Select>
              </Form.Item>
            </Col>
          )}
        </Row>
        <div hidden={!isCustomerSelected}>
          <div
            className={
              isEditingQuote && !state.customerFieldVisible
                ? "tw--mt-2"
                : "tw-w-8/12 tw-pr-2 tw-mt-4"
            }
          >
            <div className="tw-flex tw-justify-between">
              <div>
                <div className="s-hover-parent">
                  <span
                    className="tw-font-medium s-main-text-color tw-text-2xl clickAble"
                    onClick={() =>
                      updateState({
                        customerDetailsVisible: true,
                      })
                    }
                  >
                    {getCustomerName(customer)}
                  </span>
                  {isEditingQuote && !state.customerFieldVisible && (
                    <FontAwesomeIcon
                      className="tw-align-baseline tw-ml-3 s-text-gray s-pointer s-hover-target"
                      icon={faPencilAlt}
                      onClick={() =>
                        updateState({
                          customerFieldVisible: true,
                        })
                      }
                    />
                  )}
                </div>
                {phone && (
                  <div className="tw-text-sm s-main-text-color">
                    {t("customerDetails.telephone")}: {phone}
                  </div>
                )}
                {email && (
                  <div className="tw-text-sm s-main-text-color">
                    {t("customerDetails.email")}: {email}
                  </div>
                )}
                {!!addressId && addressId !== "home" ? (
                  <div className="tw-text-sm s-main-text-color">
                    {
                      addresses?.find((item) => item._id === addressId)
                        ?.formatted
                    }
                  </div>
                ) : (
                  <div className="tw-text-sm s-main-text-color">
                    {address?.formatted}
                  </div>
                )}
              </div>
              {editedRecord._id && !state.customerFieldVisible && (
                <div className="tw-w-4/12 s-main-font s-main-text-color tw-text-sm">
                  <div className="tw-flex tw-justify-between tw-mt-3">
                    <div>{t("quotes.edit.quoteNo")}</div>
                    <div>#{editedRecord._id.slice(-5)}</div>
                  </div>
                  {editedRecord.createdAt && (
                    <div className="tw-flex tw-justify-between tw-mt-3">
                      <div>{t("quotes.edit.issuedAt")}</div>
                      <div>
                        {moment(editedRecord.createdAt).format("DD/MM/YYYY")}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        <Row gutter={26}>
          <Col span={24} className="tw-mt-6 tw-mb-0">
            <RTE
              value={initialTitle}
              onChange={handleRTEChange}
              touched={state.rteState.touched}
              placeholder={t("taskEdit.enterTitle")}
              requiredMsg={t("taskEdit.detailsReq")}
              required
            />
          </Col>
        </Row>
        <Row gutter={26}>
          {firmCustomFields.map((field = {} as CustomField) => {
            const rules = getCustomFieldRules(field);
            let additionalProps = { rules } as FormItemProps;
            if (field.type === "toggleSwitch") {
              additionalProps = {
                ...additionalProps,
                valuePropName: "checked",
              };
            }

            return (
              <Col span={12} key={field._id} className="tw-mb-0">
                <Form.Item
                  name={["fields", field._id || ""]}
                  {...additionalProps}
                  label={
                    <span className="s-main-font s-main-text-color">
                      {field.label}
                    </span>
                  }
                >
                  {getFieldInput(field)}
                </Form.Item>
              </Col>
            );
          })}
        </Row>
        <Row>
          <Col span={24}>
            <Form.Item label={t("quotes.edit.customerMsg")} name="customerMsg">
              <Input.TextArea
                rows={5}
                className="st-field-color st-placeholder-color"
                placeholder={t("quotes.edit.enterCustomerMsg")}
              />
            </Form.Item>
          </Col>
        </Row>
        {changeRequests.length > 0 ? (
          <>
            <Divider />
            <div>
              <h2 className="s-main-font s-main-text-color s-semibold ">
                {t("quotes.edit.changeRequests")}:
              </h2>
            </div>
            <div className={"tw-mt-5 tw-mb-10"}>
              {changeRequests.map((item) => (
                <div key={item._id}>{item.requestText}</div>
              ))}
            </div>
            <Divider className="tw-mt-0" />
          </>
        ) : null}
      </Form>

      <CustomerDetailsDrawer
        customer={editedRecord.customer}
        editAddress={() => updateState({ isEditingAddress: true })}
        handleCancel={() => updateState({ customerDetailsVisible: false })}
        visible={state.customerDetailsVisible}
      />
      <CustomerAddressEdit
        //@ts-ignore
        visible={state.isEditingAddress}
        customerId={customer?._id}
        editedRecord={{}}
        handleOk={() => updateState({ isEditingAddress: false })}
        handleCancel={() => updateState({ isEditingAddress: false })}
      />
    </>
  );
};

export default QuoteDetailsForm;
