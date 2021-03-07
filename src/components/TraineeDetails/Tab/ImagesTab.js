import {
  Button,
  Card,
  CardActionArea,
  CardActions,
  CardMedia,
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
import { Alert } from "@material-ui/lab";
import { useEffect, useState } from "react";
import Carousel from "react-material-ui-carousel";
import { storageRef } from "../../../Util/Firebase";
import "./css/image.css";
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

export default function ImagesTab({
  id,
  trainee,
  handleDeleteImage,
  handleImgAdded,
}) {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const isTabletOrMobile = useMediaQuery("(max-width: 1224px)");
  const [traineeWithRef, setTraineeWithRef] = useState(trainee);
  const [isSaving, setIsSaving] = useState(false);
  const classes = useStyles();
  const [showModal, setShowModal] = useState(false);
  const [imagesFiles, setImagesFiles] = useState([]);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    imgHandle(trainee);
  }, [trainee]);

  const imgHandle = async (train) => {
    let refs = [];
    for (let i = 0; i < train?.images?.length; i++) {
      const res = await getImageRef(train.images[i].name);
      refs.push(res);
    }

    setTraineeWithRef((prevState) => ({
      ...train,
      imagesRef: refs,
    }));

    setIsLoading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSaving(true);
    handleImgAdded(imagesFiles, "images")
      .then((res) => {
        setIsSaving(false);
        setShowModal(!showModal);
        setImagesFiles([]);
        setIsError(false);
      })
      .catch((e) => {
        setIsSaving(false);
        setShowModal(!showModal);
        setImagesFiles([]);
        setIsError(t("TRAINEE_IMAGE_TAB_ADD_ERROR"));
      });
  };

  useEffect(() => {

    if (
      traineeWithRef?.imagesRef?.length > 0 &&
      traineeWithRef?.imagesRef?.length === traineeWithRef?.images?.length
    ) {
      cacheImages(traineeWithRef.imagesRef);
    }
  }, [traineeWithRef]);

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
  };

  const getImageRef = async (filename) => {
    var imagesRef = await storageRef.child(filename).getDownloadURL();
    return imagesRef;
  };

  const deleteImg = (e, index) => {
    //delete from storage
    //delete from array
    setIsLoading(true);
    let filtered = trainee.images.filter((el, i) => {
      return i !== index;
    });
    handleDeleteImage(filtered, trainee.images[index].name)
      .then((res) => {
        setIsLoading(false);
        setIsError(false);
      })
      .catch((e) => {
        setIsLoading(false);
        setIsError(t("TRAINEE_IMAGE_TAB_DELETE_ERROR"));
      });
  };

  const handleOnAddFile = (newFileObjs) => {
    setImagesFiles([].concat(imagesFiles, newFileObjs));
  };

  const handleOnRemoveFile = (deleteFileObj, index) => {
    let filtered = imagesFiles.filter((_, i) => i !== index);
    setImagesFiles(filtered);
  };

  return (
    <Grid
      container
      justify="center"
      style={{
        height: "100%",
        width: "inherit",
        margin: "15px 0",
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
      <Grid
        item
        xs={12}
        lg={12}
        md={12}
        sm={12}
        xl={12}
        style={{
          textAlign: "end",
          paddingBottom: "8px",
          paddingInlineEnd: "15px",
        }}
      >
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
            <Grid item xs={12} lg={12} md={12} sm={12} xl={12}>
              <h3 style={{ textAlign: "center" }}>
                {t("TRAINEE_IMAGE_UPLOAD_TITLE")}
              </h3>
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
                  fileObjects={imagesFiles}
                  accepted={["image/*"]}
                  limit={10}
                  dropzoneText={t("TRAINEE_IMAGE_UPLOAD_HEALTH")}
                  handleOnAdd={handleOnAddFile}
                  handleOnDelete={handleOnRemoveFile}
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
          {t("TRAINEE_IMAGE_TITLE")}
        </Typography>
      </Grid>

      <Grid item xs={12} lg={12} md={12} sm={12} xl={12}>
        {traineeWithRef?.imagesRef &&
          traineeWithRef?.imagesRef?.length > 0 &&
          !isLoading && (
            <Carousel
              className="SecondExample"
              autoPlay={false}
              animation={"slide"}
              indicators={true}
              timeout={500}
              swipe
              navButtonsAlwaysVisible={true}
              fullHeightHover
            >
              {traineeWithRef.imagesRef.map((item, index) => {
                return (
                  <ImageCard
                    item={item}
                    key={index}
                    index={index}
                    deleteImg={deleteImg}
                  />
                );
              })}
            </Carousel>
          )}
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
        {!isLoading && traineeWithRef?.imagesRef?.length === 0 && (
          <h3>{t("TRAINEE_IMAGES_UNAVAILABLE")}</h3>
        )}
      </Grid>
    </Grid>
  );
}

const styles = {
  card: {
    //   height: "100%",
  },
  //   media: {
  //     width: "80%",
  //     maxWidth: "650px",
  //     minWidth: "500px",
  //     maxHeight: "300px",
  //     MinHeight: "250px",
  //   },
  media: {
    width: "calc(70vw)",
    height: "calc(50vh)",
    //paddingTop: "40px",
  },
};
function ImageCard({ item, index, deleteImg }) {
  const { t } = useTranslation();
  const fullScreen = () => {
    let elem = document.getElementById("imgme");
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

  return (
    <Card style={styles.card}>
      <CardActionArea>
        <CardMedia
          id="imgme"
          classes={{
            img: "imgFit", // class name, e.g. `classes-nesting-root-x`
          }}
          style={styles.media}
          component="img"
          alt="Contemplative Reptile"
          height="50%"
          // image={item.img}
          src={item}
          title="Contemplative Reptile"
        />
        {/*   <CardContent>
         <Typography gutterBottom variant="h5" component="h2">
            {item.name}
          </Typography>
        </CardContent> */}
      </CardActionArea>
      <CardActions style={{ justifyContent: "space-around" }}>
        <Button
          size="medium"
          color="secondary"
          onClick={(e) => deleteImg(e, index)}
        >
          <Icon>delete</Icon>
          {t("DELETE")}
        </Button>
        <Button size="medium" color="primary" onClick={fullScreen}>
          <Icon>fullscreen</Icon>
          {t("FULL_SCREEN")}
        </Button>
      </CardActions>
    </Card>
  );
}
