import { Moment } from "moment";
import { Key } from "react";
import { Frequency } from "rrule";
export interface Location {
  _id?: string;
  type: "Point";
  coordinates: number[];
  userId?: string;
}

export interface Address {
  _id?: string;
  formatted: string;
  tag?: string;
  city?: string;
  state?: string;
  location: { type: "Point"; coordinates: number[] };
  customer?: Customer;
}

export interface Customer {
  defaultAddress: Address;
  _id?: string;
  businessName: string;
  contactPerson: string;
  address: Address;
  addresses?: Address[];
  addressIds: string[];
  accountType: CustomerAccountTypes;
  fields: CustomField[];
  phone: string;
  email: string;
  createdAt: string;
  taxIdNumber?: string;
  taxOffice?: string;
}

export interface UploadedFile {
  thumbUrl?: string;
  mimeType?: string;
  url?: string;
  baseUrl?: string;
  preview?: any;
  originFileObj?: File | Blob;
  status?: any;
  response?: UploadResponse;
  _id?: string;
  originalName?: string;
  uid: string;
  size: number;
  type: string;
  name: string;
  userId?: string;
  firmId?: string;
  id?: string;
  stockItemId?: string;
}

export interface UserRole {
  _id: string;
  type: string;
  title: string;
  permissions: { [permissionName in UserPermissions]: boolean };
}

export interface Team {
  _id: string;
  title: string;
}
export interface User {
  _id: string;
  fullName: string;
  phone: string;
  email: string;
  roleId: string;
  role: UserRole;
  userId?: string;
  firmId?: string;
  teamIds: string[];
  teams: Team[];
  isSharingLocation: boolean;
  isVerified: boolean;
  /**
   * @deprecated this will soon be removed from api
   */
  assignedTaskIds: string[];
  location: Location;
  profileImgUrl: string;
  color: string;
  mapIcon: string;
  signatureImgUrl: string;

  firm?: Firm;

  createdAt?: string;
  updatedAt?: string;
}

export interface CustomFieldOption {
  _id?: string;
  label: string;
}
export interface CustomField {
  _id: string;
  label: string;
  type: CustomFieldType;
  options?: CustomFieldOption[];
  value?: any;
  rank: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskStockLine {
  _id: string;
  itemId: string;
  qty: number;
  unitPrice: number;
  taxPercentage: 0 | 1 | 8 | 18;
  purchasePrice: number;
  item: StockItem;
}

export interface StockItem {
  _id: string;
  title: string;
  type: "product" | "service";
  purchasePrice: number;
  unitPrice: number;
  taxRate: 0 | 1 | 8 | 18;
  tags: Array<string>;
  barcode: string;
  description: string;
  fields: CustomField[];
  files: UploadedFile[];
  qty: number;
  unitOfMeasurement:
    | "KG"
    | "Adet"
    | "Düzine"
    | "Kutu"
    | "Torba"
    | "Varil"
    | "Paket"
    | "Rolu"
    | "Zarf"
    | "Metre"
    | "Litre";
}

export interface RecurrenceConfig {
  freq: Frequency;
  interval: number;
  dtstart: Date;
  until?: Date | undefined;
  count?: number | undefined;
  byweekday?: WeekDayNumber[];
  bymonthday?: MonthDayNumber;
  byhour?: HourNumber[];
  byminute?: 30;
}

export declare type DiscountType = "fixed" | "%";
export interface Task {
  _id: string;
  uid?: string;
  title: string;
  endAt?: Moment;
  createdAt?: Moment;

  assigneeIds: string[];
  assignees: User[];
  completedById: string;
  createdById: string;
  createdBy: { _id: string; fullName: string };

  customerId: string;
  customer: Customer;
  addressId: string | null;
  address: Address;
  customerSignature?: { imgUrl: string; signer: string };
  /**
   * @deprecated
   */
  employeeSignature: string;

  statusId: string;
  status: TaskStatus;

  isInvoiceCreated: boolean;
  isQuoteCreated: boolean;
  isTaskCreated: boolean;
  isSubtask: boolean;
  isImgRequired: boolean;
  hideFromCustomer: boolean;
  isTemplate: boolean;

  discountType: DiscountType;
  discount: number;

  isRecurring: boolean;
  /**
   * @deprecated
   */
  recurrence: { endAt: Moment; startAt: Moment; recurrenceType: string };
  rrule: RecurrenceConfig | string;
  parentId: string;

  files?: UploadedFile[];
  stock: TaskStockLine[];
  fields: CustomField[];

