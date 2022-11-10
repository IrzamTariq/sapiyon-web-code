import i18next from "i18next";
import { ColumnLayout, TableLayout } from "types";

export const taskColumns: ColumnLayout[] = [
  {
    title: i18next.t("taskList.dueDate"),
    dataIndex: "endAt",
    size: 300,
    order: 0,
    minSize: 100,
    isSystem: true,
  },
  {
    title: i18next.t("taskList.customer"),
    dataIndex: "customer",
    size: 300,
    order: 1,
    minSize: 100,
    isSystem: true,
  },
  {
    title: i18next.t("taskList.title"),
    dataIndex: "title",
    size: 500,
    alwaysVisible: true,
    order: 2,
    minSize: 100,
    isSystem: true,
  },
  {
    title: i18next.t("taskList.assignee"),
    dataIndex: "assignees",
    size: 350,
    order: 3,
    minSize: 100,
    isSystem: true,
  },
  {
    title: i18next.t("taskList.num"),
    dataIndex: "_id",
    size: 100,
    order: 4,
    minSize: 100,
    isSystem: true,
    fixedWidth: true,
  },
  {
    title: i18next.t("taskList.status"),
    dataIndex: "statusId",
    size: 100,
    order: 5,
    minSize: 100,
    isSystem: true,
  },
  {
    title: i18next.t("customerList.city"),
    dataIndex: "address",
    size: 200,
    order: 6,
    minSize: 100,
    isSystem: true,
  },
  {
    title: i18next.t("taskList.salesTotal"),
    dataIndex: "salesTotal",
    size: 200,
    order: 7,
    minSize: 100,
    isSystem: true,
  },
  {
    title: i18next.t("taskList.action"),
    dataIndex: "actions",
    size: 100,
    minSize: 100,
    isSystem: true,
    fixedWidth: true,
  } as ColumnLayout,
];

export const customerColumns: ColumnLayout[] = [
  {
    title: i18next.t("customerList.customerName"),
    dataIndex: "contactPerson",
    size: 300,
    order: 0,
    minSize: 100,
    isSystem: true,
    alwaysVisible: true,
  },
  {
    title: i18next.t("customerList.businessName"),
    dataIndex: "businessName",
    size: 300,
    order: 1,
    minSize: 100,
    isSystem: true,
    alwaysVisible: true,
  },
  {
    title: i18next.t("customerList.email"),
    dataIndex: "email",
    size: 200,
    order: 2,
    minSize: 100,
    isSystem: true,
    alwaysVisible: true,
  },
  {
    title: i18next.t("customerList.telephone"),
    dataIndex: "phone",
    size: 150,
    order: 3,
    minSize: 100,
    isSystem: true,
  },
  {
    title: i18next.t("taskCustomer.address"),
    dataIndex: "address.formatted",
    size: 400,
    order: 4,
    minSize: 100,
    isSystem: true,
  },
  {
    title: i18next.t("customerList.state"),
    dataIndex: "address.state",
    size: 150,
    order: 5,
    minSize: 100,
    isSystem: true,
  },
  {
    title: i18next.t("customerList.city"),
    dataIndex: "address.city",
    size: 150,
    order: 5,
    minSize: 100,
    isSystem: true,
  },
  {
    title: i18next.t("parasutIntegration.colTitle"),
    dataIndex: "parasutId",
    size: 150,
    minSize: 100,
    isSystem: true,
    fixedWidth: true,
  } as ColumnLayout,
  {
    title: "Actions",
    dataIndex: "actions",
    size: 100,
    minSize: 100,
    isSystem: true,
    fixedWidth: true,
  } as ColumnLayout,
];

