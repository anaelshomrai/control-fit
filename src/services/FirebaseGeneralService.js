import {storageRef,auth} from "../Util/Firebase";

// Genereal (Upload, SignIn,SignOut)


export const uploadFile = (name, file) => {
  let fileRef = storageRef.child(name);
  return fileRef.put(file);
}

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
    displayName: "Anael Shomrai|אנאל שומראי",
  }).then(function() {
    // Update successful.
  }).catch(function(error) {
    // An error happened.
  });
}

//oneTimeNameUpdate();





