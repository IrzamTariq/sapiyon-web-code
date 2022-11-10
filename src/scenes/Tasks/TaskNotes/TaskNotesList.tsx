import { faCommentAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import mixpanel from "analytics/mixpanel";
import { Avatar, Button, Comment, Popconfirm, message } from "antd";
import logger from "logger";
import moment from "moment";
import React, { useContext, useEffect, useState } from "react";
import { WithTranslation, withTranslation } from "react-i18next";
import UserContext from "UserContext";

import { TaskNoteService } from "../../../services";
import {
  PaginatedFeathersResponse,
  TaskNote,
  UserContextType,
} from "../../../types";
import {
  getRandomAlphaNumericString,
  getUsername,
  isOwner,
} from "../../../utils/helpers";
import TaskNotesForm from "./TaskNotesForm";

interface TaskNotesListProps extends WithTranslation {
  taskId: string;
}

const TaskNotesList = ({ t, taskId }: TaskNotesListProps) => {
  const { user } = useContext(UserContext) as UserContextType;
  const [notesList, setNotesList] = useState([] as TaskNote[]);
  const [noteState, setNoteState] = useState({
    addingNote: false,
    editingNote: false,
    editedNote: {} as TaskNote,
    loading: false,
  });

  useEffect(() => {
    if (!!taskId) {
      TaskNoteService.find({
        query: { taskId },
      }).then(
        (res: PaginatedFeathersResponse<TaskNote>) => setNotesList(res.data),
        (error: Error) => {
          logger.log("Couldn't fetch task notes: ", error);
          message.error(t("notes.fetchError"));
        },
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId]);

  const addNewNote = (note: TaskNote) => {
    setNoteState((old) => ({ ...old, loading: true }));
    const { _id = "", ...rest } = note;
    const newNote = { ...rest, taskId };
    if (_id.startsWith("NEW")) {
      TaskNoteService.create(newNote).then(
        (res: TaskNote) => {
          setNotesList((old) => [res, ...old]);
          setNoteState({
            addingNote: false,
            editingNote: false,
            editedNote: {} as TaskNote,
            loading: false,
          });
          mixpanel.track(`Note created in (extended) task`);
          setNoteState((old) => ({ ...old, loading: false }));
          message.success(t("notes.createSuccess"));
        },
        (error: Error) => {
          setNoteState((old) => ({ ...old, loading: false }));
          message.error(t("notes.createError"));
        },
      );
    } else {
      TaskNoteService.patch(_id, rest).then(
        (res: TaskNote) => {
          mixpanel.track(`Note updated in (extended) task`);
          setNotesList((old) =>
            old.map((item) => (item._id === res._id ? res : item)),
          );
          setNoteState({
            addingNote: false,
            editingNote: false,
            editedNote: {} as TaskNote,
            loading: false,
          });
          setNoteState((old) => ({ ...old, loading: false }));
          message.success(t("notes.updateSuccess"));
        },
        (error: Error) => {
          setNoteState((old) => ({ ...old, loading: false }));
          message.error(t("notes.updateError"));
        },
      );
    }
  };

  const deleteNote = (_id: string) => {
    TaskNoteService.remove(_id).then(
      (res: TaskNote) => {
        mixpanel.track(`Note removed in (extended) Task`);
        setNotesList((old) => old.filter((item) => item._id !== res._id));
        message.success(t("notes.removeSuccess"));
      },
      (error: Error) => message.error(t("notes.removeError")),
    );
  };

  return (
    <div>
      <div>
        {noteState.addingNote ? (
          <TaskNotesForm
            loading={noteState.loading}
            addNote={(newNote: TaskNote) => addNewNote(newNote)}
            handleCancel={() =>
              setNoteState({
                addingNote: false,
                editingNote: false,
                editedNote: {} as TaskNote,
                loading: false,
              })
            }
            editedNote={noteState.editedNote}
          />
        ) : (
          <div>
            <Button
              type="default"
              block
              className="tw-text-left tw-text-blue-500 s-main-font"
              onClick={() =>
                setNoteState({
                  editingNote: false,
                  addingNote: true,
                  editedNote: {
                    _id: `NEW-${getRandomAlphaNumericString()}`,
                  } as TaskNote,
                  loading: false,
                })
              }
            >
              <FontAwesomeIcon icon={faCommentAlt} className="tw-mr-2" />
              {t("taskEdit.addNote")}
            </Button>
          </div>
        )}
      </div>
      <div className="tw-mt-5">
        {notesList.map((note: TaskNote) => (
          <Comment
            key={note._id}
            className="note-comment"
            actions={
              noteState.addingNote ||
              noteState.editingNote ||
              (note.createdById !== user._id && !isOwner(user.role))
                ? []
                : [
                    <div className="tw-absolute tw-bottom-0">
                      <Button
                        type="link"
                        className="s-text-gray note-actions tw-pl-0"
                        onClick={() =>
                          setNoteState({
                            addingNote: false,
                            editingNote: true,
                            editedNote: note,
                            loading: false,
                          })
                        }
                      >
                        {t("global.edit")}
                      </Button>
                      <Popconfirm
                        title={t("global.deleteSurety")}
                        okText={t("global.delete")}
                        okButtonProps={{ danger: true }}
                        cancelText={t("global.cancel")}
                        onConfirm={() => deleteNote(note._id || "")}
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
              note._id !== noteState.editedNote._id ? (
                <p>{note.body}</p>
              ) : (
                <TaskNotesForm
                  loading={noteState.loading}
                  addNote={(newNote: TaskNote) => addNewNote(newNote)}
                  handleCancel={() =>
                    setNoteState({
                      editedNote: {} as TaskNote,
                      editingNote: false,
                      addingNote: false,
                      loading: false,
                    })
                  }
                  editedNote={noteState.editedNote}
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

export default withTranslation()(TaskNotesList);
