/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, Fragment } from "react";
import { useLocation, useHistory, useParams } from "react-router-dom";
import moment from "moment";

import {
  Button,
  CssBaseline,
  TextField,
  FormGroup,
  FormControl,
  FormControlLabel,
  Checkbox,
  Box,
  Typography,
  Container,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
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
    minWidth: 200,
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
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
  aclType: {
    padding: 10,
    display: "block",
  },
  checkbox: {
    marginRight: "10px",
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

const apiUrl = common.apiUrl;
const getLicenseeEmployee = `${apiUrl}/admin/licensee/employee`; // GET
const getLicenseeACL = `${apiUrl}/licensee/employee/acl`;

const putLicenseeEmployee = `${apiUrl}/admin/licensee/employee/profile`;

export default function LicenseeEmployeeEdit(props) {
  console.log("LicenseeEmployeeEdit", props);

  const classes = useStyles();

  let userData = localStorage.getItem("user");
  userData = JSON.parse(userData);
  // console.log("userData", userData);

  let history = useHistory();
  // console.log("history", history);

  let location = useLocation();
  // console.log("location", location);

  const { licenseeId, employeeId } = useParams();
  // console.log("licenseeId", licenseeId, "employeeId", employeeId);

  let { from } = location.state || { from: { pathname: "/adminpanel/" } };
  if (
    !licenseeId ||
    !employeeId ||
    !userData.acl.LICENSEEEMPLOYEE.includes("UPDATE")
  ) {
    history.replace(from);
  }

  //--------------------------------------------------------------------------

  const employeeStart = {
    name: "",
    email: "",
    // isEmailVerified: false,
    mobile: "",
    // isMobileVerified: false,
    country: common.country,
    dob: moment().subtract(18, "years").format("YYYY-MM-DD"),

    address: {
      text: "",
      pincode: "",
      coordinates: [0, 0],
      city: "",
      state: common.states[0],
      country: common.country,
    },

    driverLicense: {
      card: "",
      expiry: moment().add(1, "year").format("YYYY-MM"),
      state: common.states[0],
      scanLink: "",
    },

    // isDeleted: false,

    photoLink: "",
    additionalDocumentLink: "",
  };

  const loadOnce = 0;
  const [employeeSignup, setEmployeeSignup] = useState(employeeStart);
  const [aclSettings, setAclSettings] = useState({});
  const [acl, setACL] = useState({});

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  let licenseeEmployeeACL;
  //--------------------------------------------------------------------------

  function formatExpiryDate(inputDate) {
    const inputComp = inputDate.split("/");
    let inputDateString = `20${inputComp[1]}-${inputComp[0]}-01`;
    return moment(inputDateString).format("YYYY-MM");
  }
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

  useEffect(() => {
    if (employeeId) {
      const requestOptions = {
        method: "GET",
        headers: authHeader(),
      };
      fetch(
        `${getLicenseeEmployee}?id=${employeeId}&licenseeId=${licenseeId}`,
        requestOptions
      )
        .then(handleFetchErrors)
        .then((res) => res.json())
        .then((res) => {
          console.log("Employee API Call Response", res.employeeData);
          const employeeObj = res.employeeData;
          setACL(employeeObj.acl);
          setEmployeeSignup({
            name: employeeObj.name,
            email: employeeObj.email,
            // isEmailVerified: employeeObj.isEmailVerified,
            mobile: employeeObj.mobile.replace("+61", ""),
            // isMobileVerified: employeeObj.isMobileVerified,
            country: employeeObj.country,
            dob: moment(employeeObj.dob).format("YYYY-MM-DD"),

            address: {
              text: employeeObj.address.text,
              pincode: employeeObj.address.pincode,
              coordinates: employeeObj.address.location.coordinates,
              city: employeeObj.address.city,
              state: employeeObj.address.state,
              country: employeeObj.address.country,
            },

            driverLicense: {
              card: employeeObj.driverLicense.card,
              expiry: employeeObj.driverLicense.expiry,
              state: employeeObj.driverLicense.state,
              scanLink: employeeObj.driverLicense.scan,
            },

            photoLink: employeeObj.photo,
            additionalDocumentLink: employeeObj.additionalDocument,

            // isDeleted: employeeObj.isDeleted,
          });
        })
        .catch((err) => {
          console.log(
            "Error occurred while fetching Licensee Employee data",
            err
          );
        });
    }
  }, [loadOnce]);

  //--------------------------------------------------------------------------

  const formValidErrorMessage = {
    name: "",
    email: "",
    mobile: "",
    country: "",
    dob: "",

    address: {
      text: "",
      pincode: "",
      coordinates: "",
      city: "",
      state: "",
      country: "",
    },

    driverLicense: {
      card: "",
      expiry: "",
      state: "",
    },

    photo: "",
    driverLicenseScan: "",
    additionalDocument: "",
  };

  async function handleSubmit(e) {
    e.preventDefault();

    const isError =
      // (formValidErrorMessage.licensee.name !== "") ||
      // (formValidErrorMessage.licensee.email !== "") ||
      // (formValidErrorMessage.licensee.mobile !== "") ||
      // (formValidErrorMessage.licensee.country !== "") ||

      // (formValidErrorMessage.licensee.businessType !== "") ||

      // (formValidErrorMessage.licensee.address.text !== "") ||
      // (formValidErrorMessage.licensee.address.pincode !== "") ||
      // (formValidErrorMessage.licensee.address.coordinates !== "") ||
      // (formValidErrorMessage.licensee.address.city !== "") ||
      // (formValidErrorMessage.licensee.address.state !== "") ||
      // (formValidErrorMessage.licensee.address.country !== "") ||

      // (formValidErrorMessage.licensee.radius !== "") ||
      // (formValidErrorMessage.licensee.bsbNumber !== "") ||
      // (formValidErrorMessage.licensee.availability !== "") ||
      // (formValidErrorMessage.licensee.workingDays !== "") ||
      // (formValidErrorMessage.licensee.workingHoursStart !== "") ||
      // (formValidErrorMessage.licensee.workingHoursEnd !== "") ||
      // (formValidErrorMessage.licensee.stripeAccountId !== "") ||
      // (formValidErrorMessage.licensee.stripeAccountVerified !== "") ||
      // (formValidErrorMessage.licensee.accountNumber !== "") ||
      // (formValidErrorMessage.licensee.mcc !== "") ||
      // (formValidErrorMessage.licensee.tosAcceptanceDate !== "") ||
      // (formValidErrorMessage.licensee.tosAcceptanceIP !== "") ||
      // (formValidErrorMessage.licensee.taxId !== "") ||

      // (formValidErrorMessage.licensee.logo !== "") ||
      // (formValidErrorMessage.licensee.proofOfIncorporation !== "") ||

      formValidErrorMessage.email !== "" ||
      formValidErrorMessage.name !== "" ||
      formValidErrorMessage.mobile !== "" ||
      formValidErrorMessage.country !== "" ||
      formValidErrorMessage.dob !== "" ||
      formValidErrorMessage.address.text !== "" ||
      formValidErrorMessage.address.pincode !== "" ||
      formValidErrorMessage.address.coordinates !== "" ||
      formValidErrorMessage.address.city !== "" ||
      formValidErrorMessage.address.state !== "" ||
      formValidErrorMessage.address.country !== "" ||
      formValidErrorMessage.driverLicense.card !== "" ||
      formValidErrorMessage.driverLicense.expiry !== "" ||
      formValidErrorMessage.driverLicense.state !== "" ||
      formValidErrorMessage.photo !== "" ||
      formValidErrorMessage.driverLicenseScan !== "" ||
      formValidErrorMessage.additionalDocument !== "";

    if (isError) {
      return false;
    }

    //---------------------------------------------------------------------------

    // console.log("employeeSignup.driverLicense.expiry", employeeSignup.employee.driverLicense.expiry);

    employeeSignup.dob = moment(employeeSignup.dob).format("YYYY-MM-DD");
    employeeSignup.driverLicense.expiry = moment(
      employeeSignup.driverLicense.expiry,
      "YYYY-MM"
    ).format("YYYY-MM");
    employeeSignup.mobile = employeeSignup.mobile.replace("+61", "");
    // console.log("employeeSignup.driverLicense.expiry", employeeSignup.driverLicense.expiry);

    // employeeSignup.licensee.workingHours = `${employeeSignup.licensee.workingHoursStart.replace(":","")}-${employeeSignup.licensee.workingHoursEnd.replace(":","")}`
    employeeSignup.acl = acl;
    //---------------------------------------------------------------------------

    const formData = new FormData();
    if (employeeId) {
      employeeSignup.employeeId = employeeId;
    }
    formData.append("reqBody", JSON.stringify(employeeSignup));

    // append files --------------------------------------------------

    if (employeeSignup.photo) {
      formData.append(
        "employeePhoto",
        employeeSignup.photo,
        employeeSignup.photo.name
      );
    } else {
      delete employeeSignup.photo;
    }
    if (employeeSignup.driverLicenseScan) {
      formData.append(
        "employeeDriverLicenseScan",
        employeeSignup.driverLicenseScan,
        employeeSignup.driverLicenseScan.name
      );
    } else {
      delete employeeSignup.driverLicenseScan;
    }
    if (employeeSignup.additionalDocument) {
      formData.append(
        "employeeAdditionalDocumentScan",
        employeeSignup.additionalDocument,
        employeeSignup.additionalDocument.name
      );
    } else {
      delete employeeSignup.additionalDocument;
    }
    let requestOptions;
    if (employeeId) {
      formData.append("employeeId", employeeId);
      requestOptions = {
        method: "PUT",
        // method: "POST",
        headers: {
          ...authHeader(),
        },
        body: formData,
      };
    } else {
      requestOptions = {
        // method: "PUT",
        method: "POST",
        headers: {
          ...authHeader(),
        },
        body: formData,
      };
    }

    console.log("requestOptions", requestOptions);

    fetch(putLicenseeEmployee, requestOptions)
      .then(handleFetchErrors)
      .then((res) => res.json())
      .then((res) => {
        console.log(`${putLicenseeEmployee} Response`, res);

        if (res.success) {
          const employeeObj = res.employeeObj;

          setEmployeeSignup({
            name: employeeObj.name,
            email: employeeObj.email,
            // isEmailVerified: employeeObj.isEmailVerified,
            mobile: employeeObj.mobile.replace("+61", ""),
            // isMobileVerified: employeeObj.isMobileVerified,
            country: employeeObj.country,
            dob: moment(employeeObj.dob).format("YYYY-MM-DD"),

            address: {
              text: employeeObj.address.text,
              pincode: employeeObj.address.pincode,
              coordinates: employeeObj.address.coordinates,
              // .join(",")
              city: employeeObj.address.city,
              state: employeeObj.address.state,
              country: employeeObj.address.country,
            },

            driverLicense: {
              card: employeeObj.driverLicense.card,
              expiry: employeeObj.driverLicense.expiry,
              state: employeeObj.driverLicense.state,
              scanLink: employeeObj.driverLicense.scan,
            },

            // isDeleted: employeeObj.isDeleted,

            photoLink: employeeObj.photo,
            additionalDocumentLink: employeeObj.additionalDocument,
          });

          setErrorMessage("");
          setSuccessMessage("Successfully saved Licensee data");

          setTimeout(() => {
            setSuccessMessage("");
            history.push("/adminpanel/licensees");
          }, 5000);
        }

        // employeeSignup.driverLicense.expiry = moment().add(1, "year").format("YYYY-MM");
      })
      .catch((error) => {
        console.log(`${putLicenseeEmployee} Error`, error);
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
          Employee Edit
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
          <Box className="SectionContainer">
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="employee-name"
              label="Name"
              name="employee-name"
              autoComplete="employee-name"
              autoFocus
              error={formValidErrorMessage.name !== ""}
              helperText={formValidErrorMessage.name}
              value={employeeSignup.name}
              onChange={(e) => {
                setEmployeeSignup({
                  ...employeeSignup,
                  name: e.target.value,
                });
              }}
            />

            <FormGroup className="SectionContainer">
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                id="employee-email"
                label="Email"
                name="employee-email"
                autoComplete="employee-email"
                autoFocus
                error={formValidErrorMessage.email !== ""}
                helperText={formValidErrorMessage.email}
                value={employeeSignup.email}
                onChange={(e) => {
                  setEmployeeSignup({
                    ...employeeSignup,

                    email: e.target.value,
                  });
                }}
              />

              {/* <FormControlLabel
                control={
                  <Checkbox
                    disabled={true}
                    checked={employeeSignup.isEmailVerified}
                    name="employee-isEmailVerified"
                    onChange={(e) => {
                      console.log("onChange isEmailVerified", e);
                      setEmployeeSignup({
                        ...employeeSignup,

                        isEmailVerified: !employeeSignup.isEmailVerified,
                      });
                    }}
                  />
                }
                label="Is Email Verified?"
              /> */}
            </FormGroup>

            <FormGroup className="SectionContainer">
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                id="employee-mobile"
                label="Mobile"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">+61</InputAdornment>
                  ),
                }}
                name="employee-mobile"
                autoComplete="employee-mobile"
                autoFocus
                error={formValidErrorMessage.mobile !== ""}
                helperText={
                  "Remove / don't add country code in text (Country code is automatically attached"
                }
                value={employeeSignup.mobile}
                onChange={(e) => {
                  setEmployeeSignup({
                    ...employeeSignup,

                    mobile: e.target.value,
                  });
                }}
              />

              {/* <FormControlLabel
                control={
                  <Checkbox
                    disabled={true}
                    checked={employeeSignup.isMobileVerified}
                    name="employee-isMobileVerified"
                    onChange={(e) => {
                      console.log("onChange isMobileVerified", e);
                      setEmployeeSignup({
                        ...employeeSignup,

                        isMobileVerified: !employeeSignup.isMobileVerified,
                      });
                    }}
                  />
                }
                label="Is Mobile Verified?"
              /> */}
            </FormGroup>

            <TextField
              variant="outlined"
              margin="normal"
              aria-label="Date of Birth"
              required
              fullWidth
              type="date"
              id="employee-dob"
              label="Date Of Birth"
              name="employee-dob"
              autoComplete="employee-dob"
              autoFocus
              error={formValidErrorMessage.dob !== ""}
              helperText={formValidErrorMessage.dob}
              value={employeeSignup.dob}
              onChange={(e) => {
                console.log("new date : ", e.target.value);
                setEmployeeSignup({
                  ...employeeSignup,

                  dob: e.target.value,
                });
              }}
            />

            <Box className="SectionContainer">
              <Typography variant="subtitle1">Address</Typography>

              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                id="employee-address_text"
                label="Address Line"
                name="employee-address_text"
                autoComplete="employee-address_text"
                autoFocus
                error={formValidErrorMessage.address.text !== ""}
                helperText={formValidErrorMessage.address.text}
                value={employeeSignup.address.text}
                onChange={(e) => {
                  setEmployeeSignup({
                    ...employeeSignup,

                    address: {
                      ...employeeSignup.address,
                      text: e.target.value,
                    },
                  });
                }}
              />

              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                id="employee-address_pincode"
                label="Pincode"
                name="employee-address_pincode"
                autoComplete="employee-address_pincode"
                autoFocus
                error={formValidErrorMessage.address.pincode !== ""}
                helperText={formValidErrorMessage.address.pincode}
                value={employeeSignup.address.pincode}
                onChange={(e) => {
                  setEmployeeSignup({
                    ...employeeSignup,

                    address: {
                      ...employeeSignup.address,
                      pincode: e.target.value,
                    },
                  });
                }}
              />

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-around",
                }}
              >
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  // fullWidth
                  id="employee-address_coordinates-latitude"
                  label="Coordinates (Latitude)"
                  name="employee-address_coordinates-latitude"
                  autoComplete="employee-address_coordinates-latitude"
                  autoFocus
                  error={formValidErrorMessage.address.coordinates !== ""}
                  helperText={formValidErrorMessage.address.coordinates}
                  value={employeeSignup.address.coordinates[0]}
                  onChange={(e) => {
                    // setEmployeeSignup({
                    //   ...employeeSignup,

                    //   address: {
                    //     ...employeeSignup.address,
                    //     coordinates: e.target.value,
                    //   },
                    // });

                    let oldCoordinates = employeeSignup.address.coordinates;
                    let newLatitude = parseFloat(e.target.value);
                    let newCoordinates = oldCoordinates;
                    newCoordinates[0] = newLatitude;
                    setEmployeeSignup({
                      ...employeeSignup,
                      // address: {
                      // ...employeeSignup.address,
                      address: {
                        ...employeeSignup.address,
                        coordinates: newCoordinates,
                      },
                      // },
                    });
                  }}
                />

                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  // fullWidth
                  id="employee-address_coordinates-longitude"
                  label="Coordinates (Longitude)"
                  name="employee-address_coordinates-longitude"
                  autoComplete="employee-address_coordinates-longitude"
                  autoFocus
                  error={formValidErrorMessage.address.coordinates !== ""}
                  helperText={formValidErrorMessage.address.coordinates}
                  value={employeeSignup.address.coordinates[1]}
                  onChange={(e) => {
                    // setEmployeeSignup({
                    //   ...employeeSignup,

                    //   address: {
                    //     ...employeeSignup.address,
                    //     coordinates: e.target.value,
                    //   },
                    // });

                    let oldCoordinates = employeeSignup.address.coordinates;
                    let newLongitude = parseFloat(e.target.value);
                    let newCoordinates = oldCoordinates;
                    newCoordinates[1] = newLongitude;
                    setEmployeeSignup({
                      ...employeeSignup,
                      address: {
                        ...employeeSignup.address,
                        // address: {
                        // ...employeeSignup.address,
                        coordinates: newCoordinates,
                        // },
                      },
                    });
                  }}
                />
              </div>

              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                id="employee-address_city"
                label="City"
                name="employee-address_city"
                autoComplete="employee-address_city"
                autoFocus
                error={formValidErrorMessage.address.city !== ""}
                helperText={formValidErrorMessage.address.city}
                value={employeeSignup.address.city}
                onChange={(e) => {
                  setEmployeeSignup({
                    ...employeeSignup,

                    address: {
                      ...employeeSignup.address,
                      city: e.target.value,
                    },
                  });
                }}
              />

              {common.states && (
                <FormControl required>
                  <InputLabel id="employee-address_state-label">
                    State
                  </InputLabel>
                  <Select
                    labelId="employee-address_state-label"
                    id="employee-address_state-Select"
                    value={employeeSignup.address.state}
                    onChange={(e) => {
                      setEmployeeSignup({
                        ...employeeSignup,

                        address: {
                          ...employeeSignup.address,
                          state: e.target.value,
                        },
                      });
                    }}
                    className={classes.selectEmpty}
                  >
                    {common.states.map((state, stateIndex) => {
                      // console.log("state", state, stateIndex);
                      return (
                        <MenuItem
                          key={`employee-state-${stateIndex}`}
                          value={state}
                        >
                          {state}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              )}
            </Box>

            <Box className="SectionContainer">
              <Typography variant="subtitle1">Driver License</Typography>

              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                id="employee-driverLicense_card"
                label="Driver License Number"
                name="employee-driverLicense_card"
                autoComplete="employee-driverLicense_card"
                autoFocus
                error={formValidErrorMessage.driverLicense.card !== ""}
                helperText={formValidErrorMessage.driverLicense.card}
                value={employeeSignup.driverLicense.card}
                onChange={(e) => {
                  setEmployeeSignup({
                    ...employeeSignup,

                    driverLicense: {
                      ...employeeSignup.driverLicense,
                      card: e.target.value,
                    },
                  });
                }}
              />

              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                type="month"
                id="employee-driverLicense_expiry"
                label="Expiry Date"
                name="employee-driverLicense_expiry"
                autoComplete="employee-driverLicense_expiry"
                autoFocus
                error={formValidErrorMessage.driverLicense.expiry !== ""}
                helperText={formValidErrorMessage.driverLicense.expiry}
                value={employeeSignup.driverLicense.expiry}
                onChange={(e) => {
                  setEmployeeSignup({
                    ...employeeSignup,

                    driverLicense: {
                      ...employeeSignup.driverLicense,
                      expiry: e.target.value,
                    },
                  });
                }}
              />

              {common.states && (
                <FormControl required>
                  <InputLabel id="employee-driverLicense_state-label">
                    State
                  </InputLabel>
                  <Select
                    labelId="employee-driverLicense_state-label"
                    id="employee-driverLicense_state-Select"
                    value={employeeSignup.driverLicense.state}
                    onChange={(e) => {
                      setEmployeeSignup({
                        ...employeeSignup,

                        driverLicense: {
                          ...employeeSignup.driverLicense,
                          state: e.target.value,
                        },
                      });
                    }}
                    className={classes.selectEmpty}
                  >
                    {common.states.map((state, stateIndex) => {
                      // console.log("state", state, stateIndex);
                      return (
                        <MenuItem
                          key={`driverLicense-state-${stateIndex}`}
                          value={state}
                        >
                          {state}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              )}

              <Box className="SectionContainer">
                <Typography variant="subtitle1">
                  Scan ( Scan of Front and Back side of Driver License in a
                  single File )
                </Typography>

                {employeeSignup.driverLicense.scanLink &&
                  !employeeSignup.driverLicenseScan && (
                    <Box className="SectionContainer">
                      <a href={employeeSignup.driverLicense.scanLink}>Scan</a>
                    </Box>
                  )}

                <input
                  accept="image/jpeg, image/jpg, image/png, application/pdf"
                  id="employee-driverLicenseScan"
                  type="file"
                  name="employee-driverLicenseScan"
                  onChange={(e) => {
                    console.log("employee-driverLicenseScan", e.target.files);
                    setEmployeeSignup({
                      ...employeeSignup,

                      driverLicenseScan: e.target.files[0],
                    });
                  }}
                />

                {/* <label htmlFor="raised-button-file">
                                    <Button variant="raised" component="span" className={classes.button}>
                                        Upload
                                    </Button>
                                </label>  */}
              </Box>
            </Box>

            <Box className="SectionContainer">
              <Typography variant="subtitle1">Photo</Typography>

              {employeeSignup.photoLink && !employeeSignup.photo && (
                <Box className="SectionContainer">
                  <a href={employeeSignup.photoLink}>Photo</a>
                </Box>
              )}

              <input
                accept="image/jpeg, image/jpg, image/png"
                id="employee-photo"
                type="file"
                name="employee-photo"
                onChange={(e) => {
                  console.log("employee-photo", e.target.files);
                  setEmployeeSignup({
                    ...employeeSignup,

                    photo: e.target.files[0],
                  });
                }}
              />

              {/* <label htmlFor="raised-button-file">
                                <Button variant="raised" component="span" className={classes.button}>
                                    Upload
                                </Button>
                            </label>  */}
            </Box>

            <Box className="SectionContainer">
              <Typography variant="subtitle1">Additional Document</Typography>

              {employeeSignup.additionalDocumentLink &&
                !employeeSignup.additionalDocument && (
                  <Box className="SectionContainer">
                    <a href={employeeSignup.additionalDocumentLink}>
                      Additional Document
                    </a>
                  </Box>
                )}

              <input
                accept="image/jpeg, image/jpg, image/png, application/pdf"
                id="employee-additionalDocument"
                type="file"
                name="employee-additionalDocument"
                onChange={(e) => {
                  console.log("employee-additionalDocument", e.target.files);
                  setEmployeeSignup({
                    ...employeeSignup,

                    additionalDocument: e.target.files[0],
                  });
                }}
              />
            </Box>

            {/* <FormControlLabel
                            control={
                                <Checkbox 
                                    checked={employeeSignup.isDeleted} 
                                    name="employee-isDeleted"
                                    onChange={(e) => { 
                                        console.log("onChange isDeleted", e);
                                        setEmployeeSignup({
                                            ...employeeSignup,
                                            
                                                isDeleted: !employeeSignup.isDeleted
                                            
                                        });
                                    }}  />
                            }
                            label="Delete Employee?"
                        /> */}
          </Box>
          {
            <FormGroup className={["SectionContainer", classes.aclTypeDiv]}>
              <Typography variant="subtitle1">
                Licensee Employee Priviledges
              </Typography>

              {aclSettings &&
                Object.keys(aclSettings).map((aclType) => {
                  // console.log("aclType", aclType, acl);

                  return (
                    <Fragment key={aclType} className={classes.aclType}>
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
                                    className={classes.checkbox}
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
            onClick={handleSubmit}
          >
            Save
          </Button>
        </form>
      </div>
    </Container>
  );
}
