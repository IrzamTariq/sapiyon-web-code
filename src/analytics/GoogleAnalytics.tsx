import React, { Component } from "react";
import ReactGA from "react-ga";
import { Route, RouteComponentProps } from "react-router-dom";
import UserContext from "UserContext";

interface GAProps extends RouteComponentProps {
  options: any;
}

class GoogleAnalytics extends Component<GAProps> {
  static contextType = UserContext;
  componentDidMount() {
    this.logPageChange(
      this.props.location.pathname,
      this.props.location.search,
    );
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
    const { user } = this.context;
    const page = pathname + search;
    const { location } = window;
    ReactGA.set({
      page,
      location: `${location.origin}${page}`,
      userId: user._id,
    });
    ReactGA.pageview(page);
  }

  render() {
    return null;
  }
}

const RouteTracker = () => <Route component={GoogleAnalytics} />;

const init = (options = {}) => {
  const isGAEnabled = process.env.REACT_APP_ENV === "production";

  if (isGAEnabled) {
    ReactGA.initialize("UA-124162177-6", options);
  }

  return isGAEnabled;
};

const GoogleAnalyticsInit = {
  GoogleAnalytics,
  RouteTracker,
  init,
};

export default GoogleAnalyticsInit;