export const productsColumns: ColumnLayout[] = [
  {
    title: i18next.t("products.productName"),
    dataIndex: "title",
    size: 300,
    order: 0,
    minSize: 100,
    isSystem: true,
    alwaysVisible: true,
  },
  {
    title: i18next.t("products.serialNumber"),
    dataIndex: "barcode",
    size: 200,
    order: 1,
    minSize: 100,
    isSystem: true,
  },
  {
    title: i18next.t("products.stockInHand"),
    dataIndex: "qty",
    size: 200,
    order: 2,
    minSize: 100,
    isSystem: true,
  },
  {
    title: i18next.t("addProduct.unit"),
    dataIndex: "unitOfMeasurement",
    size: 200,
    order: 3,
    minSize: 100,
    isSystem: true,
  },
  {
    title: i18next.t("products.purchasePrice"),
    dataIndex: "purchasePrice",
    size: 200,
    order: 4,
    minSize: 100,
    isSystem: true,
  },
  {
    title: i18next.t("products.taxRate"),
    dataIndex: "taxRate",
    size: 200,
    order: 5,
    minSize: 100,
    isSystem: true,
  },
  {
    title: i18next.t("products.salesPrice"),
    dataIndex: "unitPrice",
    size: 200,
    order: 6,
    minSize: 100,
    isSystem: true,
  },
  {
    title: i18next.t("products.tags"),
    dataIndex: "tags",
    size: 250,
    order: 7,
    minSize: 100,
    isSystem: true,
  },
  {
    title: i18next.t("products.files"),
    dataIndex: "files",
    size: 100,
    order: 8,
    minSize: 100,
    isSystem: true,
    fixedWidth: true,
  },
  {
    title: i18next.t("parasutIntegration.colTitle"),
    dataIndex: "parasutId",
    size: 150,
    minSize: 100,
    isSystem: true,
    fixedWidth: true,
  } as ColumnLayout,
  {
    title: i18next.t("products.actions"),
    dataIndex: "actions",
    size: 200,
    minSize: 100,
    isSystem: true,
    fixedWidth: true,
  } as ColumnLayout,
];

export const userColumns: ColumnLayout[] = [
  {
    title: i18next.t("employeeList.fullName"),
    dataIndex: "fullName",
    size: 300,
    order: 0,
    minSize: 100,
    isSystem: true,
    alwaysVisible: true,
  },
  {
    title: i18next.t("employeeList.email"),
    dataIndex: "email",
    size: 200,
    order: 1,
    minSize: 100,
    isSystem: true,
    alwaysVisible: true,
  },
  {
    title: i18next.t("employeeList.telephone"),
    dataIndex: "phone",
    size: 200,
    order: 2,
    minSize: 100,
    isSystem: true,
  },
  {
    title: i18next.t("employeeList.team"),
    dataIndex: "teams",
    size: 300,
    order: 3,
    minSize: 100,
    isSystem: true,
  },
  {
    title: i18next.t("employeeList.role"),
    dataIndex: "role.title",
    size: 200,
    order: 4,
    minSize: 100,
    isSystem: true,
  },
  {
    title: i18next.t("employeeList.action"),
    dataIndex: "actions",
    size: 100,
    minSize: 100,
    isSystem: true,
    fixedWidth: true,
  } as ColumnLayout,
];

export const ServiceColumns: ColumnLayout[] = [
  {
    title: i18next.t("services.serviceName"),
    dataIndex: "title",
    size: 300,
    order: 0,
    minSize: 100,
    isSystem: true,
    alwaysVisible: true,
  },
  {
    title: i18next.t("services.description"),
    dataIndex: "description",
    size: 450,
    order: 1,
    minSize: 100,
    isSystem: true,
  },
  {
    title: i18next.t("services.price"),
    dataIndex: "unitPrice",
    size: 150,
    order: 2,
    minSize: 100,
    isSystem: true,
  },
  {
    title: i18next.t("products.actions"),
    dataIndex: "actions",
    size: 130,
    minSize: 100,
    isSystem: true,
    fixedWidth: true,
  } as ColumnLayout,
];

