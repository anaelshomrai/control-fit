import { useEffect, useState } from "react";
import "./css/DialogCustom.css";
import { DateTimePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import moment from "moment";
import * as yup from "yup";
import {
  Icon,
  Button,
  TextField,
  IconButton,
  FormLabel,
  Grid,
  DialogContentText,
  makeStyles,
  DialogTitle,
  DialogActions,
  Dialog,
  Switch,
  ClickAwayListener,
  InputAdornment,
  useMediaQuery,
  useTheme,
} from "@material-ui/core";
import { Alert, Autocomplete } from "@material-ui/lab";
import { Formik } from "formik";
import * as Yup from "yup";
import { useTranslation } from "react-i18next";
import MomentUtils from "@date-io/moment";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
  },
  button: {
    marginRight: theme.spacing(1),
  },
  closeButton: {
    position: "absolute",
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
}));

//TODO: ADD RESTORE FUNCTION THAT KEEP UNSAVED Trainee DETAILS OR IN CASE OF FAILURE
export default function FullEvent({
  traineeDisabled,
  eventInfo,
  isEditMode,
  deleteEvent,
  onClose,
  trainees,
  restoreData,
  isTrainee,
  preSelected,
  handleSubmitEvent,
}) {
  const classes = useStyles();
  const { t } = useTranslation();
  const isTabletOrMobile = useMediaQuery("(max-width: 1000px)");
  const [disabled, setIsDisabled] = useState(isEditMode ? true : false);
  const [selectedTrainees, setSelectedTrainees] = useState([]);
  const [isError, setIsError] = useState(false);
  const theme = useTheme();
  const [locale, setLocale] = useState(theme.chosenLang);

  useEffect(() => {
    setLocale(theme.chosenLang);
  }, [theme.direction, theme.chosenLang]);

  // const restoreDataForm = () => {
  //   restoreData();
  // };

  const handleCancel = () => {
    // props.handleCancel();
    onClose();
  };

  const toggleEdit = () => {
    setIsDisabled(!disabled);
  };

  const deleteEventForm = (id, isTrainee) => {
    const eventCustomId = parseInt(id);
    deleteEvent(
      eventCustomId,
      isTrainee,
      eventInfo?._def?.extendedProps?.docId || eventInfo?.docId,
      selectedTrainees
    )
      .then((res) => {
        onClose();
        setIsError(false);
      })
      .catch((e) => {
        setIsError("Something went wrong. Please try again later");
      });
  };

  useEffect(() => {
    if (
      eventInfo?._def?.extendedProps?.selectedTrainees ||
      eventInfo?.selectedTrainees
    ) {
      setSelectedTrainees(
        eventInfo?._def?.extendedProps?.selectedTrainees ||
          eventInfo?.selectedTrainees
      );
    }
  }, [eventInfo]);

  useEffect(() => {
    if (
      preSelected.length > 0 ||
      (Object.keys(preSelected).length > 0 &&
        preSelected.constructor === Object)
    ) {
      setSelectedTrainees([preSelected]);
    }
  }, [preSelected]);

  useEffect(() => {
  }, [selectedTrainees]);

  const onEditSubmit = async (data) => {
    const submitData = { ...data };
    delete submitData.traineesSelection;

    // if (touched.end) {
    submitData.end = submitData.end
      ? moment(submitData.end).toDate()
      : submitData.end;

    submitData.end = moment(submitData.end);
    if (submitData.end.isValid()) {
      submitData.end = moment(submitData.end).toDate();
    } else {
      submitData.end = null;
    }

    //  }
    //if (touched.start) {
    submitData.start = moment(submitData.start).toDate();
    // }

    submitData.selectedTrainees = selectedTrainees;
    handleSubmitEvent(submitData)
      .then((res) => {
        setIsError(false);
        onClose();
      })
      .catch((e) => {
        setIsError("Something went wrong. Please try again later");
      });
  };

  const onSubmitForm = async (data) => {
    const submitData = { ...data };

    //cleanup
    delete submitData.id;
    delete submitData.docId;
    delete submitData.traineesSelection;

    submitData.end = moment(submitData.end);
    if (submitData.end.isValid()) {
      submitData.end = moment(submitData.end).toDate();
    } else {
      submitData.end = null;
    }

    submitData.start = moment(submitData.start).toDate();

    handleSubmitEvent(submitData, selectedTrainees)
      .then((res) => {
        setIsError(false);
        onClose();
      })
      .catch((e) => {
        setIsError("Something went wrong. Please try again later");
      });
  };

  useEffect(() => {
  }, [eventInfo]);

  const handleTrainees = (event, value, reason) => {
    let removedDup = value.reduce((unique, o) => {
      if (!unique.some((obj) => obj.docId === o.docId)) {
        unique.push(o);
      }
      return unique;
    }, []);
    setSelectedTrainees(removedDup);
  };

  return (
    <Dialog
      scroll={"paper"}
      fullWidth={true}
      open={true}
      onClose={onClose}
      aria-labelledby="form-dialog-title"
      maxWidth={false}
      classes={
        isTabletOrMobile
          ? { paperFullWidth: "widthfixMobile" }
          : {
              paperFullWidth: "widthfix", // class name, e.g. `classes-nesting-root-x`
            }
      }
    >
      <Formik
        initialValues={{
          docId: eventInfo?._def?.extendedProps?.docId || eventInfo?.docId,
          id: eventInfo?.id,
          title: eventInfo?.title || "",
          start:
            eventInfo && eventInfo.start
              ? moment(eventInfo.start).toDate()
              : null,
          end: eventInfo && eventInfo.end ? moment(eventInfo.end).toDate() : "",
          allDay: eventInfo?.allDay ? true : false,
          description:
            eventInfo?._def?.extendedProps?.description ||
            eventInfo?.description ||
            "",
          location:
            eventInfo?._def?.extendedProps?.location ||
            eventInfo?.location ||
            "",
          isTrainee:
            eventInfo?.extendedProps?.isTrainee ||
            eventInfo?.isTrainee ||
            isTrainee
              ? true
              : false,
          notificaition: "", //future dev Trainees || selectedTrainees || preSelected
          traineesSelection: trainees || selectedTrainees,
          //resourceId - will be the Trainee id
          //more here https://fullcalendar.io/docs/event-parsing
        }}
        enableReinitialize={true}
        onSubmit={(values, { setSubmitting }) => {
          if (values.isTrainee && selectedTrainees.length <= 0) {
          } else if (isEditMode) {
            onEditSubmit(values);
          } else {
            onSubmitForm(values);
          }
        }}
        validationSchema={Yup.object().shape({
          title: yup.string().required(t("EVENT_TITLE_REQUIRED")),
          start: yup
            .date()
            .typeError(t("EVENT_START_REQUIRED"))
            .required(t("EVENT_START_REQUIRED")),
          allDay: yup.boolean().required(t("EVENT_ALL_DAY_REQUIRED")),
          end: yup.date().when("allDay", {
            is: false,
            then: yup.date().required(t("EVENT_END_REQUIRED")),
          }),
        })}
      >
        {(props) => {
          const {
            values,
            touched,
            errors,
            handleChange,
            handleSubmit,
            setFieldValue,
          } = props;
          return (
            <form
              onSubmit={handleSubmit}
              // style={{
              //   height: "100%",
              //   backgroundColor: "white",
              //   boxShadow:
              //     "0px 2px 1px -1px rgb(0 0 0 / 20%), 0px 1px 1px 0px rgb(0 0 0 / 14%), 0px 1px 3px 0px rgb(0 0 0 / 12%)",
              //   //  marginTop: "40px",
              // }}
            >
              <Grid
                container
                justify="center"
                style={{
                  height: "100%",
                  // padding: "0 20px",
                  margin: 0,
                  width: "inherit",
                }}
                spacing={2}
              >
                {isError && (
                  <ClickAwayListener
                    onClickAway={() => {
                      setIsError(false);
                    }}
                  >
                    <Alert severity="error">{isError}</Alert>
                  </ClickAwayListener>
                )}
                <Grid
                  item
                  xs={12}
                  lg={12}
                  md={12}
                  sm={12}
                  xl={12}
                  style={{ textAlign: "center" }}
                >
                  <DialogTitle id="form-dialog-title">
                    <IconButton
                      aria-label="close"
                      className={classes.closeButton}
                      onClick={() => onClose()}
                    >
                      <Icon
                        style={{ fontSize: "1.4em" }}
                        className="fas fa-times"
                      />
                    </IconButton>
                    {isEditMode ? t("EVENT_EDIT_WORKOUT") : t("EVENT_ADD_WORKOUT")}
                  </DialogTitle>
                  {!isEditMode && (
                    <DialogContentText style={{ textAlign: "start" }}>
                      <strong>{t("FORM_NOTE_TITLE")}</strong>
                      {t("EVENT_FORM_NOTE")}
                    </DialogContentText>
                  )}
                </Grid>

                <Grid
                  item
                  xs={6}
                  lg={6}
                  md={6}
                  sm={6}
                  xl={6}
                  align="center"
                  style={{ alignSelf: "flex-end" }}
                >
                  <FormLabel component="legend">
                    {t("EVENT_ALL_DAY")} ?
                    <span>
                      &nbsp;
                      <Icon
                        style={{ verticalAlign: "middle", fontSize: "1.4em" }}
                        className="far fa-clock"
                      ></Icon>
                    </span>
                  </FormLabel>

                  <Switch
                    disabled={disabled}
                    checked={values.allDay}
                    onChange={(e) => {
                      setFieldValue("allDay", e.target.checked);
                    }}
                    color="primary"
                    name="allDay"
                    inputProps={{ "aria-label": "all day checkbox" }}
                  />
                </Grid>

                <Grid
                  item
                  xs={6}
                  lg={6}
                  md={6}
                  sm={6}
                  xl={6}
                  align="center"
                  style={{ alignSelf: "flex-end" }}
                >
                  <FormLabel component="legend">
                    {t("EVENT_WITH_TRAINEE")} ?
                    <span>
                      &nbsp;
                      <Icon
                        style={{ verticalAlign: "middle", fontSize: "1.4em" }}
                        className="fas fa-running"
                      ></Icon>
                    </span>
                  </FormLabel>

                  <Switch
                    disabled={disabled || traineeDisabled}
                    checked={values.isTrainee}
                    onChange={(e) => {
                      setFieldValue("isTrainee", e.target.checked);
                    }}
                    color="primary"
                    name="isTrainee"
                    inputProps={{ "aria-label": "is trainee checkbox" }}
                  />
                </Grid>

                {values.isTrainee && (
                  <Grid
                    item
                    xs={12}
                    lg={12}
                    md={12}
                    sm={12}
                    xl={12}
                    align="center"
                  >
                    <Autocomplete
                      disabled={disabled || traineeDisabled}
                      multiple
                      id="Trainees"
                      //defaultValue={selectedTrainees ? selectedTrainees : []}
                      value={selectedTrainees}
                      options={
                        values.traineesSelection.length > 0
                          ? values.traineesSelection
                          : []
                      }
                      getOptionSelected={(option, value) =>
                        option.docId === value.docId
                      }
                      getOptionLabel={(option) => option.name}
                      onChange={handleTrainees}
                      //value={values.traineesSelection}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label={t("EVENT_SELECT_TRAINEE")}
                          variant="outlined"
                          error={
                            selectedTrainees &&
                            values.isTrainee &&
                            selectedTrainees.length <= 0
                          }
                          helperText={t("EVENT_SELECT_TRAINEE_HELPER")}
                        />
                      )}
                    />
                  </Grid>
                )}

                <Grid item xs={12} lg={6} md={6} sm={12} xl={6} align="center">
                  <TextField
                    disabled={disabled}
                    id="title"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <Icon
                            style={{ fontSize: "1.4em" }}
                            className="fas fa-calendar-week"
                          />
                        </InputAdornment>
                      ),
                    }}
                    name="title"
                    label={t("EVENT_TITLE")}
                    value={values.title}
                    onChange={handleChange}
                    error={touched.title && Boolean(errors.title)}
                    helperText={touched.title && errors.title}
                  />
                </Grid>

                <Grid item xs={12} lg={6} md={6} sm={12} xl={6} align="center">
                  <TextField
                    disabled={disabled}
                    id="location"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <Icon
                            style={{ fontSize: "1.4em" }}
                            className="fas fa-map-marker-alt"
                          />
                        </InputAdornment>
                      ),
                    }}
                    name="location"
                    label={t("EVENT_LOCATION")}
                    value={values.location}
                    onChange={handleChange}
                    error={touched.location && Boolean(errors.location)}
                    helperText={touched.location && errors.location}
                  />
                </Grid>

                <Grid item xs={12} lg={6} md={6} sm={12} xl={6} align="center">
                  <MuiPickersUtilsProvider
                    libInstance={moment}
                    utils={MomentUtils}
                    locale={locale}
                  >
                    <DateTimePicker
                      okLabel={t("EVENT_DATE_OK")}
                      cancelLabel={t("EVENT_DATE_CANCEL")}
                      clearLabel={t("EVENT_DATE_CLEAR")}
                      todayLabel={t("EVENT_DATE_TODAY")}
                      disabled={disabled}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <Icon
                              style={{ fontSize: "1.4em" }}
                              className="fas fa-hourglass-start"
                            />
                          </InputAdornment>
                        ),
                      }}
                      autoOk
                      disablePast
                      label={t("EVENT_START_DATE")}
                      showTodayButton
                      name="start"
                      ampm={false}
                      id="start"
                      format="yyyy/MM/DD HH:mm"
                      allowKeyboardControl={true}
                      //defaultValue={null}
                      value={values.start}
                      onChange={(e) => {
                        setFieldValue("start", e);
                      }}
                      error={touched.start && Boolean(errors.start)}
                      helperText={touched.start && errors.start}
                    />
                  </MuiPickersUtilsProvider>
                </Grid>

                {!values.allDay && (
                  <Grid
                    item
                    xs={12}
                    lg={6}
                    md={6}
                    sm={12}
                    xl={6}
                    align="center"
                  >
                    <MuiPickersUtilsProvider
                      libInstance={moment}
                      utils={MomentUtils}
                      locale={locale}
                    >
                      <DateTimePicker
                        okLabel={t("EVENT_DATE_OK")}
                        cancelLabel={t("EVENT_DATE_CANCEL")}
                        clearLabel={t("EVENT_DATE_CLEAR")}
                        todayLabel={t("EVENT_DATE_TODAY")}
                        disabled={disabled}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <Icon
                                style={{ fontSize: "1.4em" }}
                                className="fas fa-hourglass-end"
                              />
                            </InputAdornment>
                          ),
                        }}
                        autoOk
                        label={t("EVENT_END_DATE")}
                        showTodayButton
                        id="end"
                        name="end"
                        ampm={false}
                        format="yyyy/MM/DD HH:mm"
                        allowKeyboardControl={true}
                        minDate={new Date(values.start)}
                        minDateMessage={"more"}
                        //defaultValue={null}
                        value={values.end === "" ? null : values.end}
                        onChange={(e) => {
                          setFieldValue("end", e);
                        }}
                        error={touched.end && Boolean(errors.end)}
                        helperText={touched.end && errors.end}
                      />
                    </MuiPickersUtilsProvider>
                  </Grid>
                )}

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
                    disabled={disabled}
                    id="description"
                    style={{ width: "100%" }}
                    name="description"
                    label={t("EVENT_DESCRITPION")}
                    multiline
                    rows={4}
                    variant="outlined"
                    value={values.description}
                    onChange={handleChange}
                    error={touched.description && Boolean(errors.description)}
                    helperText={touched.description && errors.description}
                  />
                </Grid>

                <Grid item xs={12} lg={12} md={12} sm={12} xl={12}>
                  <DialogActions>
                    <div
                      style={
                        isTabletOrMobile
                          ? { width: "100%", textAlign: "center" }
                          : { width: "100%", textAlign: "end" }
                      }
                    >
                      <Button
                        color="secondary"
                        onClick={handleCancel}
                        endIcon={
                          <Icon
                            style={
                              isTabletOrMobile ? { fontSize: "1.5rem" } : {}
                            }
                          >
                            cancel
                          </Icon>
                        }
                      >
                        {isTabletOrMobile ? "" : t("CANCEL")}
                      </Button>
                      {isEditMode && (
                        <>
                          <Button
                            endIcon={
                              <Icon
                                style={
                                  isTabletOrMobile ? { fontSize: "1.5rem" } : {}
                                }
                              >
                                edit
                              </Icon>
                            }
                            onClick={toggleEdit}
                          >
                            {isTabletOrMobile ? "" : t("EDIT")}
                          </Button>
                          <Button
                            endIcon={
                              <Icon
                                style={
                                  isTabletOrMobile ? { fontSize: "1.5rem" } : {}
                                }
                              >
                                delete
                              </Icon>
                            }
                            onClick={(e) => {
                              deleteEventForm(values.id, values.isTrainee);
                            }}
                          >
                            {isTabletOrMobile ? "" : t("DELETE")}
                          </Button>
                        </>
                      )}

                      <Button
                        type="submit"
                        endIcon={
                          <Icon
                            style={
                              isTabletOrMobile ? { fontSize: "1.5rem" } : {}
                            }
                          >
                            save
                          </Icon>
                        }
                        color="primary"

                        //    onClick={onSubmit}
                      >
                        {isTabletOrMobile ? "" : t("SUBMIT")}
                      </Button>
                    </div>
                  </DialogActions>
                </Grid>
              </Grid>
            </form>
          );
        }}
      </Formik>
    </Dialog>
  );
}
