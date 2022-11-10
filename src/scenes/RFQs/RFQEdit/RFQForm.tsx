import { faPencilAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Col,
  Collapse,
  DatePicker,
  Form,
  FormItemProps,
  Input,
  Radio,
  Row,
  Select,
} from "antd";
import { FormInstance } from "antd/es/form/Form";
import { LabeledValue } from "antd/lib/select";
import CustomerAddressEdit from "components/customers/CustomerList/CustomerAddressEdit";
import i18next from "i18next";
import { debounce } from "rambdax";
import React, { useContext } from "react";
import { useTranslation } from "react-i18next";
import {
  Address,
  CustomField,
  Customer,
  RFQ,
  User,
  UserContextType,
} from "types";
import UserContext from "UserContext";
import CustomerElasticSearchField from "utils/components/CustomerElasticSearchField";
import ElasticSearchField from "utils/components/ElasticSearchField";
import RTE, { isRTEValueValid } from "utils/components/RTE/RTE";
import {
  getCustomFieldRules,
  getCustomerName,
  getCustomerSelectInfo,
  getHomeAddressLabel,
  getUsername,
  hasAddresses,
  mapFormFieldValuesToCustomFields,
} from "utils/helpers";
import getFieldInput from "utils/helpers/getFieldInput";

import CustomerDetailsDrawer from "../../../components/customers/CustomerDetails/CustomerDetailDrawer";
import { RFQEditState } from "./RFQEdit";

interface RFQDetailsFormProps {
  form: FormInstance<RFQ>;
  editedRecord: RFQ;
  state: RFQEditState;
  initialTitle: string;
  updateChanges: (changes: Partial<RFQ>) => void;
  updateState: (changes: Partial<RFQEditState>) => void;
  updateEditedRFQ: (changes: Partial<RFQ>) => void;
}
const arrivalOptions = [
  { value: "any time", label: i18next.t("requests.arrival.anyTime") },
  { value: "morning", label: i18next.t("requests.arrival.morning") },
  { value: "afternoon", label: i18next.t("requests.arrival.afternoon") },
  { value: "evening", label: i18next.t("requests.arrival.evening") },
];

const RFQDetailsForm = ({
  form,
  editedRecord,
  state,
  updateChanges,
  updateState,
  updateEditedRFQ,
  initialTitle,
}: RFQDetailsFormProps) => {
  const [t] = useTranslation();
  const { firm } = useContext(UserContext) as UserContextType;
  const firmCustomFields: CustomField[] = React.useMemo(
    () => (firm?.forms?.rfq || []).sort((a, b) => (a?.rank > b?.rank ? 1 : -1)),
    [firm?.forms?.rfq],
  );
  const isEditingRFQ = !!editedRecord._id;
  const { customer, addressId } = editedRecord;
  const { phone, email, address = {} as Address, addresses } = customer || {};
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
      updateEditedRFQ({
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
        address: {} as Address,
      });
    } else {
      updateEditedRFQ({
        customerId: "",
        customer: {} as Customer,
        addressId: null,
      });
    }
  };

  const handleFormValuesChange = (changed: RFQ, all: RFQ) => {
    const {
      customerId,
      //@ts-ignore
      visitDay1,
      ...rest
    } = changed;
    const keys = Object.keys(changed) as (keyof RFQ)[];
    let change = { ...rest } as Partial<RFQ>;
    //@ts-ignore
    if (keys.includes("visitDay1")) {
      change = Object.assign({}, { preferredVisitDates: [visitDay1, null] });
    }
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
    updateEditedRFQ(change);
    updateChanges(change);
  };

  const updateAssignees = (options = [] as any[]) => {
    const assignees: User[] = options.reduce((acc, curr) => {
      const { _id, fullName } = curr?.props?.item;
      return [...acc, { _id, fullName }];
    }, []);

    updateEditedRFQ({ assignees });
    updateChanges({ assigneeIds: assignees.map((item) => item._id) });
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
              !isEditingRFQ || state.customerFieldVisible ? "flex" : "none",
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
              isEditingRFQ && !state.customerFieldVisible
                ? "tw--mt-2"
                : "tw-w-8/12 tw-pr-2 tw-mt-4"
            }
          >
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
              {isEditingRFQ && !state.customerFieldVisible && (
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
                {addresses?.find((item) => item._id === addressId)?.formatted}
              </div>
            ) : (
              <div className="tw-text-sm s-main-text-color">
                {address?.formatted}
              </div>
            )}
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
        <Row gutter={26} className="tw-items-center">
          <Col span={12}>
            <Form.Item label={t("requests.edit.selectDay1")} name="visitDay1">
              <DatePicker
                className="st-field-color st-placeholder-color tw-w-full"
                format={"YYYY-MM-DD"}
                allowClear
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={26} className="tw-items-center">
          <Col>
            <Form.Item
              name="preferredVisitTime"
              label={t("requests.edit.selectArrivalTime")}
            >
              <Radio.Group options={arrivalOptions} name="preferredVisitTime" />
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
        <Collapse accordion>
          <Collapse.Panel header={t("requests.edit.assesment")} key="1">
            <Row gutter={26}>
              <Col span={12}>
                <Form.Item
                  name="assigneeIds"
                  label={
                    <span className="s-main-font s-main-text-color">
                      {t("taskEdit.employee")}
                    </span>
                  }
                >
                  <ElasticSearchField
                    entity="users"
                    currentValue={editedRecord.assignees}
                    mode="multiple"
                    renderOptions={(options: User[]) =>
                      options.map((option) => (
                        <Select.Option
                          key={option._id}
                          value={option._id || ""}
                          item={option}
                        >
                          {getUsername(option)}
                        </Select.Option>
                      ))
                    }
                    onChange={(val, ops) => updateAssignees(ops as any[])}
                    maxTagCount={3}
                    maxTagTextLength={5}
                    className="tw-w-full s-tags-color st-field-color st-placeholder-color"
                    placeholder={t("taskEdit.selectEmployee")}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="dueAt" label={t("requests.edit.dueDate")}>
                  <DatePicker
                    className="st-field-color st-placeholder-color tw-w-full"
                    format={"YYYY-MM-DD HH:mm"}
                    showTime={{ minuteStep: 15, format: "HH:mm" }}
                    allowClear
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <Form.Item
                  name="onSiteAssessmentInstructions"
                  label={t("requests.edit.jobInstructions")}
                >
                  <Input.TextArea
                    rows={3}
                    placeholder={t("requests.edit.enterJobInstructions")}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Collapse.Panel>
        </Collapse>
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

export default RFQDetailsForm;
