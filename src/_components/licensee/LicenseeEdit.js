/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import { useLocation, useHistory, useParams } from "react-router-dom";
import moment from "moment";
import { toast } from "react-toastify";
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
const getLicensee = `${apiUrl}/admin/licensee`; // GET
const putLicensee = `${apiUrl}/admin/licensee`; // POST

export default function LicenseeEdit(props) {
  console.log("LicenseeEdit", props);

  const classes = useStyles();

  let userData = localStorage.getItem("user");
  userData = JSON.parse(userData);
  // console.log("userData", userData);

  let history = useHistory();
  // console.log("history", history);

  let location = useLocation();
  // console.log("location", location);

  const { licenseeId } = useParams();
  // console.log("licenseeId", licenseeId);

  let { from } = location.state || { from: { pathname: "/adminpanel/" } };
  if (licenseeId && !userData.acl.LICENSEE.includes("UPDATE")) {
    history.replace(from);
  }

  //--------------------------------------------------------------------------

  const licenseeStart = {
    licensee: {
      name: "",
      email: "",
      isEmailVerified: false,
      mobile: "",
      isMobileVerified: false,
      country: common.country,
      businessType: common.businessType[0],

      address: {
        text: "",
        pincode: "",
        coordinates: [],
        city: "",
        state: common.states[0],
        country: common.country,
      },
      radius: 100,
      availability: true,

      workingDays: common.days,
      workingHours: common.hours,
      workingHoursStart: common.hoursStart,
      workingHoursEnd: common.hoursEnd,

      bsbNumber: "",
      accountNumber: "",

      taxId: "",

      stripeAccountId: "",
      stripeAccountVerified: false,
      // mcc: "",
      // productDescription: "",
      // tosAcceptanceDate: "",
      // tosAcceptanceIP: "",

      logoLink: "",
      proofOfIncorporationLink: "",
    },
  };

  const loadOnce = 0;
  const [licenseeSignup, setLicenseeSignup] = useState(licenseeStart);

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  //--------------------------------------------------------------------------

  useEffect(() => {
    if (licenseeId) {
      const requestOptions = {
        method: "GET",
        headers: authHeader(),
      };
      fetch(`${getLicensee}?id=${licenseeId}`, requestOptions)
        .then(handleFetchErrors)
        .then((res) => res.json())
        .then((res) => {
          console.log("Licensee API Call Response", res.licenseeObj);
          const licenseeObj = res.licenseeObj;

          const workingHoursSplit = licenseeObj.workingHours.split("-");
          const workingHoursStart = `${workingHoursSplit[0].substring(
            0,
            2
          )}:${workingHoursSplit[0].substring(3, 5)}`;
          const workingHoursEnd = `${workingHoursSplit[1].substring(
            0,
            2
          )}:${workingHoursSplit[1].substring(3, 5)}`;

          setLicenseeSignup({
            licensee: {
              name: licenseeObj.name,
              email: licenseeObj.email,
              isEmailVerified: licenseeObj.isEmailVerified,
              mobile: licenseeObj.mobile.replace("+61", ""),
              isMobileVerified: licenseeObj.isMobileVerified,
              country: licenseeObj.country,
              businessType: licenseeObj.businessType,

              address: {
                text: licenseeObj.address.text,
                pincode: licenseeObj.address.pincode,
                coordinates: licenseeObj.address.coordinates,
                city: licenseeObj.address.city,
                state: licenseeObj.address.state,
                country: licenseeObj.address.country,
              },
              radius: licenseeObj.radius,
              availability: licenseeObj.availability,

              workingDays: licenseeObj.workingDays,
              workingHours: licenseeObj.workingHours,
              workingHoursStart: workingHoursStart,
              workingHoursEnd: workingHoursEnd,

              bsbNumber: licenseeObj.bsbNumber,
              accountNumber: licenseeObj.accountNumber,

              taxId: licenseeObj.taxId,

              stripeAccountId: licenseeObj.stripeAccountId,
              stripeAccountVerified: licenseeObj.stripeAccountVerified,
              // mcc: licenseeObj.mcc,
              // productDescription: licenseeObj.productDescription,
              // tosAcceptanceDate: licenseeObj.tosAcceptanceDate,
              // tosAcceptanceIP: licenseeObj.tosAcceptanceIP,

              logoLink: licenseeObj.logo,
              proofOfIncorporationLink: licenseeObj.proofOfIncorporation
                ? licenseeObj.proofOfIncorporation.data
                : "",
            },
          });
        })
        .catch((err) => {
          console.log("Error occurred while fetching Licensee data", err);
        });
    }
  }, [loadOnce]);

  //--------------------------------------------------------------------------

  const formValidErrorMessage = {
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
      availability: "",

      workingDays: "",
      workingHoursStart: "",
      workingHoursEnd: "",

      bsbNumber: "",
      accountNumber: "",
      taxId: "",

      stripeAccountId: "",
      stripeAccountVerified: "",
      // mcc: "",
      // productDescription: "",
      // tosAcceptanceDate: "",
      // tosAcceptanceIP: "",

      logo: "",
      proofOfIncorporation: "",
    },
  };

  async function handleSubmit(e) {
    e.preventDefault();

    // const isError = (
    //     (formValidErrorMessage.licensee.name !== "") ||
    //     (formValidErrorMessage.licensee.email !== "") ||
    //     (formValidErrorMessage.licensee.mobile !== "") ||
    //     (formValidErrorMessage.licensee.country !== "") ||

    //     (formValidErrorMessage.licensee.businessType !== "") ||

    //     (formValidErrorMessage.licensee.address.text !== "") ||
    //     (formValidErrorMessage.licensee.address.pincode !== "") ||
    //     (formValidErrorMessage.licensee.address.coordinates !== "") ||
    //     (formValidErrorMessage.licensee.address.city !== "") ||
    //     (formValidErrorMessage.licensee.address.state !== "") ||
    //     (formValidErrorMessage.licensee.address.country !== "") ||

    //     (formValidErrorMessage.licensee.radius !== "") ||
    //     (formValidErrorMessage.licensee.availability !== "") ||

    //     (formValidErrorMessage.licensee.workingDays !== "") ||
    //     (formValidErrorMessage.licensee.workingHoursStart !== "") ||
    //     (formValidErrorMessage.licensee.workingHoursEnd !== "") ||

    //     (formValidErrorMessage.licensee.bsbNumber !== "") ||
    //     (formValidErrorMessage.licensee.accountNumber !== "") ||
    //     (formValidErrorMessage.licensee.taxId !== "") ||

    //     (formValidErrorMessage.licensee.stripeAccountId !== "") ||
    //     (formValidErrorMessage.licensee.stripeAccountVerified !== "") ||
    //     (formValidErrorMessage.licensee.mcc !== "") ||
    //     (formValidErrorMessage.licensee.productDescription !== "") ||
    //     (formValidErrorMessage.licensee.tosAcceptanceDate !== "") ||
    //     (formValidErrorMessage.licensee.tosAcceptanceIP !== "") ||

    //     (formValidErrorMessage.licensee.logo !== "") ||
    //     (formValidErrorMessage.licensee.proofOfIncorporation !== "")
    // );

    // if(isError) {
    //     return false;
    // }

    //---------------------------------------------------------------------------

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

    //---------------------------------------------------------------------------

    const formData = new FormData();
    licenseeSignup.licensee.mobile = licenseeSignup.licensee.mobile.replace(
      "+61",
      ""
    );
    formData.append("reqBody", JSON.stringify(licenseeSignup.licensee));

    // append files --------------------------------------------------

    if (licenseeSignup.licensee.logo) {
      formData.append(
        "licenseeLogo",
        licenseeSignup.licensee.logo,
        licenseeSignup.licensee.logo.name
      );
    }
    if (licenseeSignup.licensee.logo === null) {
      delete licenseeSignup.licensee.logo;
    }
    if (licenseeSignup.licensee.proofOfIncorporation) {
      formData.append(
        "licenseeProofOfIncorporation",
        licenseeSignup.licensee.proofOfIncorporation,
        licenseeSignup.licensee.proofOfIncorporation.name
      );
    }
    if (licenseeSignup.licensee.proofOfIncorporation === null) {
      delete licenseeSignup.licensee.proofOfIncorporation;
    }

    let requestOptions = {
      method: "PUT",
      headers: {
        ...authHeader(),
      },
      body: formData,
    };
    console.log("requestOptions", requestOptions);

    fetch(`${putLicensee}?licenseeId=${licenseeId}`, requestOptions)
      .then(handleFetchErrors)
      .then((res) => res.json())
      .then((res) => {
        console.log(`${putLicensee} Response`, res);

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

        // licenseeSignup.employee.driverLicense.expiry = moment()
        //   .add(1, "year")
        //   .format("YYYY-MM");
      })
      .catch((error) => {
        console.log(`${putLicensee} Error`, error);
        toast.error(error.message);
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
          Licensee Edit
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
                name="licensee-mobile"
                autoComplete="licensee-mobile"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">+61</InputAdornment>
                  ),
                }}
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
              <FormControl fullWidth required>
                <InputLabel id="licensee-businessType-label">
                  Business Type
                </InputLabel>
                <Select
                  labelId="licensee-businessType-label"
                  id="licensee-businessType-Select"
                  fullWidth
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

              {/* <TextField
                                variant="outlined"
                                margin="normal"
                                required
                                fullWidth
                                id="licensee-address_coordinates"
                                label="Coordinates (Latitude,Longitude format)"
                                name="licensee-address_coordinates"
                                autoComplete="licensee-address_coordinates"
                                autoFocus
                                error={(formValidErrorMessage.licensee.address.coordinates !== "")}
                                helperText={formValidErrorMessage.licensee.address.coordinates}
                                value={licenseeSignup.licensee.address.coordinates}
                                onChange={ (e) => { 
                                    setLicenseeSignup({
                                        ...licenseeSignup,
                                        licensee: {
                                            ...licenseeSignup.licensee,
                                            address: {
                                                ...licenseeSignup.licensee.address,
                                                coordinates: e.target.value
                                            }
                                        }
                                    });
                                } }
                            /> */}

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
                  id="address_coordinates"
                  helperText="Coordinates (Latitude)"
                  name="address_coordinates"
                  // autoComplete="licensee-address_coordinates"
                  autoFocus
                  error={
                    formValidErrorMessage.licensee.address.coordinates !== ""
                  }
                  // helperText={
                  //   formValidErrorMessage.licensee.address.coordinates
                  // }
                  value={licenseeSignup.licensee.address.coordinates[0]}
                  type="number"
                  step="any"
                  // onChange={(e) => {
                  //   setCustomer({
                  //     ...customer,
                  //       address: {
                  //         ...customer.address,
                  //         coordinates: e.target.value,
                  //       },
                  //     },
                  //   )
                  // }}
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
                  id="address_coordinates"
                  helperText="Coordinates (Longitude)"
                  name="address_coordinates"
                  // autoComplete="licensee-address_coordinates"
                  autoFocus
                  error={
                    formValidErrorMessage.licensee.address.coordinates !== ""
                  }
                  // helperText={
                  //   formValidErrorMessage.licensee.address.coordinates
                  // }
                  value={licenseeSignup.licensee.address.coordinates[1]}
                  type="number"
                  step="any"
                  // onChange={(e) => {
                  //   setCustomer({
                  //     ...customer,
                  //       address: {
                  //         ...customer.address,
                  //         coordinates: e.target.value,
                  //       },
                  //     },
                  //   )
                  // }}
                  onChange={(e) => {
                    let oldCoordinates =
                      licenseeSignup.licensee.address.coordinates;
                    let newLatitude = parseFloat(e.target.value);
                    let newCoordinates = oldCoordinates;
                    newCoordinates[1] = newLatitude;
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
                    value={
                      licenseeSignup.licensee.address.state || common.states[0]
                    }
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
                      // console.log("e.target", e.target);
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
                    {common.daysShort.map((day, dayIndex) => {
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
                      workingHoursStart: moment
                        .utc(e.target.value)
                        .format("hh:mm"),
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
                    moment.utc(e.target.value).format("hh:mm")
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
            {/* 
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
                            error={(formValidErrorMessage.licensee.url !== "")}
                            helperText={formValidErrorMessage.licensee.url}
                            value={licenseeSignup.licensee.url}
                            onChange={ (e) => { 
                                setLicenseeSignup({
                                    ...licenseeSignup,
                                    licensee: {
                                        ...licenseeSignup.licensee,
                                        url: e.target.value
                                    }
                                });
                            } }
                        /> */}

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
                    <a href={licenseeSignup.licensee.logoLink.data}>Logo</a>
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
                      logo: e.target.files[0],
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

            {/* <TextField
              variant="outlined"
              margin="normal"
              fullWidth
              disabled={true}
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

            {/* <TextField
              variant="outlined"
              margin="normal"
              fullWidth
              disabled={true}
              id="licensee-productDescription"
              label="Product Description"
              name="licensee-productDescription"
              autoComplete="licensee-productDescription"
              autoFocus
              error={formValidErrorMessage.licensee.productDescription !== ""}
              helperText={formValidErrorMessage.licensee.productDescription}
              value={licenseeSignup.licensee.productDescription}
              onChange={(e) => {
                setLicenseeSignup({
                  ...licenseeSignup,
                  licensee: {
                    ...licenseeSignup.licensee,
                    productDescription: e.target.value,
                  },
                });
              }}
            /> */}

            {/* <TextField
              variant="outlined"
              margin="normal"
              fullWidth
              disabled={true}
              type="date"
              id="licensee-tosAcceptanceDate"
              label="Acceptance Date"
              name="licensee-tosAcceptanceDate"
              autoComplete="licensee-tosAcceptanceDate"
              autoFocus
              error={formValidErrorMessage.licensee.tosAcceptanceDate !== ""}
              helperText={formValidErrorMessage.licensee.tosAcceptanceDate}
              value={licenseeSignup.licensee.tosAcceptanceDate}
              onChange={(e) => {
                setLicenseeSignup({
                  ...licenseeSignup,
                  licensee: {
                    ...licenseeSignup.licensee,
                    tosAcceptanceDate: e.target.value,
                  },
                });
              }}
            />

            <TextField
              variant="outlined"
              margin="normal"
              fullWidth
              disabled={true}
              id="licensee-tosAcceptanceIP"
              label="Acceptance Date"
              name="licensee-tosAcceptanceIP"
              autoComplete="licensee-tosAcceptanceIP"
              autoFocus
              error={formValidErrorMessage.licensee.tosAcceptanceIP !== ""}
              helperText={formValidErrorMessage.licensee.tosAcceptanceIP}
              value={licenseeSignup.licensee.tosAcceptanceIP}
              onChange={(e) => {
                setLicenseeSignup({
                  ...licenseeSignup,
                  licensee: {
                    ...licenseeSignup.licensee,
                    tosAcceptanceIP: e.target.value,
                  },
                });
              }}
            /> */}
          </Box>

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
