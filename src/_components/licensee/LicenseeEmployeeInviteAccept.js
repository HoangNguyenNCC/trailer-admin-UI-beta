/* eslint-disable no-useless-escape */
import React, { useState } from "react";
import {
  useLocation,
  useHistory,
  // useParams
} from "react-router-dom";

import {
  Button,
  CssBaseline,
  TextField,
  Typography,
  Container,
  InputAdornment,
} from "@material-ui/core";

import { Alert, AlertTitle } from "@material-ui/lab";

import { makeStyles } from "@material-ui/core/styles";

import { authHeader, handleFetchErrors } from "../../_helpers";
import { common } from "../../_constants/common";

import "../../App.css";

const apiUrl = common.apiUrl;
const saveEmployee = `${apiUrl}/licensee/employee/invite/accept`;

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

export default function EmployeeInviteAccept(props) {
  console.log("EmployeeInviteAccept", props);

  const classes = useStyles();

  const query = new URLSearchParams(useLocation().search);
  const token = query.get("token");
  // console.log("Params", token);

  let history = useHistory();
  // console.log("history", history);

  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [repassword, setRePassword] = useState("");
  const [name, setName] = useState("");
  // const [submitted, setSubmitted] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [formValidError, setFormValidError] = useState({
    mobile: false,
    name: false,
    password: false,
    repassword: false,
  });

  const [formValidErrorMessage, setFormValidErrorMessage] = useState({
    mobile: "",
    name: "",
    password: "",
    repassword: "",
  });

  function validateMobile() {}

  function validateName() {}

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

    const isError =
      formValidError.mobile || formValidError.name || formValidError.password;

    if (isError) {
      return false;
    }

    const requestOptions = {
      method: "POST",
      headers: {
        ...authHeader(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token: token,
        mobile: mobile.replace("+61", ""),
        password: password,
        name: name,
      }),
    };
    console.log("requestOptions", requestOptions);

    fetch(saveEmployee, requestOptions)
      .then(handleFetchErrors)
      .then((res) => res.json())
      .then((res) => {
        console.log(`${saveEmployee} Response`, res);

        setErrorMessage("");
        setSuccessMessage("Successfully saved Employee data");

        setMobile("");
        setName("");
        setPassword("");
        setRePassword("");

        setTimeout(() => {
          setSuccessMessage("");
          history.push("/adminpanel/");
        }, 5000);
      })
      .catch((error) => {
        console.log(`${saveEmployee} Error`, error);
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
          Accept Employee Invite
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
            id="mobile"
            label="Mobile"
            name="mobile"
            autoComplete="mobile"
            autoFocus
            error={formValidError.mobile}
            helperText={
              "Remove / don't add country code in text (Country code is automatically attached"
            }
            value={mobile}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">+61</InputAdornment>
              ),
            }}
            onChange={(e) => {
              setMobile(e.target.value);
              validateMobile();
            }}
          />

          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="name"
            label="Name"
            name="name"
            autoComplete="name"
            autoFocus
            error={formValidError.name}
            helperText={formValidErrorMessage.name}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              validateName();
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
            Accept
          </Button>
        </form>
      </div>
    </Container>
  );
}
