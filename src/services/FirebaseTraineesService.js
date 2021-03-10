import moment from "moment";
import {firestore,fieldValue,time} from "../Util/Firebase";

const traineesCollection = "trainees";
const orderBy = "created";

const traineeDb = firestore.collection(traineesCollection);

// Trainee

export const getTraineeWorkouts = (id) => {
  return traineeDb.doc(id).get();
}

export const getNotificationOfTrainee = () => {
  return traineeDb.orderBy("workouts").get();
}

export const deleteTrainee = (id) => {
  return traineeDb.doc(id).delete();
}

export const addTrainee = (trainee) => {
  //add timestamp of creation time
  return firestore
  .collection(traineesCollection)
  .add({...trainee,
    "created" : time.fromDate(new Date()),
    "tracker" : [],
    "isActive": true,
    "paidWorkouts": 0
  });
}

export const addTraineeFilesIntial = (id,files,type) => {
  let ref = traineeDb.doc(id);
  return ref.update({
    [type]: files
  });
}

export const updateTraineeField = (id,updated,field,shouldConcat,shouldConcatItem) => {
  let ref = traineeDb.doc(id);
  return ref.update({
    [field]: shouldConcat ? 
    shouldConcatItem ?
    fieldValue.arrayUnion(...updated) :
    fieldValue.arrayUnion(updated) 
    : updated
  });
}

export const getRecentTrainees = () => {
  return traineeDb
  .where(orderBy,">", moment().subtract(30, 'days').toDate())
  .get();
}

export const updateTrainee = (trainee) => {
  return traineeDb.doc(trainee.docId).update(trainee);
}