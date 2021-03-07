import { Button,Grid } from "@material-ui/core";
import { useEffect, useState } from "react";
import "./css/dropzoneResize.css";
import { useTranslation } from "react-i18next";
import DropzoneCustom from "../../Reuseable/DropzoneCustom";
export default function TraineeFilesUploadSection({
  handleUpload,
  handleCancelDialog,
  handleBack,
  handleNext,
  handleChange,
}) {
  const [imagesFiles, setImagesFiles] = useState([]);
  const [programFiles, setProgramFiles] = useState([]);
  const { t } = useTranslation();

  useEffect(() => {
    handleChange(imagesFiles, "images");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imagesFiles]);

  useEffect(() => {
    handleChange(programFiles, "program");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [programFiles]);

  const handleOnAddImageFile = (newFileObjs) => {
    setImagesFiles([].concat(imagesFiles, newFileObjs));
  };

  const handleOnRemoveImageFile = (deleteFileObj, index) => {
    let filtered = imagesFiles.filter((_, i) => i !== index);
    setImagesFiles(filtered);
  };

  const handleOnAddProgramFile = (newFileObjs) => {
    setProgramFiles([].concat(programFiles, newFileObjs));
  };

  const handleOnRemoveProgramFile = (deleteFileObj, index) => {
    let filtered = programFiles.filter((_, i) => i !== index);
    setProgramFiles(filtered);
  };

  return (
    <Grid container alignItems="flex-end" style={{ height: "100%" }}>
      <Grid item xs={12} lg={6} md={6} sm={12} xl={6}>
        <h3>{t("TRAINEE_UPLOAD_SECTION_IMAGE_TITLE")}</h3>
        <DropzoneCustom
          fileObjects={imagesFiles}
          accepted={["image/*"]}
          limit={10}
          dropzoneText={t("TRAINEE_UPLOAD_SECTION_IMAGE_UPLOAD")}
          handleOnAdd={handleOnAddImageFile}
          handleOnDelete={handleOnRemoveImageFile}
        />
      </Grid>
      <Grid item xs={12} lg={6} md={6} sm={12} xl={6}>
        <h3>{t("TRAINEE_UPLOAD_SECTION_PROGRAM_TITLE")}</h3>
        <DropzoneCustom
          fileObjects={programFiles}
          accepted={[
            ".doc",
            ".docx",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          ]}
          limit={10}
          dropzoneText={t("TRAINEE_UPLOAD_SECTION_PROGRAM_UPLOAD")}
          handleOnAdd={handleOnAddProgramFile}
          handleOnDelete={handleOnRemoveProgramFile}
        />
      </Grid>
      <Grid
        item
        xs={12}
        lg={12}
        md={12}
        sm={12}
        xl={12}
        style={{ display: "flex", justifyContent: "flex-end" }}
      >
        <Button color="secondary" onClick={handleCancelDialog}>
          {t("CANCEL")}
        </Button>
        <Button onClick={handleBack}>{t("CANCEL")}</Button>
        <Button
          color="primary"
          onClick={(e) => {
            handleNext();
          }}
        >
          {t("NEXT")}
        </Button>
      </Grid>
    </Grid>
  );
}
