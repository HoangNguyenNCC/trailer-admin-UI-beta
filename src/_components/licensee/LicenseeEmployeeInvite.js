/* eslint-disable no-unused-vars */
import React, { useState, useEffect, Fragment } from "react";
import { useLocation, useHistory, useParams } from "react-router-dom";

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
} from "@material-ui/core";

import { Alert, AlertTitle } from "@material-ui/lab";

import { makeStyles } from "@material-ui/core/styles";

import { authHeader, handleFetchErrors } from "../../_helpers";
import { common } from "../../_constants/common";

const apiUrl = common.apiUrl;
const employeeInviteUrl = `${apiUrl}/admin/inviteLicenseeEmployee`;
const getLicenseeACL = `${apiUrl}/licensee/employee/acl`;

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
  },
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

export default function InviteEmployee(props) {
  const classes = useStyles();

  let userData = localStorage.getItem("user");
  userData = JSON.parse(userData);
  // console.log("userData", userData);

  let location = useLocation();
  // console.log("location", location);

  let history = useHistory();
  // console.log("history", history);

  const { licenseeId } = useParams();
  console.log("licenseeId", licenseeId);

  let { from } = location.state || { from: { pathname: "/adminpanel/" } };
  if (!userData.acl.LICENSEEEMPLOYEE.includes("ADD")) {
    history.replace(from);
  }

  const [email, setEmail] = useState("");
  const [aclSettings, setAclSettings] = useState({});
  const [acl, setACL] = useState({});

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  let licenseeEmployeeACL;
  useEffect(() => {}, []);

  useEffect(() => {
    const requestOptions = {
      method: "GET",
      headers: {
        ...authHeader(),
        "Content-Type": "application/json",
      },
    };

    fetch(getLicenseeACL, requestOptions)
      .then((res) => res.json())
      .then((data) => {
        licenseeEmployeeACL = data.accessControlList;
        console.log(licenseeEmployeeACL);
        setAclSettings(data.accessControlList);
        const privilegeTypes = Object.keys(licenseeEmployeeACL);
        const initACL = {};
        privilegeTypes.forEach((privilegeType) => {
          initACL[privilegeType] = [];
        });
        setACL({ ...initACL });
      });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      // body: JSON.stringify({ email, acl })
      body: JSON.stringify({ email, acl }),
    };

    // console.log("config", config);

    fetch(`${employeeInviteUrl}?licenseeId=${licenseeId}`, requestOptions)
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
    <Container component="main" maxWidth="xs">
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
            <FormGroup className="SectionContainer">
              <Typography variant="subtitle1">Employee Privileges</Typography>

              {aclSettings &&
                Object.keys(aclSettings).map((aclType) => {
                  // console.log("aclType", aclType, acl);

                  return (
                    <Fragment key={aclType}>
                      <Typography variant="subtitle2">
                        {aclType.toUpperCase()}
                      </Typography>

                      <Fragment>
                        {acl &&
                          acl[aclType] &&
                          aclSettings[aclType] &&
                          aclSettings[aclType].map((setting, settingIndex) => {
                            // console.log(aclType, "setting", setting);
                            return (
                              <FormControlLabel
                                key={settingIndex}
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
                          })}
                      </Fragment>
                    </Fragment>
                  );
                })}
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
