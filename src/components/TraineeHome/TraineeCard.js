import { useContext, useEffect, useState } from "react";
import "./css/card.css";
import {
  getCurrentIds,
  increaseEventId,
  storageRef,
  deleteTrainee,
  updateTraineeField,
} from "../../Util/Firebase";
import FullEvent from "../Calendar/AddEvent";
import { Link } from "react-router-dom";
import ControlFitContext from "../Context/ControlFitContext";
import {
  Avatar,
  CardHeader,
  ClickAwayListener,
  Icon,
  IconButton,
  makeStyles,
  Card,
  CardActions,
  CardContent,
  Button,
  Typography
} from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import { WORKOUTS } from "../../Util/TraineeFields";
import { useTranslation } from "react-i18next";

const useStyles = makeStyles((theme) => ({
  large: {
    width: theme.spacing(7),
    height: theme.spacing(7),
  },
}));
export default function TraineeCard({ trainee }) {
  const { t } = useTranslation();
  const { setDetailedTrainee } = useContext(ControlFitContext);
  const [profilePictureRef, setProfilePictureRef] = useState("");
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [isError, setIsError] = useState(false);
  const classes = useStyles();

  const deleteTraineeFromList = () => {
    try {
      deleteTrainee(trainee.docId)
        .then((res) => {
          setIsError(false);
        })
        .catch((e) => {
          console.error("Error", e);
          setIsError(t("TRAINEE_CARD_REMOVE_ERROR"));
        });
    } catch (e) {
      console.error("Errors", e);
      setIsError(t("TRAINEE_CARD_REMOVE_ERROR"));
    }
  };

  const toggleModal = () => {
    setShowEventDialog(!showEventDialog);
  };

  const handleCancel = () => {
    //console.log("Cancel");
  };

  const handleIds = async () => {
    const res = await getCurrentIds();
    const id = await res.data().id;
    await increaseEventId(id);
    return id;
  };

  useEffect(() => {
    async function fetchImage() {
      if (trainee && trainee.profilePicture) {
        let ref = await getImageRef(trainee.profilePicture.name);
        setProfilePictureRef(ref);
      }
    }

    fetchImage();
  }, [trainee]);

  const updatTraineeEvent = async (event) => {
    const id = await handleIds();
    const newEvent = {
      ...event,
      id: id,
      selectedTrainees: [
        {
          docId: trainee.docId,
          name: trainee.name,
          created: trainee.created,
          isActive: trainee.isActive,
          phone: trainee.phone,
          isTrainee: true,
        }
      ],
    };
    await updateTraineeField(trainee.docId, newEvent,WORKOUTS,true);
  };
  
  const getImageRef = async (filename) => {
    var imagesRef = await storageRef.child(filename).getDownloadURL();
    return imagesRef;
  };

  return (
    <Card>
      {isError && (
        <ClickAwayListener
          onClickAway={() => {
            setIsError(false);
          }}
        >
          <Alert severity="error">{isError}</Alert>
        </ClickAwayListener>
      )}

      {showEventDialog && (
        <FullEvent
          onClose={toggleModal}
          handleSubmitEvent={updatTraineeEvent}
          handleCancel={handleCancel}
          trainees={trainee}
          preSelected={trainee}
          isEditMode={false}
          isTrainee={true}
          traineeDisabled={true}
        />
      )}
      <div className="cardWrapper" style={{height: "100%"}}>
        <CardHeader
        classes={{root: "fixCardPadding",title: "resizeCardTitle" // class name, e.g. `classes-nesting-root-x`
      }}
          avatar={
            <Avatar
              alt={trainee.name}
              src={profilePictureRef}
              className={classes.large}
            />
          }
          action={
            <IconButton aria-label="settings" onClick={deleteTraineeFromList}>
              <Icon style={{ fontSize: "1em" }} className="fas fa-trash-alt" />
            </IconButton>
          }
          title={<p>{trainee.name} &nbsp; <Icon style={trainee.isActive ? {verticalAlign: "middle",color:"#57b53f",fontSize:"1em"} : {verticalAlign: "middle",color: "#b53f3f",fontSize:"1em"}} className="fas fa-circle"> </Icon></p>}
        />
        <CardContent
        classes={{root: "fixCardPadding", // class name, e.g. `classes-nesting-root-x`
      }}
        >
          {/* <Typography noWrap={true} variant="h6" component="h3">
            {item.name || <br />}
          </Typography> */}
          <Typography
         noWrap={true} variant="body2" component="h3"
            color="textSecondary"
          >

          <p style={{marginBlockStart: "0.5em", marginBlockEnd: "0.5em", marginInlineStart: 0, marginInlineEnd: 0}}>
          {t("TRAINEE_HEADER_ID")} {trainee.docId}
          </p>
          <p style={{minHeight: "20px",marginBlockStart: "0.5em", marginBlockEnd: "0.5em", marginInlineStart: 0, marginInlineEnd: 0}}>
          {trainee.phone ? t("TRAINEE_HEADER_PHONE") : " "} {trainee.phone}
          </p>
          <p style={{minHeight: "20px",marginBlockStart: "0.5em", marginBlockEnd: "0.5em", marginInlineStart: 0, marginInlineEnd: 0}}>
          {trainee.email ? t("TRAINEE_HEADER_EMAIL") : " "} {trainee.email}
          </p>
            
          </Typography>

        </CardContent>
        <CardActions style={{ justifyContent: "space-between"}}>
          <Button
            style={{ widht: "100%" }}
            size="small"
            color="primary"
            variant="outlined"
            component={Link}
            to={{
              pathname: `/traineeDetails/${trainee.docId}`,
              traineeFromProps: trainee,
            }}
            onClick={(e) => {
              setDetailedTrainee(trainee);
            }}
          >
          {t("TRAINEE_SHOW_DETAILS")}
          </Button>

          <Button
            onClick={() => {
              setShowEventDialog(!showEventDialog);
            }}
            color="primary"
            variant="outlined"
            style={{ widht: "100%" }}
            size="small"
          >
            {t("TRAINEE_ADD_WORKOUT")}
          </Button>
        </CardActions>
        {/* 
          <div className="overlay">
      <div className="overlay-content">If you want to see more details on</div>
      <h3 className="responsive-title">{item.name}</h3>
      <div className="responsive-date">Click here</div>
  </div> */}
      </div>
    </Card>
  );
}
