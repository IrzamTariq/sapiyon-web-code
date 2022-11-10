import client from "./client";

export const USER_SERVICE_PATH = "users";
export const DEMO_SERVICE_PATH = "demo-data";
export const USER_LOCATION_SERVICE_PATH = "user/locations";
export const CUSTOMER_SERVICE_PATH = "customers";
export const IMPORT_CUSTOMER_SERVICE_PATH = "import/customers";
export const FIRM_SERVICE_PATH = "firms";
export const TASK_STATUS_SERVICE_PATH = "firm/task-status";
export const FIRM_ROLE_SERVICE_PATH = "firm/roles";
export const FIRM_TEAM_SERVICE_PATH = "firm/teams";
export const TASK_SERVICE_PATH = "tasks";
export const TASK_NOTE_SERVICE_PATH = "task/notes";
export const TASK_FILES_SERVICE_PATH = "task/files";
export const TASK_RECEIPT_SERVICE_PATH = "task/receipts";
export const CHECKLIST_TEMPLATE_SERVICE_PATH = "templates/checklists";
export const SUBTASK_TEMPLATE_SERVICE_PATH = "templates/subtasks";
export const SUBTASK_TEMPLATE_ITEMS_SERVICE_PATH = "templates/subtask-items";
export const CHECKLIST_SERVICE_PATH = "task/checklists";
export const CUSTOM_FORM_TEMPLATE_SERVICE_PATH = "templates/forms";
export const NOTIFICATION_SERVICE_PATH = "notifications";

export const UPLOAD_SERVICE_PATH = "uploads";

export const STOCK_ITEM_SERVICE_PATH = "stock/items";
export const STOCK_BIN_SERVICE_PATH = "stock/bins";
export const STOCK_LEVEL_SERVICE_PATH = "stock/levels";
export const STOCK_TRANSACTION_SERVICE_PATH = "stock/transactions";

export const SUBSCRIPTION_SERVICE_PATH = "billing/subscriptions";
export const SUBSCRIPTION_TRANSACTION_SERVICE_PATH = "billing/transactions";
export const CUSTOM_FORM_SERVICE_PATH = "task/forms";
export const CUSTOMER_ACTIONS_SERVICE_PATH = "customer/actions";
export const USER_PREFERENCES_SERVICE_PATH = "user/preferences";
export const CUSTOMER_SIGNUP_SERVICE_PATH = "customer/signup";
export const CUSTOMER_LOGIN_SERVICE_PATH = "customer/authentication";
export const INVOICE_SERVICE_PATH = "task/invoices";
export const RFQ_SERVICE_PATH = "task/rfqs";
export const QUOTE_SERVICE_PATH = "task/quotes";
export const PDF_SERVICE_PATH = "task/print";
export const REVENUE_SERVICE_PATH = "accounting/reports";
export const EXPENSES_SERVICE_PATH = "accounting/expenses";
export const COLLECTIONS_SERVICE_PATH = "accounting/collections";
export const PAYMENT_SERVICE_PATH = "task/payments";
export const ACCOUNTING_NOTES_SERVICE_PATH = "accounting/notes";
export const ACCOUNTING_FILES_SERVICE_PATH = "accounting/files";
export const CUSTOMER_ADDRESSES_SERVICE_PATH = "customer/addresses";
export const CUSTOMER_FILES_SERVICE_PATH = "customer/files";
export const CUSTOMER_NOTES_SERVICE_PATH = "customer/notes";
export const FIRM_INTEGRATION_SERVICE_PATH = "firm/integrations";
export const SMS_SERVICE_PATH = "sms";
export const ELASTIC_SEARCH_PATH = "search";
export const TASK_ACTIVITIES_SERVICE_PATH = "activities";
export const TASK_IMPORTS_SERVICE_PATH = "task/imports";
export const AUTOMATIONS_SERVICE_PATH = "automations";
export const AUTOMATIONS_HISTORY_SERVICE_PATH = "automation/runs";
export const LOCATION_TRACKING_SERVICE_PATH = "trackers";
export const PASSWORD_RESET_SERVICE_PATH = "user/reset-password";
export const PASSWORD_TOKEN_SERVICE_PATH = "parasut/tokens";
export const PRODUCT_FILES_SERVICE_PATH = "stock/files";

export const UserService = client.service(USER_SERVICE_PATH);
export const DemoService = client.service(DEMO_SERVICE_PATH);
export const UserLocationService = client.service(USER_LOCATION_SERVICE_PATH);
export const CustomerService = client.service(CUSTOMER_SERVICE_PATH);

