import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { ThemeProvider, THEME_ID, createTheme } from '@mui/material/styles';
import June from './JuneComponent/June';
import {GlobalStatusContextProvider} from './GlobalStatusContext';


const materialTheme = createTheme({
  palette: {
    mode: 'dark',
    error: { main: '#e12b38' },
    warning: { main: '#fcc133' },
    info: { main: '#3778c2' },
    primary: { main: '#32064A' },
    secondary: { main: '#292930' }
  }
});

function MainApp() {
  return (
    <ThemeProvider theme={{ [THEME_ID]: materialTheme }} >
      <GlobalStatusContextProvider>
        <June/>
      </GlobalStatusContextProvider>
    </ThemeProvider>
  );
}

ReactDOM.render(
  <React.StrictMode>
    <MainApp />
  </React.StrictMode>,
  document.getElementById('root')
);

