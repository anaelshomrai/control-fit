import Typography from "@material-ui/core/Typography";
import { useTranslation } from "react-i18next";
export default function FitFooter() {
    const { t } = useTranslation();

    return (

     <div style={{height: "50px"}}> 
      <Typography variant="subtitle2"> {t("CONTROL_FIT_COPYRIGHT")}</Typography>
      </div>
    );
}