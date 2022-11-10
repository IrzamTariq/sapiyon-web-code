import React from "react";
import styled from "styled-components";

const BuildInfoContainer = styled.div`
  margin: 100px auto 20px;
  width: 80%;
`;
const BuildInfo: React.FC = () => {
  let buildInfo = [
    {
      label: "Version",
      value: process.env.npm_package_version,
    },
    {
      label: "Git branch name",
      value: process.env.REACT_APP_GIT_BRANCH_NAME,
    },

    { label: "Git SHA", value: process.env.REACT_APP_GIT_SHA },
    { label: "Build Timestamp", value: process.env.REACT_APP_BUILD_TIMESTAMP },
  ];

  return (
    <BuildInfoContainer>
      <h1 style={{ fontSize: "18pt" }}>Build info</h1>
      <table style={{ width: "80%" }}>
        <thead>
          <tr>
            <th>Property</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          {buildInfo.map((row, index) => (
            <tr key={index}>
              <td>{row.label}</td>
              <td>{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </BuildInfoContainer>
  );
};

export default BuildInfo;