  copyNotesToInvoice: boolean;
}
interface UploadResponse {
  data: any;
}

type CustomerAccountTypes = "individual" | "business";

// Feathers Types
export interface PaginatedFeathersResponse<T> {
  total: number;
  limit: number;
  skip: number;
  data: T[];
}
export interface TaskStatus {
  _id: string;
  title: string;
  category: "rfq" | "quote" | "task" | "invoice";
  color: string;
  type: "system" | "user-defined";
}

export interface FirmForms {
  invoices?: CustomField[];
  quotes?: CustomField[];
  rfq?: CustomField[];
  stockItems?: CustomField[];
  customers?: CustomField[];
  users?: CustomField[];
  taskCustomerFeedback?: CustomField[];
  tasks?: CustomField[];
  taskStock?: CustomField[];
}

export interface FirmPrintSettings {
  task: PrintFieldId[];
}

export interface StockTag {
  _id: string;
  title: string;
}
export interface Firm {
  _id: string;
  businessName: string;
  contactPerson: string;
  phone: string;
  email: string;
  logoImgUrl?: string;
  userIds: string[];
  address: Address;
  expenseCodes: ExpenseCode[];
  printSettings: FirmPrintSettings;
  currencyFormat: string;

  parasutId?: string;

  taxIdNumber?: string;
  taxOffice?: string;

  featureFlags: { [flagName in FeatureFlags]: boolean };
  completedTaskStatusId: string;
  cancelledTaskStatusId: string;
  forms?: FirmForms;
  stockTags: StockTag[];
  subscription: Subscription;

  introTourRan: boolean;
}

export interface QuoteChangeRequest {
  _id: string;
  requestText: string;
  createdAt: Moment;
  updatedAt: Moment;
}

export interface Quote {
  _id: string;
  title: string;
  uid: string;
  customerMsg: string;
  changeRequests: QuoteChangeRequest[];

  status: TaskStatus;
  statusId: string;
  isInvoiceCreated: boolean;
  isTaskCreated: boolean;

  files?: UploadedFile[];
  fields: CustomField[];
  stock: TaskStockLine[];

  discountType: DiscountType;
  discount: number;

  customer: Customer;
  customerId: string;
  addressId: string | null;
  address: Address;

  copyNotesToTask: boolean;
  copyNotesToInvoice: boolean;

  createdBy: User;
  createdAt?: Moment;
}

export interface RFQ {
  _id?: string;
  title: string;
  createdAt?: string;
  uid: string;

  dueAt: Moment;
  onSiteAssessmentInstructions: string;

  statusId: string;
  status: TaskStatus;
  isTaskCreated: boolean;
  isQuoteCreated: boolean;

  files?: UploadedFile[];
  fields: CustomField[];

  customerId: string;
  customer: Customer;
  addressId: string | null;
  address: Address;

  assignees: User[];
  assigneeIds: string[];

  preferredVisitDates: Moment[];
  preferredVisitTime: "any time" | "morning" | "afternoon" | "evening" | string;
  copyNotesToTask: boolean;
  copyNotesToQuote: boolean;

  isInvoiceCreated: boolean;
}

export interface Invoice {
  _id: string;
  title: string;
  uid: string;
  customerMsg: string;

  status: TaskStatus;
  statusId: string;

  files?: UploadedFile[];
  fields: CustomField[];
  stock: TaskStockLine[];

  discountType: DiscountType;
  discount: number;

  customer: Customer;
  customerId: string;
  addressId: string | null;
  address: Address;
  Address: Address;

