/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-useless-escape */
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
  InputAdornment,
} from "@material-ui/core";

import { Alert, AlertTitle } from "@material-ui/lab";

import { makeStyles } from "@material-ui/core/styles";

import { authHeader, handleFetchErrors } from "../../_helpers";
import { common } from "../../_constants/common";

import "../../App.css";

const apiUrl = common.apiUrl;
const getAcl = `${apiUrl}/admin/employee/acl`;
const getEmployee = `${apiUrl}/admin/employee/profile`;
const updateEmployee = `${apiUrl}/admin/employee/profile`;
const updateEmployeeByAdmin = `${apiUrl}/admin/employee/profile/admin`;

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

const strongRegex = new RegExp(
  "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})"
);

export default function EmployeeEdit(props) {
  console.log("EmployeeEdit", props);

  const classes = useStyles();

  let token = localStorage.getItem("token");

  let userData = localStorage.getItem("user");
  userData = JSON.parse(userData);

  let aclSettingsAdmin = localStorage.getItem("aclSettingsAdmin");
  aclSettingsAdmin = JSON.parse(aclSettingsAdmin);

  // console.log("userData", userData);
  console.log("token", token);
  let selfEdit = false;
  let { employeeId } = useParams();
  if (!employeeId) {
    selfEdit = true;
    employeeId = userData._id;
  }
  // console.log("employeeId", employeeId);

  let history = useHistory();
  // console.log("history", history);

  let location = useLocation();
  // console.log("location", location);

  let { from } = location.state || { from: { pathname: "/adminpanel/" } };
  if (employeeId && !userData.acl.ADMINEMPLOYEE.includes("UPDATE")) {
    history.replace(from);
  }

  const [aclSettings, setAclSettings] = useState({});
  let saveEmployee = updateEmployee;
  // if(userData.isOwner && userData._id !== employeeId) {

  const employeeStart = {
    mobile: "",
    name: "",
    password: "",
    repassword: "",
    acl: {},
  };

  const [loadOnce, setLoadOnce] = useState(0);
  const [employee, setEmployee] = useState(employeeStart);

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (userData.isOwner) {
      // console.log("aclSettingsAdmin", aclSettingsAdmin);
      setAclSettings({
        ...aclSettingsAdmin,
      });
    }

    const requestOptions = {
      method: "GET",
      headers: authHeader(),
    };
    fetch(`${getEmployee}?employeeId=${employeeId}`, requestOptions)
      .then(handleFetchErrors)
      .then((res) => res.json())
      .then((res) => {
        console.log("API Response", res);
        const employeeObj = res.employeeObj;
        const password = employeeObj.password;

        // console.log("Emp", res);
        // console.log("employeeObj.acl", employeeObj.acl);

        setEmployee({
          ...employee,
          mobile: employeeObj.mobile.replace("+61", ""),
          name:
            typeof employeeObj.name === "object"
              ? employeeObj.name.firstName + " " + employeeObj.name.lastName
              : employeeObj.name,
          password: password,
          repassword: password,
          acl: employeeObj.acl,
        });
      })
      .catch((error) => {
        console.log("Error occurred while fetching ACL", error);
      });
  }, [loadOnce]);

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

  // function validatePasswords(vpassword, vrepassword) {
  //     const messagePasswordMatch = "Passwords don't match";
  //     const messagePasswordInvalidFormat = "Password should be 8 or more characters long. Password should contain one Uppercase Alphabetical Character, one Lowercase Alphabetical Character, one Numeric Character and one Special Character.";

  //     const doPasswordsMatch = (vpassword === vrepassword);
  //     const isPasswordsValid = strongRegex.test(vpassword);
  //     const isRePasswordValid = strongRegex.test(vrepassword);

  //     // console.log("doPasswordsMatch", doPasswordsMatch, "isPasswordsValid", isPasswordsValid, "isRePasswordValid", isRePasswordValid);

  //     let errorPassword = "";
  //     if(!doPasswordsMatch) {
  //         errorPassword += `${messagePasswordMatch} `;
  //     }
  //     if(!isPasswordsValid) {
  //         errorPassword += `${messagePasswordInvalidFormat} `;
  //     }

  //     let copyFormValidError = {
  //         ...formValidError
  //     };
  //     let copyFormValidErrorMessage = {
  //         ...formValidErrorMessage
  //     };

  //     if(doPasswordsMatch && isPasswordsValid) {
  //         copyFormValidError = {
  //             ...copyFormValidError,
  //             password: false
  //         };
  //         setFormValidError(copyFormValidError);

  //         copyFormValidErrorMessage = {
  //             ...copyFormValidErrorMessage,
  //             password: ""
  //         };
  //         setFormValidErrorMessage(copyFormValidErrorMessage);
  //     } else {
  //         copyFormValidError = {
  //             ...copyFormValidError,
  //             password: true
  //         };
  //         setFormValidError(copyFormValidError);

  //         copyFormValidErrorMessage = {
  //             ...copyFormValidErrorMessage,
  //             password: errorPassword
  //         };
  //         setFormValidErrorMessage(copyFormValidErrorMessage);
  //     }

  //     let errorRePassword = "";
  //     if(!doPasswordsMatch) {
  //         errorRePassword += `${messagePasswordMatch} `;
  //     }
  //     if(!isRePasswordValid) {
  //         errorRePassword += `${messagePasswordInvalidFormat} `;
  //     }

  //     if(doPasswordsMatch && isPasswordsValid) {
  //         copyFormValidError = {
  //             ...copyFormValidError,
  //             repassword: false
  //         };
  //         setFormValidError(copyFormValidError);

  //         copyFormValidErrorMessage = {
  //             ...copyFormValidErrorMessage,
  //             repassword: ""
  //         };
  //         setFormValidErrorMessage(copyFormValidErrorMessage);
  //     } else {
  //         copyFormValidError = {
  //             ...copyFormValidError,
  //             repassword: true
  //         };
  //         setFormValidError(copyFormValidError);

  //         copyFormValidErrorMessage = {
  //             ...copyFormValidErrorMessage,
  //             repassword: errorRePassword
  //         };
  //         setFormValidErrorMessage(copyFormValidErrorMessage);
  //     }
  // }

  function handleACLChange(aclType, setting, checked) {
    // console.log("handleACLChange", setting, checked);

    // console.log("acList", employee.acl[aclType].length);
    const isACPPresent = employee.acl[aclType].includes(setting);
    let newAcl = [];

    // console.log("isACPPresent", isACPPresent)

    if (checked && !isACPPresent) {
      newAcl = {
        ...employee.acl,
      };
      newAcl[aclType] = [...newAcl[aclType], setting];
      setEmployee({
        ...employee,
        acl: newAcl,
      });
    }
    if (!checked && isACPPresent) {
      const newAclType = employee.acl[aclType].filter((acl) => {
        return acl !== setting;
      });

      newAcl = {
        ...employee.acl,
      };
      newAcl[aclType] = newAclType;
      setEmployee({
        ...employee,
        acl: newAcl,
      });
    }
    // console.log("newAcl", newAcl[aclType].length);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const isError =
      formValidError.mobile || formValidError.name || formValidError.password;

    if (isError) {
      return false;
    }

    if (userData.isOwner) {
      saveEmployee = updateEmployeeByAdmin;
    }
    if (employee.name === "") {
      setErrorMessage("Name empty");
      return false;
    }
    let nameArray = employee.name.split(" ");
    let name;
    if (nameArray.length > 1) {
      name = {
        firstName: nameArray[0],
      };
      nameArray.shift();
      name.lastName = nameArray.join(" ");
    } else {
      name = {
        firstName: nameArray[0],
        lastName: "undefined",
      };
    }
    // const joinedACL = joinACLSettings(employee.acl);
    const joinedACL = employee.acl;

    const requestOptions = {
      method: "PUT",
      headers: {
        ...authHeader(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        employeeId: employeeId,
        mobile: employee.mobile.replace("+61", ""),
        name: name,
        acl: joinedACL,
      }),
    };
    console.log("requestOptions", requestOptions);

    fetch(saveEmployee, requestOptions)
      .then(handleFetchErrors)
      .then((res) => res.json())
      .then((res) => {
        console.log(`${saveEmployee} Response`, res);

        // localStorage.setItem('user', JSON.stringify(res.employeeObj));

        setErrorMessage("");
        setSuccessMessage("Successfully saved Employee data");

        /* setMobile("");
            setName("");
            setPassword("");
            setRePassword(""); */

        /* setEmployee({
                ...employee,
                ...employeeStart
            }); */

        setTimeout(() => {
          setSuccessMessage("");
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
          {selfEdit ? "Edit Profile" : "Edit Employee"}
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
            value={employee.mobile}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">+61</InputAdornment>
              ),
            }}
            onChange={(e) => {
              setEmployee({
                ...employee,
                mobile: e.target.value,
              });
              validateMobile(e.target.value);
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
            value={employee.name}
            onChange={(e) => {
              setEmployee({
                ...employee,
                name: e.target.value,
              });
              validateName(e.target.value);
            }}
          />

          {/* <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Password"
                        type="password"
                        id="password"
                        autoComplete="current-password"
                        value={employee.password}
                        error={formValidError.password}
                        helperText={formValidErrorMessage.password}
                        onChange={ (e) => { 
                            setEmployee({
                                ...employee,
                                password: e.target.value
                            });
                            validatePasswords(e.target.value, employee.repassword);
                        } }
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
                        value={employee.repassword}
                        onChange={ (e) => { 
                            setEmployee({
                                ...employee,
                                repassword: e.target.value
                            });
                            validatePasswords(employee.password, e.target.value);
                        } }
                    /> */}

          {!selfEdit && (
            <FormGroup className={["SectionContainer", classes.aclTypeDiv]}>
              <Typography variant="subtitle1">Employee Privileges</Typography>

              {aclSettings &&
                Object.keys(aclSettings).map((aclType) => {
                  // console.log("aclType", aclType, employee.acl);

                  return (
                    <div key={aclType} className={classes.aclType}>
                      <Typography variant="subtitle2">
                        {aclType.toUpperCase()}
                      </Typography>

                      <Fragment>
                        {employee.acl &&
                          employee.acl[aclType] &&
                          aclSettings[aclType] &&
                          aclSettings[aclType].map((setting, settingIndex) => {
                            // console.log(aclType, "setting", setting);
                            return (
                              <FormControlLabel
                                key={settingIndex}
                                control={
                                  <Checkbox
                                    checked={employee.acl[aclType].includes(
                                      setting
                                    )}
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
                    </div>
                  );
                })}
            </FormGroup>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
            onClick={handleSubmit}
          >
            Update
          </Button>
        </form>
      </div>
    </Container>
  );
}
