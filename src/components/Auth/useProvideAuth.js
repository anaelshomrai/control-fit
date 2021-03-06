import { useEffect, useState } from "react";
import {signIn,signOut
 //, oneTimeNameUpdate
 } from "../../services/FirebaseGeneralService";
 import {auth} from "../../Util/Firebase";

export default function useProvideAuth() {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      auth.onAuthStateChanged((user) => {
        if (user) {
          setUser(user);
        } else {
          setUser(null);
        }
        setIsLoading(false);
      });
    }, []);

    const signin = (email,pass) => {
      return signIn(email,pass).then((res) => {
        setUser(res.user);
        //oneTimeNameUpdate();
        return null;

      })
      .catch((error) => {
        return error;

      });
    };
  
    const signout = () => {
      signOut().then(() => {
        // Sign-out successful.
        setUser(null);

      }).catch((error) => {
      });
      
    };
  
    return {
      isLoading,
      user,
      signin,
      signout
    };
  }