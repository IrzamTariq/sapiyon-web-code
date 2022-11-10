import moment from "moment";
import React from "react";
import { Redirect, Route } from "react-router-dom";

// import NavBar from "./components/Layouts/Header/Navbar";
import UserContext from "./UserContext";

export default function ProtectedRoute({
  component: Component,
  auth,
  requiredPermission,
  requiredFeature,
  isOwnerOnly,
  ...restProps
}) {
  return (
    <UserContext.Consumer>
      {({
        isLoggedIn,
        hasPermission,
        hasFeature,
        isOwner,
        subscription: { trialEndAt, subscriptionStatus = "", dueAt },
      }) => (
        <Route
          {...restProps}
          render={(props) => {
            //TODO: check for tenure
            let trialExpired = moment().isAfter(moment(trialEndAt), "day");
            // if trial is expired redirect to subscription page
            if (
              ((subscriptionStatus === "TRIAL" && trialExpired) ||
                subscriptionStatus === "CANCELLED") &&
              !(restProps.path || "").includes("/trial-expired") &&
              !(restProps.path || "").includes("/employees")
            ) {
              return <Redirect to="/trial-expired" />;
            }
            if (
              subscriptionStatus === "UNPAID" &&
              (moment().diff(moment(new Date(dueAt)), "day") || 0) > 7 &&
              !(restProps.path || "").includes("/unpaid") &&
              !(restProps.path || "").includes("/employees")
            ) {
              return <Redirect to="/unpaid" />;
            }
            if (
              !isLoggedIn &&
              !(
                props.match.url.startsWith("/f/") ||
                props.match.url.includes("/get-rating") ||
                props.match.url.includes("/feedback-success") ||
                props.match.url.includes("/track/")
              )
            ) {
              // if user not logged in redirect to login page
              return <Redirect to="/login" />;
            }

            // if path reservered for owners only then check if user is owner
            if (isOwnerOnly && !isOwner) {
              return <Redirect to="/" />;
            }

            // if path requires feature flag then check if required feature is enabled
            if (
              requiredFeature &&
              typeof hasFeature(requiredFeature) === "boolean" &&
              !hasFeature(requiredFeature)
            ) {
              return <Redirect to="/" />;
            }

            // if path requires permissions then check if user has required permission
            if (requiredPermission && !hasPermission(requiredPermission)) {
              //TODO: add message to let user know that they need permission
              return <Redirect to="/" />;
            }

            return <Component {...props} />;
          }}
        ></Route>
      )}
    </UserContext.Consumer>
  );
}
