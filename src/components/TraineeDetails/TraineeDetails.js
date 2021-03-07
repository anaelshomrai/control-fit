import {
  Avatar,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  Fab,
  Grid,
  Icon,
  IconButton,
  Tab,
  Tabs,
  useMediaQuery,
  Switch,
  ClickAwayListener,
  makeStyles,
  AppBar,
  Box
} from "@material-ui/core";
import DetailsTab from "./Tab/DetailsTab";
import ImagesTab from "./Tab/ImagesTab";
import { useParams } from "react-router-dom";
import TrackerTab from "./Tab/TrackerTab";
import React, { useContext, useEffect, useState } from "react";
import PropTypes from "prop-types";
import "./css/tabs.css";
import ProgramTab from "./Tab/ProgramTab";
import HealthTab from "./Tab/HealthTab";
import {
  storageRef,
  updateTrainee,
  updateTraineeField,
  uploadFile,
  addTraineesProgram,
  deleteProgram,
} from "../../Util/Firebase";
import ControlFitContext from "../Context/ControlFitContext";
import { Alert } from "@material-ui/lab";
import clsx from "clsx";
import {
  HEALTH,
  IMAGES,
  PROFILE_PICTURE,
  PROGRAM,
  TRACKER,
} from "../../Util/TraineeFields";
import { useTranslation } from "react-i18next";
import DropzoneCustom from "../Reuseable/DropzoneCustom";
import { green } from "@material-ui/core/colors";
const mammoth = require("mammoth");
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`scrollable-auto-tabpanel-${index}`}
      aria-labelledby={`scrollable-auto-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box div={3} style={{ padding: 0 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};

function a11yProps(index) {
  return {
    id: `scrollable-auto-tab-${index}`,
    "aria-controls": `scrollable-auto-tabpanel-${index}`,
  };
}

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    width: "100%",
    justifyContent: "space-evenly",
  },
  tab1: {
    [theme.breakpoints.down("xs")]: {
      maxWidth: "100%",
      width: "100%",
    },
  },
  large: {
    width: theme.spacing(14),
    height: theme.spacing(14),
    border: "5px solid #ababab",
  },
  small: {
    width: theme.spacing(5),
    height: theme.spacing(5),
  },
  detailTitle: {
    color: "#767676",
  },
  detailData: {
    color: "#5b6abf", //##3f51b5
  },
  detailSection: {
    borderLeft: "1px solid #337ab7",
    padding: "0 10px",
    fontSize: "1.2em",
  },
  buttonSuccess: {
    //   backgroundColor: green[500],
    "&:hover": {
      //   backgroundColor: green[700],
    },
  },
  fabProgress: {
    color: green[500],
    position: "absolute",
    // top: -6,
    //  left: -6,
    zIndex: 1,
  },
  closeButton: {
    position: "absolute",
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
}));

export default function TraineeDetails(props) {
  const classes = useStyles();
  const { t } = useTranslation();
  const { id } = useParams();
  const [tabValue, setTabValue] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { detailedTrainee } = useContext(ControlFitContext);
  const [trainee, setTrainee] = useState();
  const [profilePictureRef, setProfilePictureRef] = useState("");
  const isTabletOrMobile = useMediaQuery("(max-width: 1000px)");
  const isWider = useMediaQuery("(max-width: 500px)");
  const [isError, setIsError] = useState(false);
  const { trainees } = useContext(ControlFitContext);
  const [profileLoading, setProfileLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const buttonClassname = clsx({
    [classes.buttonSuccess]: success,
  });

  useEffect(() => {
    if (
      detailedTrainee &&
      Object.keys(detailedTrainee).length === 0 &&
      detailedTrainee.constructor === Object
    ) {
      //console.log("empty detailedTrainee");
    } else {
     // console.log("detailedTrainee", detailedTrainee);
      setTrainee(detailedTrainee);
    }
  }, [detailedTrainee]);

  const cacheImages = async (pics) => {
    const promises = await pics.map((src) => {
      return new Promise(function (resolve, reject) {
        const img = new Image();
        img.src = src;
        img.onload = resolve();
        img.onerror = reject();
      });
    });

    await Promise.all(promises);

    setIsLoading(false);
  };

  useEffect(() => {
    async function fetchImage() {
      if (trainee && trainee.profilePicture) {
        let ref = await getImageRef(trainee.profilePicture.name);
        await cacheImages([trainee.profilePicture]);
        setProfilePictureRef(ref);
        setSuccess(true);
        setProfileLoading(false);
      }
    }

    fetchImage();
  }, [trainee]);

  const getImageRef = async (filename) => {
    var imagesRef = await storageRef.child(filename).getDownloadURL();
    return imagesRef;
  };
  const handleChange = (event, newValue) => {
    setTabValue(newValue);
  };

  useEffect(() => {
    if (trainee) setIsLoading(false);
  }, [trainee]);

  useEffect(() => {
    let inter = setInterval(() => {
     // console.log("trainee search", detailedTrainee, id, trainees);
      if (!trainee && !detailedTrainee) {
        let search = trainees.filter((e) => {
          return e.docId === id;
        });
        if (search[0]) {
      //    console.log("ser", search);
          search[0].created = search.created?.toDate();
          setTrainee(search[0]);
          clearInterval(inter);
        }
      } else {
        clearInterval(inter);
      }
    }, 5000);

    return () => {
      clearInterval(inter);
    };
  }, [trainees]);

  const handleDetailsUpdate = async (values) => {
    try {
      const traineeNew = { ...values, docId: trainee.docId };
      await updateTrainee(traineeNew);
    } catch (e) {
      return Promise.reject(e);
    }
    return Promise.resolve();
  };

  const handleProgramUpdate = async (programList, programId, newHTML) => {
    try {
      await deleteProgram(programId);
      let stripeedList = programList.map((p) => {
        return { id: p.id };
      });
      let progId = await addTraineesProgram({ html: newHTML }, "program");
      stripeedList.push({ id: progId.id });
      await updateTraineeField(id, stripeedList, PROGRAM, false, false);
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  };

  const handleDeleteProgram = async (programList, programId) => {
    try {
      await deleteProgram(programId);
      let stripeedList = programList.map((p) => {
        return { id: p.id };
      });
      await updateTraineeField(id, stripeedList, PROGRAM, false, false);
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  };

  const handleDeleteImage = async (images, deletedName) => {
    try {
      await updateTraineeField(id, images, IMAGES, false, false);
      await storageRef.child(deletedName).delete();
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  };

  const handleDeleteHealth = async (health, deletedName) => {
    try {
      await updateTraineeField(id, health, HEALTH, false, false);
      await storageRef.child(deletedName).delete();
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  };

  const handleProgramAdded = (files, type) => {
    return new Promise((resolve, reject) => {
      if (files && files.length > 0) {
        files.forEach((e) => {
          let file = e.file;
          file.arrayBuffer().then((ab) => {
            mammoth
              .convertToHtml(
                { arrayBuffer: ab },
                { includeDefaultStyleMap: true }
              )
              .then(async (result) => {
                //TODO: add marker to set if in hebrew or not
                let hebrew = `<div class="ql-align-right ql-direction-rtl">${result.value}</div>`;
                let obj = {
                  html: hebrew,
                  name:
                    id +
                    "/" +
                    type +
                    "/" +
                    file.name.split(".")[0] +
                    "-" +
                    new Date().getTime() +
                    "." +
                    file.name.split(".")[1],
                  path: file.path,
                  type: file.type,
                };
                try {
                  let res = await addTraineesProgram(obj);
                  //let res2 = 
                  await updateTraineeField(
                    id,
                    { id: res.id },
                    PROGRAM,
                    true
                  );
                } catch (e) {
                  reject(e);
                  return;
                }
                resolve();
              })
              .catch((e) => {
                reject(e);
              })
              .done();
          });
        });
      } else {
        resolve();
      }
    });
  };

  const handleTrackerAdd = (newData) => {
    return new Promise((resolve, reject) => {
      updateTraineeField(id, newData, TRACKER, true, false)
        .then((res) => {
          resolve(res);
        })
        .catch((e) => {
          reject(e);
        });
    });
  };

  const handleTrackerUpdate = (data) => {
    return new Promise((resolve, reject) => {
      // setTrainee((prevState) => ({
      //   ...prevState,
      //   tracker: data,
      // }));
      updateTraineeField(id, data, TRACKER, false, false)
        .then((res) => {
          resolve(res);
        })
        .catch((e) => {
          reject(e);
        });
    });
  };

  const handleHealthAdded = async (files, type) => {
    try {
      if (files && files.length > 0) {
        let health = [];
        for (const e of files) {
          let file = e.file;
          let obj = {
            name:
              id +
              "/" +
              type +
              "/" +
              file.name.split(".")[0] +
              "-" +
              new Date().getTime() +
              "." +
              file.name.split(".")[1],
            path: file.path,
            type: file.type,
          };
          health.push(obj);
          //let res = 
          await storageRef.child(obj.name).put(file);
        }

        await updateTraineeField(id, health, HEALTH, true, true);
      }
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  };

  const handleImgAdded = async (files, type) => {
    try {
      if (files && files.length > 0) {
        let images = [];
        for (const e of files) {
          let file = e.file;
          let obj = {
            name:
              id +
              "/" +
              type +
              "/" +
              file.name.split(".")[0] +
              "-" +
              new Date().getTime() +
              "." +
              file.name.split(".")[1],
            path: file.path,
            type: file.type,
          };
          images.push(obj);
          await storageRef.child(obj.name).put(file);
        }
        await updateTraineeField(id, images, IMAGES, true, true);
      }
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  };

  const [isHovering, setIsHovering] = useState(false);

  const toggleHoverState = (state) => {
    setIsHovering(!isHovering);
  };
  const [showProfilePicDialog, setShowProfilePicDialog] = useState(false);
  const [porfilePicNew, setProfilePicNew] = useState([]);

  const handleProfilePicUpdated = async (e) => {
    try {
      e.preventDefault();
      setShowProfilePicDialog(!showProfilePicDialog);
      let stripped = {
        name:
          id +
          "/profilePicture/" +
          porfilePicNew[0].file.name.split(".")[0] +
          "-" +
          new Date().getTime() +
          "." +
          porfilePicNew[0].file.name.split(".")[1],
        type: porfilePicNew[0].file.type,
      };
      await uploadFile(stripped.name, porfilePicNew[0].file);
      await updateTraineeField(id, stripped, PROFILE_PICTURE, false, false);
      setProfilePicNew([]);
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  };

  const handleOnAddProfileFile = (newFileObjs) => {
    setProfilePicNew((porfilePicNew, newFileObjs));
  };

  const handleOnRemoveProfileFile = (deleteFileObj, index) => {
    let filtered = porfilePicNew.filter((_, i) => i !== index);
    setProfilePicNew(filtered);
  };

  return (
    <Grid
      container
      justify="center"
      style={{
        height: "100%",
        margin: 0,
        width: "inherit",
      }}
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
      {trainee && showProfilePicDialog && (
        <Grid
          className="app"
          container
          justify="center"
          style={{
            width: "inherit",
            // margin: "15px 0",
            justifyContent: "space-evenly",
          }}
        >
          <Dialog
            scroll={"paper"}
            fullWidth={true}
            open={true}
            onClose={() => {
              setShowProfilePicDialog(!showProfilePicDialog);
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
                setShowProfilePicDialog(!showProfilePicDialog);
              }}
            >
              <Icon className="fas fa-times" />
            </IconButton>
            <Grid item xs={12} lg={12} md={12} sm={12} xl={12} align="center">
              <h3>{t("TRAINEE_DETAILS_PROFILE")}</h3>
              <DropzoneCustom
                fileObjects={porfilePicNew}
                accepted={["image/*"]}
                limit={1}
                dropzoneText={t("TRAINEE_DETAILS_PROFILE_UPLOAD")}
                handleOnAdd={handleOnAddProfileFile}
                handleOnDelete={handleOnRemoveProfileFile}
              />
            </Grid>
            <Grid item xs={12} lg={12} md={12} sm={12} xl={12}>
              <DialogActions>
                <div>
                  <Button
                    color="secondary"
                    onClick={() => {
                      setShowProfilePicDialog(!showProfilePicDialog);
                    }}
                  >
                    {t("CANCEL")}
                  </Button>
                  <Button
                    color="primary"
                    onClick={(e) => {
                      setSuccess(false);
                      setProfileLoading(true);
                      handleProfilePicUpdated(e)
                        .then((res) => {})
                        .catch((e) => {
                          setSuccess(true);
                          setProfileLoading(false);
                          setIsError(t("TRAINEE_DETAILS_PROFILE_ERROR"));
                        });
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

      <Grid
        item
        xs={12}
        lg={12}
        md={12}
        sm={12}
        xl={12}
        align="center"
        className={classes.root}
        style={{
          // height: "80%",
          backgroundColor: "white",
          //  overflow: "scroll"
        }}
      >
        <div className={classes.root}>
          <AppBar position="static" color="default">
            <Tabs
              style={{ backgroundColor: "#f3f1f2" }}
              variant="scrollable"
              scrollButtons="auto"
              value={tabValue}
              onChange={handleChange}
              indicatorColor="primary"
              textColor="primary"
              aria-label="scrollable auto tabs example"
              classes={{
                flexContainer: "spaceEven", // class name, e.g. `classes-nesting-root-x`
              }}
            >
              {/* <Tab
            disableRipple
            className={`${classes.tab1} tab1`}
            icon={
              <input type="text" className="search" placeholder="Search.." />
            }
            {...a11yProps(0)}
          /> */}

              <Tab
                className="tab2"
                label={t("TRAINEE_TAB_DETAILS")}
                icon={<Icon className="fas fa-user-tag" />}
                {...a11yProps(1)}
              />
              <Tab
                className="tab3"
                label={t("TRAINEE_TAB_PROGRAM")}
                icon={<Icon className="fas fa-clipboard-list" />}
                {...a11yProps(2)}
              />
              <Tab
                label={t("TRAINEE_TAB_TRACKER")}
                icon={<Icon className="fas fa-table" />}
                {...a11yProps(3)}
              />
              <Tab
                label={t("TRAINEE_TAB_IMAGES")}
                icon={<Icon className="fas fa-images" />}
                {...a11yProps(4)}
              />
              <Tab
                label={t("TRAINEE_TAB_HEALTH")}
                icon={<Icon className="fas fa-file-medical-alt" />}
                {...a11yProps(5)}
              />
            </Tabs>
          </AppBar>

          {trainee && (
            <Grid
              item
              xs={12}
              lg={12}
              md={12}
              sm={12}
              xl={12}
              align="center"
              className={classes.root}
              style={{ borderBottom: "1px solid #3f51b5" }}
            >
              {isTabletOrMobile ? (
                <Grid
                  container
                  justify="center"
                  style={{
                    height: "100%",
                    width: "inherit",
                    textAlign: "start",
                    backgroundColor: "white",
                  }}
                >
                  <Grid
                    item
                    xs={4}
                    lg={4}
                    md={4}
                    sm={4}
                    xl={4}
                    align="center"
                    className={classes.root}
                    style={{ display: "flex", position: "relative" }}
                  >
                    <div
                      onMouseEnter={toggleHoverState}
                      onMouseLeave={toggleHoverState}
                    >
                      <Avatar
                        alt={trainee?.name}
                        src={profilePictureRef}
                        className={classes.large}
                      />
                      {/* {!isHovering &&  */}

                      <Fab
                        style={
                          isWider
                            ? { position: "absolute", bottom: "0" }
                            : { position: "absolute", bottom: "-20%" }
                        }
                        color="primary"
                        variant="extended"
                        size={"small"}
                        className={buttonClassname}
                        onClick={(e) => {
                          setShowProfilePicDialog(!showProfilePicDialog);
                        }}
                      >
                        <Icon style={{ fontSize: "1.4em" }} className="fas fa-camera fa-lg" />
                        {profileLoading && (
                          <CircularProgress
                            size={34}
                            className={classes.fabProgress}
                          />
                        )}
                      </Fab>

                      {/* } */}
                    </div>
                  </Grid>

                  <Grid
                    item
                    xs={4}
                    lg={4}
                    md={4}
                    sm={4}
                    xl={4}
                    align="center"
                    className={classes.root}
                    style={{ display: "flex" }}
                  >
                    <p
                      className={classes.detailData}
                      style={{ fontSize: "2em", alignSelf: "center" }}
                    >
                      {trainee?.name}
                    </p>
                  </Grid>

                  <Grid
                    item
                    xs={4}
                    lg={4}
                    md={4}
                    sm={4}
                    xl={4}
                    align="center"
                    className={classes.root}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    <h3>{t("TRAINEE_TAB_HEADER_ACTIVE")}</h3>
                    <Switch
                      checked={trainee.isActive || false}
                      onChange={(e) => {
                        handleDetailsUpdate({ isActive: e.target.checked })
                          .then((res) => {
                            setIsError(false);
                          })
                          .catch((e) => {
                            setIsError(t("TRAINEE_DETAILS_ACTIVE_ERROR"));
                          });
                      }}
                      color="primary"
                      name="checkedA"
                      inputProps={{ "aria-label": "secondary checkbox" }}
                    />
                  </Grid>
                </Grid>
              ) : (
                <Grid
                  container
                  justify="center"
                  style={{
                    height: "100%",
                    width: "inherit",
                    textAlign: "start",
                    backgroundColor: "white",
                  }}
                >
                  <Grid
                    item
                    xs={4}
                    lg={4}
                    md={4}
                    sm={4}
                    xl={4}
                    align="center"
                    className={classes.root}
                    style={{ display: "flex" }}
                  >
                    <div style={{ position: "relative" }}>
                      <Avatar
                        alt={trainee?.name}
                        src={profilePictureRef}
                        className={classes.large}
                      />
                      {/* {!isHovering &&  */}
                      <Fab
                        style={{ position: "absolute", bottom: "-6%" }}
                        color="primary"
                        variant="extended"
                        size={"small"}
                        className={buttonClassname}
                        onClick={(e) => {
                          setShowProfilePicDialog(!showProfilePicDialog);
                        }}
                      >
                        <Icon style={{ fontSize: "1.4em" }} className="fas fa-camera fa-lg" />
                        {profileLoading && (
                          <CircularProgress
                            size={34}
                            className={classes.fabProgress}
                          />
                        )}
                      </Fab>

                      {/* } */}
                    </div>
                    <p
                      className={classes.detailData}
                      style={{ fontSize: "1.5em", alignSelf: "center" }}
                    >
                      {trainee?.name}
                    </p>
                  </Grid>

                  <Grid
                    item
                    xs={3}
                    lg={3}
                    md={3}
                    sm={3}
                    xl={3}
                    align="start"
                    className={classes.detailSection}
                  >
                    <p>
                      <span
                        className="far fa-calendar-alt fa-lg"
                        style={{ marginInlineEnd: "10px",fontSize: "1em" }}
                      />

                      <span className={classes.detailTitle}>
                        {t("TRAINEE_TAB_HEADER_AGE")} &nbsp;
                      </span>
                      <span className={classes.detailData}>
                        {" "}
                        {trainee?.age}{" "}
                      </span>
                    </p>

                    <p>
                      <span
                        className="far fa-calendar-check fa-lg"
                        style={{ marginInlineEnd: "10px",fontSize: "1em" }}
                      />
                      <span className={classes.detailTitle}>
                        {t("TRAINEE_TAB_HEADER_CREATED")} &nbsp;
                      </span>

                      <span className={classes.detailData}>
                        {/* { trainee?.created.toDate().toLocaleString("he-IL", {
                    month: "numeric",
                    day: "numeric",
                    year: "numeric",
                  })}  */}

                        {trainee?.created}
                      </span>
                    </p>
                  </Grid>

                  <Grid
                    item
                    xs={3}
                    lg={3}
                    md={3}
                    sm={3}
                    xl={3}
                    align="start"
                    className={classes.detailSection}
                  >
                    <p>
                      <span
                        className="fas fa-mobile-alt fa-lg"
                        style={{ marginInlineEnd: "10px",fontSize: "1em" }}
                      />

                      <span className={classes.detailTitle}>
                        {t("TRAINEE_TAB_HEADER_PHONE")} &nbsp;
                      </span>
                      <span className={classes.detailData}>
                        {trainee?.phone}
                      </span>
                    </p>

                    <p>
                      <span
                        className="far fa-envelope fa-lg"
                        style={{ marginInlineEnd: "10px",fontSize: "1em" }}
                      />

                      <span className={classes.detailTitle}>
                        {t("TRAINEE_TAB_HEADER_EMAIL")} &nbsp;
                      </span>
                      <span className={classes.detailData}>
                        {trainee?.email}
                      </span>
                    </p>
                  </Grid>

                  <Grid
                    item
                    xs={2}
                    lg={2}
                    md={2}
                    sm={2}
                    xl={2}
                    align="center"
                    className={classes.detailSection}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    <h3>{t("TRAINEE_TAB_HEADER_ACTIVE")}</h3>
                    <Switch
                      checked={trainee.isActive || false}
                      onChange={(e) => {
                        handleDetailsUpdate({ isActive: e.target.checked })
                          .then((res) => {
                            setIsError(false);
                          })
                          .catch((e) => {
                            setIsError(t("TRAINEE_DETAILS_ACTIVE_ERROR"));
                          });
                      }}
                      color="primary"
                      name="checkedA"
                      inputProps={{ "aria-label": "secondary checkbox" }}
                    />
                  </Grid>
                </Grid>
              )}
            </Grid>
          )}

          {isLoading && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignContent: "center",
                alignItems: "center",
                flexDirection: "column",
                height: "calc(100vh - 188px)",
              }}
            >
              <CircularProgress size={80} />
            </div>
          )}

          {!isLoading && (
            <TabPanel value={tabValue} index={0}>
              <DetailsTab
                id={id}
                trainee={trainee}
                handleDetailsUpdate={handleDetailsUpdate}
              />
            </TabPanel>
          )}

          <TabPanel value={tabValue} index={1}>
            <ProgramTab
              id={id}
              trainee={trainee}
              handleProgramUpdate={handleProgramUpdate}
              handleDeleteProgram={handleDeleteProgram}
              handleProgramAdded={handleProgramAdded}
            />
          </TabPanel>
          <TabPanel value={tabValue} index={2}>
            <TrackerTab
              id={id}
              trainee={trainee}
              handleTrackerAdd={handleTrackerAdd}
              handleTrackerUpdate={handleTrackerUpdate}
            />
          </TabPanel>
          <TabPanel value={tabValue} index={3}>
            <ImagesTab
              id={id}
              trainee={trainee}
              handleDeleteImage={handleDeleteImage}
              handleImgAdded={handleImgAdded}
            />
          </TabPanel>
          <TabPanel value={tabValue} index={4}>
            <HealthTab
              id={id}
              trainee={trainee}
              handleDeleteHealth={handleDeleteHealth}
              handleHealthAdded={handleHealthAdded}
            />
          </TabPanel>
        </div>
      </Grid>
    </Grid>
  );
}
