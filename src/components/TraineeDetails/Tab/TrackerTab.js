import { Grid, useMediaQuery, useTheme } from "@material-ui/core";
import { useEffect, useState } from "react";
import MaterialTable from "material-table";
import { useTranslation } from "react-i18next";
import "./css/tracker.css";

export default function TrackerTab({
  id,
  trainee,
  handleTrackerAdd,
  handleTrackerUpdate,
}) {
  const { t } = useTranslation();
  const isTabletOrMobile = useMediaQuery("(max-width: 1000px)");
  const [columns, setColumns] = useState([
    { title: t("TRAINEE_TRACKER_TAB_DATE"), field: "date", type: "numeric" },
    {
      title: t("TRAINEE_TRACKER_TAB_WEIGHT"),
      field: "weight",
      type: "numeric",
    },
    {
      title: t("TRAINEE_TRACKER_TAB_NOTE"),
      field: "note",
    },
  ]);
  const theme = useTheme();
 // const [direction,setDirection] = useState(theme.direction);

  useEffect(() => {
    //setDirection(theme.direction);
    setColumns([
      { title: t("TRAINEE_TRACKER_TAB_DATE"), field: "date", type: "numeric" },
      {
        title: t("TRAINEE_TRACKER_TAB_WEIGHT"),
        field: "weight",
        type: "numeric",
      },
      {
        title: t("TRAINEE_TRACKER_TAB_NOTE"),
        field: "note",
      },
    ])
  },[theme.direction,theme.chosenLang,t])

  return (
    <Grid
      className="app"
      container
      justify="center"
      style={{
        height: "100%",
        width: "inherit",
        margin: "15px 0",
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
        style={{ height: "100%" }}
      >
        <MaterialTable
          className={"fullheight"}
          title={isTabletOrMobile ? "" : t("TRAINEE_TRACKER_TAB_TITLE")}
          options={{
            headerStyle: {
              textAlign: "start",
            },
            cellStyle: {
              textAlign: "start",
            },
          }}
          columns={columns}
          data={trainee?.tracker}
          localization={{
            toolbar: {
              searchTooltip: t("TRACKER_SEARCH_TOOLTIP"),
              searchPlaceholder: t("TRACKER_SEARCH_PLACEHOLDER"),
            },
            body: {
              emptyDataSourceMessage: t("TRACKER_NO_RESULT"),
              addTooltip: t("TRACKER_ADD"),
              deleteTooltip: t("TRACKER_DELETE"),
              editTooltip: t("TRACKER_EDIT"),
              editRow: {
                cancelTooltip: t("TRACKER_CANCEL"),
                saveTooltip: t("TRACKER_SAVE"),
                deleteText: t("TRACKER_DELETE_TEXT"),
              }

            },
            header: {
              actions: t("TRACKER_ACTIONS"),
            },
            pagination: {
              labelRowsSelect: t("TRACKER_ROWS"),
            }
          }}
          editable={{
            onRowAdd: (newData) => {
              return handleTrackerAdd(newData);
            },
            onRowUpdate: (newData, oldData) => {
              const dataUpdate = [...trainee?.tracker];
              const index = oldData.tableData.id;
              dataUpdate[index] = newData;
              return handleTrackerUpdate([...dataUpdate]);
            },
            onRowDelete: (oldData) => {
              const dataDelete = [...trainee.tracker];
              const index = oldData.tableData.id;
              dataDelete.splice(index, 1);
              return handleTrackerUpdate([...dataDelete]);
            },
          }}
        />
        
      </Grid>
    </Grid>
  );
}
