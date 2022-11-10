import { LoadScript } from "@react-google-maps/api";
import React from "react";

import { useNetworkStatus } from "../../contexts/network.context";
import { isEnv } from "../../utils/helpers";

const libraries = ["places"];

const GoogleMapLoader: React.FunctionComponent = ({ children }) => {
  const networkStatus = useNetworkStatus();
  if (!isEnv("production") && networkStatus === "offline") {
    return <>{children}</>;
  }
  return (
    <LoadScript
      libraries={libraries}
      id="script-loader"
      googleMapsApiKey={"AIzaSyCEmExCIKFfpZwt9uF9waus3MDACGmcKJg"}
    >
      {children}
    </LoadScript>
  );
};

export default GoogleMapLoader;
