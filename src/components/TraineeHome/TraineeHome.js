import { useEffect, useRef, useState } from "react";
import {
  uploadFile,
  addTrainee,
  addTraineeFilesIntial,
  addTraineesProgram,
} from "../../Util/Firebase";
import TraineeCard from "./TraineeCard";
import AddTraineeDialog from "../TraineeForm/AddTraineeDialog";
import InfiniteScroll from "react-infinite-scroller";
import ScrollTop from "./Util/ScrollTop";
import Icon from "@material-ui/core/Icon";
import ControlFitContext from "../Context/ControlFitContext";
import { useContext } from "react";
import {
  CircularProgress,
  Typography,
  useMediaQuery,
  IconButton,
  InputBase,
  Paper,
  Grid,
  Fab,
  Tooltip,
  makeStyles,
} from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { Skeleton } from "@material-ui/lab";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  margin: {
    margin: theme.spacing(1),
  },
  rootSearch: {
    display: "flex",
    alignItems: "center",
  },
  input: {
    marginLeft: theme.spacing(1),
    flex: 1,
  },
}));

export default function TraineeHome(props) {
  const isTabletOrMobile = useMediaQuery("(max-width: 1000px)");
  let limit = isTabletOrMobile ? 4 : 8;
  const { t } = useTranslation();
  const [visibleTrainees, setVisibleTrainees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const [showAddTraineeDialog, setShowAddTraineeDialog] = useState(false);
  const [formHistory, setFormHistory] = useState({});
  const { trainees } = useContext(ControlFitContext);
  const [index, setIndex] = useState(limit);
  const [hasMore, setHasMore] = useState(true);
  const [isSearch, setIsSearch] = useState(false);
  const [isScrollLoad, setIsScrollLoad] = useState(false);
  const [timeLastResult, _setTimeLastResult] = useState();
  const ref = useRef(timeLastResult);

  const setTimeLastResult = (value) => {
    _setTimeLastResult(value);
    ref.current = value;
  };

  const classes = useStyles();
  let loadingSearchTimeout = 0;
  let loadingTime = 1200; //milis

  useEffect(() => {
    let inter = setInterval(() => {
      if (new Date().getTime() - ref.current > loadingTime) {
        setIsLoading(false);
        clearInterval(inter);
      }
    }, 500);
    return () => {
      setVisibleTrainees([]);
      clearInterval(inter);
      clearTimeout(loadingSearchTimeout);
    };
  }, []);

  useEffect(() => {
    setTimeLastResult(new Date().getTime());
    setVisibleTrainees(trainees.slice(0, index));
  }, [trainees]);

  useEffect(() => {
    // console.log(
    //   "CONDITION",
    //   hasMore,
    //   isSearch,
    //   isScrollLoad,
    //   trainees?.length,
    //   visibleTrainees?.length
    // );
    // console.log(
    //   "CONDITION EVAL",
    //   hasMore &&
    //     !isSearch &&
    //     !isScrollLoad &&
    //     trainees?.length > visibleTrainees?.length
    // );
    if (visibleTrainees.length <= trainees.length) {
      setHasMore(true);
    } else {
      setHasMore(false);
    }
  }, [visibleTrainees, trainees]);

  const getNext = () => {
    if (trainees.length <= visibleTrainees.length) {
      setHasMore(false);
      return;
    }
    setHasMore(true);
    setIsScrollLoad(true);

    let nextIndex = index + limit;
    setIndex((prev) => prev + limit);
    loadingSearchTimeout = setTimeout(() => {
      setVisibleTrainees(trainees.slice(0, nextIndex));

      setIsScrollLoad(false);
    }, 500);
  };

  const getTraineeByName = (name) => {
    let filtered = trainees.filter((e) => {
      return e.name.toLowerCase().includes(name.toLowerCase());
    });

    setVisibleTrainees(filtered);

    loadingSearchTimeout = setTimeout(() => {
      setIsLoadingSearch(false);
    }, 250);
  };

  const handleSearchChange = (e) => {
    e.preventDefault();
    setIsSearch(true);
    setIsLoadingSearch(true);
    setSearchValue(e.target.value);
    if (!e.target.value) {
      setVisibleTrainees(trainees.slice(0, limit));

      setIsLoadingSearch(false);
      setIsSearch(false);
      setHasMore(true);
      setIndex(limit);
      return;
    }

    getTraineeByName(e.target.value);
  };
  // const restoreData = () => {
  //   //setTrainee(formHistory);
  // };
  const toggleModal = () => {
    setShowAddTraineeDialog(!showAddTraineeDialog);
  };

  const handleCancel = (e, trainee) => {
    e.preventDefault();
    setFormHistory(trainee);

  };

  const addTraineeV2 = async (addedTrainee) => {
    let id = -1;
    let strippedTrainee = { ...addedTrainee };
    delete strippedTrainee.images;
    delete strippedTrainee.health;
    delete strippedTrainee.program;
    delete strippedTrainee.profilePicture;
    console.warn("starting");
    let addTraineeRes = await addTrainee(strippedTrainee);
    console.warn("S1-GOT TRAINEE ID");
    id = addTraineeRes.id;
    addedTrainee.docId = id;
    try {
    let excautionResult = await Promise.all([
      (async () => {
        console.warn("S1-IMAGES START");
        let imagesUpdated = await Promise.all(
          addedTrainee.images.map(async (e) => {
            let newFile = {
              name:
                id +
                "/images/" +
                e.file.name.split(".")[0] +
                "-" +
                new Date().getTime() +
                "." +
                e.file.name.split(".")[1],
              path: e.file.path,
              type: e.file.type,
            };
            await uploadFile(newFile.name, e.file);
            //console.warn("S1-1-IMAGES", newFile.name);
            return newFile;
          })
        );
        addedTrainee.images = imagesUpdated;
        await addTraineeFilesIntial(id, addedTrainee.images, "images");
        console.warn("S1-IMAGES DONE");
      })(),
      (async() => {
        if (addedTrainee.profilePicture) {
          console.warn("S1-PROFILE START");
          let stripped = {
            name:
              id +
              "/profilePicture/" +
              addedTrainee.profilePicture.name.split(".")[0] +
              "-" +
              new Date().getTime() +
              "." +
              addedTrainee.profilePicture.name.split(".")[1],
            type: addedTrainee.profilePicture.type,
          };
          await uploadFile(stripped.name, addedTrainee.profilePicture);
          await addTraineeFilesIntial(id, stripped, "profilePicture");
          console.warn("S1-PROFILE DONE");
        }
      })(),
      (async() => {
        console.warn("S1-HEALTH START");
        var healthUpdated = await Promise.all(
          addedTrainee.health.map(async (e) => {
            let newFile = {
              name:
                id +
                "/health/" +
                e.file.name.split(".")[0] +
                "-" +
                new Date().getTime() +
                "." +
                e.file.name.split(".")[1],
              path: e.file.path,
              type: e.file.type,
            };
            await uploadFile(newFile.name, e.file);
            return newFile;
          })
        );
        addedTrainee.health = healthUpdated;
        await addTraineeFilesIntial(id, addedTrainee.health, "health");
        console.warn("S1-HEALTH DONE");
      })(),
      (async() => {
        console.warn("S1-PROGRAM START");
        var programUpdated = await Promise.all(
          addedTrainee.program.map(async (e) => {
            let prog = {
              name:
                id +
                "/program/" +
                e.file.name.split(".")[0] +
                "-" +
                new Date().getTime() +
                "." +
                e.file.name.split(".")[1],
              path: e.file.path,
              type: e.file.type,
              html: e.html,
            };
            let progId = await addTraineesProgram(prog, "program");
          //  console.warn("S3-1-program", progId);
            let progRef = { id: progId.id };
            return progRef;
          })
        );
        addedTrainee.program = programUpdated;
        await addTraineeFilesIntial(id, addedTrainee.program, "program");
        console.warn("S1-PROGRAM DONE");
      })(),
    ]);
  } catch (e) {
    console.error("result from ss", e);
    return Promise.reject(new Error(e));
  }

  }

  const addTraineeFB = async (addedTrainee) => {
    try {
      let id = -1;
      //console.warn("starting");
      let strippedTrainee = { ...addedTrainee };
      delete strippedTrainee.images;
      delete strippedTrainee.health;
      delete strippedTrainee.program;
      delete strippedTrainee.profilePicture;
      //console.log("strippedTrainee", strippedTrainee);

      let excautionResult = await Promise.all([
        (async () => {
          let addTraineeRes = await addTrainee(strippedTrainee);
          //console.warn("S1", addTraineeRes.id);
          id = addTraineeRes.id;
          addedTrainee.docId = id;
          var imagesUpdated = await Promise.all(
            addedTrainee.images.map(async (e) => {
              let newFile = {
                name:
                  id +
                  "/images/" +
                  e.file.name.split(".")[0] +
                  "-" +
                  new Date().getTime() +
                  "." +
                  e.file.name.split(".")[1],
                path: e.file.path,
                type: e.file.type,
              };
              await uploadFile(newFile.name, e.file);
              //console.warn("S1-1-IMAGES", newFile.name);
              return newFile;
            })
          );
          addedTrainee.images = imagesUpdated;
      //    console.warn("S1-1-IMAGES-DONE", addedTrainee.images);
          await addTraineeFilesIntial(id, addedTrainee.images, "images");
       //   console.warn("S2");
          if (addedTrainee.profilePicture) {
            let stripped = {
              name:
                id +
                "/profilePicture/" +
                addedTrainee.profilePicture.name.split(".")[0] +
                "-" +
                new Date().getTime() +
                "." +
                addedTrainee.profilePicture.name.split(".")[1],
              type: addedTrainee.profilePicture.type,
            };
            await uploadFile(stripped.name, addedTrainee.profilePicture);
           // console.warn("S2-1-PROFILE", stripped.name);
            await addTraineeFilesIntial(id, stripped, "profilePicture");
        //    console.warn("S2-2-PROFILE-DONE", stripped.name);
          }

          var healthUpdated = await Promise.all(
            addedTrainee.health.map(async (e) => {
              let newFile = {
                name:
                  id +
                  "/health/" +
                  e.file.name.split(".")[0] +
                  "-" +
                  new Date().getTime() +
                  "." +
                  e.file.name.split(".")[1],
                path: e.file.path,
                type: e.file.type,
              };
              await uploadFile(newFile.name, e.file);
           //   console.warn("S2-3-HEALTH-DONE", newFile.name);
              return newFile;
            })
          );
          addedTrainee.health = healthUpdated;
          await addTraineeFilesIntial(id, addedTrainee.health, "health");
      //    console.warn("S3", addedTrainee.health);

          var programUpdated = await Promise.all(
            addedTrainee.program.map(async (e) => {
              let prog = {
                name:
                  id +
                  "/program/" +
                  e.file.name.split(".")[0] +
                  "-" +
                  new Date().getTime() +
                  "." +
                  e.file.name.split(".")[1],
                path: e.file.path,
                type: e.file.type,
                html: e.html,
              };
              let progId = await addTraineesProgram(prog, "program");
            //  console.warn("S3-1-program", progId);
              let progRef = { id: progId.id };
              return progRef;
            })
          );
          addedTrainee.program = programUpdated;
          await addTraineeFilesIntial(id, addedTrainee.program, "program");
        //  console.warn("S4", addedTrainee.program);
       //   console.warn("S5-DONE");
        })(),
        //if i'll want to preform stuff async
        // ,
        // (async() => {
        //   let frontEnd = await fetch(url_for_frontEnd);
        //   let frontEndData = await frontEnd.json();
        // })()
      ]);
    //  console.error("result from ex", excautionResult);
    } catch (e) {
      console.error("result from ss", e);
      return Promise.reject(new Error(e));
    }
  };

  const handleSubmit = (e, trainee) => {
    return addTraineeV2(trainee);
  };

  return (
    <div
      style={{
        height: "100%",
        overflow: "auto",
        width: "100%",
      }}
    >
      <InfiniteScroll
        pageStart={0}
        loadMore={getNext}
        hasMore={
          hasMore &&
          !isSearch &&
          !isScrollLoad &&
          trainees?.length > visibleTrainees?.length
        }
        loader={
          <div className="loader" key={0}>
            {t("TRAINEE_HOME_LOADING")}
          </div>
        }
        initialLoad={false}
        useWindow={false}
      >
        <Grid container style={{ padding: "24px" }}>
          {showAddTraineeDialog && (
            <AddTraineeDialog
              onClose={toggleModal}
              handleSubmit={handleSubmit}
              handleCancel={handleCancel}
              history={formHistory}
            />
          )}

          <div id="back-to-top-anchor" />
          <Grid item xs={12} lg={12} md={12} sm={12} xl={12}>
            <Typography
              variant="h4"
              component="h2"
              gutterBottom
              style={{ fontSize: "2em", marginTop: "0.35em" }}
            >
              {t("TRAINEE_HOME_TITLE")}
            </Typography>
          </Grid>
          <Grid
            item
            xs={9}
            lg={4}
            md={4}
            sm={9}
            xl={4}
            style={{ paddingBottom: 15 }}
          >
            <Paper component="form" className={classes.rootSearch}>
              <InputBase
                style={{ textOverflow: "ellipsis" }}
                autoFocus={true}
                value={searchValue}
                className={classes.input}
                placeholder={t("TRAINEE_SEARCH")}
                onChange={handleSearchChange}
                inputProps={{ "aria-label": "Search Trainee" }}
              />

              <IconButton className={classes.iconButton} aria-label="search">
                {!isLoadingSearch ? (
                  <Icon style={{ fontSize: "1em" }} className="fas fa-search" />
                ) : (
                  <CircularProgress size={24} />
                )}
              </IconButton>
            </Paper>
          </Grid>

          <Grid item xs={3} lg={8} md={8} sm={3} xl={8} align="end">
            <Tooltip title="Add" aria-label="add" placement="bottom">
              <Fab
                style={{ margin: 0 }}
                size="small"
                color="primary"
                aria-label="add"
                className={classes.margin}
                onClick={toggleModal}
              >
                <Icon className="fas fa-plus" />
              </Fab>
            </Tooltip>
          </Grid>
          {isLoading &&
            Array.from(new Array(6)).map((item, index) => (
              <Grid
                item
                key={index}
                xs={12}
                sm={6}
                md={4}
                lg={3}
                xl={3}
                style={{
                  paddingRight: 15,
                  paddingBottom: 15,
                  display: "grid",
                }}
              >
                <Skeleton variant="rect" width={"100%"} height={200} />
              </Grid>
            ))}

          {!isLoading &&
            visibleTrainees &&
            visibleTrainees.length > 0 &&
            visibleTrainees.map((trainee) => {
              return (
                <Grid
                  item
                  key={trainee.docId}
                  xs={12}
                  sm={6}
                  md={4}
                  lg={3}
                  xl={3}
                  style={{
                    paddingRight: 15,
                    paddingBottom: 15,
                    display: "grid",
                  }}
                >
                  <TraineeCard trainee={trainee} />
                </Grid>
              );
            })}

          {visibleTrainees && visibleTrainees.length > limit && (
            <ScrollTop
              style={{ visibility: "visible", transform: "inherit" }}
              {...props}
            >
              <Fab
                color="secondary"
                size="small"
                aria-label="scroll back to top"
              >
                <Icon className="fas fa-arrow-up" />
              </Fab>
            </ScrollTop>
          )}

          {!isLoading && visibleTrainees && visibleTrainees.length === 0 && (
            <Grid
              item
              xs={12}
              lg={12}
              md={12}
              sm={12}
              xl={12}
              style={{ minHeight: "300px" }}
            >
              <h1>{t("TRAINEE_NO_RESULTS")}</h1>
            </Grid>
          )}
        </Grid>
      </InfiniteScroll>
    </div>
  );
}
