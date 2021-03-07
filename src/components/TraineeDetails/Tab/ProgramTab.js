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
import "./css/image.css";
import "./css/docHelper.css";
import DocViewer from "./Util/DocViewer";
import ProgramDialog from "../../../Util/ProgramDialog";
import { Alert } from "@material-ui/lab";
import { useTranslation } from "react-i18next";
import "./css/dropzone.css";
import DropzoneCustom from "../../Reuseable/DropzoneCustom";
import DragAndDropModule from 'quill-drag-and-drop-module';

export default function ProgramTab({
  trainee,
  id,
  handleDeleteProgram,
  handleProgramAdded,
  handleProgramUpdate,
}) {
  const { t } = useTranslation();
  const isTabletOrMobile = useMediaQuery("(max-width: 1224px)");
  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const saveProgram = (newHtml, index) => {
    setIsLoading(true);
    // let updated = trainee.program.map((el, i) => {
    //   if (i === index) {
    //     el.html = newHtml;
    //   }
    //   return el;
    // });
    let filtered = trainee.program.filter((el, i) => {
      return i !== index;
    });
    handleProgramUpdate(filtered, trainee.program[index].id, newHtml)
      .then((res) => {
        setIsLoading(false);
        setIsError(false);
      })
      .catch((e) => {
        setIsError(t("TRAINEE_PROGRAM_TAB_UPDATE_ERROR"));
        setIsLoading(false);
        console.error("error", e);
      });
  };

  const deleteProgram = (e, index) => {
    setIsLoading(true);
    let filtered = trainee.program.filter((el, i) => {
      return i !== index;
    });
    handleDeleteProgram(filtered, trainee.program[index].id)
      .then((res) => {
        setIsLoading(false);
        setIsError(false);
      })
      .catch((e) => {
        setIsError(t("TRAINEE_PROGRAM_TAB_DELETE_ERROR"));
        setIsLoading(false);
        console.error("error", e);
      });
  };

  const downloadProgram = async (e, index, program) => {
    //const res = await HTMLtoDOCX(program.html);
    var HtmlHead =
      "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Export HTML To Doc</title></head><body>";
    var EndHtml = "</body></html>";

    //complete html
    var html = HtmlHead + program.html + EndHtml;

    //specify the type
    var blob = new Blob(["\ufeff", html], {
      type: program.type,
    });

    // Specify link url
    var url =
      "data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;charset=utf-8," +
      encodeURIComponent(html);

    // Specify file name
    let filename =
      program?.name?.replace(id + "/program/", "").split("-")[0] + ".doc";
    // Create download link element
    var downloadLink = document.createElement("a");

    document.body.appendChild(downloadLink);

    if (navigator.msSaveOrOpenBlob) {
      navigator.msSaveOrOpenBlob(blob, filename);
    } else {
      // Create a link to the file
      downloadLink.href = url;

      // Setting the file name
      downloadLink.download = filename;

      //triggering the function
      downloadLink.click();
    }

    document.body.removeChild(downloadLink);

    // var csvURL = window.URL.createObjectURL(res);
    // var tempLink = document.createElement('a');
    // tempLink.href = csvURL;
    // tempLink.setAttribute('download', 'blah.docx');
    // tempLink.click();
  };
  const useStyles = makeStyles((theme) => ({
    closeButton: {
      position: "absolute",
      right: theme.spacing(1),
      top: theme.spacing(1),
      color: theme.palette.grey[500],
    },
  }));
  const classes = useStyles();

  const [open, setOpen] = useState(false);

  const toggleDialog = () => {
    setOpen(!open);
  };

  const handleSubmit = (e) => {
    setIsLoading(true);
    e.preventDefault();
    setIsSaving(true);
    handleProgramAdded(programFiles, "program")
      .then((res) => {
        setIsSaving(false);
        setShowModal(!showModal);
        setProgramFiles([]);
        setIsLoading(false);
      })
      .catch((e) => {
        console.error("error", e);
        setIsError(t("TRAINEE_PROGRAM_TAB_ADD_ERROR"));
        setIsLoading(false);
        setIsSaving(false);
        setShowModal(!showModal);
        setProgramFiles([]);
      });
  };

  const [programFiles, setProgramFiles] = useState([]);

  useEffect(() => {
    setIsLoading(false);
  }, [trainee]);


  const handleOnAddFile = (newFileObjs) => {
    setProgramFiles([].concat(programFiles, newFileObjs));
  };

  const handleOnRemoveFile = (deleteFileObj, index) => {
    let filtered = programFiles.filter((_, i) => i !== index);
    setProgramFiles(filtered);
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
        style={{ textAlign: "end", paddingInlineEnd: "15px" }}
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
                {t("TRAINEE_PROGRAM_UPLOAD_TITLE")}
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
                fileObjects={programFiles}
                accepted={[
                    ".doc",
                    ".docx",
                    "application/msword",
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                  ]}
                limit={10}
                dropzoneText={t("TRAINEE_PROGRAM_UPLOAD_HEALTH")}
                handleOnAdd={handleOnAddFile}
                handleOnDelete={handleOnRemoveFile}
              />
              )}
            </Grid>
            <Grid item xs={12} lg={12} md={12} sm={12} xl={12} align="start" style={{alignSelf:"start",width:"100%"}}>
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
          {t("TRAINEE_PROGRAM_TITLE")}
        </Typography>
      </Grid>

      {!isLoading &&
        trainee &&
        trainee.program?.length > 0 &&
        trainee.program.map((program, index) => {
          return (
            <Grid
              item
              key={program.id}
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
                    <IconButton aria-label="settings" onClick={toggleDialog}>
                      <i style={{ fontSize: "1em" }} className="far fa-eye"></i>
                    </IconButton>
                    <IconButton
                      aria-label="settings"
                      onClick={(e) => {
                        downloadProgram(e, index, program);
                      }}
                    >
                      <i style={{ fontSize: "1em" }} className="fas fa-cloud-download-alt fa-1x" />
                    </IconButton>
                    <IconButton
                      aria-label="settings"
                      onClick={(e) => {
                        deleteProgram(e, index);
                      }}
                    >
                      <Icon style={{ fontSize: "1em" }} className="fas fa-trash-alt fa-1x" />
                    </IconButton>
                  </div>
                  <p style={{ marginTop: "0" }}>
                    {program?.name?.replace(id + "/program/", "").split("-")[0]}
                  </p>

                  <DocViewer html={program.html} />
                </CardContent>
              </Card>
              {open && (
                <ProgramDialog
                  index={index}
                  title={
                    program?.name?.replace(id + "/program/", "").split("-")[0]
                  }
                  open={open}
                  close={toggleDialog}
                  html={program.html}
                  saveProgram={saveProgram}
                />
              )}
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
      {!isLoading && trainee.program.length === 0 && (
        
        <h3>{t("TRAINEE_PROGRAM_UNAVAILABLE")}</h3>
      )}
    </Grid>
  );
}
