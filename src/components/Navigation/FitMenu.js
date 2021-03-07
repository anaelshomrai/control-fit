import { useEffect, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { useAuth } from "../Auth/ProvideAuth";
import {
  Divider,
  Button,
  Grid,
  ListItemIcon,
  ListItemText,
  SvgIcon,
  useMediaQuery,
  makeStyles,
  AppBar,
  List,
  Drawer,
  Badge,
  Toolbar,
  IconButton,
  Typography,
  MenuItem,
  Menu,
  Tooltip,
  Icon,
  ListItem,
} from "@material-ui/core";
import "./css/drawer.css";
import {
  updateEvent,
  deleteEvent,
  getCurrentIds,
  increaseEventId,
  updateTraineeField,
  addEvent,
  getTraineeWorkouts,
} from "../../Util/Firebase";
import moment from "moment";
import ControlFitContext from "../Context/ControlFitContext";
import { useContext } from "react";
import { Alert } from "@material-ui/lab";
import FullEvent from "../Calendar/AddEvent";
import { WORKOUTS } from "../../Util/TraineeFields";
import { useTranslation } from "react-i18next";
import { ReactComponent as HebrewIcon } from "../../logos/hebrew.svg";
import { ReactComponent as EnglishIcon } from "../../logos/english.svg";

/* <div>Icons made by <a href="https://www.freepik.com" title="Freepik">Freepik</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a></div> */

const useStyles = makeStyles((theme) => ({
  grow: {
    flexGrow: 1,
  },
  pStyle: {
    margin: 0,
  },
  title: {
    color: "white",
    display: "none",
    [theme.breakpoints.up("sm")]: {
      display: "block",
    },
  },
  sectionDesktop: {
    display: "none",
    [theme.breakpoints.up("md")]: {
      display: "flex",
    },
  },
  sectionMobile: {
    display: "flex",
    [theme.breakpoints.up("md")]: {
      display: "none",
    },
  },
}));
export default function FitMenu(props) {
  const classes = useStyles();
  const isTabletOrMobile = useMediaQuery("(max-width: 1000px)");
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = useState(null);
  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);
  const {
    trainees,
    notifications,
    workouts,
    updateWorkouts,
    updateNotifications,
    refreshNotifications,
  } = useContext(ControlFitContext);
  const { t } = useTranslation();

  let auth = useAuth();

  const handleMobileMenuClose = () => {
    setMobileMoreAnchorEl(null);
  };

  const handleMobileMenuOpen = (event) => {
    setMobileMoreAnchorEl(event.currentTarget);
  };

  const mobileMenuId = "primary-search-account-menu-mobile";
  const renderMobileMenu = (
    <Menu
      anchorEl={mobileMoreAnchorEl}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
      id={mobileMenuId}
      keepMounted
      transformOrigin={{ vertical: "top", horizontal: "right" }}
      open={isMobileMenuOpen}
      onClose={handleMobileMenuClose}
    >
      <MenuItem component={Link} to="/">
        <Tooltip title={t("MENU_ROUTE_HOME")}>
          <IconButton aria-label="home" color="inherit">
            <Icon style={{ fontSize: "0.8em" }} className="fas fa-home" />
          </IconButton>
        </Tooltip>
        <p className={classes.pStyle}>{t("MENU_ROUTE_HOME")}</p>
      </MenuItem>
      <MenuItem component={Link} to="/trainees">
        <Tooltip title={t("MENU_ROUTE_TRAINEES")}>
          <IconButton aria-label="trainees" color="inherit">
            <Icon style={{ fontSize: "0.8em" }} className="fas fa-running" />
          </IconButton>
        </Tooltip>
        <p className={classes.pStyle}>{t("MENU_ROUTE_TRAINEES")}</p>
      </MenuItem>
      <MenuItem component={Link} to="/calendar">
        <Tooltip title={t("MENU_ROUTE_CALENDAR")}>
          <IconButton aria-label="calendar" color="inherit">
            <Icon
              style={{ fontSize: "0.8em" }}
              className="far fa-calendar-alt"
            />
          </IconButton>
        </Tooltip>
        <p className={classes.pStyle}>{t("MENU_ROUTE_CALENDAR")}</p>
      </MenuItem>
      <MenuItem component={Link} to="/billing">
        <Tooltip title={t("MENU_ROUTE_BILLING")}>
          <IconButton aria-label="billing" color="inherit">
            <Icon
              style={{ fontSize: "0.8em" }}
              className="far fa-credit-card"
            />
          </IconButton>
        </Tooltip>
        <p className={classes.pStyle}>{t("MENU_ROUTE_BILLING")}</p>
      </MenuItem>
      {auth.user ? (
        <MenuItem
          onClick={() => {
            setIsSignOutClicket(!isSignOutClicked);
          }}
        >
          <Tooltip title={t("MENU_ROUTE_SIGNOUT")}>
            <IconButton aria-label="signout" color="inherit">
              <Icon
                style={{ fontSize: "0.8em" }}
                className="fas fa-sign-out-alt"
              />
            </IconButton>
          </Tooltip>
          <p className={classes.pStyle}>{t("MENU_ROUTE_SIGNOUT")}</p>
        </MenuItem>
      ) : (
        <MenuItem component={Link} to="/login">
          <Tooltip title={t("MENU_ROUTE_LOGIN")}>
            <IconButton aria-label="signout" color="inherit">
              <Icon
                style={{ fontSize: "0.8em" }}
                className="fas fa-sign-in-alt"
              />
            </IconButton>
          </Tooltip>
          <p className={classes.pStyle}>{t("MENU_ROUTE_LOGIN")}</p>
        </MenuItem>
      )}
    </Menu>
  );
  const list = (anchor) => (
    <div role="presentation">
      <List>
        <Typography
          key="titleNotification"
          variant="h6"
          noWrap
          style={{
            color: "#1f2859",
            paddingLeft: "16px",
            paddingRight: "16px",
          }}
        >
          {t("MENU_NEW_EVENTS")}
        </Typography>
        {notifications &&
          notifications.length > 0 &&
          notifications.map((note, index) => (
            <ListItem key={index}>
              <ListItemIcon
                classes={{
                  root: "centerListItem", // class name, e.g. `classes-nesting-root-x`
                }}
              >
                <Icon style={{ fontSize: "1.4em" }} className="far fa-bell" />
              </ListItemIcon>
              <ListItemText
                style={{ cursor: "pointer" }}
                onClick={() => {
                  setEvent(note);
                  setShowEventDialog(true);
                }}
                primary={
                  // `You have " ${note.title} at ${note.startStr}`
                  <>
                    <Typography
                      component="span"
                      variant="subtitle1"
                      color="textPrimary"
                    >
                      {t("MENU_NEW_EVENTS_YOU_HAVE")}{" "}
                      <strong>{note.title}</strong> {t("MENU_NEW_EVENTS_AT")}
                      <strong>{note.startStr}</strong>
                    </Typography>
                  </>
                }
              />
              {notifications.length - 1 !== index && <Divider key={index} />}
            </ListItem>
          ))}
      </List>
    </div>
  );

  const LANGUAGES = [
    { code: "en", name: t("ENGLISH"), iconClass: EnglishIcon },
    { code: "he", name: t("HEBREW"), iconClass: HebrewIcon },
  ];

  const changeLanguage = (lan) => {
    props.changeLanguage(lan);
  };

  const listLanguages = (anchor) => (
    <div role="presentation">
      <List>
        <Typography
          key="languages"
          variant="h6"
          noWrap
          style={{
            color: "#1f2859",
            paddingLeft: "16px",
            paddingRight: "16px",
          }}
        >
          {t("MENU_LANGUAGE_SELECT")}
        </Typography>
        {LANGUAGES &&
          LANGUAGES.length > 0 &&
          LANGUAGES.map((lan, index) => (
            <ListItem
              key={index}
              classes={{
                root: "fixTextAlign",
              }}
            >
              <ListItemIcon
                classes={{
                  root: "centerListItem",
                }}
              >
                <SvgIcon component={lan.iconClass} viewBox="0 0 600 476.6" />
              </ListItemIcon>
              <ListItemText
                style={{ cursor: "pointer" }}
                onClick={() => {
                  changeLanguage(lan.code);
                }}
                primary={
                  <>
                    <Typography
                      component="span"
                      variant="subtitle1"
                      color="textPrimary"
                    >
                      {lan.name}
                    </Typography>
                  </>
                }
              />
              {LANGUAGES.length - 1 !== index && <Divider key={index} />}
            </ListItem>
          ))}
      </List>
    </div>
  );

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLanguageDrawerOpen, setIsLanguageDrawerOpen] = useState(false);
  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };
  const toggleDrawerLanguages = () => {
    setIsLanguageDrawerOpen(!isLanguageDrawerOpen);
  };

  const [isSignOutClicked, setIsSignOutClicket] = useState(false);
  let history = useHistory();

  const [showEventDialog, setShowEventDialog] = useState(false);
  const toggleModal = () => {
    setShowEventDialog(!showEventDialog);
  };

  useEffect(() => {
    let now = null;
    let endDate = moment().endOf("day");
    // let testDate = moment('02/03/2021 10:53', 'DD/MM/YYYY HH:mm');

    let inter = setInterval(() => {
      now = moment().startOf("day");
      if (now.isAfter(endDate)) {
        endDate = moment().endOf("day");
        refreshNotifications();
      }
      // if (testDate.isAfter(endDate)) {
      //   testDate = moment().startOf("day");
      //   console.error("new day whoho");
      //   refreshNotifications();
      // }
    }, 1000);

    return () => clearInterval(inter);
  }, []);

  const [event, setEvent] = useState({});

  const updateEventFunc = (newEvent) => {
    //check if it was a regular event and became a trainee or vice versa
    //if type changed to regular, i need to delete trainee event and create new one
    //if type changed to trainee, i need to delete regular event and create new one
    // else it just changed values and I update event normally

    if (
      (event.isTrainee && !newEvent.isTrainee) ||
      (!event.isTrainee && newEvent.isTrainee)
    ) {
      return new Promise((resolve, reject) => {
        const eventCustomId = parseInt(event.id);

        deleteEventFunc(
          eventCustomId,
          event.isTrainee,
          event.docId,
          event.selectedTrainees
        ).then((res) => {
          handleSubmit(newEvent, newEvent.selectedTrainees).then((res) => {
            resolve();
          });
        });
      });
    } else {
      return new Promise((resolve, reject) => {
        if (newEvent.isTrainee) {
          const eventCustomId = parseInt(newEvent.id);
          newEvent.id = eventCustomId;
          delete newEvent.docId;

          updateNewFunc(event, newEvent).then((res) => {
            resolve();
          });
        } else {
          updateRegularEvent(newEvent).then((res) => {
            resolve();
          });
        }
      });
    }
  };

  const updateRegularEvent = (event) => {
    return new Promise((resolve, reject) => {
      updateEvent(event, event.docId).then((res) => {
        resolve();
      });
    });
  };

  const updateNewFunc = (event, newEvent) => {
    return new Promise((resolve, reject) => {
      let news = notifications.map((e) => {
        return e.id === newEvent.id ? newEvent : e;
      });

      updateWorkouts(news);
      let newNotification = workouts.filter((e) => {
        return e.id !== newEvent.id && checkIsToday(e.start);
      });

      updateNotifications(newNotification);

      const removedTrainees = event.selectedTrainees.reduce(
        (newArray, item) => {
          if (newEvent.selectedTrainees.includes(item)) {
            return newArray;
          } else {
            return [...newArray, item];
          }
        },
        []
      );

      if (removedTrainees.length > 0) {
        removedTrainees.forEach((t) => {
          getTraineeWorkouts(t.docId)
            .then(async (res) => {
              const events = await res.data();
              return events;
            })
            .then((events) => {
              const newEventsAdd = events.workouts.filter((w) => {
                return w.id !== newEvent.id;
              });
              //   t.wokrouts = newEventsAdd;
              updateTraineeField(t.docId, newEventsAdd, WORKOUTS, false, false)
                .then((res) => {
                })
                .catch((e) => {
                  console.error("error in delete", e);
                });
            })
            .catch((e) => {
              console.error("error in get", e);
            });
        });
      }
      //the stayed trainees
      newEvent.selectedTrainees.forEach((t) => {
        getTraineeWorkouts(t.docId).then(async (res) => {
          const events = await res.data();
          //if a trainee remove then we need to completey removed it
          let newEventsAdd;
          if (!events.workouts || events.workouts.length === 0) {
            newEventsAdd = [newEvent];
          } else {
            //this is ok if i need to replace the event, but if it's an added trainee then
            let exist = events.workouts.some((el) => el.id === newEvent.id);
            if (exist) {
              newEventsAdd = events.workouts.map((w) => {
                return w.id === newEvent.id ? newEvent : w;
              });
            } else {
              newEventsAdd = [...events.workouts, newEvent];
            }
          }

          //   t.wokrouts = newEventsAdd;
          updateTraineeField(
            t.docId,
            newEventsAdd,
            WORKOUTS,
            false,
            false
          ).then((res) => {
          });
        });
      });
      resolve();
    });
  };

  const checkIsToday = (date) => {
    let startDate = moment().startOf("day");
    let endDate = moment().endOf("day");

    return moment(date).isBetween(startDate, endDate, null, "[]");
  };

  const deleteEventFunc = (id, isTrainee, docId, selectedTrainees) => {
    return new Promise((resolve, reject) => {
      if (isTrainee) {
        deleteNewFunc(event, id).then((res) => {
          resolve();
        });
        resolve();
      } else {
        deleteRegularEvent(docId).then((res) => {
          resolve();
        });
      }
    });
  };

  const deleteRegularEvent = (docId) => {
    return new Promise((resolve, reject) => {
      deleteEvent(docId).then((res) => {
        // let news = workouts.filter((e) => {
        //   return e.docId !== docId;
        // });
        resolve();
      });
    });
  };

  const deleteNewFunc = (event, newEventId) => {
    return new Promise((resolve, reject) => {
      let news = workouts.filter((e) => {
        return e.id !== newEventId;
      });
      updateWorkouts(news);
      let newNotification = workouts.filter((e) => {
        return e.id !== newEventId && checkIsToday(e.start);
      });

      updateNotifications(newNotification);

      event.selectedTrainees.forEach((t) => {
        getTraineeWorkouts(t.docId).then(async (res) => {
          const events = await res.data();

          const newEventsAdd = events.workouts.filter((w) => {
            return w.id !== newEventId;
          });
          // t.wokrouts = newEventsAdd;
          updateTraineeField(
            t.docId,
            newEventsAdd,
            WORKOUTS,
            false,
            false
          ).then((res) => {
          });
        });
      });
      resolve();
    });
  };

  const handleSubmit = (event, selectedTrainees) => {
    return new Promise((resolve, reject) => {
      if (event.isTrainee) {

        submitTraineeEvent(event, selectedTrainees).then((res) => {
          resolve();
        });
      } else {
        //to make sure all ok if type changed
        delete event.docId;
        delete event.selectedTrainees;
        handleGenralEvent(event).then((res) => {
          resolve();
        });
      }
    });
  };

  const submitTraineeEvent = (event, selectedTrainees) => {
    return new Promise((resolve, reject) => {
      handleIds()
        .then((id) => {
          selectedTrainees = selectedTrainees.map((s) => {
            return {
              docId: s.docId,
              name: s.name,
              created: s.created,
              isActive: s.isActive,
              phone: s.phone,
            };
          });

          const newEvent = {
            ...event,
            id: id,
            selectedTrainees: selectedTrainees,
            isTrainee: true,
          };
          return newEvent;
        })
        .then((newEvent) => {
          selectedTrainees.forEach((t) => {
            updateTraineeField(t.docId, newEvent, WORKOUTS, true, false).then(
              (docref) => {
                return docref;
              }
            );
          });
          resolve();
        });
      // .then((newEvent) => {
      //   resolve();
      // });
    });
  };

  const handleIds = () => {
    return new Promise((resolve, reject) => {
      getCurrentIds()
        .then(async (res) => {
          const id = await res.data().id;
          return id;
        })
        .then((id) => {
          increaseEventId(id)
            .then((res) => {
              return id;
            })
            .then((id) => {

              resolve(id);
            });
        });
    });
  };

  const handleGenralEvent = (event) => {
    return new Promise((resolve, reject) => {
      handleIds().then((id) => {
        const newEvent = {
          ...event,
          id: id,
        };

        addEvent(newEvent).then((res) => {
          newEvent.docId = res.id;
          resolve();
        });
      });
    });
  };

  return (
    <Grid
      container
      style={
        {
          // height: "10%"
          //maxHeight: "70px"
        }
      }
    >
      {showEventDialog && (
        <FullEvent
          onClose={toggleModal}
          eventInfo={event}
          trainees={trainees}
          isEditMode={true}
          preSelected={[]}
          handleSubmitEvent={updateEventFunc}
          deleteEvent={deleteEventFunc}
        />
      )}

      {isSignOutClicked && (
        <Alert
          severity="error"
          style={{ width: "100%" }}
          action={
            <>
              <Button
                color="secondary"
                size="small"
                onClick={(e) => {
                  setIsSignOutClicket(!isSignOutClicked);
                  auth.signout();
                  history.push("/");
                }}
              >
                {t("MENU_SIGN_OUT_YES")}
              </Button>
              <Button
                color="default"
                size="small"
                onClick={(e) => {
                  setIsSignOutClicket(!isSignOutClicked);
                }}
              >
                {t("MENU_SIGN_OUT_NO")}
              </Button>
            </>
          }
        >
          {t("MENU_SIGN_OUT_SURE")}
        </Alert>
      )}

      <div className={classes.grow}>
        <AppBar position="static">
          <Toolbar>
            <Drawer
              anchor="top"
              open={isLanguageDrawerOpen}
              onClose={toggleDrawerLanguages}
              classes={
                isTabletOrMobile
                  ? {}
                  : {
                      paperAnchorTop: "belowHeader", // class name, e.g. `classes-nesting-root-x`
                    }
              }
            >
              <div
                tabIndex={0}
                role="button"
                onClick={toggleDrawerLanguages}
                onKeyDown={toggleDrawerLanguages}
              >
                {listLanguages()}
              </div>
            </Drawer>
            <Drawer
              anchor="top"
              open={isDrawerOpen}
              onClose={toggleDrawer}
              classes={
                isTabletOrMobile
                  ? {}
                  : {
                      paperAnchorTop: "belowHeader", // class name, e.g. `classes-nesting-root-x`
                    }
              }
            >
              <div
                tabIndex={0}
                role="button"
                onClick={toggleDrawer}
                onKeyDown={toggleDrawer}
              >
                {list()}
              </div>
            </Drawer>

            <IconButton
              style={{ paddingRight: "20px" }}
              aria-label="show notifications"
              color="inherit"
              onClick={toggleDrawerLanguages}
            >
              <Icon
                style={{ fontSize: "0.8em" }}
                className="fas fa-globe-europe"
              />
            </IconButton>

            <Typography
              style={{ textDecoration: "none" }}
              className={classes.title}
              variant="h6"
              noWrap
              component={Link}
              to="/trainees"
            >
              {t("CONTROL_FIT_TITLE")}
            </Typography>

            <IconButton
              style={{ paddingRight: "20px" }}
              aria-label="show notifications"
              color="inherit"
              onClick={toggleDrawer}
            >
              <Badge badgeContent={notifications?.length} color="secondary">
                <Icon style={{ fontSize: "0.8em" }} className="far fa-bell" />
              </Badge>
            </IconButton>

            <div className={classes.grow} />
            <div className={classes.sectionDesktop}>
              <MenuItem component={Link} to="/">
                <Tooltip title={t("MENU_ROUTE_HOME")}>
                  <IconButton aria-label="home" color="inherit">
                    <Icon
                      style={{ fontSize: "0.8em" }}
                      className="fas fa-home"
                    />
                  </IconButton>
                </Tooltip>
                <p className={classes.pStyle}>{t("MENU_ROUTE_HOME")}</p>
              </MenuItem>
              <MenuItem component={Link} to="/trainees">
                <Tooltip title={t("MENU_ROUTE_TRAINEES")}>
                  <IconButton aria-label="trainees" color="inherit">
                    <Icon
                      style={{ fontSize: "0.8em" }}
                      className="fas fa-running"
                    />
                  </IconButton>
                </Tooltip>
                <p className={classes.pStyle}>{t("MENU_ROUTE_TRAINEES")}</p>
              </MenuItem>
              <MenuItem component={Link} to="/calendar">
                <Tooltip title={t("MENU_ROUTE_CALENDAR")}>
                  <IconButton aria-label="calendar" color="inherit">
                    <Icon
                      style={{ fontSize: "0.8em" }}
                      className="far fa-calendar-alt"
                    />
                  </IconButton>
                </Tooltip>
                <p className={classes.pStyle}>{t("MENU_ROUTE_CALENDAR")}</p>
              </MenuItem>
              <MenuItem component={Link} to="/billing">
                <Tooltip title={t("MENU_ROUTE_BILLING")}>
                  <IconButton aria-label="billing" color="inherit">
                    <Icon
                      style={{ fontSize: "0.8em" }}
                      className="far fa-credit-card"
                    />
                  </IconButton>
                </Tooltip>
                <p className={classes.pStyle}>{t("MENU_ROUTE_BILLING")}</p>
              </MenuItem>
              {auth.user ? (
                <MenuItem
                  //   component={Link} to="/signout"
                  onClick={() => {
                    setIsSignOutClicket(!isSignOutClicked);
                  }}
                >
                  <Tooltip title={t("MENU_ROUTE_SIGNOUT")}>
                    <IconButton aria-label="signout" color="inherit">
                      <Icon
                        style={{ fontSize: "0.8em" }}
                        className="fas fa-sign-out-alt"
                      />
                    </IconButton>
                  </Tooltip>
                  <p className={classes.pStyle}>{t("MENU_ROUTE_SIGNOUT")}</p>
                </MenuItem>
              ) : (
                <MenuItem component={Link} to="/login">
                  <Tooltip title={t("MENU_ROUTE_LOGIN")}>
                    <IconButton aria-label="signout" color="inherit">
                      <Icon
                        style={{ fontSize: "0.8em" }}
                        className="fas fa-sign-in-alt"
                      />
                    </IconButton>
                  </Tooltip>
                  <p className={classes.pStyle}>{t("MENU_ROUTE_LOGIN")}</p>
                </MenuItem>
              )}
            </div>
            <div className={classes.sectionMobile}>
              <IconButton
                aria-label="show more"
                aria-controls={mobileMenuId}
                aria-haspopup="true"
                onClick={handleMobileMenuOpen}
                color="inherit"
              >
                <Icon style={{ fontSize: "0.8em" }} className="fas fa-bars" />
              </IconButton>
            </div>
          </Toolbar>
        </AppBar>
        {renderMobileMenu}
      </div>
    </Grid>
  );
}
