import { useEffect, useState, useRef, useContext } from "react";
import {
  updateEvent,
  deleteEvent,
  getCurrentIds,
  increaseEventId,
  addEvent,
  getTraineeWorkouts,
  updateTraineeField,
} from "../../Util/Firebase";
import FullCalendar from "@fullcalendar/react";
import { Grid, Fab, makeStyles, useTheme, Icon } from "@material-ui/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listMonth from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction"; // needed for dayClick
import "./css/Calendar.css";
import React from "react";
import FullEvent from "./AddEvent";
import ControlFitContext from "../Context/ControlFitContext";
import moment from "moment";
import { WORKOUTS } from "../../Util/TraineeFields";
import { useTranslation } from "react-i18next";

const useStyles = makeStyles((theme) => ({
  add: {
    position: "fixed",
    bottom: theme.spacing(2),
    right: theme.spacing(2),
  },
}));

export default function TraineeCalendar(props) {
  const classes = useStyles();
  const { t } = useTranslation();
  const {
    trainees,
    events,
    workouts,
    updateWorkouts,
    updateNotifications,
  } = useContext(ControlFitContext);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddEventDialog, setShowAddEventDialog] = useState(false);
  const [showEvent, setShowEvent] = useState(false);
  const [event, setEvent] = useState({});
  const CalendarRef = useRef();
  const [preSelect, setPreSelect] = useState({});
  const [currentEvents, setCurrentEvents] = useState([]);
  const theme = useTheme();

  useEffect(() => {
    setIsLoading(false);
  }, [currentEvents]);

  useEffect(() => {
    //workouts is Trainee only
    setCurrentEvents([...workouts, ...events]);

    return () => setCurrentEvents([]);
  }, [trainees, workouts, events]);

  const toggleModal = () => {
    if (showAddEventDialog) {
      setPreSelect({});
    }
    setShowAddEventDialog(!showAddEventDialog);
  };

  const handleDateSelect = (selectInfo) => {
    setPreSelect(selectInfo);
    let calendarApi = selectInfo.view.calendar;

    calendarApi.unselect(); // clear date selection
    toggleModal();
  };

  //const [direction,setDirection] = useState(theme.direction);
  //const [lang,setLang] = useState(theme.chosenLang);

  useEffect(() => {
    CalendarRef.current.getApi().setOption("locale", theme.chosenLang);
    CalendarRef.current.getApi().setOption("direction", theme.direction);
    //setDirection(theme.direction);
    // setLang(theme.chosenLang);
  }, [theme.direction, theme.chosenLang]);

  //edit dialog
  const toggleEventModal = (info) => {

    if (!showEvent) {
      const calendarApi = CalendarRef.current.getApi();
      const selected = calendarApi.getEventById(info.event.id);
      setEvent(selected);
    }
    setShowEvent(!showEvent);
  };

  const renderEventContent = (eventInfo) => {
    return (
      <>
        <div>
          {eventInfo.timeText}
          {eventInfo?.event?.extendedProps?.selectedTrainees &&
            eventInfo.event.extendedProps.selectedTrainees.length > 0 && (
              <div>
                {t("CALENDAR_TRAINEES")}
                {eventInfo.event.extendedProps.selectedTrainees
                  .map((t) => {
                    return t.name;
                  })
                  .join(", ")}
              </div>
            )}
          <div>{eventInfo.event.title}</div>
          {eventInfo?.event?.extendedProps?.descirption && (
            <div>{eventInfo.event.extendedProps.descirption}</div>
          )}
          {eventInfo?.event?.extendedProps?.location && (
            <div>{eventInfo.event.extendedProps.location}</div>
          )}
        </div>
      </>
    );
  };

  const handleCancel = () => {
    //console.log("Cancel");
  };

  const handleIds = () => {
    return new Promise((resolve, reject) => {
      getCurrentIds()
        .then(async (res) => {
          const id = await res.data().id;
          return id;
        })
        .then((id) => {
          increaseEventId(id)
            .then((res) => {
              return id;
            })
            .then((id) => {

              resolve(id);
            });
        })
        .catch((e) => {
          reject(e);
        });
    });
  };

  const submitTraineeEvent = (event, selectedTrainees) => {
    return new Promise((resolve, reject) => {
      handleIds()
        .then((id) => {
          selectedTrainees = selectedTrainees.map((s) => {
            return {
              docId: s.docId,
              name: s.name,
              created: s.created,
              isActive: s.isActive,
              phone: s.phone,
            };
          });

          const newEvent = {
            ...event,
            id: id,
            selectedTrainees: selectedTrainees,
            isTrainee: true,
          };
          return newEvent;
        })
        .then((newEvent) => {
          selectedTrainees.forEach((t) => {
            updateTraineeField(t.docId, newEvent, WORKOUTS, true, false).then(
              (docref) => {
                return docref;
              }
            );
          });
          resolve();
        })
        .catch((e) => {
          reject(e);
        });
    });
  };

  const handleSubmit = async (event, selectedTrainees) => {
    try {
      if (event.isTrainee) {
        await submitTraineeEvent(event, selectedTrainees);
      } else {
        delete event.docId;
        delete event.selectedTrainees;
        await handleGenralEvent(event);
      }
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  };

  const handleGenralEvent = (event) => {
    return new Promise((resolve, reject) => {
      handleIds()
        .then((id) => {
          const newEvent = {
            ...event,
            id: id,
          };

          addEvent(newEvent).then((res) => {
            newEvent.docId = res.id;
            resolve();
          });
        })
        .catch((e) => {
          reject(e);
        });
    });
  };

  const deleteRegularEvent = (docId) => {
    return new Promise((resolve, reject) => {
      deleteEvent(docId)
        .then((res) => {
          // let news = workouts.filter((e) => {
          //   return e.docId !== docId;
          // });
          resolve();
        })
        .catch((e) => {
          reject(e);
        });
    });
  };

  //id is the event id my id
  const deleteEventFunc = async (id, isTrainee, docId, selectedTrainees) => {
    try {
      if (isTrainee) {
        await deleteNewFunc(event, id);
      } else {
        await deleteRegularEvent(docId);
      }
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  };

  const updateRegularEvent = (event) => {
    return new Promise((resolve, reject) => {
      updateEvent(event, event.docId)
        .then((res) => {
          resolve();
        })
        .catch((e) => {
          reject(e);
        });
    });
  };

  const updateNewFunc = (event, newEvent) => {
    return new Promise((resolve, reject) => {
      let news = workouts.map((e) => {
        return e.id === newEvent.id ? newEvent : e;
      });

      updateWorkouts(news);
      let newNotification = workouts.filter((e) => {
        return e.id !== newEvent.id && checkIsToday(e.start);
      });
      updateNotifications(newNotification);

      const removedTrainees = event.extendedProps.selectedTrainees.reduce(
        (newArray, item) => {
          if (newEvent.selectedTrainees.includes(item)) {
            return newArray;
          } else {
            return [...newArray, item];
          }
        },
        []
      );

      if (removedTrainees.length > 0) {
        removedTrainees.forEach((t) => {
          getTraineeWorkouts(t.docId)
            .then(async (res) => {
              const events = await res.data();
              return events;
            })
            .then((events) => {
              const newEventsAdd = events.workouts.filter((w) => {
                return w.id !== newEvent.id;
              });
              //   t.wokrouts = newEventsAdd;
              updateTraineeField(t.docId, newEventsAdd, WORKOUTS, false, false)
                .then((res) => {
                })
                .catch((e) => {
                  reject(e);
                });
            })
            .catch((e) => {
              reject(e);
            });
        });
      }
      //the stayed trainees
      newEvent.selectedTrainees.forEach((t) => {
        getTraineeWorkouts(t.docId)
          .then(async (res) => {
            const events = await res.data();
            //if a trainee remove then we need to completey removed it
            let newEventsAdd;
            if (!events.workouts || events.workouts.length === 0) {
              newEventsAdd = [newEvent];
            } else {
              //this is ok if i need to replace the event, but if it's an added trainee then
              let exist = events.workouts.some((el) => el.id === newEvent.id);
              if (exist) {
                newEventsAdd = events.workouts.map((w) => {
                  return w.id === newEvent.id ? newEvent : w;
                });
              } else {
                newEventsAdd = [...events.workouts, newEvent];
              }
            }

            //   t.wokrouts = newEventsAdd;
            updateTraineeField(
              t.docId,
              newEventsAdd,
              WORKOUTS,
              false,
              false
            ).then((res) => {
            });
          })
          .catch((e) => {
            reject(e);
          });
      });
      resolve();
    });
  };

  const checkIsToday = (date) => {
    let startDate = moment().startOf("day");
    let endDate = moment().endOf("day");

    return moment(date).isBetween(startDate, endDate, null, "[]");
  };

  const deleteNewFunc = (event, newEventId) => {
    return new Promise((resolve, reject) => {
      let news = workouts.filter((e) => {
        return e.id !== newEventId;
      });
      updateWorkouts(news);
      let newNotification = workouts.filter((e) => {
        return e.id !== newEventId && checkIsToday(e.start);
      });
      updateNotifications(newNotification);

      event.extendedProps.selectedTrainees.forEach((t) => {
        getTraineeWorkouts(t.docId)
          .then(async (res) => {
            const events = await res.data();

            const newEventsAdd = events.workouts.filter((w) => {
              return w.id !== newEventId;
            });
            // t.wokrouts = newEventsAdd;
            updateTraineeField(
              t.docId,
              newEventsAdd,
              WORKOUTS,
              false,
              false
            ).then((res) => {
            });
          })
          .catch((e) => {
            reject(e);
          });
      });
      resolve();
    });
  };

  const updateEventFunc = async (newEvent) => {
    //check if it was a regular event and became a trainee or vice versa
    //if type changed to regular, i need to delete trainee event and create new one
    //if type changed to trainee, i need to delete regular event and create new one
    // else it just changed values and I update event normally
    try {
      if (
        (event.extendedProps.isTrainee && !newEvent.isTrainee) ||
        (!event.extendedProps.isTrainee && newEvent.isTrainee)
      ) {
        const eventCustomId = parseInt(event.id);
        await deleteEventFunc(
          eventCustomId,
          event.extendedProps.isTrainee,
          event.extendedProps.docId,
          event.extendedProps.selectedTrainees
        );
        await handleSubmit(newEvent, newEvent.selectedTrainees);
      } else {
        if (newEvent.isTrainee) {
          const eventCustomId = parseInt(newEvent.id);
          newEvent.id = eventCustomId;
          delete newEvent.docId;

          await updateNewFunc(event, newEvent);
        } else {
          await updateRegularEvent(newEvent);
        }
      }
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  };

  return (
    <Grid
      container
      style={{
        height: "100%",
        paddingLeft: "24px",
        paddingRight: "24px",
        paddingBottom: "24px",
        marginTop: "24px",
        width: "95%",
        backgroundColor: "white",
        boxShadow:
          "0px 2px 1px -1px rgb(0 0 0 / 20%), 0px 1px 1px 0px rgb(0 0 0 / 14%), 0px 1px 3px 0px rgb(0 0 0 / 12%)",
      }}
    >
      <Grid
        item
        xs={12}
        lg={12}
        md={12}
        sm={12}
        xl={12}
        style={{ height: "10%" }}
        align="start"
      >
        <h1>{t("CALENDAR_TITLE")}</h1>
      </Grid>

      <Grid
        item
        xs={12}
        lg={12}
        md={12}
        sm={12}
        xl={12}
        style={{ height: "90%" }}
      >
        {isLoading && <h1>{t("CALENDAR_LOADING")}</h1>}

        {/* <div className="demo-app">
          <div className="demo-app-main"> */}
        <FullCalendar
          height={"100%"}
          ref={CalendarRef}
          plugins={[
            dayGridPlugin,
            timeGridPlugin,
            interactionPlugin,
            listMonth,
          ]}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay,listMonth",
          }}
          buttonText={{
            today: t("CALEDNAR_HEADER_TOOLBAR_TODAY"),
            month: t("CALEDNAR_HEADER_TOOLBAR_MONTH"),
            week: t("CALEDNAR_HEADER_TOOLBAR_WEEK"),
            day: t("CALEDNAR_HEADER_TOOLBAR_DAY"),
            list: t("CALEDNAR_HEADER_TOOLBAR_LIST"),
            prev: t("CALEDNAR_HEADER_TOOLBAR_PREV"),
            next: t("CALEDNAR_HEADER_TOOLBAR_NEXT"),
            year: t("CALEDNAR_HEADER_TOOLBAR_YEAR"),
            prevYear: t("CALEDNAR_HEADER_TOOLBAR_PREV_YEAR"),
            nextYear: t("CALEDNAR_HEADER_TOOLBAR_NEXT_YEAR"),
          }}
          allDayText={t("CALEDNAR_HEADER_ALL_DAY")}
          moreLinkText={t("CALEDNAR_HEADER_MORE")}
          noEventsText={t("CALEDNAR_HEADER_NO_EVENTS")}
          initialView="dayGridMonth"
          editable={true}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          weekends={true}
          buttonIcons={false}
          navLinks={true}
          // initialEvents={intial}
          events={currentEvents}
          // alternatively, use the `events` setting to fetch from a feed
          select={handleDateSelect}
          eventContent={renderEventContent} // custom render function
          eventClick={toggleEventModal}
          //  eventsSet={handleEvents} // called after events are initialized/added/changed/removed
          /* you can update a remote database when these fire:
            eventAdd={function(){}}
            eventChange={function(){}}
            eventRemove={function(){}}
            */
        />
        {/* </div>
        </div> */}
      </Grid>

      <Fab
        color="secondary"
        size="small"
        className={classes.add}
        onClick={toggleModal}
      >
        <Icon className="fas fa-plus" />
      </Fab>

      {showAddEventDialog && (
        <FullEvent
          onClose={toggleModal}
          handleSubmitEvent={handleSubmit}
          handleCancel={handleCancel}
          eventInfo={preSelect}
          trainees={trainees}
          isEditMode={false}
          preSelected={[]}
        />
      )}

      {showEvent && (
        <FullEvent
          onClose={toggleEventModal}
          handleSubmitEvent={updateEventFunc}
          handleCancel={handleCancel}
          deleteEvent={deleteEventFunc}
          eventInfo={event}
          trainees={trainees}
          isEditMode={true}
          preSelected={[]}
        />
      )}
    </Grid>
  );
}
