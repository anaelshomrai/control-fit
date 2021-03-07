import { Grid,Button, Icon, useMediaQuery } from "@material-ui/core";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import DropzoneCustom from "../../Reuseable/DropzoneCustom";
export default function TraineeHealthUploadSection({
  handleUpload,
  health,
  handleCancelDialog,
  handleBack,
  handleSubmitDialog,
  handleChange
}) {
  const [helathFiles, setHelathFiles] = useState([]);
  const { t } = useTranslation();
  const isTabletOrMobile = useMediaQuery("(max-width: 1224px)");

  useEffect(() => {
    handleChange(helathFiles,"health");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[helathFiles])

  const handleOnAddFile = (newFileObjs) => {
    setHelathFiles([].concat(helathFiles, newFileObjs));

  };

  const handleOnRemoveFile = (deleteFileObj, index) => {
    let filtered = helathFiles.filter((_, i) => i !== index)
    setHelathFiles(filtered);
  };

  return (
    <Grid container alignItems="flex-end" style={{ height: "100%" }}>
      <Grid item xs={12} lg={12} md={12} sm={12} xl={12}>
        <h3>{t("TRAINEE_UPLOAD_SECTION_HEALTH_TITLE")}</h3>
        <DropzoneCustom
                fileObjects={helathFiles}
                accepted={[
            ".pdf,.doc",
            ".docx",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          ]}
                limit={10}
                dropzoneText={t("TRAINEE_UPLOAD_SECTION_HEALTH_UPLOAD")}
                handleOnAdd={handleOnAddFile}
                handleOnDelete={handleOnRemoveFile}
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
        <Button onClick={handleBack}>{t("BACK")}</Button>
        <Button
          endIcon={<Icon style={isTabletOrMobile ? {fontSize: "1.5rem"} : {}}>save</Icon>}
          color="primary"
          onClick={(e) => { 
            handleSubmitDialog(e);
          }}
        >
          {t("SUBMIT")}
        </Button>
      </Grid>
    </Grid>
  );
}
