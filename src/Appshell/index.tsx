import { Layout } from "antd";
import VerifyEmailRibbon from "components/Layouts/VerifyEmailRibbon";
import React, { ReactNode, UIEventHandler, useContext, useState } from "react";
import { UserContextType } from "types";
import UserContext from "UserContext";

import MainHeader from "./MainHeader";
import MainSideMenu from "./MainSideMenu";

const { Sider, Header, Content } = Layout;
interface AppshellProps {
  children: ReactNode;
  hideSideMenu?: boolean;
  activeLink: [string, string];
  onScroll?: UIEventHandler<HTMLDivElement>;
}

const Appshell = ({
  children,
  hideSideMenu = false,
  activeLink = ["", ""],
  onScroll = () => null,
}: AppshellProps) => {
  const isMenuCollapsed = localStorage.getItem("menuStatus") === "collapsed";
  const { isOwner, user } = useContext(UserContext) as UserContextType;
  const [state, setState] = useState({
    isCollapsed: isMenuCollapsed,
  });
  const { isCollapsed } = state;

  return (
    <Layout
      hasSider={!hideSideMenu}
      style={{ height: "100vh", overflow: "hidden" }}
    >
      {!hideSideMenu ? (
        <Sider
          collapsible
          collapsed={isCollapsed}
          onCollapse={(isCollapsed) => {
            localStorage.setItem(
              "menuStatus",
              isCollapsed ? "collapsed" : "open",
            );
            setState((old) => ({ ...old, isCollapsed }));
          }}
          onClick={() => null}
          className="tw-h-full"
          style={{ backgroundColor: "#212121" }}
        >
          <MainSideMenu isCollapsed={isCollapsed} activeLink={activeLink} />
        </Sider>
      ) : null}
      <Layout hasSider={false} className="tw-bg-white tw-h-full">
        {!hideSideMenu ? (
          <>
            <Header className="tw-bg-white tw-border-b tw-px-2 md:tw-px-4 xl:tw-px-8 2xl:tw-px-32 tw-flex tw-items-center">
              <MainHeader />
            </Header>
            {isOwner && !user?.isVerified && (
              <VerifyEmailRibbon email={user?.email} _id={user?._id} />
            )}
            <Content
              className="tw-py-6 tw-px-2 md:tw-px-4 xl:tw-px-8 2xl:tw-px-32 s-main-content"
              onScroll={onScroll}
            >
              {children}
            </Content>
          </>
        ) : (
          children
        )}
      </Layout>
    </Layout>
  );
};

export default Appshell;
