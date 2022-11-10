import {
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  message,
} from "antd";
import moment from "moment";
import React, { useContext, useEffect, useState } from "react";
import { WithTranslation, withTranslation } from "react-i18next";
import { DailyExpense, ExpenseCode } from "types";
import { getRTEText } from "utils/components/RTE/RTE";
import { getUsername } from "utils/helpers";

import { ExpensesService } from "../../services";
import UserContext from "../../UserContext";
import ElasticSearchField from "../../utils/components/ElasticSearchField";

interface DailyExpenseFormProps extends WithTranslation {
  visible: boolean;
  handleCancel: () => void;
  editedRecord: DailyExpense;
  showSpenderField: boolean;
  onSave: (expense: DailyExpense) => void;
  hideTaskField?: boolean;
}

const DailyExpenseForm = ({
  t,
  visible,
  handleCancel,
  editedRecord = {} as DailyExpense,
  showSpenderField = false,
  onSave,
  hideTaskField = false,
}: DailyExpenseFormProps) => {
  const [form] = Form.useForm();

  useEffect(() => {
    form.resetFields();
    if (visible) {
      const {
        _id,
        amount,
        code,
        remarks,
        spentAt,
        taskId,
        spenderId,
      } = editedRecord;
      form.setFieldsValue({
        _id,
        spenderId,
        amount,
        code,
        remarks,
        spentAt: moment(spentAt),
        taskId,
      });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const handleExpenseSave = (values = {} as DailyExpense) => {
    const { _id, ...restData } = values;
    if (_id) {
      ExpensesService.patch(_id, restData).then(
        (res: DailyExpense) => {
          onSave(res);
          message.success(t("accounting.expense.updateSuccess"));
        },
        (error: Error) => {
          // console.log("Error in updating expense: ", error);
          message.error(t("accounting.expense.updateError"));
        },
      );
    } else {
      ExpensesService.create(restData).then(
        (res: DailyExpense) => {
          onSave(res);
          message.success(t("accounting.expense.createSuccess"));
        },
        (error: Error) => {
          // console.log("Error in saving expense");
          message.error(t("accounting.expense.createError"));
        },
      );
    }
  };
  const handleSubmit = () => {
    form.validateFields().then((values) => {
      handleExpenseSave(values);
    });
  };

  const { firm = {} }: any = useContext(UserContext);
  const { expenseCodes = [] } = firm;

  const [defaultTaskQuery, setDefaultTaskQuery] = useState({});

  useEffect(() => {
    if (editedRecord.spenderId) {
      setDefaultTaskQuery((query) => {
        if (Object.keys(query).length > 0) {
          return query;
        }
        return { assigneeIds: { $in: [editedRecord.spenderId] } };
      });
    }
  }, [editedRecord]);

  return (
    <Modal
      title={t("accounting.expense.newExpense")}
      visible={visible}
      closable={true}
      onOk={handleSubmit}
      onCancel={handleCancel}
      okText={t("global.save")}
      cancelText={t("global.cancel")}
      okButtonProps={{ className: "tw-mr-2" }}
      width={450}
      bodyStyle={{ padding: "12px 24px" }}
    >
      <Form form={form} labelCol={{ span: 24 }}>
        <Form.Item name="_id" hidden noStyle>
          <Input />
        </Form.Item>

        <Form.Item
          name="spenderId"
          rules={[
            {
              required: true,
              message: t("accounting.expense.spenderReq"),
            },
          ]}
          label={t("accounting.expense.spender")}
          hidden={!showSpenderField}
        >
          <ElasticSearchField
            entity="users"
            currentValue={editedRecord.spender}
            renderOptions={(options) =>
              options.map((option) => (
                <Select.Option key={option._id} value={option._id}>
                  {getUsername(option)}
                </Select.Option>
              ))
            }
            className="st-field-color st-placeholder-color"
            placeholder={t("accounting.expense.selectSpender")}
          />
        </Form.Item>
        <Form.Item
          name="spentAt"
          rules={[
            {
              required: true,
              message: t("Date is required"),
            },
          ]}
          label={t("accounting.expense.date")}
        >
          <DatePicker
            className="st-field-color st-placeholder-color tw-w-full"
            format={"DD-MM-YYYY HH:mm"}
            showTime={{ minuteStep: 15, format: "HH:mm" }}
            allowClear
          />
        </Form.Item>
        <Form.Item
          name="amount"
          rules={[{ required: true, message: t("payment.amountReq") }]}
          label={t("payment.amount")}
        >
          <InputNumber
            placeholder={t("payment.enterAmount")}
            className="st-field-color st-placeholder-color tw-w-full"
          />
        </Form.Item>
        <Form.Item name="code" label={t("accounting.expense.code")}>
          <Select
            placeholder={t("payment.expense.enterCode")}
            className="st-field-color st-placeholder-color"
          >
            {expenseCodes.map((item: ExpenseCode) => (
              <Select.Option key={item._id} value={item.label}>
                {item.label}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          name="taskId"
          label={t("accounting.expense.assocJob")}
          hidden={hideTaskField}
          noStyle={hideTaskField}
        >
          <ElasticSearchField
            entity="tasks"
            extraQuery={defaultTaskQuery}
            currentValue={editedRecord.task}
            renderOptions={(options) =>
              options.map((option) => (
                <Select.Option key={option._id} value={option._id}>
                  {getRTEText(option.title)}
                </Select.Option>
              ))
            }
            className="st-field-color st-placeholder-color"
            placeholder={t("accounting.expense.selectAssocJob")}
          />
        </Form.Item>
        <Form.Item name="remarks" label={t("payment.details")}>
          <Input.TextArea
            placeholder={t("payment.enterDetails")}
            className="st-field-color st-placeholder-color"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default withTranslation()(DailyExpenseForm);
