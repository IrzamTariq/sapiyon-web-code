import React, { useContext, useState, useEffect } from "react";

type NetworkStatusType = "online" | "offline";

const NetworkStatus = React.createContext<NetworkStatusType | undefined>(
  undefined,
);

const useNetworkStatus = () => {
  const networkStatus = useContext(NetworkStatus);
  if (networkStatus === undefined) {
    throw new Error(
      "useNetworkStatus should be used be under NetworkStatusProvider only",
    );
  }

  return networkStatus;
};

const NetworkStatusProvider: React.FunctionComponent = ({ children }) => {
  const [networkStatus, setNetworkStatus] = useState<
    NetworkStatusType | undefined
  >(navigator.onLine ? "online" : "offline");
  const handleOnline = () => setNetworkStatus("online");
  const handleOffline = () => setNetworkStatus("offline");

  useEffect(() => {
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <NetworkStatus.Provider value={networkStatus}>
      {children}
    </NetworkStatus.Provider>
  );
};

export { useNetworkStatus, NetworkStatusProvider };
