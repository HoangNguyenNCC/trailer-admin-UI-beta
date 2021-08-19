/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, Fragment } from "react";
import {
  useLocation,
  useHistory,
  // useParams
} from "react-router-dom";

import {
  // Avatar,
  Button,
  CssBaseline,
  TextField,
  FormGroup,
  FormControlLabel,
  Checkbox,
  // Link,
  // Grid,
  // Box,
  // LockOutlinedIcon,
  Typography,
  Container,
  Paper,
} from "@material-ui/core";

import { Alert, AlertTitle } from "@material-ui/lab";

import { makeStyles } from "@material-ui/core/styles";

import { authHeader, handleFetchErrors } from "../../_helpers";
import { common } from "../../_constants/common";

const apiUrl = common.apiUrl;
const employeeInviteUrl = `${apiUrl}/admin/employee/invite`;

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
  },
  paper: {
    marginTop: theme.spacing(4),
    display: "flex",
    padding: 20,
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
    display: "block",
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
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
  aclType: {
    padding: 10,
    display: "block",
  },
  checkbox: {
    marginRight: "30px",
  },
  aclTypeDiv: {
    paddingLeft: "8%",
    overflowY: "scroll",
    height: "400px",
    display: "block",
    "&::-webkit-scrollbar": {
      width: "0.4em",
    },
    "&::-webkit-scrollbar-track": {
      boxShadow: "inset 0 0 6px rgba(0,0,0,0.00)",
      webkitBoxShadow: "inset 0 0 6px rgba(0,0,0,0.00)",
    },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: "rgba(0,0,0,.1)",
      outline: "1px solid slategrey",
    },
  },
}));

export default function InviteEmployee(props) {
  const classes = useStyles();

  let userData = localStorage.getItem("user");
  userData = JSON.parse(userData);
  // console.log("userData", userData);

  let aclSettingsAdmin = localStorage.getItem("aclSettingsAdmin");
  aclSettingsAdmin = JSON.parse(aclSettingsAdmin);

  let location = useLocation();
  // console.log("location", location);

  let history = useHistory();
  // console.log("history", history);

  let { from } = location.state || { from: { pathname: "/adminpanel/" } };
  if (!userData.acl.ADMINEMPLOYEE.includes("ADD")) {
    history.replace(from);
  }

  // let token = localStorage.getItem('token');

  const [email, setEmail] = useState("");
  const [aclSettings, setAclSettings] = useState({});
  const [acl, setACL] = useState({});
  // const [submitted, setSubmitted] = useState(false);

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // console.log("aclSettingsAdmin", aclSettingsAdmin);

  useEffect(() => {
    setAclSettings({
      ...aclSettingsAdmin,
    });

    const privilegeTypes = Object.keys(aclSettingsAdmin);
    const initACL = {};
    privilegeTypes.forEach((privilegeType) => {
      initACL[privilegeType] = [];
    });
    setACL({ ...initACL });
  }, []);
  if (!userData.isOwner) {
    return (
      <Paper elevation={3} className={classes.paper}>
        Contact owner for more information.
      </Paper>
    );
  }
  function handleACLChange(aclType, setting, checked) {
    // console.log("handleACLChange", setting, checked);

    // console.log("acList", acl[aclType].length);
    const isACPPresent = acl[aclType].includes(setting);
    let newAcl = [];

    // console.log("isACPPresent", isACPPresent)

    if (checked && !isACPPresent) {
      newAcl = {
        ...acl,
      };
      newAcl[aclType] = [...newAcl[aclType], setting];
      setACL(newAcl);
    }
    if (!checked && isACPPresent) {
      const newAclType = acl[aclType].filter((acl) => {
        return acl !== setting;
      });

      newAcl = {
        ...acl,
      };
      newAcl[aclType] = newAclType;
      setACL(newAcl);
    }
    // console.log("newAcl", newAcl[aclType].length);
  }

  function onEmployeeInviteSubmit(e) {
    e.preventDefault();

    const requestOptions = {
      method: "POST",
      headers: {
        ...authHeader(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, acl }),
    };

    // console.log("config", config);

    fetch(employeeInviteUrl, requestOptions)
      .then(handleFetchErrors)
      .then((res) => res.json())
      .then((res) => {
        console.log(res);
        setErrorMessage("");
        setSuccessMessage("Successfully invited Employee");

        history.push("/adminpanel/");
      })
      .catch((error) => {
        console.log("Employee Invite Error", error);
        setErrorMessage(
          typeof error.message === "string" ? error.message : "Error"
        );
        setSuccessMessage("");
      });
  }

  return (
    <Container component="main" maxWidth="sm">
      <CssBaseline />

      <div className={classes.paper}>
        {/* <Avatar className={classes.avatar}>
                    <LockOutlinedIcon />
                </Avatar> */}

        <Typography component="h1" variant="h5">
          Invite Employee
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

          {
            <FormGroup className={["SectionContainer", classes.aclTypeDiv]}>
              <Fragment>
                <Typography variant="subtitle1">Employee Privileges</Typography>
                {aclSettings &&
                  Object.keys(aclSettings).map((aclType) => {
                    // console.log("aclType", aclType, acl);
                    return (
                      <div key={aclType} className={classes.aclType}>
                        <Typography variant="body2">
                          {aclType.toUpperCase()}
                        </Typography>

                        <Fragment>
                          {acl &&
                            acl[aclType] &&
                            aclSettings[aclType] &&
                            aclSettings[aclType].map(
                              (setting, settingIndex) => {
                                // console.log(aclType, "setting", setting);
                                return (
                                  <FormControlLabel
                                    key={settingIndex}
                                    className={classes.checkbox}
                                    control={
                                      <Checkbox
                                        checked={acl[aclType].includes(setting)}
                                        name={setting}
                                        onChange={(e) => {
                                          console.log("onChange", e);
                                          handleACLChange(
                                            aclType,
                                            setting,
                                            e.target.checked
                                          );
                                        }}
                                      />
                                    }
                                    label={setting}
                                  />
                                );
                              }
                            )}
                        </Fragment>
                      </div>
                    );
                  })}
              </Fragment>
            </FormGroup>
          }

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
            onClick={onEmployeeInviteSubmit}
          >
            Invite Employee
          </Button>
        </form>
      </div>
    </Container>
  );
}

/* function mapState(state) {
    // const { loggingIn } = state.authentication;
    // return { loggingIn };
    return {};
}
const actionCreators = {
    inviteEmployee: userActions.inviteEmployee
};
const connectedInviteEmployeePage = connect(mapState, actionCreators)(InviteEmployee);
export { connectedInviteEmployeePage as EmployeeInvite }; */