export const warehouseColumns: ColumnLayout[] = [
  {
    title: i18next.t("warehouses.name"),
    dataIndex: "title",
    size: 300,
    order: 0,
    minSize: 100,
    isSystem: true,
    alwaysVisible: true,
  },
  {
    title: i18next.t("warehouses.assignedTo"),
    dataIndex: "assignees",
    size: 400,
    order: 1,
    minSize: 100,
    isSystem: true,
  },
  {
    title: i18next.t("parasutIntegration.colTitle"),
    dataIndex: "parasutId",
    size: 150,
    minSize: 100,
    isSystem: true,
    fixedWidth: true,
  } as ColumnLayout,
  {
    title: i18next.t("global.actions"),
    dataIndex: "actions",
    size: 150,
    minSize: 100,
    isSystem: true,
    fixedWidth: true,
  } as ColumnLayout,
];

export const feedbackColumns: ColumnLayout[] = [
  {
    title: i18next.t("feedback.points"),
    dataIndex: "completionFeedbackByCustomer.rating",
    size: 100,
    order: 0,
    minSize: 100,
    isSystem: true,
    fixedWidth: true,
    alwaysVisible: true,
  },
  {
    title: i18next.t("feedback.customer"),
    dataIndex: "customer",
    size: 350,
    order: 1,
    minSize: 100,
    isSystem: true,
  },
  {
    title: i18next.t("feedback.feedbackNote"),
    dataIndex: "completionFeedbackByCustomer.text",
    size: 400,
    order: 2,
    minSize: 100,
    isSystem: true,
  },
  {
    title: i18next.t("feedback.assignee"),
    dataIndex: "assigneeIds",
    size: 350,
    order: 3,
    minSize: 100,
    isSystem: true,
  },
  {
    title: i18next.t("taskDetail.endAt"),
    dataIndex: "endAt",
    size: 200,
    order: 4,
    minSize: 100,
    isSystem: true,
  },
  {
    title: i18next.t("feedback.smsSentAt"),
    dataIndex: "completionFeedbackByCustomer.smsSentAt",
    size: 200,
    order: 5,
    minSize: 100,
    isSystem: true,
  },
  {
    title: i18next.t("feedback.receivedAt"),
    dataIndex: "completionFeedbackByCustomer.receivedAt",
    size: 200,
    order: 6,
    minSize: 100,
    isSystem: true,
  },
  {
    title: i18next.t("feedback.smsStatus"),
    dataIndex: "completionFeedbackByCustomer.smsStatus",
    size: 150,
    order: 7,
    minSize: 100,
    isSystem: true,
  },
];

export const rfqColumns: ColumnLayout[] = [
  {
    title: i18next.t("requests.requestDate"),
    dataIndex: "createdAt",
    size: 200,
    order: 0,
    minSize: 100,
    isSystem: true,
  },
  {
    title: i18next.t("requests.customer"),
    dataIndex: "customer.businessName",
    size: 350,
    order: 1,
    minSize: 100,
    isSystem: true,
  },
  {
    title: i18next.t("requests.details"),
    dataIndex: "title",
    size: 400,
    order: 2,
    minSize: 100,
    isSystem: true,
    alwaysVisible: true,
  },
  {
    title: i18next.t("requests.status"),
    dataIndex: "status",
    size: 100,
    order: 3,
    minSize: 100,
    isSystem: true,
  },
  {
    title: i18next.t("global.actions"),
    dataIndex: "actions",
    size: 150,
    minSize: 100,
    isSystem: true,
    fixedWidth: true,
  } as ColumnLayout,
];

