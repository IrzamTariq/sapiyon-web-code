import "./App.scss";

import React, { lazy } from "react";
import { Route, Switch } from "react-router-dom";
import BuildInfo from "scenes/BuildInfo/BuildInfo";
import Iframes from "scenes/Iframes";

import LoginPage from "./components/auth/components/LoginPage";
import Logout from "./components/auth/components/Logout";
import CustomerList from "./components/customers/index";
import ErrorPage from "./components/error-page/ErrorPage";
import EmployeeList from "./components/users/UserList/UserList";
import ProtectedRoute from "./ProtectedRoute";
import Dashboard from "./scenes/Dashboard";
import Invoices from "./scenes/Invoices";
import Notifications from "./scenes/Notifications/";
import Quotes from "./scenes/Quotations";
import Requests from "./scenes/RFQs/index";
import ProductsContainer from "./scenes/Stock";
import Services from "./scenes/Stock/services";
import TaskCalendarContainer from "./scenes/Tasks/TaskCalendar";
import MainTasksContainer from "./scenes/Tasks/TaskList";
import TaskMapContainer from "./scenes/Tasks/TaskMap";

const SignupPage = lazy(() =>
  import("./components/auth/components/SignupPage"),
);
const SignupPendingPage = lazy(() =>
  import("./components/auth/components/SignupPendingPage"),
);

const VerifyAccount = lazy(() =>
  import("./components/auth/components/VerifyAccount"),
);

const ForgetPasswordPage = lazy(() =>
  import("./components/auth/components/ForgetPasswordPage"),
);
const ResetPassword = lazy(() =>
  import("./components/auth/components/ResetPassword"),
);

const JobsReportByDate = lazy(() =>
  import("./components/reports/JobsReports/byDate"),
);
const JobsReportByStatus = lazy(() =>
  import("./components/reports/JobsReports/byStatus"),
);
const JobsReportByUsers = lazy(() =>
  import("./components/reports/JobsReports/byUsers"),
);
const JobsReportByCustomers = lazy(() =>
  import("./components/reports/JobsReports/byCustomers"),
);
const CustomerReportsByLocation = lazy(() =>
  import("./components/reports/CustomerReports/byLocation"),
);
const ServiceReportsGeneral = lazy(() =>
  import("./components/reports/ServiceReports/general"),
);
const ServiceReportsByDate = lazy(() =>
  import("./components/reports/ServiceReports/byDate"),
);
const ProductsReportsGeneral = lazy(() =>
  import("./components/reports/ProductsReports/general"),
);
const ProductsReportsByWarehouse = lazy(() =>
  import("./components/reports/ProductsReports/byWarehouse"),
);
const ProductsReportsByDate = lazy(() =>
  import("./components/reports/ProductsReports/byDate"),
);
const FirmStatus = lazy(() => import("./scenes/Settings/CustomStatuses"));
const FirmExpenseCodes = lazy(() => import("./scenes/Settings/ExpenseCodes"));
const Teams = lazy(() => import("./components/settings/Teams/FirmTeams"));
const Roles = lazy(() => import("./components/settings/Teams/FirmRoles"));
const Permissions = lazy(() =>
  import("./components/settings/Teams/FirmRolePermissions"),
);
const BusinessProfile = lazy(() =>
  import("./components/settings/Account/FirmBusinessProfile"),
);
const Password = lazy(() =>
  import("./components/settings/Account/FirmPassword"),
);
const CurrentBillingPlan = lazy(() =>
  import("./components/settings/Billing/CurrentPlan"),
);
// const BillingHistory = lazy(() =>
//   import("./components/settings/Billing/BillingHistory"),
// );
const ViewSettings = lazy(() =>
  import("./components/settings/AppSettings/View"),
);
const GeneralSettings = lazy(() =>
  import("./components/settings/AppSettings/General"),
);

