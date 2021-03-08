import { useAuth } from "../Auth/ProvideAuth";
import moment from "moment";
import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Button,
  ButtonGroup,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Typography,
  useTheme,
} from "@material-ui/core";
import ControlFitContext from "../Context/ControlFitContext";
import { useTranslation } from "react-i18next";
export default function Welcome() {
  const auth = useAuth();
  const { t } = useTranslation();
  const [time, setTime] = useState(moment().format("h:mm:ss a"));
  const [weatherData, setWeatherData] = useState();
  const [iconUrl, setIconUrl] = useState("");
  const [greeting, setGreeting] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { trainees, newTraineesAmout } = useContext(ControlFitContext);
  const [name, setName] = useState("");
  const [error, setError] = useState(false);
  const city = t("TEL_AVIV");
  const country = "Israel";

  const apiKey = process.env.REACT_APP_OPEN_WEATHER_API_KEY;
  const apiUrl = process.env.REACT_APP_OPEN_WEATHER_API_URL;
  const imageUrl = process.env.REACT_APP_OPEN_WEATHER_API_IMAGE_URL;

  const theme = useTheme();

  useEffect(() => {
    auth.user.providerData.forEach(function (profile) {
      // console.log("Sign-in provider: " + profile.providerId);
      // console.log("  Provider-specific UID: " + profile.uid);
      // console.log("  Name: " + profile.displayName);
      // console.log("  Email: " + profile.email);
      // console.log("  Photo URL: " + profile.photoURL);
      let split = theme.chosenLang === "en" ? profile.displayName.split("|")[0] : profile.displayName.split("|")[1];

      setName(split);
    });
  },[theme.direction,theme.chosenLang,auth.user])


  useEffect(() => {
    setGreeting(t("WELCOME_HELLO"));
    const timeInterval = setInterval(() => {
      setTime(moment().format("h:mm:ss a"));
      const currentHour = moment().format("HH");

      if (currentHour >= 3 && currentHour < 12) {
        setGreeting(t("WELCOME_GOOD_MORNING"));
      } else if (currentHour >= 12 && currentHour < 15) {
        setGreeting(t("WELCOME_GOOD_AFTERNOON"));
      } else if (currentHour >= 15 && currentHour < 20) {
        setGreeting(t("WELCOME_GOOD_EVENING"));
      } else if (currentHour >= 20) {
        setGreeting(t("WELCOME_GOOD_NIGHT"));
      } else {
        setGreeting(t("WELCOME_HELLO"));
      }
    }, 1000);

    async function fetchData() {
      //TODO GET CITY AND STATE?
      //console.log(Intl.DateTimeFormat().resolvedOptions().timeZone)
      let url = `${apiUrl}?q=${city},${country}&appid=${apiKey}&units=metric`;
      const response = await fetch(url);
      if (response.status !== 200) {
        setError(t("WELCOME_WEATHER_ERROR"));
        return;
      }
      const data = await response.json();
      setWeatherData(data);
      let icon = `${imageUrl}/${data.weather[0].icon}@2x.png`;
      setIconUrl(icon);
      setIsLoading(false);
    }

    fetchData();

    return () => {
      clearInterval(timeInterval);
    };
  }, []);

  return (
    <Grid
      container
      justify="center"
      style={{
        backgroundColor: "white",
        boxShadow:
          "0px 2px 1px -1px rgb(0 0 0 / 20%), 0px 1px 1px 0px rgb(0 0 0 / 14%), 0px 1px 3px 1px rgb(0 0 0 / 12%)",
        width: "90%",
        padding: "24px",
      }}
    >
      {isLoading && (
        <Grid item xs={12} lg={12} md={12} sm={12} xl={12}>
          <CircularProgress size={80} />
        </Grid>
      )}

      {auth.user && !isLoading && (
        <>
          <Grid item xs={12} lg={12} md={12} sm={12} xl={12}>
            <Typography
              variant="h4"
              component="h2"
              gutterBottom
              style={{ color: "#3f51b5" }}
            >
              {`${greeting} ${name}`}
            </Typography>
          </Grid>
          <Grid item xs={12} lg={12} md={12} sm={12} xl={12}>
            <Typography variant="h5" component="h2">
              {t("WELCOME_TODAY")} {moment().format("MMMM Do YYYY")}, {time}
            </Typography>
          </Grid>

          <Grid item xs={12} lg={12} md={12} sm={12} xl={12}>
            {weatherData ? (
              <Typography variant="h5" component="h2" gutterBottom>
                {city} &nbsp;
                <img
                  style={{ backgroundColor: "white" }}
                  src={iconUrl}
                  alt="weather icon"
                ></img>
                &nbsp;
                {weatherData.main.temp.toFixed(0) + "C°"}
              </Typography>
            ) : (
              <h4 style={{ color: "red" }}>{error}</h4>
            )}
          </Grid>

          <Grid
            item
            xs={12}
            lg={6}
            md={6}
            sm={12}
            xl={6}
            style={{
              marginBottom: "15px",
              boxShadow:
                "0px 2px 1px -1px rgb(0 0 0 / 100%), 0px 1px 1px 0px rgb(0 0 0 / 95%), 0px 1px 3px 1px rgb(0 0 0 / 90%)",
            }}
          >
            <Card>
              <CardContent>
                <Typography
                  gutterBottom
                  variant="h5"
                  component="h2"
                  style={{ color: "#3f51b5" }}
                >
                  {t("WELCOME_STATISTICS")}
                </Typography>
                <Typography
                  color="textSecondary"
                  style={{ textAlign: "start" }}
                >
                  {t("WELCOME_TOTAL_TRAINEES")}{" "}
                  <strong>{trainees?.length} </strong>
                </Typography>
                <Typography
                  color="textSecondary"
                  style={{ textAlign: "start" }}
                >
                  {t("WELCOME_NEW_TRAINEES")}{" "}
                  <strong>{newTraineesAmout} </strong>
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} lg={12} md={12} sm={12} xl={12}>
            <ButtonGroup
              color="primary"
              aria-label="outlined primary button group"
            >
              <Button
                component={Link}
                to="/trainees"
                style={{ fontWeight: "bold" }}
              >
                {t("WELCOME_SEE_TRAINEES")}
              </Button>
              <Button
                component={Link}
                to="/billing"
                style={{ fontWeight: "bold" }}
              >
                {t("WELCOME_CHECK_BILLING")}
              </Button>
            </ButtonGroup>
          </Grid>
        </>
      )}
    </Grid>
  );
}
