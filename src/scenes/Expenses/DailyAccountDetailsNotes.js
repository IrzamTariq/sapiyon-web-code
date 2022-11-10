import { faCommentAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Avatar, Button, Comment, Popconfirm, message } from "antd";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { withTranslation } from "react-i18next";
import { getUsername } from "utils/helpers";

import { AccountingNotesService } from "../../services";
import ExpensesNotesForm from "./ExpensesNotesForm";

const DailyAccountDetailsNotes = ({ t, date, userId, isOwner }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedNote, setEditedNote] = useState({});

  const [data, setData] = useState([]);

  const cancelEditing = () => {
    setIsEditing(false);
    setEditedNote({});
  };

  const startEditing = (note) => {
    setIsEditing(true);
    setEditedNote(note);
  };

  const save = (note) => {
    const { _id, body } = note;
    if (!_id) {
      AccountingNotesService.create({
        body,
        dailyAccountDate: date,
        type: "dailyAccount",
        createdForId: userId,
      }).then(
        (res) => {
          cancelEditing();
          message.success(t("notes.createSuccess"));
        },
        () => message.error(t("notes.createError")),
      );
    } else {
      AccountingNotesService.patch(_id, { body }).then(
        (res) => {
          cancelEditing();
          message.success(t("notes.updateSuccess"));
        },
        () => message.error(t("notes.updateError")),
      );
    }
  };

  const remove = (_id = "") => {
    AccountingNotesService.remove(_id).then(
      (res) => {
        setData(data.filter((item) => item._id !== res._id));
        message.success(t("notes.removeSuccess"));
      },
      () => message.error(t("notes.removeError")),
    );
  };

  useEffect(() => {
    let isUnmounted = false;
    const query = {
      dailyAccountDate: date,
      createdForId: userId,
      $sort: { createdAt: -1 },
    };

    AccountingNotesService.find({
      query,
    }).then((res) => {
      if (isUnmounted) {
        return;
      }
      setData(res.data);
    });
    return () => {
      isUnmounted = true;
    };
  }, [date, userId]);

  useEffect(() => {
    let isUnmounted = false;
    const handleCreated = (res) => {
      if (isUnmounted || res.createdForId !== userId) {
        return;
      }
      setData((data) => {
        return [res, ...data];
      });
    };
    const handlePatched = (res) => {
      if (isUnmounted) {
        return;
      }

      setData((data) => {
        let index = data.findIndex((item) => item._id === res._id);
        if (index === -1) {
          return [res, ...data];
        } else {
          return data.map((item) => (item._id === res._id ? res : item));
        }
      });
    };
    const handleRemoved = (res) => {
      if (isUnmounted) {
        return;
      }
      setData((data) => {
        return data.filter((item) => item._id !== res._id);
      });
    };

    AccountingNotesService.on("created", handleCreated);
    AccountingNotesService.on("patched", handlePatched);
    AccountingNotesService.on("removed", handleRemoved);

    return () => {
      isUnmounted = true;
      AccountingNotesService.off("created", handleCreated);
      AccountingNotesService.off("patched", handlePatched);
      AccountingNotesService.off("removed", handleRemoved);
    };
  }, [date, userId]);

  return (
    <div>
      {isEditing && !editedNote._id ? (
        <ExpensesNotesForm
          handleSubmit={(note) => save(note)}
          handleCancel={() => {
            cancelEditing();
          }}
          editedNote={editedNote}
        />
      ) : (
        <div>
          <Button
            type="default"
            block
            className="tw-text-left tw-text-blue-500 s-main-font"
            onClick={() => startEditing({})}
          >
            <FontAwesomeIcon icon={faCommentAlt} className="tw-mr-2" />{" "}
            {t("taskEdit.addNote")}
          </Button>
        </div>
      )}

      <div className="tw-mt-5">
        {data.map((note) => (
          <Comment
            key={note._id}
            className="note-comment"
            actions={
              isEditing
                ? []
                : [
                    <div className="tw-absolute tw-bottom-0">
                      <Button
                        type="link"
                        className="s-text-gray note-actions tw-pl-0"
                        onClick={() => {
                          startEditing(note);
                        }}
                      >
                        {t("global.edit")}
                      </Button>
                      <Popconfirm
                        title={t("global.deleteSurety")}
                        onConfirm={() => remove(note._id)}
                        okText={t("global.delete")}
                        okButtonProps={{ danger: true }}
                        cancelText={t("global.cancel")}
                      >
                        <Button
                          type="link"
                          className="s-text-gray note-actions"
                        >
                          {t("global.delete")}
                        </Button>
                      </Popconfirm>
                    </div>,
                  ]
            }
            author={
              <span className="s-main-font s-light-text-color s-semibold">
                {getUsername(note?.user)}
              </span>
            }
            avatar={
              <Avatar style={{ backgroundColor: "orange" }}>
                {getUsername(note?.user)[0].toUpperCase()}
              </Avatar>
            }
            content={
              editedNote._id !== note._id ? (
                <p>{note.body}</p>
              ) : (
                <ExpensesNotesForm
                  handleSubmit={(note) => save(note)}
                  handleCancel={() => {
                    setIsEditing(false);
                    setEditedNote({});
                  }}
                  editedNote={note}
                />
              )
            }
            datetime={
              <span className="s-main-font s-light-text-color">
                {moment(note.createdAt).format("dddd, DD MMMM YYYY - HH:mm")}
              </span>
            }
          />
        ))}
      </div>
    </div>
  );
};

export default withTranslation()(DailyAccountDetailsNotes);