const TrialExpired = lazy(() =>
  import("./scenes/Subscription/components/DOSViews/TrialExpired"),
);
const TaskPDF = lazy(() =>
  import(
    "./scenes/Tasks/TaskEdit/Components/TaskDrawerHeader/Components/PDF/TaskPDFPreview"
  ),
);
const Feedback = lazy(() => import("./scenes/FeedBack"));
const FeedbackWelcome = lazy(() =>
  import("./scenes/FeedBack/components/GettingFeedback/Welcome"),
);
const GetFeedback = lazy(() =>
  import("./scenes/FeedBack/components/GettingFeedback/GetFeedback"),
);
const ThankFeedback = lazy(() =>
  import("./scenes/FeedBack/components/GettingFeedback/ThankFeedback"),
);
const PDFPreview = lazy(() => import("./scenes/PDF/index"));
const Expenses = lazy(() => import("./scenes/Expenses"));
const SMSIntegration = lazy(() =>
  import("./scenes/Settings/Integrations/SMSIntegration"),
);
const ParasutIntegration = lazy(() =>
  import("./scenes/Settings/Integrations/Parasut"),
);
const SubscriptionUnpaid = lazy(() =>
  import("scenes/Subscription/components/DOSViews/Unpaid"),
);
const Automation = lazy(() => import("scenes/Settings/Automations"));
const LocationTracking = lazy(() => import("scenes/LocationTracking"));

