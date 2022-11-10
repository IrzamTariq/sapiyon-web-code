import { Button, DatePicker, Form, Select } from "antd";
import { debounce } from "rambdax";
import React from "react";
import { withTranslation } from "react-i18next";
import { connect } from "react-redux";
import { getUsername } from "utils/helpers";

import {
  doClearFeedbackFilters,
  doFeedbackFiltersCustomersRequest,
  doFeedbackFiltersRequest,
  doFeedbackFiltersUsersRequest,
  doUpdateFeedbackFilters,
} from "./../../../store/feedbackFilters";

const moment = require("moment");

const { Option } = Select;

const FeedbackFilters = function ({
  t,
  doFeedbackFiltersRequest,
  doFeedbackFiltersCustomersRequest,
  doFeedbackFiltersUsersRequest,
  doUpdateFeedbackFilters,
  doClearFeedbackFilters,
  users = [],
  customers = [],
  appliedFilters = {},
  feedbackFilters,
  isVerified = true,
}) {
  const [form] = Form.useForm();
  const getRanges = () => {
    const now = moment();

    return {
      Bugün: [now.clone().startOf("day"), now.clone().endOf("day")],
      Yarın: [
        now.clone().add(1, "day").startOf("day"),
        now.clone().add(1, "day").endOf("day"),
      ],
      "Bu hafta": [now.clone().startOf("week"), now.clone().endOf("week")],
      "Gelecek 7 gün": [
        now.clone().startOf("day"),
        now.clone().add(1, "week").endOf("day"),
      ],
      "Bu ay": [now.clone().startOf("month"), now.clone().endOf("month")],
      Dün: [
        now.clone().add(-1, "day").startOf("day"),
        now.clone().add(-1, "day").endOf("day"),
      ],
    };
  };

  const isFiltersEmpty = () => {
    const values = form.getFieldsValue();

    return (
      Object.values(values).filter((query = "") => query && query.length)
        .length === 0 &&
      Object.values(appliedFilters || {}).filter(
        (query = "") => query && query.length,
      ).length === 0
    );
  };

  const handleCustomerSearch = debounce(
    ($search) => doFeedbackFiltersCustomersRequest({ $search }),
    500,
  );
  const handleUserSearch = debounce(
    ($search) => doFeedbackFiltersUsersRequest({ $search }),
    500,
  );

  const clearFilters = () => {
    form.resetFields();
    doClearFeedbackFilters();
  };

  const handleSubmit = (e) => {
    form.validateFields().then((values) => doFeedbackFiltersRequest(values));
  };

  return (
    <section className="tw-mt-5 tw-mb-6">
      <Form
        name="feedback-filters-form"
        form={form}
        onFinish={handleSubmit}
        onValuesChange={(changedValues, allValues) =>
          doUpdateFeedbackFilters(allValues)
        }
        className="tw-flex"
      >
        <Form.Item name="endAt" className="tw-w-2/12 tw-mr-2 tw-mb-0">
          <DatePicker.RangePicker
            ranges={getRanges()}
            className="st-field-color st-placeholder-color tw-w-full"
          />
        </Form.Item>

        <Form.Item name="rating" className="tw-w-2/12 tw-mr-2 tw-mb-0">
          <Select
            allowClear
            placeholder={t("Filter By NPS")}
            className="st-field-color st-placeholder-color tw-w-full"
            filterOption={(input, option) =>
              option.props.children
                .toLowerCase()
                .indexOf(input.toLowerCase()) >= 0
            }
          >
            <Option value={"Detractors"} key="Detractors">
              {t("Detractors")}
            </Option>
            <Option value={"Passives"} key="Passives">
              {t("Passives")}
            </Option>
            <Option value={"Promoters"} key="Promoters">
              {t("Promoters")}
            </Option>
          </Select>
        </Form.Item>

        <Form.Item name="assigneeIds" className="tw-w-2/12 tw-mr-2 tw-mb-0">
          <Select
            mode="multiple"
            maxTagCount={1}
            maxTagTextLength={3}
            allowClear
            placeholder={t("Filter By Employees")}
            className="s-tags-color tw-w-full st-field-color st-placeholder-color"
            filterOption={(input, option) =>
              option.props.children
                .toLowerCase()
                .indexOf(input.toLowerCase()) >= 0
            }
            onFocus={() => doFeedbackFiltersUsersRequest()}
            showSearch
            onSearch={handleUserSearch}
          >
            {users.map((item) => (
              <Option value={item._id} key={item._id}>
                {getUsername(item)}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="customerIds" className="tw-w-2/12 tw-mr-2 tw-mb-0">
          <Select
            mode="multiple"
            maxTagCount={1}
            maxTagTextLength={3}
            placeholder={t("Filter By Customers")}
            className="st-field-color st-placeholder-color tw-w-full"
            allowClear
            filterOption={(input, option) =>
              option.props.children
                .toLowerCase()
                .indexOf(input.toLowerCase()) >= 0
            }
            onFocus={() => doFeedbackFiltersCustomersRequest()}
            showSearch
            onSearch={handleCustomerSearch}
          >
            {customers.map((item) => (
              <Option value={item._id} key={item._id}>
                {`${
                  item.accountType === "individual"
                    ? item.contactPerson
                    : item.businessName
                }`}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item className="tw-mr-2 tw-mb-0">
          <Button
            htmlType={"submit"}
            disabled={isFiltersEmpty()}
            type="primary"
          >
            {t("feedbackFilters.apply")}
          </Button>
        </Form.Item>
        <Form.Item className="tw-mr-2 tw-mb-0">
          <Button
            htmlType="reset"
            danger
            disabled={isFiltersEmpty()}
            onClick={() => clearFilters()}
          >
            {t("feedbackFilters.clear")}
          </Button>
        </Form.Item>
      </Form>
    </section>
  );
};

const mapStateToProps = (state) => {
  return {
    users: state.feedbackFilters.users,
    customers: state.feedbackFilters.customers,
    appliedFilters: state.feedbackFilters.applied,
    feedbackFilters: state.feedbackFilters.edited,
    isVerified: state.auth.user.isVerified,
  };
};

const mapDispatchToProps = {
  doUpdateFeedbackFilters,
  doClearFeedbackFilters,
  doFeedbackFiltersRequest,
  doFeedbackFiltersCustomersRequest,
  doFeedbackFiltersUsersRequest,
};

const connectedForm = connect(
  mapStateToProps,
  mapDispatchToProps,
)(FeedbackFilters);

export default withTranslation()(connectedForm);
