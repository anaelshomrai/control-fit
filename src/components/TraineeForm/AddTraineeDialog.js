import { useEffect, useState } from "react";
import {
  makeStyles,
  withStyles,
  Button,
  Dialog,
  DialogContentText,
  DialogTitle,
  Stepper,
  Step,
  StepLabel,
  StepConnector,
  Grid,
  IconButton,
  Icon,
  CircularProgress,
  useMediaQuery
} from "@material-ui/core";
import ColorlibStepIcon from "./Util/ColorlibStepIcon";
import TraineeDetailsSection from "./Sections/TraineeDetailsSection";
import TraineeFilesUploadSection from "./Sections/TraineeFilesUploadSection";
import TraineeHealthUploadSection from "./Sections/TraineeHealthUploadSection";
import "./css/dialog.css";
import { useTranslation } from "react-i18next";

const ColorlibConnector = withStyles({
  alternativeLabel: {
    top: 22,
  },
  active: {
    "& $line": {
      backgroundImage:
        "linear-gradient( 95deg,rgb(242,113,33) 0%,rgb(233,64,87) 50%,rgb(138,35,135) 100%)",
    },
  },
  completed: {
    "& $line": {
      backgroundImage:
        "linear-gradient( 95deg,rgb(242,113,33) 0%,rgb(233,64,87) 50%,rgb(138,35,135) 100%)",
    },
  },
  line: {
    height: 3,
    border: 0,
    backgroundColor: "#eaeaf0",
    borderRadius: 1,
  },
})(StepConnector);

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
  },
  button: {
    marginRight: theme.spacing(1),
  },
  instructions: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  closeButton: {
    position: "absolute",
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
}));

const mammoth = require("mammoth");