function Main() {
  return (
    <Switch>
      <Route exact path="/login" component={LoginPage} />
      <Route exact path="/logout" component={Logout} />
      <Route exact path="/forget-password" component={ForgetPasswordPage} />
      <Route
        exact
        path="/reset-password/:_id/:resetToken"
        component={ResetPassword}
      />
      <Route exact path="/signup" component={SignupPage} />
      <Route exact path="/build" component={BuildInfo} />
      <Route
        exact
        path="/signup-pending/:email"
        component={SignupPendingPage}
      />
      <Route
        exact
        path="/verify-account/:_id/:verifyToken"
        component={VerifyAccount}
      />
      <Route exact path="/print/:type/:id" component={PDFPreview} />
      <ProtectedRoute exact path="/iframes" component={Iframes} />
      <ProtectedRoute
        exact
        requiredPermission={"canEditUsers"}
        path="/employees"
        component={EmployeeList}
      />
      <ProtectedRoute
        exact
        path="/customers"
        requiredPermission={"canViewCustomers"}
        component={CustomerList}
      />
      <ProtectedRoute
        exact
        path="/products"
        requiredPermission={"canCreateStock"}
        component={ProductsContainer}
      />
      <ProtectedRoute
        exact
        path="/services"
        requiredPermission={"canManageServices"}
        component={Services}
      />
      <ProtectedRoute exact path="/reports" component={JobsReportByDate} />
      <ProtectedRoute
        exact
        requiredPermission={"canViewReports"}
        path="/reports/jobs/by-date"
        component={JobsReportByDate}
      />
      <ProtectedRoute
        exact
        requiredPermission={"canViewReports"}
        path="/reports/jobs/by-status"
        component={JobsReportByStatus}
      />
      <ProtectedRoute
        exact
        requiredPermission={"canViewReports"}
        path="/reports/jobs/by-users"
        component={JobsReportByUsers}
      />
      <ProtectedRoute
        exact
        requiredPermission={"canViewReports"}
        path="/reports/jobs/by-customers"
        component={JobsReportByCustomers}
      />
      <ProtectedRoute
        exact
        requiredPermission={"canViewReports"}
        path="/reports/customers/by-location"
        component={CustomerReportsByLocation}
      />
      <ProtectedRoute
        exact
        requiredPermission={"canViewReports"}
        path="/reports/services/general"
        component={ServiceReportsGeneral}
      />
      <ProtectedRoute
        exact
        requiredPermission={"canViewReports"}
        path="/reports/services/by-date"
        component={ServiceReportsByDate}
      />
      <ProtectedRoute
        exact
        requiredPermission={"canViewReports"}
        path="/reports/products/general"
        component={ProductsReportsGeneral}
      />
      <ProtectedRoute
        exact
        requiredPermission={"canViewReports"}
        path="/reports/products/by-warehouse"
        component={ProductsReportsByWarehouse}
      />
      <ProtectedRoute
        exact
        requiredPermission={"canViewReports"}
        path="/reports/products/by-date"
        component={ProductsReportsByDate}
      />
      <ProtectedRoute exact path="/task-list" component={MainTasksContainer} />
      <ProtectedRoute
        exact
        path="/task-calendar"
        component={TaskCalendarContainer}
      />
      <ProtectedRoute exact path="/task-map" component={TaskMapContainer} />
      <ProtectedRoute
        exact
        requiredPermission={"canManageSettings"}
        path="/settings"
        component={FirmStatus}
      />
      <ProtectedRoute
        exact
        requiredPermission={"canManageSettings"}
        path="/settings/expense-codes"
        component={FirmExpenseCodes}
      />
      <ProtectedRoute
        exact
        requiredPermission={"canManageSettings"}
        path="/settings/team/teams"
        component={Teams}
      />
      <ProtectedRoute
        exact
        requiredPermission={"canManageSettings"}
        path="/settings/team/roles"
        component={Roles}
      />
      <ProtectedRoute
        exact
        requiredPermission={"canManageSettings"}
        path="/settings/team/permissions"
        component={Permissions}
      />
      <ProtectedRoute
        exact
        requiredPermission={"canManageSettings"}
        path="/settings/account/business-profile"
        component={BusinessProfile}
      />
      <ProtectedRoute
        exact
        requiredPermission={"canManageSettings"}
        path="/settings/account/password-reset"
        component={Password}
      />
      <ProtectedRoute
        exact
        requiredPermission={"canManageSubscription"}
        path="/settings/billing/current-plan"
        component={CurrentBillingPlan}
      />
      <ProtectedRoute
        exact
        requiredPermission={"canManageSettings"}
        path="/settings/app/view"
        component={ViewSettings}
      />
      <ProtectedRoute
        exact
        requiredPermission={"canManageSettings"}
        path="/settings/app/general"
        component={GeneralSettings}
      />
      <ProtectedRoute
        exact
        requiredPermission={"canManageSettings"}
        path="/settings/integrations/sms"
        component={SMSIntegration}
      />
      <ProtectedRoute
        exact
        requiredPermission={"canManageSettings"}
        path="/settings/integrations/parasut"
        component={ParasutIntegration}
      />
      <ProtectedRoute exact path="/dashboard" component={Dashboard} />
      <ProtectedRoute exact path="/trial-expired" component={TrialExpired} />
      <ProtectedRoute exact path="/unpaid" component={SubscriptionUnpaid} />
      <ProtectedRoute exact path="/notifications" component={Notifications} />
      <ProtectedRoute exact path="/task-pdf-preview" component={TaskPDF} />
      <ProtectedRoute
        exact
        requiredPermission={"canManageFeedback"}
        requiredFeature="taskCompletionFeedback"
        path="/feedback"
        component={Feedback}
      />
      <ProtectedRoute exact path="/f/:id" component={FeedbackWelcome} />
      <ProtectedRoute exact path="/get-rating/:id" component={GetFeedback} />
      <ProtectedRoute
        exact
        path="/feedback-success"
        component={ThankFeedback}
      />
      <ProtectedRoute
        exact
        requiredFeature="extendedTasks"
        requiredPermission="canManageRFQs"
        path="/rfqs"
        component={Requests}
      />
      <ProtectedRoute
        exact
        requiredFeature="extendedTasks"
        requiredPermission="canManageQuotes"
        path="/quotes"
        component={Quotes}
      />
      <ProtectedRoute
        exact
        requiredFeature="extendedTasks"
        path="/invoices"
        component={Invoices}
      />
      <ProtectedRoute
        exact
        path="/pdf-preview/:type/:id"
        component={PDFPreview}
      />
      <ProtectedRoute
        exact
        path="/accounting"
        component={Expenses}
        requiredFeature={"dailyAccounting"}
      />
      <ProtectedRoute
        exact
        path="/settings/automations"
        component={Automation}
        requiredPermission="canManageSettings"
      />
      <ProtectedRoute exact path="/track/:uid" component={LocationTracking} />
      <ProtectedRoute exact path="/" component={Dashboard} />
      <ProtectedRoute path="*" component={ErrorPage} />
    </Switch>
  );
}

export default Main;