  issuedAt: Moment | null;
  dueAt: Moment | null;
  createdAt: Moment;
}

export interface TaskNote {
  _id?: string;
  body: string;
  taskId: string;
  createdAt: Moment;
  updatedAt: Moment;
  createdById: string;
  user: User;
}

export interface CustomerNote {
  _id?: string;
  customerId?: string;
  createdAt?: string;
  createdBy?: User;
  body: string;
}

export interface Integration {
  _id?: string;
  apiUserName: string;
  apiUserId: string;
  apiUserPassword: string;
  type: string;
  provider: string;
  apiSender: string;
}

export interface NotificationProps {
  _id: string;
  activity: Activity;
  isRead: boolean;
  recipientId: string;
  createdAt: Moment;
  updatedAt: Moment;
}

export interface UserPreferences extends TableLayout {
  _id: string;
  firmId: string;
  userId: string;
  mapTheme: "light" | "dark";
  language: "tr" | "en";
}

export interface ExportRequest {
  _id?: string;
  serviceName: string;
  exportType: "allRecords" | "selectedRecords";
  status?: "pending" | "done";
  file?: UploadedFile;
  createdAt?: string;
  ids?: Key[];
}

export interface ChecklistItem {
  _id?: string;
  title: string;
  isDone?: boolean;
}

/**
 * Remove the bucket id from this after removing buckets
 */
export interface Checklist {
  _id?: string;
  title: string;
  items: ChecklistItem[];
  // TODO: Remove bucketId after getting rid of buckets
  //       because checklists don't have a bucket id
  bucketId: string;
}

export interface ChecklistBucket {
  _id: string;
  firmId: string;
  userId: string;
  checklists: Checklist[];
  createdAt: string;
}

export interface Subtask {
  _id: string;
  parentId?: string;
  title: string;
  isSubtask: true;
  notes: TaskNote[];
  files: UploadedFile[];
  statusId?: string;
  status: TaskStatus;
  isImgRequired?: boolean;
  isInvoiceCreated?: boolean;
  assigneeIds: string[];
  assignees: User[];
  endAt: Moment;
  rank: string;
}

export interface SubtaskItem {
  _id: string;
  title: string;
  templateId: string;
  rank: string;
}

export interface SubtaskTemplate {
  _id: string;
  title: string;
}

export type CustomFieldType =
  | "shortText"
  | "floatNumber"
  | "toggleSwitch"
  | "dropdown"
  | "date"
  | "rating"
  | "file"
  | "tags"
  | "phone"
  | "email"
  | "url"
  | "currency"
  | "percentage";

export interface CustomFormField {
  _id?: string;
  label: string;
  type: CustomFieldType;
  options: { _id: string; label: string }[];
  value: any;
}

export interface CustomForm {
  _id?: string;
  title: string;
  fields: CustomFormField[];
  bucketId: string;
}

export interface CustomFormBucket {
  _id: string;
  firmId: string;
  userId: string;
  bucketItems: CustomForm[];
  createdAt: string;
}

export interface UserIcon {
  key: string;
  svg: string;
  path: string;
  anchorX: number;
  anchorY: number;
  scale: number;
}

export type UserIcons = { [key: string]: UserIcon };

export type entitiesWithElasticSearch =
  | "customers"
  | "users"
  | "tasks"
  | "stock/items"
  | "stock/bins";

export type UserPermissions =
  | "canViewCustomers"
  | "canCreateCustomers"
  | "canCreateTasks"
  | "canRemoveTasks"
  | "canViewAllTasks"
  | "hideCompletedTasks"
  | "canCreateStock"
  | "canManageServices"
  | "canManageCompletedTasks"
  | "canEditUsers"
  | "canManageSettings"
  | "canViewReports"
  | "canManageCustomFields"
  | "canEditStockPrice"
  | "deviceLocationRequired"
  | "canManageRFQs"
  | "canManageQuotes"
  | "canManageInvoices"
  | "canManageDailyCollection"
  | "canManageFeedback"
  | "canManageAllRFQs"
  | "canChangeDueDate";

export type FeatureFlags =
  | "customerPortal"
  | "taskCompletionFeedback"
  | "extendedTasks"
  | "dailyAccounting"
  | "parasutSync";

export type AppEnv = "production" | "test" | "development";

export type TaskServiceType = "tasks" | "task/quotes" | "task/invoices";

export type WeekDayNumber = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type MonthDayNumber =
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 17
  | 18
  | 19
  | 20
  | 21
  | 22
  | 23
  | 24
  | 25
  | 26
  | 27
  | 28
  | 29
  | 30
  | 31;

export type HourNumber =
  | 0
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 17
  | 18
  | 19
  | 20
  | 21
  | 22
  | 23;

export type Bin = {
  _id: string;
  title: string;
  assigneeIds: string[];
  watcherIds: string[];
  firmId: string;
  assignees: User[];
  user: User;
  createdAt: Moment;
};

export declare type StockTransactionType =
  | "add"
  | "transfer"
  | "sale"
  | "adjust"
  | "remove";
export type StockTransaction = {
  type: StockTransactionType;
  toId: string;
  productId: string;
  _id?: string;
  fromId?: string;
  description?: string;
  createdAt: Moment;
  user: User;
  product: StockItem;
  fromBin: Bin;
  toBin: Bin;
  qty: number;
};

export type DailyExpense = {
  _id: string;
  spenderId: string;
  spender: User;
  amount: number;
  code: string;
  remarks: string;
  spentAt: Moment;
  taskId: string;
  task: Task;
};

export type ExpenseCode = {
  _id: string;
  label: string;
};

export type ActivityType =
  | "TaskCreated"
  | "TaskUpdated"
  | "TaskNoteCreated"
  | "TaskFileCreated"
  | "TaskStatusUpdated"
  | "TaskAssigneesUpdated"
  | "TaskRemoved"
  | "TaskFileRemoved"
  | "TaskNoteUpdated"
  | "TaskNoteRemoved"
  | "StockAdd"
  | "StockTransfer"
  | "StockRemove"
  | "StockAdjust"
  | "StockSale"
  | "SummaryNotification"
  | "RFQCreated"
  | "RFQUpdated"
  | "RFQRemoved"
  | "QuoteCreated"
  | "QuoteUpdated"
  | "QuoteRemoved"
  | "InvoiceCreated"
  | "InvoiceUpdated"
  | "InvoiceRemoved";

export type Activity = {
  _id: string;
  firmId: string;
  userId: string;
  createdAt: Moment;
  type: ActivityType;
  from: User;
  file?: UploadedFile;
  status?: TaskStatus;
  note?: TaskNote;
  addedAssigneeIds?: string[];
  removedAssigneeIds?: string[];
  addedAssignees?: User[];
  removedAssignees?: User[];
  task?: Task;
  rfq?: RFQ;
  quote?: Quote;
  invoice?: Invoice;
  customer?: Customer;
  product?: StockItem;
  toBin?: Bin;
  fromBin?: Bin;
  qty: number;
};

export interface Subscription {
  trialStartAt: Moment;
  trialEndAt: Moment;

