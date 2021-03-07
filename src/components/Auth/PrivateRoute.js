import { Route, Redirect } from 'react-router-dom';
import { useAuth } from "../Auth/ProvideAuth";

export default function PrivateRoute({ component: Component, ...rest }) {
  let auth = useAuth();

  return (
    <>
    {
      !auth.isLoading  && 
      <Route
      {...rest}
      render={({ location,props }) =>
      auth.user ?  (
        <Component {...props} /> 
        ) : (
          <Redirect
            to={{
              pathname: "/login",
              state: { from: location }
            }}
          />
        )
      }
    />
    }
    </>
  );
}


