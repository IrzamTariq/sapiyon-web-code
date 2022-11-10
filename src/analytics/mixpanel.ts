import logger from "logger";
import mixpanel from "mixpanel-browser";

function mixpanelClient() {
  let mixpanelCode: string | undefined = "";
  if (process.env.REACT_APP_ENV === "production") {
    logger.info("tracker initiating in production");
    mixpanelCode = process.env.REACT_APP_MIXPANEL_TOKEN_PRODUCTION;
  } else {
    logger.info("tracker initiating in development");
    mixpanelCode = process.env.REACT_APP_MIXPANEL_TOKEN_DEVELOPMENT;
  }

  if (!mixpanelCode) {
    throw new Error("Invalid MIXPANEL_TOKEN");
  }

  mixpanel.init(mixpanelCode);
  logger.info("tracker initiated");
  return mixpanel;
}

const client = mixpanelClient();

export default client;
