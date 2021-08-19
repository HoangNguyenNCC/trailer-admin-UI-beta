/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState } from "react";
import { useLocation, useHistory } from "react-router-dom";
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
}));

const apiUrl = common.apiUrl;
const addLicensee = `${apiUrl}/admin/licensee`; // POST

export default function LicenseeSignup(props) {
  console.log("LicenseeSignup", props);

  const classes = useStyles();

  let userData = localStorage.getItem("user");
  userData = JSON.parse(userData);
  // console.log("userData", userData);

  let history = useHistory();
  // console.log("history", history);

  let location = useLocation();
  // console.log("location", location);

  let { from } = location.state || { from: { pathname: "/adminpanel/" } };
  if (!userData.acl.LICENSEE.includes("ADD")) {
    history.replace(from);
  }

  //--------------------------------------------------------------------------

  const licenseeStart = {
    licensee: {
      name: "",
      email: "",
      // isEmailVerified: false,
      mobile: "",
      // isMobileVerified: false,
      country: common.country,
      businessType: common.businessType[0],

      address: {
        text: "",
        pincode: "",
        coordinates: [0, 0],
        city: "",
        state: common.states[0],
        country: common.country,
      },
      radius: 100,
      bsbNumber: "",
      availability: true,
      workingDays: common.days,
      workingHours: common.hours,
      workingHoursStart: common.hoursStart,
      workingHoursEnd: common.hoursEnd,
      stripeAccountId: "",
      stripeAccountVerified: false,
      accountNumber: "",
      // mcc: "",
      // tosAcceptanceDate: "",
      // tosAcceptanceIP: "",
      taxId: "",

      logoLink: "",
      proofOfIncorporationLink: "",
    },
    employee: {
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

      photoLink: "",
      additionalDocumentLink: "",
    },
  };

  const [loadOnce, setLoadOnce] = useState(0);
  const [licenseeSignup, setLicenseeSignup] = useState(licenseeStart);
  const [sameAddress, setSameAddress] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [formValidErrorMessage, setFormValidErrorMessage] = useState({
    licensee: {
      name: "",
      email: "",
      mobile: "",
      country: "",
      businessType: "",

      address: {
        text: "",
        pincode: "",
        coordinates: "",
        city: "",
        state: "",
        country: "",
      },
      radius: "",
      bsbNumber: "",
      availability: "",
      workingDays: "",
      workingHoursStart: "",
      workingHoursEnd: "",
      stripeAccountId: "",
      stripeAccountVerified: "",
      accountNumber: "",
      // mcc: "",
      // tosAcceptanceDate: "",
      // tosAcceptanceIP: "",
      taxId: "",

      logo: "",
      proofOfIncorporation: "",
    },
    employee: {
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
    },
  });

  function checkSameAddress(value) {
    if (value) {
      setLicenseeSignup({
        ...licenseeSignup,
        employee: {
          ...licenseeSignup.employee,
          address: { ...licenseeSignup.licensee.address },
        },
      });
    }
    setSameAddress(value);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const isError =
      formValidErrorMessage.licensee.name !== "" ||
      formValidErrorMessage.licensee.email !== "" ||
      formValidErrorMessage.licensee.mobile !== "" ||
      formValidErrorMessage.licensee.country !== "" ||
      formValidErrorMessage.licensee.businessType !== "" ||
      formValidErrorMessage.licensee.address.text !== "" ||
      formValidErrorMessage.licensee.address.pincode !== "" ||
      formValidErrorMessage.licensee.address.coordinates !== "" ||
      formValidErrorMessage.licensee.address.city !== "" ||
      formValidErrorMessage.licensee.address.state !== "" ||
      formValidErrorMessage.licensee.address.country !== "" ||
      formValidErrorMessage.licensee.radius !== "" ||
      formValidErrorMessage.licensee.bsbNumber !== "" ||
      formValidErrorMessage.licensee.availability !== "" ||
      formValidErrorMessage.licensee.workingDays !== "" ||
      formValidErrorMessage.licensee.workingHoursStart !== "" ||
      formValidErrorMessage.licensee.workingHoursEnd !== "" ||
      formValidErrorMessage.licensee.stripeAccountId !== "" ||
      formValidErrorMessage.licensee.stripeAccountVerified !== "" ||
      formValidErrorMessage.licensee.accountNumber !== "" ||
      formValidErrorMessage.licensee.taxId !== "" ||
      formValidErrorMessage.licensee.logo !== "" ||
      formValidErrorMessage.licensee.proofOfIncorporation !== "" ||
      formValidErrorMessage.employee.name !== "" ||
      formValidErrorMessage.employee.email !== "" ||
      formValidErrorMessage.employee.mobile !== "" ||
      formValidErrorMessage.employee.country !== "" ||
      formValidErrorMessage.employee.dob !== "" ||
      formValidErrorMessage.employee.address.text !== "" ||
      formValidErrorMessage.employee.address.pincode !== "" ||
      formValidErrorMessage.employee.address.coordinates !== "" ||
      formValidErrorMessage.employee.address.city !== "" ||
      formValidErrorMessage.employee.address.state !== "" ||
      formValidErrorMessage.employee.address.country !== "" ||
      formValidErrorMessage.employee.driverLicense.card !== "" ||
      formValidErrorMessage.employee.driverLicense.expiry !== "" ||
      formValidErrorMessage.employee.driverLicense.state !== "" ||
      formValidErrorMessage.employee.photo !== "" ||
      formValidErrorMessage.employee.driverLicenseScan !== "" ||
      formValidErrorMessage.employee.additionalDocument !== "";

    if (isError) {
      return false;
    }

    //---------------------------------------------------------------------------

    // console.log("licenseeSignup.employee.driverLicense.expiry", licenseeSignup.employee.driverLicense.expiry);

    licenseeSignup.employee.dob = moment(licenseeSignup.employee.dob).format(
      "YYYY-MM-DD"
    );
    // licenseeSignup.employee.driverLicense.expiry = moment(licenseeSignup.employee.driverLicense.expiry, "YYYY-MM").format("YYYY/MM");
    licenseeSignup.employee.driverLicense.expiry = moment(
      licenseeSignup.employee.driverLicense.expiry,
      "YYYY-MM"
    ).format("YYYY-MM");

    // console.log("licenseeSignup.employee.driverLicense.expiry", licenseeSignup.employee.driverLicense.expiry);
    licenseeSignup.licensee.workingHoursStart = moment(
      "2017-09-04 " + licenseeSignup.licensee.workingHoursStart
    )
      .utc()
      .format("HH:mm");
    licenseeSignup.licensee.workingHoursEnd = moment(
      "2017-09-04 " + licenseeSignup.licensee.workingHoursEnd
    )
      .utc()
      .format("HH:mm");
    licenseeSignup.licensee.workingHours = `${licenseeSignup.licensee.workingHoursStart.replace(
      ":",
      ""
    )}-${licenseeSignup.licensee.workingHoursEnd.replace(":", "")}`;
    licenseeSignup.licensee.mobile = licenseeSignup.licensee.mobile.replace(
      "+61",
      ""
    );
    licenseeSignup.employee.mobile = licenseeSignup.employee.mobile.replace(
      "+61",
      ""
    );
    //---------------------------------------------------------------------------

    const formData = new FormData();
    console.log("reqbody before sending", licenseeSignup);
    formData.append("reqBody", JSON.stringify(licenseeSignup));

    // append files --------------------------------------------------

    if (licenseeSignup.licensee.logo) {
      formData.append(
        "licenseeLogo",
        licenseeSignup.licensee.logo,
        licenseeSignup.licensee.logo.name
      );
    }
    if (licenseeSignup.licensee.proofOfIncorporation) {
      formData.append(
        "licenseeProofOfIncorporation",
        licenseeSignup.licensee.proofOfIncorporation,
        licenseeSignup.licensee.proofOfIncorporation.name
      );
    }

    if (licenseeSignup.employee.photo) {
      formData.append(
        "employeePhoto",
        licenseeSignup.employee.photo,
        licenseeSignup.employee.photo.name
      );
    }
    if (licenseeSignup.employee.driverLicenseScan) {
      formData.append(
        "employeeDriverLicenseScan",
        licenseeSignup.employee.driverLicenseScan,
        licenseeSignup.employee.driverLicenseScan.name
      );
    }
    if (licenseeSignup.employee.additionalDocument) {
      formData.append(
        "employeeAdditionalDocumentScan",
        licenseeSignup.employee.additionalDocument,
        licenseeSignup.employee.additionalDocument.name
      );
    }

    let requestOptions = {
      method: "POST",
      headers: {
        ...authHeader(),
      },
      body: formData,
    };
    console.log("requestOptions", requestOptions);

    fetch(addLicensee, requestOptions)
      .then(handleFetchErrors)
      .then((res) => res.json())
      .then((res) => {
        console.log(`${addLicensee} Response`, res);

        if (res.success) {
          // const licenseeObj = res.licenseeObj;
          // const employeeObj = res.employeeObj;

          setErrorMessage("");
          setSuccessMessage("Successfully saved Licensee data");

          setTimeout(() => {
            setSuccessMessage("");
            history.push("/adminpanel/licensees");
          }, 5000);
        }

        licenseeSignup.employee.driverLicense.expiry = moment()
          .add(1, "year")
          .format("YYYY-MM");
      })
      .catch((error) => {
        console.log(`${addLicensee} Error`, error);

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
          Licensee Signup
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
            <Typography component="h5">Licensee</Typography>

            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="licensee-name"
              label="Name"
              name="licensee-name"
              autoComplete="licensee-name"
              autoFocus
              error={formValidErrorMessage.licensee.name !== ""}
              helperText={formValidErrorMessage.licensee.name}
              value={licenseeSignup.licensee.name}
              onChange={(e) => {
                setLicenseeSignup({
                  ...licenseeSignup,
                  licensee: {
                    ...licenseeSignup.licensee,
                    name: e.target.value,
                  },
                });
              }}
            />

            <FormGroup className="SectionContainer">
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                id="licensee-email"
                label="Email"
                name="licensee-email"
                autoComplete="licensee-email"
                autoFocus
                error={formValidErrorMessage.licensee.email !== ""}
                helperText={formValidErrorMessage.licensee.email}
                value={licenseeSignup.licensee.email}
                onChange={(e) => {
                  setLicenseeSignup({
                    ...licenseeSignup,
                    licensee: {
                      ...licenseeSignup.licensee,
                      email: e.target.value,
                    },
                  });
                }}
              />

              {/* <FormControlLabel
                control={
                  <Checkbox
                    disabled={true}
                    checked={licenseeSignup.licensee.isEmailVerified}
                    name="licensee-isEmailVerified"
                    onChange={(e) => {
                      console.log("onChange isEmailVerified", e);
                      setLicenseeSignup({
                        ...licenseeSignup,
                        licensee: {
                          ...licenseeSignup.licensee,
                          isEmailVerified: !licenseeSignup.licensee
                            .isEmailVerified,
                        },
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
                id="licensee-mobile"
                label="Mobile"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">+61</InputAdornment>
                  ),
                }}
                name="licensee-mobile"
                autoComplete="licensee-mobile"
                autoFocus
                error={formValidErrorMessage.licensee.mobile !== ""}
                helperText={
                  "Remove / don't add country code in text (Country code is automatically attached"
                }
                value={licenseeSignup.licensee.mobile}
                onChange={(e) => {
                  setLicenseeSignup({
                    ...licenseeSignup,
                    licensee: {
                      ...licenseeSignup.licensee,
                      mobile: e.target.value,
                    },
                  });
                }}
              />

              {/* <FormControlLabel
                control={
                  <Checkbox
                    disabled={true}
                    checked={licenseeSignup.licensee.isMobileVerified}
                    name="licensee-isMobileVerified"
                    onChange={(e) => {
                      console.log("onChange isMobileVerified", e);
                      setLicenseeSignup({
                        ...licenseeSignup,
                        licensee: {
                          ...licenseeSignup.licensee,
                          isMobileVerified: !licenseeSignup.licensee
                            .isMobileVerified,
                        },
                      });
                    }}
                  />
                }
                label="Is Mobile Verified?"
              /> */}
            </FormGroup>

            {common.businessType && (
              <FormControl required>
                <InputLabel id="licensee-businessType-label">
                  Business Type
                </InputLabel>
                <Select
                  labelId="licensee-businessType-label"
                  id="licensee-businessType-Select"
                  value={licenseeSignup.licensee.businessType}
                  onChange={(e) => {
                    setLicenseeSignup({
                      ...licenseeSignup,
                      licensee: {
                        ...licenseeSignup.licensee,
                        businessType: e.target.value,
                      },
                    });
                  }}
                  className={classes.selectEmpty}
                >
                  {common.businessType.map(
                    (businessType, businessTypeIndex) => {
                      // console.log("businessType", businessType, businessTypeIndex);
                      return (
                        <MenuItem
                          key={`businessType-${businessTypeIndex}`}
                          value={businessType}
                        >
                          {businessType}
                        </MenuItem>
                      );
                    }
                  )}
                </Select>
              </FormControl>
            )}

            {/* <TextField
              variant="outlined"
              margin="normal"
              fullWidth
              // disabled={true}
              id="licensee-mcc"
              label="MCC"
              name="licensee-mcc"
              autoComplete="licensee-mcc"
              autoFocus
              error={formValidErrorMessage.licensee.mcc !== ""}
              helperText={formValidErrorMessage.licensee.mcc}
              value={licenseeSignup.licensee.mcc}
              onChange={(e) => {
                setLicenseeSignup({
                  ...licenseeSignup,
                  licensee: {
                    ...licenseeSignup.licensee,
                    mcc: e.target.value,
                  },
                });
              }}
            /> */}

            <Box className="SectionContainer">
              <Typography variant="subtitle1">Address</Typography>

              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                id="licensee-address_text"
                label="Address Line"
                name="licensee-address_text"
                autoComplete="licensee-address_text"
                autoFocus
                error={formValidErrorMessage.licensee.address.text !== ""}
                helperText={formValidErrorMessage.licensee.address.text}
                value={licenseeSignup.licensee.address.text}
                onChange={(e) => {
                  setLicenseeSignup({
                    ...licenseeSignup,
                    licensee: {
                      ...licenseeSignup.licensee,
                      address: {
                        ...licenseeSignup.licensee.address,
                        text: e.target.value,
                      },
                    },
                  });
                }}
              />

              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                id="licensee-address_pincode"
                label="Pincode"
                name="licensee-address_pincode"
                autoComplete="licensee-address_pincode"
                autoFocus
                error={formValidErrorMessage.licensee.address.pincode !== ""}
                helperText={formValidErrorMessage.licensee.address.pincode}
                value={licenseeSignup.licensee.address.pincode}
                onChange={(e) => {
                  setLicenseeSignup({
                    ...licenseeSignup,
                    licensee: {
                      ...licenseeSignup.licensee,
                      address: {
                        ...licenseeSignup.licensee.address,
                        pincode: e.target.value,
                      },
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
                  id="licensee-address_coordinates-latitude"
                  label="Coordinates (Latitude)"
                  name="licensee-address_coordinates-latitude"
                  // autoComplete="licensee-address_coordinates"
                  autoFocus
                  error={
                    formValidErrorMessage.licensee.address.coordinates !== ""
                  }
                  helperText={
                    formValidErrorMessage.licensee.address.coordinates
                  }
                  value={licenseeSignup.licensee.address.coordinates[0]}
                  type="number"
                  step="any"
                  onChange={(e) => {
                    setLicenseeSignup({
                      ...licenseeSignup,
                      licensee: {
                        ...licenseeSignup.licensee,
                        address: {
                          ...licenseeSignup.licensee.address,
                          coordinates: e.target.value,
                        },
                      },
                    });
                  }}
                  onChange={(e) => {
                    let oldCoordinates =
                      licenseeSignup.licensee.address.coordinates;
                    let newLatitude = parseFloat(e.target.value);
                    let newCoordinates = oldCoordinates;
                    newCoordinates[0] = newLatitude;
                    setLicenseeSignup({
                      ...licenseeSignup,
                      licensee: {
                        ...licenseeSignup.licensee,
                        address: {
                          ...licenseeSignup.licensee.address,
                          coordinates: newCoordinates,
                        },
                      },
                    });
                  }}
                />
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  // fullWidth
                  id="licensee-address_coordinates-longitude"
                  label="Coordinates (Longitude)"
                  name="licensee-address_coordinates-longitude"
                  // autoComplete="licensee-address_coordinates"
                  autoFocus
                  error={
                    formValidErrorMessage.licensee.address.coordinates !== ""
                  }
                  helperText={
                    formValidErrorMessage.licensee.address.coordinates
                  }
                  type="number"
                  step="any"
                  value={licenseeSignup.licensee.address.coordinates[1]}
                  // onChange={(e) => {
                  //   setLicenseeSignup({
                  //     ...licenseeSignup,
                  //     licensee: {
                  //       ...licenseeSignup.licensee,
                  //       address: {
                  //         ...licenseeSignup.licensee.address,
                  //         coordinates: e.target.value,
                  //       },
                  //     },
                  //   });
                  // }}
                  onChange={(e) => {
                    let oldCoordinates =
                      licenseeSignup.licensee.address.coordinates;
                    let newLongitude = parseFloat(e.target.value);
                    let newCoordinates = oldCoordinates;
                    newCoordinates[1] = newLongitude;
                    setLicenseeSignup({
                      ...licenseeSignup,
                      licensee: {
                        ...licenseeSignup.licensee,
                        address: {
                          ...licenseeSignup.licensee.address,
                          coordinates: newCoordinates,
                        },
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
                id="licensee-address_city"
                label="City"
                name="licensee-address_city"
                autoComplete="licensee-address_city"
                autoFocus
                error={formValidErrorMessage.licensee.address.city !== ""}
                helperText={formValidErrorMessage.licensee.address.city}
                value={licenseeSignup.licensee.address.city}
                onChange={(e) => {
                  setLicenseeSignup({
                    ...licenseeSignup,
                    licensee: {
                      ...licenseeSignup.licensee,
                      address: {
                        ...licenseeSignup.licensee.address,
                        city: e.target.value,
                      },
                    },
                  });
                }}
              />

              {common.states && (
                <FormControl required>
                  <InputLabel id="licensee-address_state-label">
                    State
                  </InputLabel>
                  <Select
                    labelId="licensee-address_state-label"
                    id="licensee-address_state-Select"
                    value={licenseeSignup.licensee.address.state}
                    onChange={(e) => {
                      setLicenseeSignup({
                        ...licenseeSignup,
                        licensee: {
                          ...licenseeSignup.licensee,
                          address: {
                            ...licenseeSignup.licensee.address,
                            state: e.target.value,
                          },
                        },
                      });
                    }}
                    className={classes.selectEmpty}
                  >
                    {common.states.map((state, stateIndex) => {
                      // console.log("state", state, stateIndex);
                      return (
                        <MenuItem key={`state-${stateIndex}`} value={state}>
                          {state}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              )}
            </Box>

            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="licensee-radius"
              label="Radius for Trailer Dropoff ( in kilometers )"
              name="licensee-radius"
              autoComplete="licensee-radius"
              autoFocus
              error={formValidErrorMessage.licensee.radius !== ""}
              helperText={formValidErrorMessage.licensee.radius}
              value={licenseeSignup.licensee.radius}
              onChange={(e) => {
                setLicenseeSignup({
                  ...licenseeSignup,
                  licensee: {
                    ...licenseeSignup.licensee,
                    radius: parseInt(e.target.value),
                  },
                });
              }}
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={licenseeSignup.licensee.availability}
                  name="licensee-availability"
                  onChange={(e) => {
                    console.log("onChange availability", e);
                    setLicenseeSignup({
                      ...licenseeSignup,
                      licensee: {
                        ...licenseeSignup.licensee,
                        availability: !licenseeSignup.licensee.availability,
                      },
                    });
                  }}
                />
              }
              label="Is Licensee Available?"
            />

            <FormGroup className="SectionContainer">
              {common.days && (
                <FormControl required>
                  <InputLabel id="licensee-workingDays-label">
                    Working Days
                  </InputLabel>
                  <Select
                    multiple={true}
                    labelId="licensee-workingDays-label"
                    id="licensee-workingDays-Select"
                    value={licenseeSignup.licensee.workingDays}
                    onChange={(e) => {
                      console.log("e.target", e.target);
                      /* const { options } = e.target;
                                            console.log("workingDays options", options);
                                            const value = [];
                                            for (let i = 0, l = options.length; i < l; i += 1) {
                                                if (options[i].selected) {
                                                    value.push(options[i].value);
                                                }
                                            }
                                            console.log("workingDays selected", value); */

                      setLicenseeSignup({
                        ...licenseeSignup,
                        licensee: {
                          ...licenseeSignup.licensee,
                          workingDays: e.target.value,
                        },
                      });
                    }}
                    className={classes.selectEmpty}
                  >
                    {common.days.map((day, dayIndex) => {
                      // console.log("day", day, dayIndex);
                      return (
                        <MenuItem key={`day-${dayIndex}`} value={day}>
                          {day}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              )}

              <label>Working Hours</label>

              <TextField
                variant="outlined"
                margin="normal"
                aria-label="WorkingHours Start"
                required
                fullWidth
                type="time"
                id="licensee-workingHours-start"
                label="WorkingHours Start"
                name="licensee-workingHours-start"
                autoComplete="licensee-workingHours-start"
                autoFocus
                error={formValidErrorMessage.licensee.workingHoursStart !== ""}
                helperText={formValidErrorMessage.licensee.workingHoursStart}
                value={licenseeSignup.licensee.workingHoursStart}
                onChange={(e) => {
                  console.log(
                    "WorkingHours Start",
                    moment.utc(e.target.value).format("hh:mm")
                  );
                  setLicenseeSignup({
                    ...licenseeSignup,
                    licensee: {
                      ...licenseeSignup.licensee,
                      workingHoursStart: e.target.value,
                    },
                  });
                }}
              />

              <TextField
                variant="outlined"
                margin="normal"
                aria-label="WorkingHours End"
                required
                fullWidth
                type="time"
                id="licensee-workingHours-end"
                label="WorkingHours End"
                name="licensee-workingHours-end"
                autoComplete="licensee-workingHours-end"
                autoFocus
                error={formValidErrorMessage.licensee.workingHoursEnd !== ""}
                helperText={formValidErrorMessage.licensee.workingHoursEnd}
                value={licenseeSignup.licensee.workingHoursEnd}
                onChange={(e) => {
                  console.log(
                    "WorkingHours End",
                    moment("2017-09-04 " + e.target.value)
                      .utc()
                      .format("HH:mm")
                  );
                  setLicenseeSignup({
                    ...licenseeSignup,
                    licensee: {
                      ...licenseeSignup.licensee,
                      workingHoursEnd: e.target.value,
                    },
                  });
                }}
              />
            </FormGroup>

            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="licensee-bsbNumber"
              label="BSB Number"
              name="licensee-bsbNumber"
              autoComplete="licensee-bsbNumber"
              autoFocus
              error={formValidErrorMessage.licensee.bsbNumber !== ""}
              helperText={formValidErrorMessage.licensee.bsbNumber}
              value={licenseeSignup.licensee.bsbNumber}
              onChange={(e) => {
                setLicenseeSignup({
                  ...licenseeSignup,
                  licensee: {
                    ...licenseeSignup.licensee,
                    bsbNumber: e.target.value,
                  },
                });
              }}
            />

            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="licensee-accountNumber"
              label="Account Number"
              name="licensee-accountNumber"
              autoComplete="licensee-accountNumber"
              autoFocus
              error={formValidErrorMessage.licensee.accountNumber !== ""}
              helperText={formValidErrorMessage.licensee.accountNumber}
              value={licenseeSignup.licensee.accountNumber}
              onChange={(e) => {
                setLicenseeSignup({
                  ...licenseeSignup,
                  licensee: {
                    ...licenseeSignup.licensee,
                    accountNumber: e.target.value,
                  },
                });
              }}
            />

            <TextField
              variant="outlined"
              margin="normal"
              fullWidth
              type="url"
              id="licensee-url"
              label="Website URL"
              name="licensee-url"
              autoComplete="licensee-url"
              autoFocus
              error={formValidErrorMessage.licensee.url !== ""}
              helperText={formValidErrorMessage.licensee.url}
              value={licenseeSignup.licensee.url}
              onChange={(e) => {
                setLicenseeSignup({
                  ...licenseeSignup,
                  licensee: {
                    ...licenseeSignup.licensee,
                    url: e.target.value,
                  },
                });
              }}
            />

            <TextField
              variant="outlined"
              margin="normal"
              fullWidth
              id="licensee-taxId"
              label="Tax ID"
              name="licensee-taxId"
              autoComplete="licensee-taxId"
              autoFocus
              error={formValidErrorMessage.licensee.taxId !== ""}
              helperText={formValidErrorMessage.licensee.taxId}
              value={licenseeSignup.licensee.taxId}
              onChange={(e) => {
                setLicenseeSignup({
                  ...licenseeSignup,
                  licensee: {
                    ...licenseeSignup.licensee,
                    taxId: e.target.value,
                  },
                });
              }}
            />

            <Box className="SectionContainer">
              <Typography variant="subtitle1">Logo</Typography>

              {licenseeSignup.licensee.logoLink &&
                !licenseeSignup.licensee.logo && (
                  <Box className="SectionContainer">
                    <a href={licenseeSignup.licensee.logoLink}>Logo</a>
                  </Box>
                )}

              <input
                accept="image/jpeg, image/jpg, image/png"
                id="licensee-logo"
                multiple
                type="file"
                name="licensee-logo"
                onChange={(e) => {
                  console.log("licensee-logo", e.target.files);
                  setLicenseeSignup({
                    ...licenseeSignup,
                    licensee: {
                      ...licenseeSignup.licensee,
                      photo: e.target.files[0],
                    },
                  });
                }}
              />
            </Box>

            <Box className="SectionContainer">
              <Typography variant="subtitle1">
                Proof Of Incorporation
              </Typography>

              {licenseeSignup.licensee.proofOfIncorporationLink &&
                !licenseeSignup.licensee.proofOfIncorporation && (
                  <Box className="SectionContainer">
                    <a href={licenseeSignup.licensee.proofOfIncorporationLink}>
                      Proof Of Incorporation
                    </a>
                  </Box>
                )}

              <input
                accept="image/jpeg, image/jpg, image/png, image/pdf"
                id="licensee-proofOfIncorporation"
                multiple
                type="file"
                name="licensee-proofOfIncorporation"
                onChange={(e) => {
                  console.log("licensee-proofOfIncorporation", e.target.files);
                  setLicenseeSignup({
                    ...licenseeSignup,
                    licensee: {
                      ...licenseeSignup.licensee,
                      proofOfIncorporation: e.target.files[0],
                    },
                  });
                }}
              />
            </Box>
          </Box>

          <Box className="SectionContainer">
            <Typography component="h5">Employee</Typography>

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
              error={formValidErrorMessage.employee.name !== ""}
              helperText={formValidErrorMessage.employee.name}
              value={licenseeSignup.employee.name}
              onChange={(e) => {
                setLicenseeSignup({
                  ...licenseeSignup,
                  employee: {
                    ...licenseeSignup.employee,
                    name: e.target.value,
                  },
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
                error={formValidErrorMessage.employee.email !== ""}
                helperText={formValidErrorMessage.employee.email}
                value={licenseeSignup.employee.email}
                onChange={(e) => {
                  setLicenseeSignup({
                    ...licenseeSignup,
                    employee: {
                      ...licenseeSignup.employee,
                      email: e.target.value,
                    },
                  });
                }}
              />

              {/* <FormControlLabel
                control={
                  <Checkbox
                    disabled={true}
                    checked={licenseeSignup.employee.isEmailVerified}
                    name="employee-isEmailVerified"
                    onChange={(e) => {
                      console.log("onChange isEmailVerified", e);
                      setLicenseeSignup({
                        ...licenseeSignup,
                        employee: {
                          ...licenseeSignup.employee,
                          isEmailVerified: !licenseeSignup.employee
                            .isEmailVerified,
                        },
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
                error={formValidErrorMessage.employee.mobile !== ""}
                helperText={
                  "Remove / don't add country code in text (Country code is automatically attached"
                }
                value={licenseeSignup.employee.mobile}
                onChange={(e) => {
                  setLicenseeSignup({
                    ...licenseeSignup,
                    employee: {
                      ...licenseeSignup.employee,
                      mobile: e.target.value,
                    },
                  });
                }}
              />

              {/* <FormControlLabel
                control={
                  <Checkbox
                    disabled={true}
                    checked={licenseeSignup.employee.isMobileVerified}
                    name="employee-isMobileVerified"
                    onChange={(e) => {
                      console.log("onChange isMobileVerified", e);
                      setLicenseeSignup({
                        ...licenseeSignup,
                        employee: {
                          ...licenseeSignup.employee,
                          isMobileVerified: !licenseeSignup.employee
                            .isMobileVerified,
                        },
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
              error={formValidErrorMessage.employee.dob !== ""}
              helperText={formValidErrorMessage.employee.dob}
              value={licenseeSignup.employee.dob}
              onChange={(e) => {
                setLicenseeSignup({
                  ...licenseeSignup,
                  employee: {
                    ...licenseeSignup.employee,
                    dob: e.target.value,
                  },
                });
              }}
            />

            <Box className="SectionContainer">
              <Typography variant="subtitle1">Personal Address</Typography>
              {licenseeSignup.licensee.businessType === "individual" && (
                <FormControlLabel
                  control={
                    <Checkbox
                      // disabled={true}
                      checked={sameAddress}
                      name="employee-sameAddress"
                      onChange={(e) => {
                        console.log("onChange sameAddress", e);
                        checkSameAddress(e.target.checked);
                      }}
                    />
                  }
                  label="Set address same as the above?"
                />
              )}
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
                error={formValidErrorMessage.employee.address.text !== ""}
                helperText={formValidErrorMessage.employee.address.text}
                value={licenseeSignup.employee.address.text}
                onChange={(e) => {
                  setLicenseeSignup({
                    ...licenseeSignup,
                    employee: {
                      ...licenseeSignup.employee,
                      address: {
                        ...licenseeSignup.employee.address,
                        text: e.target.value,
                      },
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
                error={formValidErrorMessage.employee.address.pincode !== ""}
                helperText={formValidErrorMessage.employee.address.pincode}
                value={licenseeSignup.employee.address.pincode}
                onChange={(e) => {
                  setLicenseeSignup({
                    ...licenseeSignup,
                    employee: {
                      ...licenseeSignup.employee,
                      address: {
                        ...licenseeSignup.employee.address,
                        pincode: e.target.value,
                      },
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
                  id="employee-address_coordinates"
                  label="Coordinates (Latitude)"
                  name="employee-address_coordinates-latitude"
                  type="number"
                  step="any"
                  // autoComplete="employee-address_coordinates-latitude"
                  autoFocus
                  error={
                    formValidErrorMessage.employee.address.coordinates !== ""
                  }
                  helperText={
                    formValidErrorMessage.employee.address.coordinates
                  }
                  value={licenseeSignup.employee.address.coordinates[0]}
                  onChange={(e) => {
                    let oldCoordinates =
                      licenseeSignup.employee.address.coordinates;
                    let newLatitude = parseFloat(e.target.value);
                    let newCoordinates = oldCoordinates;
                    newCoordinates[0] = newLatitude;
                    setLicenseeSignup({
                      ...licenseeSignup,
                      employee: {
                        ...licenseeSignup.employee,
                        address: {
                          ...licenseeSignup.employee.address,
                          coordinates: newCoordinates,
                        },
                      },
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
                  name="employee-address_coordinates"
                  type="number"
                  step="any"
                  // autoComplete="employee-address_coordinates"
                  autoFocus
                  error={
                    formValidErrorMessage.employee.address.coordinates !== ""
                  }
                  helperText={
                    formValidErrorMessage.employee.address.coordinates
                  }
                  value={licenseeSignup.employee.address.coordinates[1]}
                  onChange={(e) => {
                    let oldCoordinates =
                      licenseeSignup.employee.address.coordinates;
                    let newLongitude = parseFloat(e.target.value);
                    let newCoordinates = oldCoordinates;
                    newCoordinates[1] = newLongitude;
                    setLicenseeSignup({
                      ...licenseeSignup,
                      employee: {
                        ...licenseeSignup.employee,
                        address: {
                          ...licenseeSignup.employee.address,
                          coordinates: newCoordinates,
                        },
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
                error={formValidErrorMessage.employee.address.city !== ""}
                helperText={formValidErrorMessage.employee.address.city}
                value={licenseeSignup.employee.address.city}
                onChange={(e) => {
                  setLicenseeSignup({
                    ...licenseeSignup,
                    employee: {
                      ...licenseeSignup.employee,
                      address: {
                        ...licenseeSignup.employee.address,
                        city: e.target.value,
                      },
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
                    value={licenseeSignup.employee.address.state}
                    onChange={(e) => {
                      setLicenseeSignup({
                        ...licenseeSignup,
                        employee: {
                          ...licenseeSignup.employee,
                          address: {
                            ...licenseeSignup.employee.address,
                            state: e.target.value,
                          },
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
                error={formValidErrorMessage.employee.driverLicense.card !== ""}
                helperText={formValidErrorMessage.employee.driverLicense.card}
                value={licenseeSignup.employee.driverLicense.card}
                onChange={(e) => {
                  setLicenseeSignup({
                    ...licenseeSignup,
                    employee: {
                      ...licenseeSignup.employee,
                      driverLicense: {
                        ...licenseeSignup.employee.driverLicense,
                        card: e.target.value,
                      },
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
                error={
                  formValidErrorMessage.employee.driverLicense.expiry !== ""
                }
                helperText={formValidErrorMessage.employee.driverLicense.expiry}
                value={licenseeSignup.employee.driverLicense.expiry}
                onChange={(e) => {
                  setLicenseeSignup({
                    ...licenseeSignup,
                    employee: {
                      ...licenseeSignup.employee,
                      driverLicense: {
                        ...licenseeSignup.employee.driverLicense,
                        expiry: e.target.value,
                      },
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
                    value={licenseeSignup.employee.driverLicense.state}
                    onChange={(e) => {
                      setLicenseeSignup({
                        ...licenseeSignup,
                        employee: {
                          ...licenseeSignup.employee,
                          driverLicense: {
                            ...licenseeSignup.employee.driverLicense,
                            state: e.target.value,
                          },
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

                {licenseeSignup.employee.driverLicense.scanLink &&
                  !licenseeSignup.employee.driverLicenseScan && (
                    <Box className="SectionContainer">
                      <a href={licenseeSignup.employee.driverLicense.scanLink}>
                        Scan
                      </a>
                    </Box>
                  )}

                <input
                  accept="image/jpeg, image/jpg, image/png, application/pdf"
                  id="employee-driverLicenseScan"
                  type="file"
                  name="employee-driverLicenseScan"
                  onChange={(e) => {
                    console.log("employee-driverLicenseScan", e.target.files);
                    setLicenseeSignup({
                      ...licenseeSignup,
                      employee: {
                        ...licenseeSignup.employee,
                        driverLicenseScan: e.target.files[0],
                      },
                    });
                  }}
                />
              </Box>
            </Box>

            <Box className="SectionContainer">
              <Typography variant="subtitle1">Photo</Typography>

              {licenseeSignup.employee.photoLink &&
                !licenseeSignup.employee.photo && (
                  <Box className="SectionContainer">
                    <a href={licenseeSignup.employee.photoLink}>Photo</a>
                  </Box>
                )}

              <input
                accept="image/jpeg, image/jpg, image/png"
                id="employee-photo"
                type="file"
                name="employee-photo"
                onChange={(e) => {
                  console.log("employee-photo", e.target.files);
                  setLicenseeSignup({
                    ...licenseeSignup,
                    employee: {
                      ...licenseeSignup.employee,
                      photo: e.target.files[0],
                    },
                  });
                }}
              />
            </Box>

            <Box className="SectionContainer">
              <Typography variant="subtitle1">Additional Document</Typography>

              {licenseeSignup.employee.additionalDocumentLink &&
                !licenseeSignup.employee.additionalDocument && (
                  <Box className="SectionContainer">
                    <a href={licenseeSignup.employee.additionalDocumentLink}>
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
                  setLicenseeSignup({
                    ...licenseeSignup,
                    employee: {
                      ...licenseeSignup.employee,
                      additionalDocument: e.target.files[0],
                    },
                  });
                }}
              />
            </Box>
          </Box>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
            onClick={handleSubmit}
          >
            Signup
          </Button>
        </form>
      </div>
    </Container>
  );
}
