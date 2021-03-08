import { useAuth } from "../Auth/ProvideAuth";
import { useState } from "react";
import {
  TextField,
  Button,
  Link,
  Dialog,
  Grid,
  DialogContentText,
  Fab,
  FormLabel,
  Icon,
  InputAdornment,
  useMediaQuery,
} from "@material-ui/core";
import { Formik } from "formik";
import * as Yup from "yup";
import { sendPasswordResetEmail } from "../../Util/Firebase";
import { useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "../TraineeForm/css/dialog.css";

export default function Login(props) {
  let auth = useAuth();
  const history = useHistory();
  const { t } = useTranslation();
  const [isError, setIsError] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetMessage, setResetMessage] = useState();
  const [resetStatus, setResetStatus] = useState(0);
  const isTabletOrMobile = useMediaQuery("(max-width: 1224px)");

  const login = async (values) => {
    const res = await auth.signin(values.username, values.password);
    if (res) {
      let message;
      switch (res.code) {
        case "auth/user-not-found":
          message = t("LOGIN_USER_NOT_FOUND_ERROR");
          break;
        case "auth/wrong-password":
          message = t("LOGIN_WRONG_PASSWORD_ERROR");
          break;
        default:
          message = res.message;
      }
      setIsError(message);
    } else {
      setIsError(false);
      history.push("/");
    }
  };

  return (
    <Formik
      initialValues={{
        username: "",
        password: "",
      }}
      enableReinitialize={true}
      onSubmit={(values, { setSubmitting }) => {
        login(values);
      }}
      validationSchema={Yup.object().shape({
        username: Yup.string()
          .email(t("LOGIN_EMAIL_REQUIRED"))
          .required(t("LOGIN_NAME_REQUIRED")),
      })}
    >
      {(props) => {
        const { values, touched, errors, handleChange, handleSubmit } = props;
        return (
          <form
            onSubmit={handleSubmit}
            style={
              isTabletOrMobile
                ? {
                    backgroundColor: "white",
                    boxShadow:
                      "0px 2px 1px -1px rgb(0 0 0 / 20%), 0px 1px 1px 0px rgb(0 0 0 / 14%), 0px 1px 3px 0px rgb(0 0 0 / 12%)",
                  }
                : {
                    backgroundColor: "white",
                    boxShadow:
                      "0px 2px 1px -1px rgb(0 0 0 / 20%), 0px 1px 1px 0px rgb(0 0 0 / 14%), 0px 1px 3px 0px rgb(0 0 0 / 12%)",
                    width: "60%",
                  }
            }
          >
            <Grid
              container
              justify="center"
              style={{
                height: "100%",
                margin: 0,
              }}
            >
              {showForgotPassword && (
                <Formik
                  initialValues={{
                    email: "",
                  }}
                  enableReinitialize={true}
                  onSubmit={(values, { resetForm, setErrors }) => {
                    sendPasswordResetEmail(values.email)
                      .then((res) => {
                        setResetStatus("success");
                        setResetMessage(res);
                        resetForm({ values: "" });
                      })
                      .catch((e) => {
                        setResetStatus("failure");
                        setResetMessage(e);
                      });
                  }}
                  validationSchema={Yup.object().shape({
                    email: Yup.string().email(t("LOGIN_EMAIL_REQUIRED")),
                  })}
                >
                  {(props) => {
                    const {
                      values,
                      touched,
                      errors,
                      handleChange,
                      handleSubmit,
                    } = props;
                    return (
                      <Dialog
                        scroll={"paper"}
                        fullWidth={true}
                        //style={{width:"50%"}}
                        open={true}
                        aria-labelledby="form-dialog-title"
                        maxWidth={false}
                        classes={
                          isTabletOrMobile
                            ? {}
                            : {
                                paperFullWidth: "dialogSizeLogin", // class name, e.g. `classes-nesting-root-x`
                              }
                        }
                        onClose={() => {
                          setShowForgotPassword(!showForgotPassword);
                        }}
                      >
                        <form
                          onSubmit={handleSubmit}
                          style={{
                            backgroundColor: "white",
                            boxShadow:
                              "0px 2px 1px -1px rgb(0 0 0 / 20%), 0px 1px 1px 0px rgb(0 0 0 / 14%), 0px 1px 3px 0px rgb(0 0 0 / 12%)",
                          }}
                        >
                          <Grid container justify="flex-start" style={{}}>
                            <Grid
                              item
                              xs={12}
                              lg={12}
                              md={12}
                              sm={12}
                              xl={12}
                              align="center"
                            >
                              <h2>{t("LOGIN_FORGOT_PASSWORD")}</h2>
                            </Grid>

                            <Grid
                              item
                              xs={12}
                              lg={12}
                              md={12}
                              sm={12}
                              xl={12}
                              align="center"
                            >
                              <DialogContentText
                                style={{ width: "95%", textAlign: "start" }}
                              >
                                <strong>{t("FORM_NOTE_TITLE")}</strong>
                                {t("LOGIN_FORM_NOTE")}
                              </DialogContentText>
                            </Grid>

                            <Grid
                              item
                              xs={12}
                              lg={12}
                              md={12}
                              sm={12}
                              xl={12}
                              align="center"
                            >
                              <TextField
                                style={{ width: "95%" }}
                                name="email"
                                id="input-with-icon-grid"
                                label={"Email"}
                                type="email"
                                InputProps={{
                                  endAdornment: (
                                    <InputAdornment position="end">
                                      <Icon
                                        style={{ fontSize: "1.4em" }}
                                        className="far fa-envelope"
                                      />
                                    </InputAdornment>
                                  ),
                                }}
                                value={values.email}
                                onChange={handleChange}
                                error={touched.email && Boolean(errors.email)}
                                helperText={
                                  errors.email && touched.email && errors.email
                                }
                              />
                            </Grid>

                            <Grid
                              item
                              xs={12}
                              lg={12}
                              md={12}
                              sm={12}
                              xl={12}
                              align="center"
                            >
                              {resetStatus === "success" && (
                                <h4 style={{ color: "#1f285a" }}>
                                  {t("LOGIN_EMAIL_SUCCESS")}
                                </h4>
                              )}

                              {resetStatus === "failure" && (
                                <h4 style={{ color: "red" }}>
                                  {resetMessage.message}
                                  {/* TODO: FIX TRAINSALTION */}
                                </h4>
                              )}
                            </Grid>

                            <Grid
                              item
                              xs={12}
                              lg={12}
                              md={12}
                              sm={12}
                              xl={12}
                              align="center"
                              //  style={{ display: "flex", justifyContent: "flex-end" }}
                              //style={{position: "fixed", bottom: "12%", right: "10%"}}
                              style={{ textAlign: "end", padding: "8px" }}
                            >
                              <Button
                                color="secondary"
                                onClick={() => {
                                  setShowForgotPassword(!showForgotPassword);
                                }}
                              >
                                {t("CANCEL")}
                              </Button>
                              <Button
                                color="primary"
                                type="submit"
                                endIcon={
                                  <Icon
                                    style={
                                      isTabletOrMobile
                                        ? { fontSize: "1.5rem" }
                                        : {}
                                    }
                                  >
                                    save
                                  </Icon>
                                }
                                onClick={handleSubmit}
                              >
                                {t("SUBMIT")}
                              </Button>
                            </Grid>
                          </Grid>
                        </form>
                      </Dialog>
                    );
                  }}
                </Formik>
              )}

              <Grid item xs={12} lg={12} md={12} sm={12} xl={12} align="center">
                <h2>{t("LOGIN_TITLE")}</h2>
              </Grid>

              <Grid
                item
                xs={3}
                lg={3}
                md={3}
                sm={3}
                xl={3}
                align="center"
                style={{
                  padding: "8px",
                }}
              >
                <FormLabel component="legend">
                  {t("LOGIN_USERNAME_FIELD")}
                </FormLabel>
              </Grid>

              <Grid
                item
                xs={9}
                lg={9}
                md={9}
                sm={9}
                xl={9}
                align="center"
                style={{
                  padding: "8px",
                }}
              >
                <TextField
                  style={isTabletOrMobile ? {
                    width: "90%",
                    //     border: "1px solid rgb(63 81 181)",
                  } : { width: "60%",}}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Icon
                          style={{ fontSize: "1.4em" }}
                          className="far fa-envelope"
                        />
                      </InputAdornment>
                    ),
                  }}
                  id="username"
                  name="username"
                  autoFocus={true}
                  value={values.username}
                  onChange={handleChange}
                  error={touched.username && Boolean(errors.username)}
                  helperText={
                    errors.username && touched.username && errors.username
                  }
                />
              </Grid>

              <Grid
                item
                xs={3}
                lg={3}
                md={3}
                sm={3}
                xl={3}
                align="center"
                style={{
                  padding: "8px",
                }}
              >
                <FormLabel component="legend">
                  {t("LOGIN_PASSWORD_FIELD")}
                </FormLabel>
              </Grid>

              <Grid
                item
                xs={9}
                lg={9}
                md={9}
                sm={9}
                xl={9}
                align="center"
                style={{
                  padding: "8px",
                }}
              >
                <TextField
                   style={isTabletOrMobile ? {
                    width: "90%",
                    //     border: "1px solid rgb(63 81 181)",
                  } : { width: "60%",}}
                  id="password"
                  name="password"
                  type="password"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Icon
                          style={{ fontSize: "1.4em" }}
                          className="fas fa-key"
                        />
                      </InputAdornment>
                    ),
                  }}
                  autoFocus={true}
                  value={values.password}
                  onChange={handleChange}
                  error={touched.password && Boolean(errors.password)}
                  helperText={
                    errors.password && touched.password && errors.password
                  }
                />
              </Grid>

              {isError && <div className="text-danger">{isError}</div>}

              <Grid
                item
                xs={12}
                lg={12}
                md={12}
                sm={12}
                xl={12}
                align="end"
                style={{
                  paddingInlineEnd: "8px",
                }}
              >
                <Fab
                  type="submit"
                  variant="extended"
                  color="primary"
                  size={"medium"}
                  onClick={(e) => {
                    handleSubmit(e);
                  }}
                >
                  {t("LOGIN_TITLE")} &nbsp;
                  <Icon
                    style={{ fontSize: "1.4em" }}
                    className="fas fa-sign-in-alt"
                  />
                </Fab>
              </Grid>

              <Grid
                item
                xs={12}
                lg={12}
                md={12}
                sm={12}
                xl={12}
                align="center"
                style={{
                  padding: "8px",
                }}
              >
                <Link
                  href="#"
                  variant="body2"
                  onClick={() => {
                    setShowForgotPassword(!showForgotPassword);
                  }}
                >
                  {t("LOGIN_FORGOT_PASSWORD")}?
                </Link>
              </Grid>
            </Grid>
          </form>
        );
      }}
    </Formik>
  );
}
