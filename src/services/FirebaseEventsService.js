import moment from "moment";
import {firestore,time} from "../Util/Firebase";


const calendarCollection = "events";

const calendarDb = firestore.collection(calendarCollection);

// Events

export const getNotifications = () => {
  let m1 = moment().startOf('day');
  let m2 = moment().endOf('day');

  return calendarDb
  .orderBy("start")
  .where("start", ">=", m1.toDate())
  .where("start", "<=", m2.toDate())
  .get();
}

export const updateEvent = (event) => {
  return calendarDb.doc(event.docId).update(event);
}

export const deleteEvent = (id) => {
  return calendarDb.doc(id).delete();
}

export const addEvent = (event) => {  
  return calendarDb.add({
    ...event,
    start: time.fromDate(event.start)
  });
}

export const getEvents = () => {
  return calendarDb.get();
}
