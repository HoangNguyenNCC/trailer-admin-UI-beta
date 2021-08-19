import React, { useState } from "react";
import {
  Button,
  CssBaseline,
  TextField,
  Typography,
  Container,
  CircularProgress,
} from "@material-ui/core";

import { Alert, AlertTitle } from "@material-ui/lab";

import { makeStyles } from "@material-ui/core/styles";

import { useHistory } from "react-router-dom";

import { handleFetchErrors } from "../../_helpers";
import { common } from "../../_constants/common";

const apiUrl = common.apiUrl;
const signInUrl = `${apiUrl}/admin/employee/signin`;

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: "100%", // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

export default function EmployeeSignIn() {
  const classes = useStyles();

  let history = useHistory();
  // console.log("history", history);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  /* async function handleSubmit(e) {
        e.preventDefault();

        setSubmitted(true);
    
        if (email && password) {
            await props.login(email, password);
            console.log("Logged In", history);
            // history.push("/adminpanel/");
        }
    } */

  function onSignInSubmit(e) {
    e.preventDefault();

    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    };

    // console.log("config", config);
    setLoading(true);
    fetch(signInUrl, requestOptions)
      .then(handleFetchErrors)
      .then((res) => res.json())
      .then((res) => {
        console.log(res);
        // store user details and jwt token in local storage to keep user logged in between page refreshes
        localStorage.setItem("user", JSON.stringify(res.employeeObj));
        localStorage.setItem("token", JSON.stringify(res.token));
        localStorage.setItem(
          "expiry",
          new Date().getTime() + 8 * 60 * 60 * 1000
        );

        localStorage.setItem(
          "aclSettingsAdmin",
          JSON.stringify(res.aclSettingsAdmin)
        );

        setErrorMessage("");
        setSuccessMessage("Successfully Signed in");
        history.push("/adminpanel/");
        setLoading(false);
      })
      .catch((error) => {
        console.log("SignIn Error", error);
        setLoading(false);
        setErrorMessage("Invalid Credentials");
        setSuccessMessage("");
      });
  }

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />

      <div className={classes.paper}>
        {/* <Avatar className={classes.avatar}>
                    <LockOutlinedIcon />
                </Avatar> */}

        <Typography component="h1" variant="h5">
          Sign In
        </Typography>

        {successMessage !== "" && (
          <Alert severity="success">
            <AlertTitle>Success</AlertTitle>
            {successMessage}
          </Alert>
        )}

        {errorMessage !== "" && (
          <Alert severity="error">
            <AlertTitle>Error</AlertTitle>
            {errorMessage}
          </Alert>
        )}

        <form className={classes.form} noValidate>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
            }}
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
            }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
            onClick={onSignInSubmit}
          >
            Sign In
            {loading && (
              <CircularProgress
                color="secondary"
                size="1.3em"
                style={{ marginLeft: "1em" }}
              />
            )}
          </Button>
        </form>
      </div>
    </Container>
  );
}
