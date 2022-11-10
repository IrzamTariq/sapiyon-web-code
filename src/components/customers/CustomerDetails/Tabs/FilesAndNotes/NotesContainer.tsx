import React, { useEffect, useState } from "react";
import { withTranslation, WithTranslation } from "react-i18next";
import { CustomerNote, PaginatedFeathersResponse } from "../../../../../types";
import CustomerNotes from "./Notes";
import { CustomerNotesService } from "../../../../../services/index";
import { message } from "antd";
import { getRandomAlphaNumericString } from "../../../../../utils/helpers";
import mixpanel from "analytics/mixpanel";

interface NotesState {
  notes: CustomerNote[];
  editedNote: CustomerNote;
  editingId: string;
  disabled: boolean;
  creatingNote: boolean;
}

interface NotesContainerProps extends WithTranslation {
  customerId: string;
}

const NotesContainer = ({ t, customerId }: NotesContainerProps) => {
  const [notesState, setNotesState] = useState({
    notes: [] as CustomerNote[],
    editedNote: {} as CustomerNote,
    editingId: "",
    creatingNote: false,
    disabled: false,
  } as NotesState);

  // CDM
  useEffect(() => {
    CustomerNotesService.find({
      query: { customerId },
    }).then((res: PaginatedFeathersResponse<CustomerNote>) =>
      setNotesState((data) => ({ ...data, notes: res.data })),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addNote = (note: CustomerNote) => {
    const newNote = { ...note, customerId };
    const { _id = "", ...rest } = newNote;
    if (customerId) {
      if (_id.substr(0, 3) === "NEW") {
        CustomerNotesService.create(rest).then(
          (res: CustomerNote) => {
            mixpanel.track(`Note created in customer`);
            setNotesState((data) => ({
              ...data,
              editedNote: {} as CustomerNote,
              editingId: "",
              notes: [res, ...data.notes],
            }));
          },
          (error: Error) => {
            message.error(t("notes.createError"));
            // console.log("Error in saving note: ", error);
          },
        );
      } else {
        CustomerNotesService.patch(_id, rest).then(
          (res: CustomerNote) => {
            mixpanel.track(`Note updated in customer`);
            setNotesState((data) => ({
              ...data,
              editedNote: {} as CustomerNote,
              editingId: "",
              notes: data.notes.map((note) =>
                note._id === res._id ? res : note,
              ),
            }));
          },
          (error: Error) => {
            message.error(t("notes.updateError"));
            // console.log("Error in updating customer note: ", error);
          },
        );
      }
    }
  };

  const removeNote = (_id: string) => {
    CustomerNotesService.remove(_id).then((res: CustomerNote) => {
      mixpanel.track(`Note removed in customer`);
      setNotesState((data) => ({
        ...data,
        notes: data.notes.filter((note) => note._id !== res._id),
      }));
    });
  };
  const startCreatingNote = (_id: string | undefined) => {
    const editedNote: CustomerNote = _id
      ? notesState.notes.find((note) => note._id === _id) ||
        ({} as CustomerNote)
      : {
          _id: `NEW-${getRandomAlphaNumericString(10)}`,
          body: "",
        };

    setNotesState((data) => ({
      ...data,
      editedNote,
      editingId: editedNote._id ? editedNote._id : "",
      creatingNote: !_id,
      disabled: false,
    }));
  };

  return (
    <div>
      <CustomerNotes
        notesState={notesState}
        doAddCustomerNote={addNote}
        doRemoveCustomerNote={removeNote}
        cancelNoteEditing={() =>
          setNotesState((data) => ({
            ...data,
            editingId: "",
            creatingNote: false,
            editedNote: {} as CustomerNote,
          }))
        }
        startCreatingNote={startCreatingNote}
      />
    </div>
  );
};

export default withTranslation()(NotesContainer);
