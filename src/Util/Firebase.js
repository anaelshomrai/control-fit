import app from "firebase/app";
import "firebase/firestore";
import "firebase/auth";
import 'firebase/storage'; 
import moment from "moment";
import 'firebase/analytics';
import 'firebase/performance';
const { REACT_APP_FIREBASE_APP_KEY,REACT_APP_FIREBASE_AUTH_DOMAIN,REACT_APP_FIREBASE_PROJECT_ID
,REACT_APP_FIREBASE_STORAGE_BUCKET,REACT_APP_FIREBASE_MESSAGING_SENDER_ID
, REACT_APP_FIREBASE_APP_ID,REACT_APP_FIREBASE_MEASUREMENT_ID} = process.env;


 //to export to env file
let firebaseConfig = {
    apiKey: REACT_APP_FIREBASE_APP_KEY,
    authDomain: REACT_APP_FIREBASE_AUTH_DOMAIN,
    //databaseURL: "https://test-f8ea4.firebaseio.com",
    projectId: REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: REACT_APP_FIREBASE_APP_ID,
    measurementId: REACT_APP_FIREBASE_MEASUREMENT_ID,
    //sotrageURL: "gs://test-f8ea4.appspot.com/",
  };


// const config = {
//   apiKey: process.env.REACT_APP_API_KEY,
//   authDomain: process.env.REACT_APP_AUTH_DOMAIN,
//   databaseURL: process.env.REACT_APP_DATABASE_URL,
//   projectId: process.env.REACT_APP_PROJECT_ID,
//   storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
//   messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
// };

const settings = { /* your settings... */ timestampsInSnapshots: true };

const firebase = !app.apps.length ? app.initializeApp(firebaseConfig) : app.app();
export const auth = app.auth();
export const firestore = app.firestore();
//.settings(settings);
export const storageRef = firebase.storage().ref();

app.analytics();
app.performance();


const traineesCollection = "trainees";
const orderBy = "created";

const idsCollection = "ID";
const idDoc = "eventIds";

const calendarCollection = "events";

const traineesPrograms = "programs";

// Trainee

export const getTraineeWorkouts = (id) => {
  return firestore.collection(traineesCollection).doc(id).get();
}

export const getNotificationOfTrainee = () => {
  return firestore.collection(traineesCollection).orderBy("workouts").get();
}

export const deleteTrainee = (id) => {
  return firestore.collection(traineesCollection).doc(id).delete();
}

export const addTrainee = (trainee) => {
  //add timestamp of creation time
  return firestore
  .collection(traineesCollection)
  .add({...trainee,
    "created" : app.firestore.Timestamp.fromDate(new Date()),
    "tracker" : [],
    "isActive": true,
    "paidWorkouts": 0
  });
}

export const addTraineeFilesIntial = (id,files,type) => {
  let ref = firestore.collection(traineesCollection).doc(id);
  return ref.update({
    [type]: files
  });
}

export const updateTraineeField = (id,updated,field,shouldConcat,shouldConcatItem) => {
  let ref = firestore.collection(traineesCollection).doc(id);
  return ref.update({
    [field]: shouldConcat ? 
    shouldConcatItem ?
    app.firestore.FieldValue.arrayUnion(...updated) :
    app.firestore.FieldValue.arrayUnion(updated) 
    : updated
  });
}

// export const getTraineeByName = (name) => {
//   return firestore
//   .collection(traineesCollection).orderBy('name').startAt(name).endAt(name + "\uf8ff").get();
// }

// export const getNextTrainees = (index,limit) => {
//   console.log("firebase",index,index[orderBy]);
//  return firestore.collection(traineesCollection).orderBy(orderBy, 'desc').startAfter(index[orderBy]).limit(limit).get();

// }

export const getRecentTrainees = () => {
  return firestore.collection(traineesCollection)
  .where(orderBy,">", moment().subtract(30, 'days').toDate())
  .get();
}

export const updateTrainee = (trainee) => {
  return firestore.collection(traineesCollection).doc(trainee.docId).update(trainee);
}

// Events

export const getNotifications = () => {
  let m1 = moment().startOf('day');
  let m2 = moment().endOf('day');

  return firestore.collection(calendarCollection)
  .orderBy("start")
  .where("start", ">=", m1.toDate())
  .where("start", "<=", m2.toDate())
  .get();
}

export const updateEvent = (event) => {
  return firestore.collection(calendarCollection).doc(event.docId).update(event);
}

export const deleteEvent = (id) => {
  return firestore.collection(calendarCollection).doc(id).delete();
}

export const addEvent = (event) => {
  //add timestamp of creation time
  
  return firestore.collection(calendarCollection).add({
    ...event,
    start: app.firestore.Timestamp.fromDate(event.start)
  });
}

export const getEvents = () => {
  return firestore.collection(calendarCollection).get();
}


// Programs

export const getTraineesProgram = (id) => {
  return firestore
  .collection(traineesPrograms).doc(id).get();
}

export const deleteProgram = (id) => {
  return firestore.collection(traineesPrograms).doc(id).delete();
}

export const addTraineesProgram = (program) => {
  return firestore
  .collection(traineesPrograms)
  .add({...program,
    "created" : app.firestore.Timestamp.fromDate(new Date())
  });
}

export const getNextProgramId = async (program) => {
  let ref = await firestore.collection(traineesPrograms).doc();
  return ref.id;
}

// IDs

export const getCurrentIds = () => {
  return firestore.collection(idsCollection).doc(idDoc).get();
}

export const increaseEventId = (id) => {
  let ref = firestore.collection(idsCollection).doc(idDoc);
  return ref.update({
    id: ++id
  });
}


// Genereal (Upload, SignIn,SignOut)

export const uploadFile = (name, file) => {
  let fileRef = storageRef.child(name);
  return fileRef.put(file);
}

//check how i do partial update
// Set the "capital" field of the city 'DC'
// db.collection("cities").doc("DC").update({
//   capital: true
// });

export const signIn = (email,pass) => {
    return auth
      .signInWithEmailAndPassword(email, pass);
  };

export const signOut = () => {
    return auth.signOut();
}

export const sendPasswordResetEmail = (emailAddress) => {
  return auth.sendPasswordResetEmail(emailAddress);
}

export const oneTimeNameUpdate = (emailAddress) => {
  auth.currentUser.updateProfile({
    displayName: "Anael Shomrai",
    name: "Anael Shomrai"
  }).then(function() {
    // Update successful.
  }).catch(function(error) {
    // An error happened.
  });
}

//oneTimeNameUpdate();


// export const addUserToGroceryList = (userName, groceryListId, userId) => {
//     return db.collection('groceryLists')
//         .doc(groceryListId)
//         .update({
//             users: firebase.firestore.FieldValue.arrayUnion({ 
//                 userId: userId,
//                 name: userName
//             })
//         });
// };






