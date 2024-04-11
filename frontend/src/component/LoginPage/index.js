import React, { useState } from 'react';
import { TextField, Button, Container, Typography, Box } from '@mui/material';
import { styled } from '@mui/system';

const LoginPageContainer = styled(Container)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 80vh;
`;

const OuterBox = styled(Box)`
  width: 80%; /* Adjust the width as needed */
  max-width: 400px; /* Set maximum width for responsiveness */
  padding: 20px;
  border-radius: 10px;
  background-color: #ffffff;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
`;

const InnerBox = styled(Box)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 10px;
  border-radius: 5px;
  background-color: #ffffff;
`;

const LoginPage = ({ authenticate }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginFailed, setLoginFailed] = useState(false);

  const handleLogin = () => {
    if (username === 'admin' && password === 'admin') {
      authenticate();
    } else {
      setLoginFailed(true);
    }
  };

  return (
    <LoginPageContainer>
      <OuterBox>
        <Typography variant="h4" align="center" gutterBottom>
          Login
        </Typography>
        <InnerBox>
          <TextField
            fullWidth
            size="small"
            label="Username"
            variant="outlined"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <TextField
            fullWidth
            size="small"
            label="Password"
            type="password"
            variant="outlined"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {loginFailed && (
            <Typography variant="body2" color="error">
              Incorrect username or password. Please try again.
            </Typography>
          )}
          <Button variant="contained" color="primary" onClick={handleLogin}>
            Login
          </Button>
        </InnerBox>
      </OuterBox>
    </LoginPageContainer>
  );
};

export default LoginPage;
