import "./App.css";
import { ProvideAuth } from "./components/Auth/ProvideAuth";
import FitRouter from "./components/Navigation/FitRouter";
import FitMenu from "./components/Navigation/FitMenu";
import FitFooter from "./components/Navigation/FitFooter";
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import MomentUtils from '@date-io/moment';
import ControlFitContextHanlder from "./components/Context/ControlFitContextHandler";
import { Grid, CssBaseline,useTheme } from "@material-ui/core";
import withRoot from "./Util/withRoot";
import i18n from "./i18n/i18n";
import moment from "moment";
import 'moment/locale/he';


/*
  	Flaticon icon font: Flaticon
    Creation date: 02/09/2018 12:17
    <div>Icons made by <a href="https://www.freepik.com" title="Freepik">Freepik</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a></div>
*/

function App() {
  const theme = useTheme();

  document.body.dir = i18n.dir();
  theme.direction = i18n.dir();
  theme.chosenLang = i18n.language;
  moment.locale(i18n.language);
  const changeLanguage = (lang) => { 
    i18n.changeLanguage(lang)
    document.body.dir = i18n.dir();
    theme.direction = i18n.dir();
    theme.chosenLang=lang;
    moment.locale(lang);
  }
  return (
    <div className="App" style={{}}>
      <ProvideAuth>
      <ControlFitContextHanlder>
        <CssBaseline />

        <Grid container style={{ height: 'calc(100vh - 50px)', justifyContent: "center", overflow: "auto"}}>
        <MuiPickersUtilsProvider utils={MomentUtils}>
        {/* Has height of 10% */}
        <FitMenu changeLanguage={changeLanguage}/> 
                {/* Has height of 90% */}
          <FitRouter/>
          </MuiPickersUtilsProvider>
        </Grid>
        <FitFooter/>
        </ControlFitContextHanlder>
      </ProvideAuth>
    </div>
  );
}

export default withRoot(App);