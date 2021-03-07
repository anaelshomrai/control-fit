import React from 'react';
import { create } from 'jss';
import rtl from 'jss-rtl';

import {
  MuiThemeProvider,
  StylesProvider,
  createMuiTheme,
  jssPreset,
} from '@material-ui/core/styles';
import i18n from "../i18n/i18n";

const jss = create({ plugins: [...jssPreset().plugins, rtl()] });

const theme = createMuiTheme({
  direction: i18n.dir(),
  typography: {
    // fontFamily: [
    //   'Arial',
    //   'Roboto',
    //   '"Helvetica Neue"c', //Helvetica
    //   'Arial',
    //   'sans-serif',
    //   '"Segoe UI Emoji"',
    //   '"Segoe UI Symbol"',
    // ].join(','),
  },
});


function withRoot(Component) {
  function WithRoot(props) {
    // JssProvider allows customizing the JSS styling solution.
    return (
      <StylesProvider jss={jss}>

        <MuiThemeProvider theme={theme}>
          <Component {...props} />
        </MuiThemeProvider>
      </StylesProvider>
    );
  }

  return WithRoot;
}

export default withRoot;