  createdDate: number;
  startDate: number;
  subscriptionStatus:
    | "TRIAL"
    | "ACTIVE"
    | "PENDING"
    | "UNPAID"
    | "UPGRADED"
    | "CANCELED"
    | "EXPIRED";
  dueAt: number;
  subscribedAt: Moment;
  cancelledAt: Moment;

  userId: string;
  firmId: string;
}
export interface UserContextType {
  isOwner: boolean;
  isLoggedIn: boolean;
  user: User;
  firm: Firm;
  subscription: Subscription;
  hasFeature: (feature: FeatureFlags) => boolean;
  hasPermission: (permission: UserPermissions) => boolean;
  userPreferences: UserPreferences;

  tableSettings: TableLayout;
  updateUserPreferences: (
    table: Partial<UserPreferences>,
    reload?: boolean,
  ) => Promise<UserPreferences>;
}

export declare type AutomationCause = "taskCreated" | "taskStatusUpdated";
export declare type AutomationAction =
  | "sendTaskAssigneesTrackingURL"
  | "sendNPSMsg"
  | "informSomeone";
export interface Automation {
  _id: string;
  trigger: AutomationCause;
  statusId: string;
  status: TaskStatus;
  actionToPerform: AutomationAction;
  sendToAssignees: boolean;
  sendToCustomer: boolean;
  sendToCreator: boolean;
  otherRecipientIds: string[];
  isPaused: boolean;
  msgTemplate: string;
  firmId: string;
  userId: string;
}

export interface AutomationHistory {
  automationId: string;
  taskId: string;
  msgText: string;
  status: "success" | "pending" | "error";
  firmId: string;
  userId: string;
  createdAt: Moment;
}

export interface LocationData {
  coordinates: [number, number];
  user: User;
}
export interface LocationTrackingData {
  businessName: string;
  locations: LocationData[];
}

export interface PrintData extends Task {
  subtasks: Subtask[];
  checklists: ChecklistBucket[];
  forms: CustomFormBucket[];
  firm: Firm;
  notes: TaskNote[];
}

export declare type PrintFieldId =
  | "title"
  | "customer"
  | "dueDate"
  | "assignees"
  | "taskId"
  | "status"
  | "stock"
  | "remarks"
  | "images"
  | "checklists"
  | "subtasks"
  | "forms"
  | "notes"
  | "signatures";

export interface PrintField {
  _id: PrintFieldId;
  label: string;
  shouldPrint: boolean;
}

export interface StockLevel {
  _id: string;
  productId: string;
  product: StockItem;
  qty: number;
  binId: string;
  firmId: string;
  userId: string;
}

export declare type TableName =
  | "tasks"
  | "customers"
  | "stockItems"
  | "users"
  | "services"
  | "warehouses"
  | "feedback"
  | "rfq"
  | "quotes"
  | "invoices"
  | "taskStock";

export interface ColumnLayout {
  dataIndex: string;
  size: number;
  order: number;
  title: string;
  minSize: number;
  isHidden?: boolean;
  isSystem: boolean;
  alwaysVisible?: boolean;
  fixedWidth?: boolean;
}

export interface TableLayout
  extends Partial<Record<TableName, ColumnLayout[]>> {}

interface RevenueReportItem {
  income: number;
  expense: number;
  fullName: string;
  userId: string;
}
export interface RevenueReport {
  income: number;
  expense: number;
  items: RevenueReportItem[];
  date: string;
}