export default function AddTraineeDialog({
  onClose,
  restoreData,
  handleCancel,
  handleSubmit,
}) {
  const { t } = useTranslation();
  const classes = useStyles();
  const isTabletOrMobile = useMediaQuery("(max-width: 1000px)");
  const [activeStep, setActiveStep] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isError, setIsError] = useState(false);
  const [newTrainee, setNewTrainee] = useState({
    age: "",
    name: "",
    notes: "",
    weight: "",
    phone: "",
    profilePicture: "",
    email: "",
    gender: "",
    images: [],
    program: [],
    health: [],
    tracker: [],
  });

  const getSteps = () => {
    return [
      {
        keyLable: "Trainee detals",
        title: t("TRAINEE_FORM_STEPPER_DETAILS_TITLE"),
        description: t("TRAINEE_FORM_STEPPER_DETAILS_DESCRIPTION"),
        section: "details",
      },
      {
        keyLable: "Trainee files",
        title: t("TRAINEE_FORM_STEPPER_FILES_TITLE"),
        description: t("TRAINEE_FORM_STEPPER_FILES_DESCRIPTION"),
        section: "upload",
      },
      {
        keyLable: "Trainee health statement",
        title: t("TRAINEE_FORM_STEPPER_HEALTH_TITLE"),
        description: t("TRAINEE_FORM_STEPPER_HEALTH_DESCRIPTION"),
        section: "health",
      },
    ];
  };

  const renderSection = () => {
    switch (steps[activeStep].section) {
      case "details":
        return (
          <TraineeDetailsSection
            handleCancelDialog={handleCancelDialog}
            handleNext={handleNext}
            trainee={newTrainee}
            handleDetailsSectionSubmit={handleDetailsSectionSubmit}
          />
        );
      case "upload":
        return (
          <TraineeFilesUploadSection
            handleCancelDialog={handleCancelDialog}
            handleNext={handleNext}
            handleBack={handleBack}
            images={newTrainee.images}
            program={newTrainee.program}
            handleUpload={handleUpload}
            handleChange={handleChangeFiles}
          />
        );
      case "health":
        return (
          <TraineeHealthUploadSection
            handleCancelDialog={handleCancelDialog}
            handleSubmitDialog={handleSubmitDialog}
            handleBack={handleBack}
            health={newTrainee.health}
            handleUpload={handleUpload}
            handleChange={handleChangeFiles}
          />
        );
      default:
        return "Error";
    }
  };

  const steps = getSteps();

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
    setNewTrainee({
      age: "",
      name: "",
      notes: "",
      weight: "",
      phone: "",
      profilePicture: "",
      email: "",
      gender: "",
      images: [],
      program: [],
      health: [],
      tracker: [],
    });
  };

  const handleChangeFiles = (files, type) => {
    if (files && files.length > 0 && type === "program") {
      files.forEach((e) => {
        e.file.arrayBuffer().then((ab) => {
          mammoth
            .convertToHtml(
              { arrayBuffer: ab },
              { includeDefaultStyleMap: true }
            )
            .then((result) => {
              //TODO: add marker to set if in hebrew or not
              let hebrew = `<div class="ql-align-right ql-direction-rtl">${result.value}</div>`;
              let obj = {
                html: hebrew,
                file: e.file,
              };
              setNewTrainee((prevState) => ({
                ...prevState,
                [type]:
                  prevState?.[type] && prevState?.[type].length > 0
                    ? [...prevState[type], obj]
                    : [obj],
              }));
           //   console.warn("conversion warning", result.messages);
            })
            .done();
        });
      });
    } else {
      setNewTrainee((prevState) => ({
        ...prevState,
        [type]: files,
      }));
    }
  };
  const handleCancelDialog = (e) => {
    e.preventDefault();
    handleCancel(e, newTrainee);
    setNewTrainee({
      age: "",
      name: "",
      notes: "",
      weight: "",
      phone: "",
      profilePicture: "",
      email: "",
      gender: "",
      images: [],
      program: [],
      health: [],
      tracker: [],
    });
    onClose();
  };

  const handleDetailsSectionSubmit = (values) => {
    setNewTrainee((prevState) => ({
      ...prevState,
      ...values,
    }));
    handleNext();
  };

  const handleSubmitDialog = (e) => {
    e.preventDefault();
    setIsSaving(true);
    handleNext();
    handleSubmit(e, newTrainee)
      .then((res) => {
        setIsError(false);
        setIsSaving(false);
      })
      .catch((e) => {
        setIsError(true);
        setIsSaving(false);
      });
  };

  const handleUpload = (files, type) => {
    if (files && files.length > 0 && type === "program") {
      files.forEach((e) => {
        e.file.arrayBuffer().then((ab) => {
          mammoth
            .convertToHtml(
              { arrayBuffer: ab },
              { includeDefaultStyleMap: true }
            )
            .then((result) => {
              //TODO: add marker to set if in hebrew or not
              let hebrew = `<div class="ql-align-right ql-direction-rtl">${result.value}</div>`;
              let obj = {
                html: hebrew,
                file: e.file,
              };
              setNewTrainee((prevState) => ({
                ...prevState,
                [type]: prevState?.[type] ? [...prevState[type], obj] : [obj],
              }));
         //     console.warn("conversion warning", result.messages);
            })
            .done();
        });
      });
    } else {
      setNewTrainee((prevState) => ({
        ...prevState,
        [type]: files,
      }));
    }
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
          ? { paperFullWidth: "dialogSizeMobile" }
          : {
              paperFullWidth: "dialogSize", // class name, e.g. `classes-nesting-root-x`
            }
      }
    >
      <Grid
        container
        justify="flex-start"
        style={{
          height: "100%",
          padding: "0 20px",
        }}
      >
        {/* Stepper part */}
        <Grid item xs={12} lg={12} md={12} sm={12} xl={12}>
          <Stepper
            style={{ padding: "12px" }}
            alternativeLabel
            activeStep={activeStep}
            connector={<ColorlibConnector />}
          >
            {steps.map(({ keyLable, title }) => (
              <Step key={keyLable}>
                <StepLabel StepIconComponent={ColorlibStepIcon}>
                  {title}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Grid>

        {/* title and description part only show on 1 tab */}
        {activeStep !== steps.length &&
          steps[activeStep].section === "details" && (
            <Grid
              item
              xs={12}
              lg={12}
              md={12}
              sm={12}
              xl={12}
              style={{
                textAlign: "center",
              }}
            >
              <DialogTitle
                id="form-dialog-title"
                style={{
                  padding: "0 12px",
                }}
              >
                <IconButton
                  aria-label="close"
                  className={classes.closeButton}
                  onClick={onClose}
                >
                  <Icon className="fas fa-times" />
                </IconButton>
                {steps[activeStep].title}
              </DialogTitle>
              <DialogContentText
                style={{
                  marginBottom: "0",
                }}
              >
                {steps[activeStep].description}
              </DialogContentText>
            </Grid>
          )}

        {/* actual section part */}
        {activeStep !== steps.length && (
          <Grid
            item
            xs={12}
            lg={12}
            md={12}
            sm={12}
            xl={12}
            align="center"
            style={
              activeStep === 0
                ? {
                    textAlign: "center",
                    minHeight: "60%",
                  }
                : {
                    textAlign: "center",
                    minHeight: "80%",
                  }
            }
          >
            {renderSection()}
          </Grid>
        )}

        {/* when clicking submit */}
        {activeStep === steps.length && isSaving && (
          <Grid
            item
            xs={12}
            lg={12}
            md={12}
            sm={12}
            xl={12}
            align="center"
            style={{
              height: "80%",
              textAlign: "center",
              display: "flex",
              justifyContent: "center",
              alignContent: "center",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <CircularProgress />
          </Grid>
        )}
        {/* after clicking submit and saving is done.  */}
        {activeStep === steps.length && !isSaving && !isError && (
          <Grid
            item
            xs={12}
            lg={12}
            md={12}
            sm={12}
            xl={12}
            align="center"
            style={{
              height: "80%",
              textAlign: "center",
              display: "flex",
              justifyContent: "space-evenly",
              alignContent: "center",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <h1>{t("TRAINEE_FORM_ADD_ANOTHER")}</h1>
            <div style={{ display: "flex" }}>
              <Button variant="outlined" color="primary" onClick={handleReset}>
                {t("TRAINEE_FORM_ADD_ANOTHER_OK")}
              </Button>
              &nbsp;
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleCancelDialog}
              >
                {t("TRAINEE_FORM_ADD_ANOTHER_NO")}
              </Button>
            </div>
          </Grid>
        )}

        {activeStep === steps.length && !isSaving && isError && (
          <Grid
            item
            xs={12}
            lg={12}
            md={12}
            sm={12}
            xl={12}
            align="center"
            style={{
              height: "80%",
              textAlign: "center",
              display: "flex",
              justifyContent: "space-evenly",
              alignContent: "center",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <h1>{t("TRAINEE_FORM_ADD_ERROR")}</h1>
            <div>
              <Button variant="outlined" color="primary" onClick={handleReset}>
                {t("TRAINEE_FORM_ADD_ERROR_TRY_AGAIN")}
              </Button>
              &nbsp;
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleCancelDialog}
              >
                {t("TRAINEE_FORM_ADD_ANOTHER_NO")}
              </Button>
            </div>
          </Grid>
        )}
      </Grid>
    </Dialog>
  );
}
