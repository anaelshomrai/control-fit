import {
  Button,
  ClickAwayListener,
  Dialog,
  DialogContentText,
  Fab,
  Grid,
  Icon,
  TextField,
  useMediaQuery,
  useTheme,
} from "@material-ui/core";
import MaterialTable from "material-table";
import { useContext, useEffect, useState } from "react";
import ControlFitContext from "../Context/ControlFitContext";
import { Formik } from "formik";
import * as Yup from "yup";
import { Alert, Autocomplete } from "@material-ui/lab";
import { updateTrainee } from "../../Util/Firebase";
import { useTranslation } from "react-i18next";
import "../TraineeDetails/Tab/css/tracker.css";

export default function BillingDetails() {
  const { t } = useTranslation();
  const [columns, setColumns] = useState([
    // { title: "Date", field: "date", type: "numeric" },
    // { title: "Payment Method", field: "paymentMethod" },
    // { title: "Amount", field: "amount" },
    { title: t("BILLING_TRAINEE"), field: "trainee" },
    { title:  t("BILLING_PAID_WORKOUTS"), field: "paidWorkouts" },
    { title:  t("BILLING_UNPAID_WORKOUTS"), field: "unpaidWorkouts" },
    { title:  t("BILLING_ID"), field: "id", type: "numeric" },

  ]);
  const theme = useTheme();

  useEffect(() => {
    setColumns([
      // { title: "Date", field: "date", type: "numeric" },
      // { title: "Payment Method", field: "paymentMethod" },
      // { title: "Amount", field: "amount" },
      { title: t("BILLING_TRAINEE"), field: "trainee" },
      { title:  t("BILLING_PAID_WORKOUTS"), field: "paidWorkouts" },
      { title:  t("BILLING_UNPAID_WORKOUTS"), field: "unpaidWorkouts" },
      { title:  t("BILLING_ID"), field: "id", type: "numeric" },
  
    ])
  },[theme.direction,theme.chosenLang,t])
  const { trainees } = useContext(ControlFitContext);
  const [data, setData] = useState([]);
  const isTabletOrMobile = useMediaQuery("(max-width: 1224px)");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [availableTrainees, setAvailableTrainees] = useState([]);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    let filtered = trainees.filter((e) => {
      return e.workouts && e.workouts.length > 0;
    });

    setAvailableTrainees(filtered);

    return () => setAvailableTrainees([]);
  }, [trainees]);

  useEffect(() => {
    availableTrainees.forEach((e) => {
      setData((prevState) => [
        ...prevState,
        {
          id: e.docId,
          trainee: e.name,
          paidWorkouts: e.workouts?.length,
          unpaidWorkouts: e.workouts?.length - e.paidWorkouts,
        },
      ]);
    });

    return () => setData([]);
  }, [availableTrainees]);

  const handleTraineePaidWorkouts = (values) => {
    return new Promise((resolve, reject) => {
      const update = { docId: values.trainee, paidWorkouts: values.amount };
      updateTrainee(update)
        .then((docref) => {
          resolve("cool");
          return docref;
        })
        .catch((e) => {
          reject(e);
        });
    });
  };

  return (
    <Grid
      container
      justify="center"
      style={{
        backgroundColor: "white",
        boxShadow:
          "0px 2px 1px -1px rgb(0 0 0 / 20%), 0px 1px 1px 0px rgb(0 0 0 / 14%), 0px 1px 3px 1px rgb(0 0 0 / 12%)",
        width: "90%",
        height:"100%"
      }}
    >
      {showPaymentModal && (
        <Dialog
          scroll={"paper"}
          open={true}
          onClose={() => {
            setShowPaymentModal(!showPaymentModal);
          }}
          aria-labelledby="form-dialog-title"
          maxWidth={false}
        >
          <Grid
            container
            justify="flex-start"
            style={{
              padding: "0 20px",
            }}
          >
            <Formik
              //  innerRef={formRef}
              initialValues={{
                trainee: "",
                amount: "",
              }}
              enableReinitialize={true}
              onSubmit={(values, { setSubmitting }) => {
                handleTraineePaidWorkouts(values)
                  .then((res) => {
                    setShowPaymentModal(!showPaymentModal);
                    setIsError(false);
                  })
                  .catch((e) => {
                    setIsError(t("BILLING_ERROR"));
                  });
              }}
              validationSchema={Yup.object().shape({
                trainee: Yup.string().required(t("BILLING_TRAINEE_REQUIRED")),
                amount: Yup.number().required(t("BILLING_AMOUNT_REQUIRED")),
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
                    style={{
                      width: "100%",
                      padding: "12px 0",
                    }}
                  >
                    <Grid container alignItems="flex-end" justify="center">
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

                      <Grid
                        item
                        xs={12}
                        lg={12}
                        md={12}
                        sm={12}
                        xl={12}
                        align="center"
                      >
                      
                        <h2>{t("BILLING_SUBMIT_PAYMENT")}</h2>
                      </Grid>

                      <DialogContentText style={{ textAlign: "start" }}>
                        {/* Add workout details. <br />  */}
                        <strong>{t("FORM_NOTE_TITLE")}</strong> {t("BIILING_FORM_NOTE")}
                    
                      </DialogContentText>

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
                          id="trainee"
                          name="trainee"
                          //defaultValue={selectedTrainees ? selectedTrainees : []}
                          // value={selectedTrainees}
                          options={availableTrainees}
                          getOptionSelected={(option, value) =>
                            option.docId === value.docId
                          }
                          getOptionLabel={(option) => option.name}
                          onChange={(event, value, reason) => {
                            setFieldValue("trainee", value?.docId || "");
                          }}
                          //value={values.traineesSelection}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label={t("BIILING_SELECT_TRAINEE")}
                              variant="outlined"
                              error={touched.trainee && Boolean(errors.trainee)}
                              helperText={
                                t("BIILING_SELECT_TRAINEE_HELPER")
                                
                              }
                            />
                          )}
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
                        <TextField
                          style={{ width: "95%" }}
                          name="amount"
                          id="input-with-icon-grid"
                          label={t("BIILING_AMOUNT")}
                          type="number"
                          
                          value={values.amount}
                          onChange={handleChange}
                          error={touched.amount && Boolean(errors.amount)}
                          helperText={
                            errors.amount && touched.amount && errors.amount
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
                        //  style={{ display: "flex", justifyContent: "flex-end" }}
                        //style={{position: "fixed", bottom: "12%", right: "10%"}}
                        style={{ height: "10%", textAlign: "end" }}
                      >
                        <Button
                          color="secondary"
                          onClick={() => {
                            setShowPaymentModal(!showPaymentModal);
                          }}
                        >
                          {t("CANCEL")}
                        </Button>
                        <Button
                          color="primary"
                          type="submit"
                          onClick={handleSubmit}
                          endIcon={<Icon style={isTabletOrMobile ? {fontSize: "1.5rem"} : {}}>save</Icon>}
                        >
                          {t("SUBMIT")}
                        </Button>
                      </Grid>
                    </Grid>
                  </form>
                );
              }}
            </Formik>
          </Grid>
        </Dialog>
      )}

      <Grid item xs={12} lg={12} md={12} sm={12} xl={12} align="center">
        <h2>{t("BILLING_TITLE")}</h2>
      </Grid>

      <Grid
        item
        xs={12}
        lg={12}
        md={12}
        sm={12}
        xl={12}
        style={{
          margin: "10px",
          backgroundColor: "white",
          boxShadow:
            "0px 2px 1px -1px rgb(0 0 0), 0px 1px 1px 0px rgb(0 0 0), 0px 1px 3px 1px rgb(0 0 0)",
        }}
      >
        <MaterialTable
          style={{ display: "flex", flexDirection: "column" }}
          className={"fullheight"}
          title={isTabletOrMobile ? "" : t("BILLING_TITLE")}
          columns={columns}
          data={data}
          options={{
            headerStyle: {
              textAlign: "start"
            },
            cellStyle: {
              textAlign: "start"
            },
          }}
          localization={{
            toolbar: {
              searchTooltip: t("TRACKER_SEARCH_TOOLTIP"),
              searchPlaceholder: t("TRACKER_SEARCH_PLACEHOLDER"),
            },
            body: {
              emptyDataSourceMessage: t("TRACKER_NO_RESULT"),
              addTooltip: t("TRACKER_ADD"),
              deleteTooltip: t("TRACKER_DELETE"),
              editTooltip: t("TRACKER_EDIT"),
              editRow: {
                cancelTooltip: t("TRACKER_CANCEL"),
                saveTooltip: t("TRACKER_SAVE"),
                deleteText: t("TRACKER_DELETE_TEXT"),
              }

            },
            header: {
              actions: t("TRACKER_ACTIONS"),
            },
            pagination: {
              labelRowsSelect: t("TRACKER_ROWS"),
            }
          }}
        />
      </Grid>

      <Grid item xs={12} lg={12} md={12} sm={12} xl={12} align="end">
        <Fab
          variant="extended"
          color="primary"
          size={isTabletOrMobile ? "small" : "medium"}
          onClick={(e) => {
            setShowPaymentModal(!showPaymentModal);
          }}
        >
           <Icon style={{ fontSize: "1.4em" }}>payment</Icon>

          {isTabletOrMobile ? "" : t("BILLING_ADD_PAYMENT")}
        </Fab>
      </Grid>
    </Grid>
  );
}
