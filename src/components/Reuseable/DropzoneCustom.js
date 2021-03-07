import { DropzoneAreaBase } from "material-ui-dropzone";
import { useTranslation } from "react-i18next";
//import "./Tab/css/dropzone.css";

export default function DropzoneCustom({
  fileObjects,
  accepted,
  limit,
  dropzoneText,
  handleOnAdd,
  handleOnDelete,
}) {
  const { t } = useTranslation();

  return (
    <DropzoneAreaBase
      getFileAddedMessage={(filename) => {
        return t("DROPZONE_FILE_ADDED", { name: filename });
      }}
      getFileLimitExceedMessage={(filesLimit) => {
        return t("DROPZONE_FILE_LIMIT", { limit: filesLimit });
      }}
      getFileRemovedMessage={(filename) => {
        return t("DROPZONE_FILE_REMOVED", { name: filename });
      }}
      getDropRejectMessage={(rejectedFile, acceptedFiles, maxFileSize) => {
        return t("DROPZONE_FILE_REJECT", { name: rejectedFile.name });
      }}
      maxFileSize={5000000}
      showPreviewsInDropzone={true}
      showFileNamesInPreview={true}
      showFileNames={true}
      fileObjects={fileObjects}
      onAdd={(newFileObjs) => {
        handleOnAdd(newFileObjs);
      }}
      onDelete={(deleteFileObj, index) => {
        handleOnDelete(deleteFileObj, index);
      }}
      acceptedFiles={accepted}
      filesLimit={limit}
      dropzoneClass={"resize"}
      dropzoneText={dropzoneText}
      clearOnUnmount={true}
      //initialFiles={images}
      //handle the history by using intial, clear files once done and acceptable files
      //      onChange={(files) => {handleUpload(fileObjects, "images")}}
    />
  );
}
