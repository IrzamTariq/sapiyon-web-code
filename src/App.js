import "./App.scss";

import React from "react";
import { SapiyonGuideWrapper } from "scenes/Onboarding";

import GA from "./analytics/GoogleAnalytics";
import Mixpanel from "./analytics/MixpanelAnalytics";
import Main from "./Main";
import { UserContextWrapper } from "./UserContext";

function App() {
  return (
    <UserContextWrapper>
      {GA.init() && <GA.RouteTracker />}
      {Mixpanel.init() && <Mixpanel.RouteTracker />}
      {/* <UserContext.Consumer>
        {({ userPreferences = {}, user = {} }) => {
          const userLang = userPreferences.language;
          const currLang = i18next.language;
          if (!!userLang && userLang !== currLang) {
            i18next.changeLanguage(userLang).catch(
              (e) => console.log("Error in changing language: ", e),
            );
          }
          return <Main />;
        }}
    </UserContext.Consumer> */}
      <SapiyonGuideWrapper>
        <Main />
      </SapiyonGuideWrapper>
    </UserContextWrapper>
  );
}

export default App;
