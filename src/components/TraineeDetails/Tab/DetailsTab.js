import {
  CircularProgress,
  ClickAwayListener,
  Fab,
  FormControlLabel,
  FormLabel,
  Grid,
  Icon,
  makeStyles,
  Radio,
  RadioGroup,
  TextField,
  useMediaQuery,
  useTheme,
} from "@material-ui/core";
import { useEffect, useState } from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import { phoneRegExp } from "../../../Util/regex";
import { Alert } from "@material-ui/lab";
import { useTranslation } from "react-i18next";
import { useStyles } from "@material-ui/pickers/views/Calendar/SlideTransition";
import { green } from "@material-ui/core/colors";
import clsx from 'clsx';

const useMyStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    alignItems: 'center',
  },
  wrapper: {
    margin: theme.spacing(1),
    position: 'relative',
  },
  buttonSuccess: {
    backgroundColor: green[500],
    '&:hover': {
      backgroundColor: green[700],
    },
  },
  fabProgress: {
    color: green[500],
    position: 'absolute',
    top: -6,
    left: -6,
    zIndex: 1,
  },
  buttonProgress: {
    color: green[500],
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12,
  },
}));
export default function DetailsTab({ id, trainee, handleDetailsUpdate }) {
  const [disabled, setDisabled] = useState(true);
  const isTabletOrMobile = useMediaQuery("(max-width: 1224px)");
  const [isError,setIsError] = useState(false);
  const { t } = useTranslation();
  const theme = useTheme();
  const [direction,setDirection] = useState(theme.direction);
  const classes = useMyStyles();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const buttonClassname = clsx({
    [classes.buttonSuccess]: success,
  });

  useEffect(() => {
    setDirection(theme.direction);
  },[theme.direction,theme.chosenLang])


  return (
    <Formik
      initialValues={{
        name: trainee?.name,
        phone: trainee?.phone,
        age: trainee?.age,
        weight: trainee?.weight,
        notes: trainee?.notes,
        gender: trainee?.gender,
        email: trainee?.email,
      }}
      enableReinitialize={true}
      onSubmit={(values, { setSubmitting }) => {
        if (!loading) {
      setSuccess(false);
      setLoading(true);

    }
        handleDetailsUpdate(values)
          .then((res) => {
            setDisabled(!disabled);
            setIsError(false);
            setSuccess(true);
            setLoading(false);
          })
          .catch((e) => {
        setLoading(false);
            console.error("formik error", e);
            setIsError(t("TRAINEE_DETAILS_TAB_UPDATE_ERROR"));
          });
      }}
      validationSchema={Yup.object().shape({
        name: Yup.string().required(t("TRAINEE_FROM_NAME_REQUIRED")),
        phone: Yup.string().matches(phoneRegExp, {
          message: t("TRAINEE_FROM_PHONE_REQUIRED"),
          excludeEmptyString: true,
        }).length(10),
        email: Yup.string()
        .email(t("TRAINEE_FROM_EMAIL_REQUIRED"))
      })}
    >
      {(props) => {
        const {
          values,
          touched,
          errors,
          handleChange,
          handleSubmit,
          handleReset,
          setErrors
        } = props;
        return (
          <form
            onSubmit={handleSubmit}
            style={{
              height: "100%",
              backgroundColor: "white",
              boxShadow:
                "0px 2px 1px -1px rgb(0 0 0 / 20%), 0px 1px 1px 0px rgb(0 0 0 / 14%), 0px 1px 3px 0px rgb(0 0 0 / 12%)",
              //  marginTop: "40px",
            }}
          >
            <Grid
              container
              justify="center"
              style={{
                height: "100%",
                margin: 0,
                width: "inherit",
              }}
              spacing={1}
            >
      {isError && (
        <ClickAwayListener
          onClickAway={() => {
            setIsError(false);
          }}
        >
          <Alert
            style={{
              width: "100%",
              justifyContent: "center",
            }}
            severity="error"
          >
            {isError}
          </Alert>
        </ClickAwayListener>
      )}
<Grid item xs={12} lg={12} md={12} sm={12} xl={12} align="center">

              <h3>{t("TRAINEE_DETAILS_TITLE")}</h3>
              </Grid>

              <Grid item xs={3} lg={3} md={3} sm={3} xl={3} align="center">
                <FormLabel
                  component="legend"
                  style={{ padding: "12px", textAlign: "end" }}
                >
                  {t("TRAINEE_DETAILS_NAME_LABEL")}
                </FormLabel>
              </Grid>

              <Grid item xs={9} lg={9} md={9} sm={9} xl={9} align="center">
                <TextField
                  style={
                    disabled
                      ? isTabletOrMobile
                        ? { width: "85%", padding: "6px 12px" }
                        : { width: "60%", padding: "6px 12px" }
                      : isTabletOrMobile
                      ? {
                          width: "85%",
                          border: "1px solid #e1e1e1",
                          padding: "6px 12px",
                        }
                      : {
                          width: "60%",
                          border: "1px solid #e1e1e1",
                          padding: "6px 12px",
                        }
                  }
                  InputProps={{ disableUnderline: true }}
                  disabled={disabled}
                  id="name"
                  name="name"
                  autoFocus={true}
                  value={values.name}
                  onChange={handleChange}
                  error={touched.name && Boolean(errors.name)}
                  helperText={errors.name && touched.name && errors.name}
                />
              </Grid>

              <Grid item xs={3} lg={3} md={3} sm={3} xl={3} align="center">
                <FormLabel
                  component="legend"
                  style={{ padding: "12px", textAlign: "end" }}
                >
                  {t("TRAINEE_DETAILS_GENDER_LABEL")}
                </FormLabel>
              </Grid>

              <Grid item xs={9} lg={9} md={9} sm={9} xl={9} align="center">
                <RadioGroup
                  name={"gender"}
                  onChange={handleChange}
                  value={values.gender}
                  style={{ alignItems: "center" }}
                >
                  {[t("TRAINEE_DETAILS_GENDER_OPTION_MALE"), t("TRAINEE_DETAILS_GENDER_OPTION_FEMALE")].map((option) => (
                    <FormControlLabel
                      key={option}
                      value={option}
                      control={<Radio />}
                      label={option}
                      style={isTabletOrMobile
                        ? { width: "85%", padding: "6px 12px" }
                        : { width: "60%", padding: "6px 12px" }
                  }
                      disabled={disabled}
                    />
                  ))}
                </RadioGroup>

                {touched.gender && errors.gender && <>{errors.gender}</>}
              </Grid>

              <Grid item xs={3} lg={3} md={3} sm={3} xl={3} align="center">
                <FormLabel
                  component="legend"
                  style={{ padding: "12px", textAlign: "end" }}
                >
                 {t("TRAINEE_DETAILS_AGE_LABEL")}
                </FormLabel>
              </Grid>

              <Grid item xs={9} lg={9} md={9} sm={9} xl={9} align="center">
                <TextField
                  style={
                    disabled
                      ? isTabletOrMobile
                        ? { width: "85%", padding: "6px 12px" }
                        : { width: "60%", padding: "6px 12px" }
                      : isTabletOrMobile
                      ? {
                          width: "85%",
                          border: "1px solid #e1e1e1",
                          padding: "6px 12px",
                        }
                      : {
                          width: "60%",
                          border: "1px solid #e1e1e1",
                          padding: "6px 12px",
                        }
                  }
                  InputProps={{ disableUnderline: true }}
                  disabled={disabled}
                  id="age"
                  name="age"
                  value={values.age}
                  onChange={handleChange}
                  error={touched.age && Boolean(errors.age)}
                  helperText={errors.age && touched.age && errors.age}
                />
              </Grid>

              <Grid item xs={3} lg={3} md={3} sm={3} xl={3} align="center">
                <FormLabel
                  component="legend"
                  style={{ padding: "12px", textAlign: "end" }}
                >
                 {t("TRAINEE_DETAILS_WEIGHT_LABEL")}
                </FormLabel>
              </Grid>

              <Grid item xs={9} lg={9} md={9} sm={9} xl={9} align="center">
                <TextField
                  style={
                    disabled
                      ? isTabletOrMobile
                        ? { width: "85%", padding: "6px 12px" }
                        : { width: "60%", padding: "6px 12px" }
                      : isTabletOrMobile
                      ? {
                          width: "85%",
                          border: "1px solid #e1e1e1",
                          padding: "6px 12px",
                        }
                      : {
                          width: "60%",
                          border: "1px solid #e1e1e1",
                          padding: "6px 12px",
                        }
                  }
                  InputProps={{ disableUnderline: true }}
                  disabled={disabled}
                  id="weight"
                  name="weight"
                  value={values.weight}
                  onChange={handleChange}
                  error={touched.weight && Boolean(errors.weight)}
                  helperText={errors.weight && touched.weight && errors.weight}
                />
              </Grid>
              <Grid item xs={3} lg={3} md={3} sm={3} xl={3} align="center">
                <FormLabel
                  component="legend"
                  style={{ padding: "12px", textAlign: "end" }}
                >
                  {t("TRAINEE_DETAILS_PHONE_LABEL")}
                </FormLabel>
              </Grid>

              <Grid item xs={9} lg={9} md={9} sm={9} xl={9} align="center">
                <TextField
                  style={
                    disabled
                      ? isTabletOrMobile
                        ? { width: "85%", padding: "6px 12px" }
                        : { width: "60%", padding: "6px 12px" }
                      : isTabletOrMobile
                      ? {
                          width: "85%",
                          border: "1px solid #e1e1e1",
                          padding: "6px 12px",
                        }
                      : {
                          width: "60%",
                          border: "1px solid #e1e1e1",
                          padding: "6px 12px",
                        }
                  }
                  InputProps={{ disableUnderline: true }}
                  disabled={disabled}
                  id="phone"
                  name="phone"
                  value={values.phone}
                  onChange={handleChange}
                  error={touched.phone && Boolean(errors.phone)}
                  helperText={errors.phone && touched.phone && errors.phone}
                />
              </Grid>
              

              <Grid item xs={3} lg={3} md={3} sm={3} xl={3} align="center">
                <FormLabel
                  component="legend"
                  style={{ padding: "12px", textAlign: "end" }}
                >
                  {t("TRAINEE_DETAILS_EMAIL_LABEL")}
                </FormLabel>
              </Grid>

              <Grid item xs={9} lg={9} md={9} sm={9} xl={9} align="center">
                <TextField
                  style={
                    disabled
                      ? isTabletOrMobile
                        ? { width: "85%", padding: "6px 12px" }
                        : { width: "60%", padding: "6px 12px" }
                      : isTabletOrMobile
                      ? {
                          width: "85%",
                          border: "1px solid #e1e1e1",
                          padding: "6px 12px",
                        }
                      : {
                          width: "60%",
                          border: "1px solid #e1e1e1",
                          padding: "6px 12px",
                        }
                  }
                  InputProps={{ disableUnderline: true }}
                  disabled={disabled}
                  id="email"
                  name="email"
                  value={values.email}
                  onChange={handleChange}
                  error={touched.email && Boolean(errors.email)}
                  helperText={errors.email && touched.email && errors.email}
                />
              </Grid>

              <Grid item xs={3} lg={3} md={3} sm={3} xl={3} align="center">
                <FormLabel
                  component="legend"
                  style={{ padding: "12px", textAlign: "end" }}
                >
                  {t("TRAINEE_DETAILS_NOTES_LABEL")}
                </FormLabel>
              </Grid>

              <Grid item xs={9} lg={9} md={9} sm={9} xl={9} align="center">
                <TextField
                  style={
                    disabled
                      ? isTabletOrMobile
                        ? { width: "85%", padding: "6px 12px" }
                        : { width: "60%", padding: "6px 12px" }
                      : isTabletOrMobile
                      ? {
                          width: "85%",
                          border: "1px solid #e1e1e1",
                          padding: "6px 12px",
                        }
                      : {
                          width: "60%",
                          border: "1px solid #e1e1e1",
                          padding: "6px 12px",
                        }
                  }
                  InputProps={{ disableUnderline: true }}
                  multiline
                  rows={4}
                  disabled={disabled}
                  id="notes"
                  name="notes"
                  value={values.notes}
                  onChange={handleChange}
                  error={touched.notes && Boolean(errors.notes)}
                  helperText={errors.notes && touched.notes && errors.notes}
                />
              </Grid>
            </Grid>

            <Grid
              container
              style={
                isTabletOrMobile && direction === "rtl" ?
                {
                      alignItems: "flex-end",
                      position: "fixed",
                      left: "2%",
                      bottom: "55px",
                      flexDirection: "column",
                      width: "15%"
                } : isTabletOrMobile && direction === "ltr" ?
                {
                      alignItems: "flex-end",
                      position: "fixed",
                      right: "2%",
                      bottom: "55px",
                      flexDirection: "column",
                      width: "15%"
                    } : !isTabletOrMobile && direction === "rtl" ?
                    {
                      alignItems: "flex-end",
                      position: "fixed",
                      left: "2%",
                      bottom: "55px",
                      flexDirection: "row-reverse",
                      width: "fit-content"
                    } : 
                    {
                      alignItems: "flex-end",
                      position: "fixed",
                      right: "2%",
                      bottom: "55px",
                      flexDirection: "row-reverse",
                      width: "fit-content"
                    }

              }
              spacing={2}
            >
              {!disabled && (
                <Grid item>
                  <Fab
                    variant="extended"
                    color="secondary"
                    size={isTabletOrMobile ? "small" : "medium"}
                    onClick={(e) => {
                      setDisabled(!disabled);
                      setErrors({})
                      handleReset({});

                    }}
                  >
                    <Icon>close</Icon>
                    {isTabletOrMobile ? "" : t("CLOSE")}
                  </Fab>
                </Grid>
              )}

              <Grid item>
                {disabled ? (
                  <Fab
                    variant="extended"
                    color="primary"
                    size={isTabletOrMobile ? "small" : "medium"}
                    onClick={(e) => {
                      e.preventDefault();
                      setDisabled(!disabled);
                    }}
                  >
                    <Icon>edit</Icon>

                    {isTabletOrMobile ? "" : t("EDIT")}
                  </Fab>
                ) : (
                  <Fab
                    type="submit"
                    variant="extended"
                    color="primary"
                    className={buttonClassname}
                    disabled={loading}
                    size={isTabletOrMobile ? "small" : "medium"}
                    onClick={(e) => {
                      // setDisabled(!disabled);
                      // handleSubmit();
                    }}
                  >
                    <Icon>save</Icon>

                    {isTabletOrMobile ? "" : t("SAVE")}
                    {loading && <CircularProgress size={24} className={classes.buttonProgress} />}
                  </Fab>
                )}
              </Grid>
            </Grid>
          </form>
        );
      }}
    </Formik>
  );
}
