import { faPencilAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Col,
  DatePicker,
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
import {
  Address,
  CustomField,
  Customer,
  Invoice,
  UserContextType,
} from "types";
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
import { InvoiceEditState } from ".";

interface InvoiceDetailsFormProps {
  form: FormInstance<Invoice>;
  editedRecord: Invoice;
  state: InvoiceEditState;
  initialTitle: string;
  updateChanges: (changes: Partial<Invoice>) => void;
  updateState: (changes: Partial<InvoiceEditState>) => void;
  updateEditedInvoice: (changes: Partial<Invoice>) => void;
}

const InvoiceDetailsForm = ({
  state,
  form,
  initialTitle,
  updateChanges,
  updateEditedInvoice,
  updateState,
  editedRecord,
}: InvoiceDetailsFormProps) => {
  const [t] = useTranslation();
  const { firm } = useContext(UserContext) as UserContextType;
  const firmCustomFields: CustomField[] = React.useMemo(
    () =>
      (firm?.forms?.invoices || []).sort((a, b) =>
        a?.rank > b?.rank ? 1 : -1,
      ),
    [firm?.forms?.invoices],
  );
  const isEditingInvoice = !!editedRecord._id;
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
      updateEditedInvoice({
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
      updateEditedInvoice({
        customerId: "",
        customer: {} as Customer,
        addressId: null,
        address: {} as Address,
      });
    }
  };

  const handleFormValuesChange = (changed: Invoice, all: Invoice) => {
    const { customerId, ...rest } = changed;
    const keys = Object.keys(changed) as (keyof Invoice)[];
    let change = { ...rest } as Partial<Invoice>;
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
    updateEditedInvoice(change);
    updateChanges(change);
  };

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
              !isEditingInvoice || state.customerFieldVisible ? "flex" : "none",
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
              isEditingInvoice && !state.customerFieldVisible
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
                  {isEditingInvoice && !state.customerFieldVisible && (
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
                    <div>{t("invoices.edit.invoiceNo")}</div>
                    <div>#{editedRecord._id.slice(-5)}</div>
                  </div>
                  {editedRecord.issuedAt && (
                    <div className="tw-flex tw-justify-between tw-mt-3">
                      <div>{t("invoices.edit.issuedAt")}</div>
                      <div>
                        {moment(editedRecord.issuedAt).format("DD/MM/YYYY")}
                      </div>
                    </div>
                  )}
                  {editedRecord.dueAt && (
                    <div className="tw-flex tw-justify-between tw-mt-3">
                      <div>{t("invoices.edit.dueAt")}</div>
                      <div>
                        {moment(editedRecord.dueAt).format("DD/MM/YYYY")}
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
          <Col span={12}>
            <Form.Item
              name="issuedAt"
              rules={[{ required: true, message: t("Issue date is required") }]}
              label={t("invoices.edit.issueDate")}
            >
              <DatePicker
                className="st-field-color st-placeholder-color tw-w-full"
                format={"YYYY-MM-DD"}
                allowClear
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="dueAt" label={t("invoices.edit.dueDate")}>
              <DatePicker
                className="st-field-color st-placeholder-color tw-w-full"
                format={"YYYY-MM-DD"}
                allowClear
              />
            </Form.Item>
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
            <Form.Item
              name="customerMsg"
              labelCol={{ span: 24 }}
              label={t("invoices.edit.customerMsg")}
              className={editedRecord._id ? "tw--mt-3" : ""}
            >
              <Input.TextArea
                rows={5}
                className="st-field-color st-placeholder-color"
                placeholder={t("invoices.edit.enterCustomerMsg")}
              />
            </Form.Item>
          </Col>
        </Row>
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

export default InvoiceDetailsForm;
