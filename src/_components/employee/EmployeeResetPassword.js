/* eslint-disable no-useless-escape */
import React, { useState } from "react";
import { useLocation } from "react-router-dom";

import {
  Button,
  CssBaseline,
  TextField,
  Typography,
  Container,
} from "@material-ui/core";

import { Alert, AlertTitle } from "@material-ui/lab";

import { makeStyles } from "@material-ui/core/styles";

import { authHeader, handleFetchErrors } from "../../_helpers";
import { common } from "../../_constants/common";

import "../../App.css";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
  },
  paper: {
    width: "100%",
    marginBottom: theme.spacing(2),
  },
  table: {
    minWidth: 750,
  },
  visuallyHidden: {
    border: 0,
    clip: "rect(0 0 0 0)",
    height: 1,
    margin: -1,
    overflow: "hidden",
    padding: 0,
    position: "absolute",
    top: 20,
    width: 1,
  },
}));

const strongRegex = new RegExp(
  "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})"
);

const apiUrl = common.apiUrl;
const employeeResetPasswordUrl = `${apiUrl}/admin/employee/resetpassword`;

export default function EmployeeInviteAccept(props) {
  console.log("EmployeeInviteAccept", props);

  const classes = useStyles();

  const query = new URLSearchParams(useLocation().search);
  const token = query.get("token");
  // console.log("Params", token);

  const [password, setPassword] = useState("");
  const [repassword, setRePassword] = useState("");
  // const [submitted, setSubmitted] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [formValidError, setFormValidError] = useState({
    password: false,
    repassword: false,
  });

  const [formValidErrorMessage, setFormValidErrorMessage] = useState({
    password: "",
    repassword: "",
  });

  function validatePasswords(password, repassword) {
    const messagePasswordMatch = "Passwords don't match";
    const messagePasswordInvalidFormat =
      "Password should be 8 or more characters long. Password should contain one Uppercase Alphabetical Character, one Lowercase Alphabetical Character, one Numeric Character and one Special Character.";

    const doPasswordsMatch = password === repassword;
    const isPasswordsValid = strongRegex.test(password);
    const isRePasswordValid = strongRegex.test(repassword);

    // console.log("doPasswordsMatch", doPasswordsMatch, "isPasswordsValid", isPasswordsValid, "isRePasswordValid", isRePasswordValid);

    let errorPassword = "";
    if (!doPasswordsMatch) {
      errorPassword += `${messagePasswordMatch} `;
    }
    if (!isPasswordsValid) {
      errorPassword += `${messagePasswordInvalidFormat} `;
    }

    let copyFormValidError = {
      ...formValidError,
    };
    let copyFormValidErrorMessage = {
      ...formValidErrorMessage,
    };

    if (doPasswordsMatch && isPasswordsValid) {
      copyFormValidError = {
        ...copyFormValidError,
        password: false,
      };
      setFormValidError(copyFormValidError);

      copyFormValidErrorMessage = {
        ...copyFormValidErrorMessage,
        password: "",
      };
      setFormValidErrorMessage(copyFormValidErrorMessage);
    } else {
      copyFormValidError = {
        ...copyFormValidError,
        password: true,
      };
      setFormValidError(copyFormValidError);

      copyFormValidErrorMessage = {
        ...copyFormValidErrorMessage,
        password: errorPassword,
      };
      setFormValidErrorMessage(copyFormValidErrorMessage);
    }

    let errorRePassword = "";
    if (!doPasswordsMatch) {
      errorRePassword += `${messagePasswordMatch} `;
    }
    if (!isRePasswordValid) {
      errorRePassword += `${messagePasswordInvalidFormat} `;
    }

    if (doPasswordsMatch && isPasswordsValid) {
      copyFormValidError = {
        ...copyFormValidError,
        repassword: false,
      };
      setFormValidError(copyFormValidError);

      copyFormValidErrorMessage = {
        ...copyFormValidErrorMessage,
        repassword: "",
      };
      setFormValidErrorMessage(copyFormValidErrorMessage);
    } else {
      copyFormValidError = {
        ...copyFormValidError,
        repassword: true,
      };
      setFormValidError(copyFormValidError);

      copyFormValidErrorMessage = {
        ...copyFormValidErrorMessage,
        repassword: errorRePassword,
      };
      setFormValidErrorMessage(copyFormValidErrorMessage);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const isError = formValidError.password;

    if (isError) {
      return false;
    }

    const requestOptions = {
      method: "PUT",
      headers: {
        ...authHeader(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token: token,
        password: password,
      }),
    };
    console.log("requestOptions", requestOptions);

    fetch(employeeResetPasswordUrl, requestOptions)
      .then(handleFetchErrors)
      .then((res) => res.json())
      .then((res) => {
        console.log(`${employeeResetPasswordUrl} Response`, res);

        setErrorMessage("");
        setSuccessMessage("Successfully saved Password");

        setPassword("");
        setRePassword("");

        setTimeout(() => {
          setSuccessMessage("");
        }, 5000);
      })
      .catch((error) => {
        console.log(`${employeeResetPasswordUrl} Error`, error);
        setErrorMessage(
          typeof error.message === "string" ? error.message : "Error"
        );
      });
  }

  return (
    <Container component="main" maxWidth="sm">
      <CssBaseline />

      <div className={classes.paper}>
        <Typography component="h1" variant="h5">
          Reset Password
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
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            error={formValidError.password}
            helperText={formValidErrorMessage.password}
            onChange={(e) => {
              setPassword(e.target.value);
              validatePasswords(e.target.value, repassword);
            }}
          />

          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="repassword"
            label="Confirm Password"
            type="password"
            id="repassword"
            autoComplete="confirm-password"
            error={formValidError.repassword}
            helperText={formValidErrorMessage.repassword}
            value={repassword}
            onChange={(e) => {
              setRePassword(e.target.value);
              validatePasswords(password, e.target.value);
            }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
            onClick={handleSubmit}
          >
            Save Password
          </Button>
        </form>
      </div>
    </Container>
  );
}
