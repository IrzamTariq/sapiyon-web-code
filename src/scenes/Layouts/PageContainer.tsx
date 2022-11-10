import React, { CSSProperties, ReactNode } from "react";

interface PageContainerProps {
  children: ReactNode;
  containerStyle?: CSSProperties;
  showNavbar?: boolean;
  onScroll?: (event: any) => void;
}
const PageContainer = ({
  containerStyle,
  showNavbar = true,
  children,
  ...restProps
}: PageContainerProps) => {
  return (
    <div
      className="tw-bg-gray-200 tw-p-4"
      style={{
        ...containerStyle,
        marginTop: showNavbar ? "64px" : "0px",
        overflowY: "auto",
      }}
      {...restProps}
    >
      {children}
    </div>
  );
};

export default PageContainer;