export const quoteColumns: ColumnLayout[] = [
  {
    title: i18next.t("quotes.date"),
    dataIndex: "createdAt",
    size: 200,
    order: 0,
    minSize: 100,
    isSystem: true,
  },
  {
    title: i18next.t("quotes.customer"),
    dataIndex: "customer.businessName",
    size: 300,
    order: 1,
    minSize: 100,
    isSystem: true,
  },
  {
    title: i18next.t("quotes.details"),
    dataIndex: "title",
    size: 400,
    order: 2,
    minSize: 100,
    isSystem: true,
    alwaysVisible: true,
  },
  {
    title: i18next.t("quotes.amount"),
    dataIndex: "stock",
    size: 150,
    order: 3,
    minSize: 100,
    isSystem: true,
  },
  {
    title: i18next.t("quotes.status"),
    dataIndex: "status",
    size: 100,
    order: 4,
    minSize: 100,
    isSystem: true,
  },
  {
    title: i18next.t("quotes.createdBy"),
    dataIndex: "createdBy.fullName",
    size: 200,
    order: 5,
    minSize: 100,
    isSystem: true,
  },
  {
    title: i18next.t("global.actions"),
    dataIndex: "actions",
    size: 150,
    minSize: 100,
    isSystem: true,
    fixedWidth: true,
  } as ColumnLayout,
];

export const invoiceColumns: ColumnLayout[] = [
  {
    title: i18next.t("invoices.invoiceNo"),
    dataIndex: "_id",
    size: 150,
    order: 0,
    minSize: 100,
    isSystem: true,
    fixedWidth: true,
  },
  {
    title: i18next.t("invoices.dueDate"),
    dataIndex: "dueAt",
    size: 200,
    order: 1,
    minSize: 100,
    isSystem: true,
  },
  {
    title: i18next.t("taskList.customer"),
    dataIndex: "customer.businessName",
    size: 300,
    order: 2,
    minSize: 100,
    isSystem: true,
  },
  {
    title: i18next.t("invoices.jobTitle"),
    dataIndex: "title",
    size: 300,
    order: 3,
    minSize: 100,
    isSystem: true,
    alwaysVisible: true,
  },
  {
    title: i18next.t("invoices.totalAmount"),
    dataIndex: "stock",
    size: 150,
    order: 4,
    minSize: 100,
    isSystem: true,
  },
  {
    title: i18next.t("invoices.status"),
    dataIndex: "status",
    size: 100,
    order: 5,
    minSize: 100,
    isSystem: true,
  },
  {
    title: i18next.t("parasutIntegration.colTitle"),
    dataIndex: "parasutId",
    size: 150,
    minSize: 100,
    isSystem: true,
    fixedWidth: true,
  } as ColumnLayout,
  {
    title: i18next.t("global.actions"),
    dataIndex: "actions",
    size: 150,
    minSize: 100,
    isSystem: true,
    fixedWidth: true,
  } as ColumnLayout,
];

export const TaskStockColumns: ColumnLayout[] = [
  {
    title: i18next.t("stock.item"),
    dataIndex: "itemId",
    alwaysVisible: true,
    isSystem: true,
    minSize: 250,
    order: 0,
    size: 300,
  },
  {
    title: i18next.t("products.serialNumber"),
    dataIndex: "barcode",
    isHidden: true,
    isSystem: true,
    minSize: 150,
    order: 1,
    size: 250,
  },
  {
    title: i18next.t("stock.qty"),
    dataIndex: "qty",
    isSystem: true,
    minSize: 100,
    order: 2,
    size: 100,
  },
  {
    title: i18next.t("stock.unitCost"),
    dataIndex: "unitPrice",
    isSystem: true,
    minSize: 100,
    order: 3,
    size: 100,
  },
  {
    title: i18next.t("stockList.KDV"),
    dataIndex: "taxPercentage",
    isSystem: true,
    minSize: 100,
    order: 4,
    size: 100,
  },
  {
    title: i18next.t("stock.cost"),
    dataIndex: "cost",
    isSystem: true,
    minSize: 100,
    order: 5,
    size: 100,
  },
];

const AllTableColumns: TableLayout = {
  tasks: taskColumns,
  customers: customerColumns,
  stockItems: productsColumns,
  users: userColumns,
  services: ServiceColumns,
  warehouses: warehouseColumns,
  feedback: feedbackColumns,
  rfq: rfqColumns,
  quotes: quoteColumns,
  invoices: invoiceColumns,
  taskStock: TaskStockColumns,
};

export default AllTableColumns;
