import React, { useEffect } from "react";
import { Spin } from "antd";
import { RouteComponentProps, withRouter } from "react-router-dom";
import client from "../../../services/client";
import {
  doLogoutSuccess,
  doLogoutError,
} from "./../../../store/auth/authentication";
import { connect } from "react-redux";
import mixpanel from "analytics/mixpanel";

interface LogoutProps extends RouteComponentProps {
  doLogoutSuccess: () => void;
  doLogoutError: () => void;
}

function Logout({ doLogoutSuccess, doLogoutError, history }: LogoutProps) {
  useEffect(() => {
    client
      .logout()
      .then(() => {
        mixpanel.track("Logout");
        doLogoutSuccess();
        history.push("/login");
        window.location.reload();
      })
      .catch(() => doLogoutError());

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <div className="tw-h-screen tw-flex">
        <div className="tw-m-auto">
          <Spin />
        </div>
      </div>
    </div>
  );
}

const Routed = withRouter(Logout);
export default connect(null, { doLogoutSuccess, doLogoutError })(Routed);