export const TaskService = client.service(TASK_SERVICE_PATH);
export const TaskReceiptService = client.service(TASK_RECEIPT_SERVICE_PATH);
export const TaskStatusService = client.service(TASK_STATUS_SERVICE_PATH);
export const TaskNoteService = client.service(TASK_NOTE_SERVICE_PATH);
export const TaskFileService = client.service(TASK_FILES_SERVICE_PATH);
export const UploadService = client.service(UPLOAD_SERVICE_PATH);
export const FirmTeamService = client.service(FIRM_TEAM_SERVICE_PATH);
export const FirmRoleService = client.service(FIRM_ROLE_SERVICE_PATH);
export const FirmService = client.service(FIRM_SERVICE_PATH);
export const NotificationService = client.service(NOTIFICATION_SERVICE_PATH);
export const ChecklistTemplateService = client.service(
  CHECKLIST_TEMPLATE_SERVICE_PATH,
);
export const SubtaskTemplateService = client.service(
  SUBTASK_TEMPLATE_SERVICE_PATH,
);
export const SubtaskTemplateItemsService = client.service(
  SUBTASK_TEMPLATE_ITEMS_SERVICE_PATH,
);
export const CustomFormTemplateService = client.service(
  CUSTOM_FORM_TEMPLATE_SERVICE_PATH,
);
export const ChecklistService = client.service(CHECKLIST_SERVICE_PATH);
export const CustomFormService = client.service(CUSTOM_FORM_SERVICE_PATH);

// stock related services
export const StockItemService = client.service(STOCK_ITEM_SERVICE_PATH);
export const StockBinService = client.service(STOCK_BIN_SERVICE_PATH);
export const StockLevelService = client.service(STOCK_LEVEL_SERVICE_PATH);
export const StockTransactionService = client.service(
  STOCK_TRANSACTION_SERVICE_PATH,
);
export const CustomerActionsService = client.service(
  CUSTOMER_ACTIONS_SERVICE_PATH,
);
export const UserPreferencesService = client.service(
  USER_PREFERENCES_SERVICE_PATH,
);

// import services
export const ImportCustomerService = client.service(
  IMPORT_CUSTOMER_SERVICE_PATH,
);

// subscription services
export const SubscriptionService = client.service(SUBSCRIPTION_SERVICE_PATH);
export const CustomerSignupService = client.service(
  CUSTOMER_SIGNUP_SERVICE_PATH,
);
export const CustomerLoginService = client.service(CUSTOMER_LOGIN_SERVICE_PATH);
export const SubscriptionTransactionService = client.service(
  SUBSCRIPTION_TRANSACTION_SERVICE_PATH,
);
export const InvoiceService = client.service(INVOICE_SERVICE_PATH);
export const RFQService = client.service(RFQ_SERVICE_PATH);
export const QuoteService = client.service(QUOTE_SERVICE_PATH);
export const PDFService = client.service(PDF_SERVICE_PATH);
export const RevenueService = client.service(REVENUE_SERVICE_PATH);
export const ExpensesService = client.service(EXPENSES_SERVICE_PATH);
export const CollectionsService = client.service(COLLECTIONS_SERVICE_PATH);
export const PaymentService = client.service(PAYMENT_SERVICE_PATH);
export const AccountingNotesService = client.service(
  ACCOUNTING_NOTES_SERVICE_PATH,
);
export const AccountingFilesService = client.service(
  ACCOUNTING_FILES_SERVICE_PATH,
);
export const CustomerAddressesService = client.service(
  CUSTOMER_ADDRESSES_SERVICE_PATH,
);
export const CustomerFilesService = client.service(CUSTOMER_FILES_SERVICE_PATH);
export const CustomerNotesService = client.service(CUSTOMER_NOTES_SERVICE_PATH);
export const FirmIntegrationService = client.service(
  FIRM_INTEGRATION_SERVICE_PATH,
);
export const SMSService = client.service(SMS_SERVICE_PATH);
export const ElasticSearch = client.service(ELASTIC_SEARCH_PATH);
export const TaskActivitiesService = client.service(
  TASK_ACTIVITIES_SERVICE_PATH,
);

export const TaskImportService = client.service(TASK_IMPORTS_SERVICE_PATH);
export const AutomationsService = client.service(AUTOMATIONS_SERVICE_PATH);
export const AutomationsHistoryService = client.service(
  AUTOMATIONS_HISTORY_SERVICE_PATH,
);
export const LocationTrackingService = client.service(
  LOCATION_TRACKING_SERVICE_PATH,
);
export const PasswordResetService = client.service(PASSWORD_RESET_SERVICE_PATH);
export const ParasutTokenService = client.service(PASSWORD_TOKEN_SERVICE_PATH);
export const StockFilesService = client.service(PRODUCT_FILES_SERVICE_PATH);
