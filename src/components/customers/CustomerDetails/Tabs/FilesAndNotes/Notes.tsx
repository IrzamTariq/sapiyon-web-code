import { faCommentAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Avatar, Button, Comment, Popconfirm } from "antd";
import moment from "moment";
import React from "react";
import { WithTranslation, withTranslation } from "react-i18next";
import { getUsername } from "utils/helpers";

import { CustomerNote } from "../../../../../types";
import CustomerNotesForm from "./customerNotesForm";

interface NotesState {
  notes: CustomerNote[];
  editedNote: CustomerNote;
  editingId: string;
  disabled: boolean;
  creatingNote: boolean;
}

interface NotesCustomerDetailsProps extends WithTranslation {
  notesState: NotesState;
  doAddCustomerNote: (note: CustomerNote) => void;
  doRemoveCustomerNote: (_id: string) => void;
  cancelNoteEditing: () => void;
  startCreatingNote: (_id: string | undefined) => void;
}

const NotesCustomerDetails = ({
  t,
  notesState,
  doAddCustomerNote,
  doRemoveCustomerNote,
  cancelNoteEditing,
  startCreatingNote,
}: NotesCustomerDetailsProps) => {
  const { editingId, creatingNote, notes, editedNote } = notesState;
  return (
    <div>
      <div>
        {editingId && creatingNote ? (
          <CustomerNotesForm
            addNote={(note: CustomerNote) => doAddCustomerNote(note)}
            handleCancel={cancelNoteEditing}
            editedNote={editedNote}
          />
        ) : (
          <div>
            <Button
              type="default"
              block
              className="tw-text-left tw-text-blue-500 s-main-font"
              onClick={() => startCreatingNote(undefined)}
            >
              <FontAwesomeIcon icon={faCommentAlt} className="tw-mr-2" />
              {t("taskEdit.addNote")}
            </Button>
          </div>
        )}
      </div>
      <div className="tw-mt-5">
        {notes.map((note) => (
          <Comment
            key={note._id}
            className="note-comment"
            actions={
              editingId
                ? []
                : [
                    <div className="tw-absolute tw-bottom-0">
                      <Button
                        type="link"
                        className="s-text-gray note-actions tw-pl-0"
                        onClick={() => startCreatingNote(note._id)}
                      >
                        {t("global.edit")}
                      </Button>
                      <Popconfirm
                        title={t("global.deleteSurety")}
                        okButtonProps={{ danger: true }}
                        okText={t("global.delete")}
                        cancelText={t("global.cancel")}
                        onConfirm={() =>
                          doRemoveCustomerNote(note._id ? note._id : "")
                        }
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
                {getUsername(note?.createdBy)}
              </span>
            }
            avatar={
              <Avatar style={{ backgroundColor: "orange" }}>
                {(getUsername(note?.createdBy) || " ")[0].toUpperCase()}
              </Avatar>
            }
            content={
              editingId !== note._id ? (
                <p>{note.body}</p>
              ) : (
                <CustomerNotesForm
                  addNote={(note) => doAddCustomerNote(note)}
                  handleCancel={cancelNoteEditing}
                  editedNote={note}
                />
              )
            }
            datetime={
              <span className="s-main-font s-light-text-color">
                {note.createdAt
                  ? moment(note.createdAt).format("dddd, DD MMMM YYYY - HH:mm")
                  : ""}
              </span>
            }
          />
        ))}
      </div>
    </div>
  );
};

export default withTranslation()(NotesCustomerDetails);
