import { Route, Switch } from "react-router-dom";
import Login from "../Auth/Login";
import PrivateRoute from "../Auth/PrivateRoute";
import Welcome from "../Home/Welcome";
import TraineeHome from "../TraineeHome/TraineeHome";
import TraineeCalendar from "../Calendar/TraineeCalendar";
import TraineeDetails from "../TraineeDetails/TraineeDetails";
import { useTheme, Grid } from "@material-ui/core";
import BillingDetails from "../Billing/BillingDetails";

export default function FitRouter() {
  const theme = useTheme();

  return (
    <Grid
    container
    spacing={0}
    direction="column"
    alignItems="center"
    justify="center"
    style={{
      height: "90%",
      //paddingLeft: "24px", paddingRight: "24px", replace this with them.space
      //  maxWidth: "calc(100vw - 50px)"}}
      maxWidth: "calc(100vw)",
    }}
    //64 is the appbar and 50 is the footer
  >
    <Switch>

        <PrivateRoute exact path="/" component={Welcome}/>
        <Route path="/login" component={Login}/>

        <PrivateRoute path="/trainees" component={TraineeHome} />

        <PrivateRoute path="/calendar" component={TraineeCalendar} />

        <PrivateRoute path="/billing" component={BillingDetails} />

        <PrivateRoute
          exact
          path="/traineeDetails/:id"
          component={TraineeDetails}
        />

    </Switch>
    </Grid>

  );
}
