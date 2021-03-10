import {firestore,time} from "../Util/Firebase";


const traineesPrograms = "programs";

const programsDb = firestore.collection(traineesPrograms);


// Programs

export const getTraineesProgram = (id) => {
  return firestore
  .collection(traineesPrograms).doc(id).get();
}

export const deleteProgram = (id) => {
  return programsDb.doc(id).delete();
}

export const addTraineesProgram = (program) => {
  return firestore
  .collection(traineesPrograms)
  .add({...program,
    "created" : time.fromDate(new Date())
  });
}

export const getNextProgramId = async (program) => {
  let ref = await programsDb.doc();
  return ref.id;
}