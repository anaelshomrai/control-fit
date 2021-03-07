import {
  Button,
  Card,
  CardContent,
  CircularProgress,
  ClickAwayListener,
  Dialog,
  DialogActions,
  Fab,
  Grid,
  Icon,
  IconButton,
  makeStyles,
  Typography,
  useMediaQuery,
} from "@material-ui/core";
import { useEffect, useState } from "react";
import { storageRef } from "../../../Util/Firebase";
import "./css/image.css";
import { Alert } from "@material-ui/lab";
import { useTranslation } from "react-i18next";
import DropzoneCustom from "../../Reuseable/DropzoneCustom";

const useStyles = makeStyles((theme) => ({
  closeButton: {
    position: "absolute",
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
}));
export default function HealthTab({
  id,
  trainee,
  handleDeleteHealth,
  handleHealthAdded,
}) {
  const { t } = useTranslation();
  const [health, setHealth] = useState([]);
  const isTabletOrMobile = useMediaQuery("(max-width: 1224px)");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [healthFiles, setHealthFiles] = useState([]);
  const classes = useStyles();
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    healthHandle(trainee);
  }, [trainee]);

  const healthHandle = async (train) => {
    let refs = [];
    for (let i = 0; i < train?.health?.length; i++) {
      const res = await getRef(train.health[i].name);
      refs.push({
        name: train.health[i].name,
        ref: res,
        type: train.health[i].type,
      });
    }
    setIsLoading(false);
    setHealth((prevState) => [...refs]);
  };

  const getRef = async (filename) => {
    var imagesRef = await storageRef.child(filename).getDownloadURL();
    return imagesRef;
  };

  const fullScreen = (id) => {
    let elem = document.getElementById(id);
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.mozRequestFullScreen) {
      /* Firefox */
      elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) {
      /* Chrome, Safari & Opera */
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
      /* IE/Edge */
      elem.msRequestFullscreen();
    }
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    handleHealthAdded(healthFiles, "health")
      .then((res) => {
        setIsSaving(false);
        setShowModal(!showModal);
        setHealthFiles([]);
        setIsLoading(true);
        setIsError(false);
      })
      .catch((e) => {
        setIsSaving(false);
        setShowModal(!showModal);
        setHealthFiles([]);
        setIsLoading(true);
        setIsError(t("TRAINEE_HEALTH_TAB_ADD_ERROR"));
        console.error("Done health error", e);
      });
  };

  const deleteHealth = (e, index) => {
    setIsLoading(true);
    let filtered = trainee.health.filter((el, i) => {
      return i !== index;
    });
    handleDeleteHealth(filtered, trainee.health[index].name)
      .then((res) => {
        setIsLoading(false);
      })
      .catch((e) => {
        setIsLoading(false);
        setIsError(t("TRAINEE_HEALTH_TAB_DELETE_ERROR"));
        console.error("Done health error", e);
      });
  };

  const handleOnAddHealthFile = (newFileObjs) => {
    setHealthFiles([].concat(healthFiles, newFileObjs));
  };

  const handleOnRemoveHealthFile = (deleteFileObj, index) => {
    let filtered = healthFiles.filter((_, i) => i !== index);
    setHealthFiles(filtered);
  };


  return (
    <Grid
      className="app"
      container
      justify="center"
      style={{
        height: "100%",
        width: "inherit",
        margin: "15px 0",
        justifyContent: "space-evenly",
      }}
      spacing={2}
    >
      <Grid
        item
        xs={12}
        lg={12}
        md={12}
        sm={12}
        xl={12}
        style={{ textAlign: "end", paddingInlineEnd: "15px" }}
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
        <Fab
          //  style={{position: "absolute", left: "2%", bottom: "55px"}}
          variant="extended"
          color="secondary"
          size={isTabletOrMobile ? "small" : "medium"}
          onClick={(e) => {
            setShowModal(!showModal);
          }}
        >
          <Icon>add</Icon>
          {isTabletOrMobile ? "" : t("ADD")}
        </Fab>
      </Grid>

      {showModal && (
        <Grid
          className="app"
          container
          justify="center"
          style={{
            width: "inherit",
            margin: "15px 0",
            justifyContent: "space-evenly",
          }}
        >
          <Dialog
            scroll={"paper"}
            fullWidth={true}
            open={true}
            onClose={() => {
              setShowModal(!showModal);
            }}
            aria-labelledby="form-dialog-title"
            maxWidth={false}
            classes={{
              paperFullWidth: "dialogSizeTab", // class name, e.g. `classes-nesting-root-x`
            }}
          >
              <IconButton
                aria-label="close"
                className={classes.closeButton}
                onClick={() => {
                  setShowModal(!showModal);
                }}
              >
                <Icon className="fas fa-times" />
              </IconButton>
            <Grid item xs={12} lg={12} md={12} sm={12} xl={12} align="center">
              <h2>
              {t("TRAINEE_HEALTH_UPLOAD_TITLE")}
              </h2>
              {isSaving ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    minHeight: "calc(20vh)",
                    justifyContent: "center",
                  }}
                >
                  <CircularProgress size={48} />{" "}
                </div>
              ) : (
                <DropzoneCustom
                fileObjects={healthFiles}
                accepted={[
                    ".pdf,.doc",
                    ".docx",
                    "application/msword",
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                  ]}
                limit={10}
                dropzoneText={t("TRAINEE_HEALTH_UPLOAD_HEALTH")}
                handleOnAdd={handleOnAddHealthFile}
                handleOnDelete={handleOnRemoveHealthFile}
              />
              )}
            </Grid>
            <Grid item xs={12} lg={12} md={12} sm={12} xl={12}>
              <DialogActions>
                <div>
                  <Button
                    color="secondary"
                    onClick={() => {
                      setShowModal(!showModal);
                    }}
                  >
                    {t("CANCEL")}
                  </Button>
                  <Button
                    color="primary"
                    onClick={(e) => {
                      handleSubmit(e);
                    }}
                  >
                    {t("SUBMIT")}
                  </Button>
                </div>
              </DialogActions>
            </Grid>
          </Dialog>
        </Grid>
      )}

      <Grid item xs={12} lg={12} md={12} sm={12} xl={12}>
        <Typography
          gutterBottom
          style={{ fontSize: "2em", marginTop: "0.25em" }}
        >
        {t("TRAINEE_HEALTH_TITLE")}
        </Typography>
      </Grid>

      {!isLoading &&
        health &&
        health.length > 0 &&
        health.map((h, index) => {
          return (
            <Grid
              item
              key={h.name}
              xs={12}
              sm={6}
              md={3}
              lg={3}
              xl={3}
              style={{
                paddingRight: 15,
                paddingBottom: 15,
                display: "grid",
                height: "250px",
              }}
            >
              <Card>
                <CardContent id="teste" style={{ paddingTop: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <IconButton
                      aria-label="settings"
                      onClick={(e) => {
                        fullScreen(h.ref);
                      }}
                    >
                      <i style={{ fontSize: "1em" }} className="far fa-eye"></i>
                    </IconButton>
                    <IconButton
                      aria-label="settings"
                      onClick={(e) => {
                        deleteHealth(e, index);
                      }}
                    >
                      <Icon style={{ fontSize: "1em" }} className="fas fa-trash-alt fa-1x" />
                    </IconButton>
                  </div>
                  <p style={{ marginTop: "0", overflowWrap: "anywhere" }}>
                    {h.name.replace(id + "/health/", "").split("-")[0]}
                  </p>
                  <object
                    id={h.ref}
                    style={{ height: "100%" }}
                    data={h.ref}
                    type={h.type}
                    width="100%"
                    height="100%"
                  >

                          <p>
                          <a href={h.ref} rel="noreferrer" target="_blank">{t("TRAINEE_HEALTH_OPEN_FILE")}</a>

                          </p>
                 


                  </object>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      {isLoading && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            minHeight: "calc(20vh)",
            justifyContent: "center",
          }}
        >
          <CircularProgress size={80} />{" "}
        </div>
      )}
      {!isLoading && health.length === 0 && (
        
        <h3>{t("TRAINEE_HEALTH_UNAVAILABLE")}</h3>
      )}
    </Grid>
  );
}
