import app from "firebase/app";
import "firebase/firestore";
import "firebase/auth";
import 'firebase/storage'; 
import 'firebase/analytics';
import 'firebase/performance';
const { REACT_APP_FIREBASE_APP_KEY,REACT_APP_FIREBASE_AUTH_DOMAIN,REACT_APP_FIREBASE_PROJECT_ID
  ,REACT_APP_FIREBASE_STORAGE_BUCKET,REACT_APP_FIREBASE_MESSAGING_SENDER_ID
  , REACT_APP_FIREBASE_APP_ID,REACT_APP_FIREBASE_MEASUREMENT_ID} = process.env;
  
  
  let firebaseConfig = {
      apiKey: REACT_APP_FIREBASE_APP_KEY,
      authDomain: REACT_APP_FIREBASE_AUTH_DOMAIN,
      projectId: REACT_APP_FIREBASE_PROJECT_ID,
      storageBucket: REACT_APP_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
      appId: REACT_APP_FIREBASE_APP_ID,
      measurementId: REACT_APP_FIREBASE_MEASUREMENT_ID,
    };
  

  const firebase = !app.apps.length ? app.initializeApp(firebaseConfig) : app.app();
  const auth = app.auth();
  const firestore = app.firestore();
  const storageRef = firebase.storage().ref();
  const fieldValue = app.firestore.FieldValue;
  const time = app.firestore.Timestamp;
  app.analytics();
  app.performance();

  export {auth,firestore,storageRef,fieldValue,time};