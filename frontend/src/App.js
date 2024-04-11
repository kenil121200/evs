import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { styled } from '@mui/system';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import './App.css';
import Home from "./component/HomePage/index";
import Administrator from "./component/AdminPage";
import LoginPage from "./component/LoginPage";

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    alignItems: 'center',
  },
}));

const StyledLink = styled(Link)(({ theme }) => ({
  color: 'white',
  textDecoration: 'none',
  '&:hover': {
    textDecoration: 'none',
  },
}));

function App() {
  const [loggedIn, setLoggedIn] = useState(false);

  const authenticate = () => {
    setLoggedIn(true);
  };

  const logout = () => {
    setLoggedIn(false);
    window.location.href = "/";
  };

  return (
    <Router>
      <div>
        <AppBar position="static">
          <StyledToolbar>
            <Typography variant="h6" component="div">
              Employee Verification System (EVS)
            </Typography>
            <div>
              <Button color="inherit"><StyledLink to="/">Home</StyledLink></Button>
              {loggedIn ? (
                <>
                  <Button color="inherit"><StyledLink to="/administrator">Administrator</StyledLink></Button>
                  <Button color="inherit" onClick={logout}>Logout</Button>
                </>
              ) : (
                <Button color="inherit"><StyledLink to="/login">Login</StyledLink></Button>
              )}
            </div>
          </StyledToolbar>
        </AppBar>
        <Routes>
          <Route exact path="/" element={<Home />} />
          <Route path="/login" element={loggedIn ? <Navigate to="/administrator" /> : <LoginPage authenticate={authenticate} />} />
          <Route path="/administrator" element={loggedIn ? <Administrator /> : <Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
