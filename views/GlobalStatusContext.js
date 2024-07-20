import React, {createContext, useContext, useEffect, useState} from 'react';
import {Alert, Snackbar} from '@mui/material';

const GlobalStatusContext = createContext({});

export const GlobalStatusContextProvider = ({ children }) => {
  const {snackbarObject, clearSnackbar, ...contextObject} = useGlobalStatusService()
  const [openSnackBar, setOpenSnackBar] = useState(false);


  useEffect(() => {
    if(snackbarObject?.type && snackbarObject?.message){
      setOpenSnackBar(true);
    }
  }, [snackbarObject])

  const handleCloseSnackBar = (event, reason) => {
    if (reason === 'clickaway') return;
    setOpenSnackBar(false);
    clearSnackbar();
  };

  return (
    <GlobalStatusContext.Provider value={contextObject}>
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        open={openSnackBar}
        autoHideDuration={3000}
        onClose={handleCloseSnackBar}
      >
        <Alert
          onClose={handleCloseSnackBar}
          severity={snackbarObject?.type}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbarObject?.message}
        </Alert>
      </Snackbar>
      {children}
    </GlobalStatusContext.Provider>
  );
};
const useGlobalStatusService = () => {
  const [snackbarObject, setSnackbarObject] = useState({});

  const showSnackbar = (type, message) => setSnackbarObject({type, message});
  const clearSnackbar = () => setSnackbarObject({});

  return {snackbarObject, clearSnackbar, showSnackbar};
}

export const useGlobalStatus = () => useContext(GlobalStatusContext);