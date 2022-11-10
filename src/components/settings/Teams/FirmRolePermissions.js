import { Select } from "antd";
import Appshell from "Appshell";
import React, { useEffect, useState } from "react";
import { withTranslation } from "react-i18next";

import { FirmRoleService } from "../../../services";
import FirmRolePermissionEditForm from "./FirmRolePermissionEditForm";

const { Option } = Select;

function FirmRolePermissions(props) {
  const { t } = props;

  const [roles, setRoles] = useState({});
  const [editedId, setEditedId] = useState("");

  useEffect(() => {
    FirmRoleService.find({
      query: { $limit: 500, title: { $ne: "Owner" } },
    }).then((res) => {
      setRoles((roles = {}) => {
        let output = res.data.reduce((acc, curr) => {
          return { ...acc, [curr._id]: curr };
        }, roles);
        return output;
      });
      setEditedId((editedId) => {
        if (!editedId) {
          return res.data[0]._id;
        }
      });
    });
  }, []);

  useEffect(() => {
    const handleCreated = (res) => {
      setRoles((old) => ({ ...old, [res._id]: res }));
    };

    const handlePatched = (res: Bin) => {
      setRoles((old) => ({ ...old, [res._id]: res }));
    };

    FirmRoleService.on("created", handleCreated);
    FirmRoleService.on("patched", handlePatched);
    return () => {
      FirmRoleService.off("created", handleCreated);
      FirmRoleService.off("patched", handlePatched);
    };
  }, []);

  return (
    <Appshell activeLink={["settings", "permissions"]}>
      <div className="md:tw-mx-20 xl:tw-mx-32">
        <h1 className="s-page-title tw-mb-5">{t("permissions.title")}</h1>
        <div>
          <Select
            className="tw-mb-6 tw-w-64"
            placeholder={t("permissions.placeholder")}
            onChange={(id) => setEditedId(id)}
            value={editedId}
          >
            {Object.values(roles).map((role) => (
              <Option key={role._id} value={role._id}>
                <span className="s-text-dark">{role.title}</span>
              </Option>
            ))}
          </Select>
        </div>
        <FirmRolePermissionEditForm role={roles[editedId]} />
      </div>
    </Appshell>
  );
}

export default withTranslation()(FirmRolePermissions);
