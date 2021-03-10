import { useRef, useState } from "react";
import ControlFitContext from "./ControlFitContext";
import moment from "moment";
import { useEffect } from "react";
import {
  getRecentTrainees,
  getNotificationOfTrainee,
} from "../../services/FirebaseTraineesService";
import {
  getNotifications,
} from "../../services/FirebaseEventsService";
import {
  getTraineesProgram,
} from "../../services/FirebaseProgramsService";
import {auth as lis,firestore} from "../../Util/Firebase";
import { useAuth } from "../Auth/ProvideAuth";

export default function ControlFitContextHanlder({ children }) {
  const traineeCollection = "trainees";
  const calendarCollection = "events";
  const traineeField = "trainees";
  const notificationField = "notifications";
  const eventsField = "events";
  const workoutsField = "workouts";
  const [controlFitContext, _setControlFitContext] = useState({
    detailedTrainee: {},
    trainees: [],
    events: [],
    workouts: [],
    newTraineesAmout: [],
    notifications: [],
    updateWorkouts: (workoutsNew) => {
      setTraineeContext(workoutsNew, workoutsField, false, true);
    },
    updateNotifications: (news) => {
      setTraineeContext(news, notificationField, false, true);
    },
    setDetailedTrainee: (trainee) => {
      setDetailedTraineeContext(trainee);
    },
    clearDetailedTrainee: () => {
      localStorage.removeItem("detailedTrainee");
      clearTheDetailedTrainee();
    },
    refreshNotifications: async () => {
      //pure events
      let events = await getNotifications();
      let notifications = [];
      events.forEach((d) => {
        let not = d.data();
        not.docId = d.id;
        not.start = not.start.toDate();
        not.startStr = moment(not.start).format("HH:mm");
        if (not.end) {
          not.end = not.end.toDate();
        }
        notifications.push(not);
      })
      let documentSnapshots = await getNotificationOfTrainee();
      let notificationsOfTrainees = [];
      documentSnapshots.forEach((d) => {
        let not = d.data();
        not.workouts.forEach((n) => {
          n.docId = not.id;
          n.start = n.start.toDate();
          n.startStr = moment(n.start).format("HH:mm");
          if (n.end) {
            n.end = n.end.toDate();
          }
          let exist = notificationsOfTrainees.some(
            (el) => el.docId === n.docId
          );
          checkIsToday(n.start) && !exist && notificationsOfTrainees.push(n);
        })
      })
      let merged = [...notifications,...notificationsOfTrainees];
      setTraineeContext(merged, notificationField, false, true);
    }
  });
  const traineeContextRef = useRef(controlFitContext);
  let auth = useAuth();

  useEffect(() => {
    //POSSIBLE PROBLEM HERE
    // if (auth.user) {
    //   console.log("details in context", controlFitContext.detailedTrainee);
    //   const fromStorage = JSON.parse(localStorage.getItem("detailedTrainee"));
    //   console.log("from storage is", fromStorage);
    //   if (fromStorage) {
    //     setDetailedTraineeContext(fromStorage);
    //   }
    // }
  }, []);

  const checkIsToday = (date) => {
    let startDate = moment().startOf("day");
    let endDate = moment().endOf("day");
  
    return moment(date).isBetween(
      startDate,
      endDate,
      null,
      "[]"
    );
  }

  const clearTheDetailedTrainee = () => {
    let prev = traineeContextRef.current;

    traineeContextRef.current = {
      ...prev,
      detailedTrainee: {},
    };

    _setControlFitContext((prevState) => ({
      ...prevState,
      detailedTrainee: {},
    }));
  };

  const setDetailedTraineeContext = (trainee) => {
    let prev = traineeContextRef.current;

    let dateParsed =
      typeof trainee.created === "string"
        ? ""
        : trainee?.created?.toDate().toLocaleString("he-IL", {
            month: "numeric",
            day: "numeric",
            year: "numeric",
          });
    const newTrainee =
      typeof trainee.created === "string"
        ? { ...trainee }
        : { ...trainee, created: dateParsed };
    localStorage.setItem("detailedTrainee", JSON.stringify(newTrainee));

    traineeContextRef.current = {
      ...prev,
      detailedTrainee: newTrainee,
    };

    _setControlFitContext((prevState) => ({
      ...prevState,
      detailedTrainee: newTrainee,
    }));
  };

  const compare = (a, b) => {
    let first = moment(a.created?.toDate());
    let second = moment(b.created?.toDate());
    //console.warn(`${a.name} on ${first} VS ${b.name} On ${second}`);

    if (
      !first ||
      !second ||
      !first.isValid() ||
      !second.isValid() ||
      !a.name ||
      !b.name
    ) {
      return 0;
    }

    if (first.isAfter(second)) {
      return -1;
    } else if (first.isBefore(second)) {
      return 1;
    } else {
      return 0;
    }
  };

  const setNewTraineesAmount = (size) => {
    let prev = traineeContextRef.current;

    traineeContextRef.current = {
      ...prev,
      newTraineesAmout: size,
    };

    _setControlFitContext((prevState) => ({
      ...prev,
      newTraineesAmout: size,
    }));
  };

  const cleanTraineeContext = () => {
    let prev = traineeContextRef.current;
    traineeContextRef.current = {
      ...prev,
      detailedTrainee: {},
      trainees: [],
      events: [],
      workouts: [],
      newTraineesAmout: [],
      notifications: [],
    };

    _setControlFitContext((prevState) => ({
      ...prevState,
      detailedTrainee: {},
      trainees: [],
      events: [],
      workouts: [],
      newTraineesAmout: [],
      notifications: [],
    }));
  };

  const setTraineeContext = (
    value,
    field,
    shouldConcatField,
    shouldConcatAll
  ) => {
    let prev = traineeContextRef.current;

    if (shouldConcatAll) {
      if (shouldConcatField) {
        traineeContextRef.current = {
          ...prev,
          [field]: [...prev[field], value].sort(compare),
        };

        _setControlFitContext((prevState) => ({
          ...prevState,
          [field]: [...prevState[field], value].sort(compare),
        }));
      } else {
        traineeContextRef.current = {
          ...prev,
          [field]: [...value].sort(compare),
        };

        _setControlFitContext((prevState) => ({
          ...prevState,
          [field]: [...value].sort(compare),
        }));
      }
    } else {
      if (shouldConcatField) {
        traineeContextRef.current = {
          [field]: [...prev[field], value].sort(compare),
        };

        _setControlFitContext((prevState) => ({
          [field]: [...prevState[field], value].sort(compare),
        }));
      } else {
        traineeContextRef.current = {
          [field]: [value].sort(compare),
        };
        _setControlFitContext({
          [field]: [value].sort(compare),
        });
      }
    }
  };

  // useEffect(() => {
  //   let unsubscribe = getTraineesRealtime();

  //   return () => {
  //     unsubscribe();
  //   };
  // }, []);

  const getTraineesRealtime = () => {
    let unsubscribe;
    getRecentTrainees()
      .then((res) => {
        setNewTraineesAmount(res.size);
        let refArr = [];
        res.forEach((doc) => {
          refArr.push(doc.id);
        });

        unsubscribe = firestore
          .collection(traineeCollection)
          .orderBy("created", "desc")
          .onSnapshot(
            (snapshot) => {
            //  console.log("onSnapshot Called!", traineeContextRef.current);

              snapshot.docChanges().forEach(async (change, i) => {
                let id = change.doc.id;

                if (
                  !refArr.includes(id) &&
                  moment(change.doc.data().created.toDate()).isAfter(
                    moment().subtract(30, "days").toDate()
                  )
                ) {
                  setNewTraineesAmount(
                    traineeContextRef.current.newTraineesAmout + 1
                  );
                }

                const newTrainee = { ...change.doc.data(), docId: id };
                if (newTrainee.workouts?.length > 0) {
                  newTrainee.workouts.forEach((a) => {
                    let exist = traineeContextRef.current.workouts?.some(
                      (el) => el.id === a.id
                    );

                    let existNotf = traineeContextRef.current.notifications?.some(
                      (el) => el.id === a.id
                    );

                    const newWork = { ...a };
                    newWork.start = a.start.toDate();
                    if (a.end) {
                      newWork.end = a.end.toDate();
                    }


                    if (
                      checkIsToday(newWork.start) && !existNotf
                    ) {

                      const notification = {
                        ...newWork,
                        startStr: moment(newWork.start).format("HH:mm"),
                      };

                      if (change.type !== "added") {
                        if (change.type === "modified") {
                          let news = traineeContextRef.current.notifications.filter(
                            (e) => {
                              return e.id !== notification.id;
                            }
                          );
                          let updated = [...news, notification];
                          setTraineeContext(
                            updated,
                            notificationField,
                            false,
                            true
                          );
                        } else if (change.type === "removed") {
                          let news = traineeContextRef.current.notifications.filter(
                            (e) => {
                              return e.id !== notification.id;
                            }
                          );
                          setTraineeContext(
                            news,
                            notificationField,
                            false,
                            true
                          );
                        }
                      } else {
                        setTraineeContext(
                          notification,
                          notificationField,
                          true,
                          true
                        ); //value, field,cocnatfield,concatall
                      }
         
                    }

                    if (exist) {
                     // console.log("strike");
                      return;
                    } else {
                      setTraineeContext(newWork, workoutsField, true, true); //value, field,cocnatfield,concatall

                    }

                  });
                }
                const updatedtrainee = { ...newTrainee, change: change.type };

                //get programs context
                if (updatedtrainee?.program && updatedtrainee.program.length > 0) {
                  var results = await Promise.all(
                    updatedtrainee.program.map(async (e) => {
                      let program = await (
                        await getTraineesProgram(e.id)
                      ).data();
                      let updated = { ...e, ...program };

                      return updated;
                    })
                  );
                  updatedtrainee.program = results;
                }

                if (change.type === "added") {
                  //console.log("New : ", updatedtrainee);
                  setTraineeContext(updatedtrainee, traineeField, true, true); //value, field,cocnatfield,concatall
                }
                if (change.type === "modified") {
                  // console.log(
                  //   "Modified : ",
                  //   updatedtrainee,
                  //   change.oldIndex,
                  //   change.newIndex
                  // );
                  //check if the detailed trainee changed
                  if (
                    traineeContextRef.current.detailedTrainee.docId ===
                    updatedtrainee.docId
                  ) {
                 //   console.warn("updating detailed trainee", updatedtrainee);
                    setDetailedTraineeContext(updatedtrainee);
                  }

                  let news = traineeContextRef.current.trainees.filter((e) => {
                    return e.docId !== updatedtrainee.docId;
                  });
                  let updated = [...news, updatedtrainee];
                  setTraineeContext(updated, traineeField, false, true); //value, field,cocnatfield,concatall
                }
                if (change.type === "removed") {
                  // console.log(
                  //   "Removed : ",
                  //   updatedtrainee,
                  //   change.oldIndex,
                  //   change.newIndex
                  // );
                  let news = traineeContextRef.current.trainees.filter((e) => {
                    return e.docId !== updatedtrainee.docId;
                  });

                  setTraineeContext(news, traineeField, false, true); //value, field,cocnatfield,concatall
                }
              });
            },
            (e) => {
              console.error("snapshot error", e);
            }
          );
      })
      .catch((e) => {
        console.log("error getting new Trainees", e);
      });

    return unsubscribe;
  };

  const getEventsRealtime = () => {
    let unsubscribes = firestore.collection(calendarCollection).onSnapshot(
      (snapshot) => {
      //  console.log("event listener Called!");

        snapshot.docChanges().forEach((change) => {
          let id = change.doc.id;
          const newEvent = { ...change.doc.data(), docId: id };

          newEvent.start = newEvent.start.toDate();
          if (newEvent.end) {
            newEvent.end = newEvent.end.toDate();
          }


          if (
            checkIsToday(newEvent.start)
          ) {
            const notification = {
              ...newEvent,
              startStr: moment(newEvent.start).format("HH:mm"),
            };

            if (change.type !== "added") {
            //  console.log("NOTF", notification);
              if (change.type === "modified") {
                //TODO: FIX THAT IT'S A STRING
                let news = traineeContextRef.current.notifications.filter(
                  (e) => {
                    return e.id != notification.id;
                  }
                );
                let updated = [...news, notification];

                setTraineeContext(updated, notificationField, false, true);
              } else if (change.type === "removed") {
                let news = traineeContextRef.current.notifications.filter(
                  (e) => {
                    return e.id !== notification.id;
                  }
                );

                setTraineeContext(news, notificationField, false, true);
              }
            } else {
              setTraineeContext(notification, notificationField, true, true); //value, field,cocnatfield,concatall
            }
          }

          if (change.type === "added") {
          //  console.log("New : ", newEvent);

            setTraineeContext(newEvent, eventsField, true, true); //value, field,cocnatfield,concatall
          }
          if (change.type === "modified") {
            // console.log(
            //   "Modified : ",
            //   newEvent,
            //   change.oldIndex,
            //   change.newIndex
            // );
            let news = traineeContextRef.current.events.filter((e) => {
              return e.docId !== newEvent.docId;
            });

            let updated = [...news, newEvent];

            setTraineeContext(updated, eventsField, false, true); //value, field,cocnatfield,concatall
          }
          if (change.type === "removed") {
            // console.log(
            //   "Removed : ",
            //   newEvent,
            //   change.oldIndex,
            //   change.newIndex
            // );
            let news = traineeContextRef.current.events.filter((e) => {
              return e.docId !== newEvent.docId;
            });

            setTraineeContext(news, eventsField, false, true); //value, field,cocnatfield,concatall
          }
        });
      },
      (e) => {
        console.error("snapshot error", e);
      }
    );
    return unsubscribes;
  };

  useEffect(() => {
    //maybe do some cleanup on null
    let unsubscribe;
    let eventsUnsubscribe;
    if (!auth.isLoading) {
      lis.onAuthStateChanged((user) => {
        if (user) {
          unsubscribe = getTraineesRealtime();
          eventsUnsubscribe = getEventsRealtime();
          const fromStorage = JSON.parse(localStorage.getItem("detailedTrainee"));
          if (fromStorage) {
            setDetailedTraineeContext(fromStorage);
          }
        } else {
          unsubscribe && unsubscribe();
          eventsUnsubscribe && eventsUnsubscribe();
          cleanTraineeContext();
        }
      });

      // if (auth.user) {
      //   unsubscribe = getTraineesRealtime();
      //   eventsUnsubscribe = getEventsRealtime();
      //   console.log("details in context", controlFitContext.detailedTrainee);
      //   const fromStorage = JSON.parse(localStorage.getItem("detailedTrainee"));
      //   console.log("from storage is", fromStorage);
      //   if (fromStorage) {
      //     setDetailedTraineeContext(fromStorage);
      //   }
      // } else {
      //   unsubscribe && unsubscribe();
      //   eventsUnsubscribe && eventsUnsubscribe();
      //   console.error("cleanning up");
      //   cleanTraineeContext();
      // }
    }

    return () => {
      unsubscribe && unsubscribe();
      eventsUnsubscribe && eventsUnsubscribe();
      cleanTraineeContext();
    };
  }, [auth.isLoading]);

  return (
    <ControlFitContext.Provider value={controlFitContext}>
      {children}
    </ControlFitContext.Provider>
  );
}
