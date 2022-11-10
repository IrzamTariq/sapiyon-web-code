import React, { Component } from "react";
import { Route, RouteComponentProps } from "react-router-dom";

import UserContext from "../UserContext";
import getUserProfile from "../utils/analytics/getUserProfile";
import mixpanel from "./mixpanel";

interface GAProps extends RouteComponentProps {
  options: any;
}

class MixpanelAnalytics extends Component<GAProps> {
  static contextType = UserContext;
  componentDidMount() {
    this.logPageChange(
      this.props.location.pathname,
      this.props.location.search,
    );

    const { user } = this.context;

    mixpanel.identify(user._id);
    mixpanel.people.set(getUserProfile(user));
  }

  componentDidUpdate({ location: prevLocation }: GAProps) {
    const {
      location: { pathname, search },
    } = this.props;
    const isDifferentPathname = pathname !== prevLocation.pathname;
    const isDifferentSearch = search !== prevLocation.search;

    if (isDifferentPathname || isDifferentSearch) {
      this.logPageChange(pathname, search);
    }
  }

  logPageChange(pathname: string, search = "") {
    mixpanel.track(`pagevisit`);
  }

  render() {
    return null;
  }
}

const RouteTracker = () => <Route component={MixpanelAnalytics} />;

const init = (options = {}) => {
  return process.env.REACT_APP_ENV === "production";
};

const MixpanelAnalyticsInit = {
  RouteTracker,
  init,
};

export default MixpanelAnalyticsInit;
