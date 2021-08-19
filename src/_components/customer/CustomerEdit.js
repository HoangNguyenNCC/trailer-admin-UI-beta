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
  FormHelperText,
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
const getCustomer = `${apiUrl}/admin/customer`;
const addCustomer = `${apiUrl}/admin/customer`; // POST
const updateCustomer = `${apiUrl}/admin/customer`; // PUT

export default function CustomerEdit(props) {
  console.log("CustomerEdit", props);

  const classes = useStyles();

  let userData = localStorage.getItem("user");
  userData = JSON.parse(userData);
  // console.log("userData", userData);

  let history = useHistory();
  // console.log("history", history);

  let location = useLocation();
  // console.log("location", location);

  const { customerId } = useParams();
  // console.log("customerId", customerId);

  let { from } = location.state || { from: { pathname: "/adminpanel/" } };
  if (!customerId && !userData.acl.CUSTOMERS.includes("ADD")) {
    history.replace(from);
  }
  if (customerId && !userData.acl.CUSTOMERS.includes("UPDATE")) {
    history.replace(from);
  }

  const customerStart = {
    name: "",
    address: {
      text: "",
      pincode: "",
      coordinates: [],
      country: "",
      city: "",
    },
    dob: moment().subtract(18, "years").format("YYYY-MM-DD"),
    driverLicense: {
      card: "",
      expiry: moment().add(1, "year").format("YYYY-MM"),
      state: common.states[0],
      scanLink: "",
    },
    email: "",
    // isEmailVerified: false,
    mobile: "",
    // isMobileVerified: false,
    photoLink: "",
  };

  const loadOnce = 0;
  const [customer, setCustomer] = useState(customerStart);

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (customerId) {
      const requestOptions = {
        method: "GET",
        headers: authHeader(),
      };
      fetch(`${getCustomer}?id=${customerId}`, requestOptions)
        .then(handleFetchErrors)
        .then((res) => res.json())
        .then((res) => {
          console.log(`${getCustomer} Response`, res.customerObj);
          const customerObj = res.customerObj;
          // console.log("vaibhav customers", customerObj.address.coordinates)
          setCustomer({
            name: customerObj.name,
            address: {
              text: customerObj.address.text,
              pincode: customerObj.address.pincode,
              coordinates: customerObj.address.coordinates,
              country: customerObj.address.country,
              city: customerObj.address.city,
              state: customerObj.address.state,
            },
            dob: customerObj.dob,
            driverLicense: {
              card: customerObj.driverLicense.card,
              expiry: customerObj.driverLicense.expiry,
              state: customerObj.driverLicense.state,
              scan: customerObj.driverLicense.scan,
              scanLink: customerObj.driverLicense.scan,
            },
            email: customerObj.email,
            // isEmailVerified: customerObj.isEmailVerified,
            mobile: customerObj.mobile.replace("+61", ""),
            // isMobileVerified: customerObj.isMobileVerified,
            photoLink: customerObj.photo,
          });
        })
        .catch((error) => {
          console.log(`${getCustomer} Error`, error);
        });
    }
  }, [loadOnce]);

  const formValidErrorMessage = {
    name: "",
    address: {
      text: "",
      pincode: "",
      coordinates: "",
    },
    dob: "",
    driverLicense: {
      card: "",
      expiry: "",
      state: "",
      scan: "",
    },
    email: "",
    mobile: "",
    photo: "",
  };

  async function handleSubmit(e) {
    e.preventDefault();

    const isError =
      formValidErrorMessage.name !== "" ||
      formValidErrorMessage.address.text !== "" ||
      formValidErrorMessage.address.pincode !== "" ||
      formValidErrorMessage.address.coordinates !== "" ||
      formValidErrorMessage.dob !== "" ||
      formValidErrorMessage.driverLicense.card !== "" ||
      formValidErrorMessage.driverLicense.expiry !== "" ||
      formValidErrorMessage.driverLicense.state !== "" ||
      formValidErrorMessage.driverLicense.scan !== "" ||
      formValidErrorMessage.email !== "" ||
      formValidErrorMessage.mobile !== "" ||
      formValidErrorMessage.photo !== "";

    if (isError) {
      return false;
    }

    let requestOptions = {
      method: customerId ? "PUT" : "POST",
    };

    // console.log("customer.driverLicense.expiry", customer.driverLicense.expiry);

    customer.dob = moment(customer.dob).format("YYYY-MM-DD");
    customer.driverLicense.expiry = moment(
      customer.driverLicense.expiry,
      "YYYY-MM"
    ).format("YYYY-MM");

    // console.log("customer.driverLicense.expiry", customer.driverLicense.expiry);
    if (customer.photo || customer.driverLicenseScan) {
      const formData = new FormData();

      formData.append("name", customer.name);
      // const coordArr = customer.address.coordinates.split(",");
      // coordArr[0] = parseFloat(coordArr[0]);
      // coordArr[1] = parseFloat(coordArr[1]);
      // customer.address.coordinates = coordArr;
      formData.append("address", JSON.stringify(customer.address));
      formData.append("dob", customer.dob);
      formData.append("email", customer.email);
      formData.append("mobile", customer.mobile.replace("+61", ""));

      if (customer.photo) {
        formData.append("photo", customer.photo, customer.photo.name);
      } else {
        delete customer.photo;
      }
      if (customer.driverLicenseScan) {
        formData.append(
          "driverLicenseScan",
          customer.driverLicenseScan,
          customer.driverLicenseScan.name
        );
        delete customer.driverLicense.scan;
      } else {
        delete customer.driverLicenseScan;
      }
      formData.append("driverLicense", JSON.stringify(customer.driverLicense));

      // append files

      if (customerId) {
        formData.append("_id", customerId);
        formData.append("customerId", customerId);
      } else {
        formData.append("password", customer.password);
      }

      requestOptions.headers = {
        ...authHeader(),
      };
      requestOptions.body = formData;
    } else {
      const reqObj = {
        name: customer.name,
        address: customer.address,
        dob: customer.dob,
        driverLicense: customer.driverLicense,
        email: customer.email,
        mobile: customer.mobile.replace("+61", ""),
      };

      if (customerId) {
        reqObj._id = customerId;
        reqObj.customerId = customerId;
      }

      requestOptions.headers = {
        ...authHeader(),
        "Content-Type": "application/json",
      };
      requestOptions.body = JSON.stringify(reqObj);
    }

    console.log("requestOptions", requestOptions);

    const saveCustomerReqURL = customerId ? updateCustomer : addCustomer;

    fetch(saveCustomerReqURL, requestOptions)
      .then(handleFetchErrors)
      .then((res) => res.json())
      .then((res) => {
        console.log(`${saveCustomerReqURL} Response`, res);

        const customerObj = res.customerObj;

        // console.log("vaibhav coordinates", customerObj.address.coordinates)
        // console.log("vaibhav coodinates:",customerObj.address.coordinates.map(coordinate => parseFloat(coordinate)))
        setCustomer({
          name: customerObj.name,
          address: {
            text: customerObj.address.text,
            pincode: customerObj.address.pincode,
            coordinates: customerObj.address.coordinates,
            country: customerObj.address.country,
          },
          dob: customerObj.dob,
          driverLicense: {
            card: customerObj.driverLicense.card,
            expiry: customerObj.driverLicense.expiry,
            state: customerObj.driverLicense.state,
            scan: customerObj.driverLicense.scan,
            scanLink: customerObj.driverLicense.scan,
          },
          email: customerObj.email,
          // isEmailVerified: customerObj.isEmailVerified,
          mobile: customerObj.mobile.replace("+61", ""),
          // isMobileVerified: customerObj.isMobileVerified,
          photoLink: customerObj.photo,
        });

        setErrorMessage("");
        setSuccessMessage("Successfully saved Customer data");

        setTimeout(() => {
          setSuccessMessage("");
        }, 5000);
      })
      .catch((error) => {
        console.log(`${saveCustomerReqURL} Error`, error.message);

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
          {customerId ? "Edit a Customer" : "Add New Customer"}
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
            id="name"
            label="Name"
            name="name"
            autoComplete="name"
            autoFocus
            error={formValidErrorMessage.name !== ""}
            helperText={formValidErrorMessage.name}
            value={customer.name}
            onChange={(e) => {
              setCustomer({
                ...customer,
                name: e.target.value,
              });
            }}
          />
          {!customerId && (
            <Fragment>
              {/* <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email"
                name="email"
                autoComplete="email"
                autoFocus
                type="email"
                error={formValidErrorMessage.email !== ""}
                helperText={formValidErrorMessage.email}
                value={customer.email}
                onChange={(e) => {
                  setCustomer({
                    ...customer,
                    email: e.target.value,
                  });
                }}
              /> */}
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                id="password"
                label="Password"
                name="password"
                autoComplete="password"
                autoFocus
                type="password"
                helperText={formValidErrorMessage.password}
                value={customer.password}
                onChange={(e) => {
                  setCustomer({
                    ...customer,
                    password: e.target.value,
                  });
                }}
              />
            </Fragment>
          )}

          <Box className="SectionContainer">
            <Typography variant="subtitle1">Address</Typography>

            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="address_text"
              label="Address Line"
              name="address_text"
              autoComplete="address_text"
              autoFocus
              error={formValidErrorMessage.address.text !== ""}
              helperText={formValidErrorMessage.address.text}
              value={customer.address.text}
              onChange={(e) => {
                setCustomer({
                  ...customer,
                  address: {
                    ...customer.address,
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
              id="address_city"
              label="City"
              name="address_city"
              autoComplete="address_city"
              autoFocus
              //   error={formValidErrorMessage.address.city !== ""}
              helperText={formValidErrorMessage.address.city}
              value={customer.address.city}
              onChange={(e) => {
                setCustomer({
                  ...customer,
                  address: {
                    ...customer.address,
                    city: e.target.value,
                  },
                });
              }}
            />
            {common.states && (
              <FormControl required>
                <InputLabel id="state-label">State</InputLabel>
                <Select
                  labelId="state-label"
                  id="stateSelect"
                  value={customer.address.state || common.states[0]}
                  onChange={(e) => {
                    setCustomer({
                      ...customer,
                      address: {
                        ...customer.address,
                        state: e.target.value,
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
                <FormHelperText>Required</FormHelperText>
              </FormControl>
            )}

            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="address_pincode"
              label="Pincode"
              name="address_pincode"
              autoComplete="address_pincode"
              autoFocus
              error={formValidErrorMessage.address.pincode !== ""}
              helperText={formValidErrorMessage.address.pincode}
              value={customer.address.pincode}
              onChange={(e) => {
                setCustomer({
                  ...customer,
                  address: {
                    ...customer.address,
                    pincode: e.target.value,
                  },
                });
              }}
            />

            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="address_country"
              label="Country"
              name="address_country"
              autoComplete="address_country"
              autoFocus
              //   error={formValidErrorMessage.address.country !== ""}
              helperText={formValidErrorMessage.address.country}
              value={customer.address.country}
              onChange={(e) => {
                setCustomer({
                  ...customer,
                  address: {
                    ...customer.address,
                    country: e.target.value,
                  },
                });
              }}
            />

            {/* <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="address_coordinates"
              label="Coordinates (Latitude,Longitude format)"
              name="address_coordinates"
              autoComplete="address_coordinates"
              autoFocus
              error={formValidErrorMessage.address.coordinates !== ""}
              helperText={formValidErrorMessage.address.coordinates}
              value={customer.address.coordinates}
              onChange={(e) => {
                setCustomer({
                  ...customer,
                  address: {
                    ...customer.address,
                    coordinates: e.target.value,
                  },
                });
              }}
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
                // autoFocus
                // error={formValidErrorMessage.address.coordinates !== ""}
                // helperText={formValidErrorMessage.address.coordinates}
                value={customer.address.coordinates[0]}
                type="number"
                step="any"
                onChange={(e) => {
                  let oldCoordinates = customer.address.coordinates;
                  let newLatitude = parseFloat(e.target.value);
                  let newCoordinates = oldCoordinates;
                  newCoordinates[0] = newLatitude;
                  setCustomer({
                    ...customer,
                    address: {
                      ...customer.address,
                      coordinates: newCoordinates,
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
                // autoFocus
                // error={formValidErrorMessage.address.coordinates !== ""}
                // helperText={formValidErrorMessage.address.coordinates}
                value={customer.address.coordinates[1]}
                type="number"
                step="any"
                onChange={(e) => {
                  let oldCoordinates = customer.address.coordinates;
                  let newLatitude = parseFloat(e.target.value);
                  let newCoordinates = oldCoordinates;
                  newCoordinates[1] = newLatitude;
                  setCustomer({
                    ...customer,
                    address: {
                      ...customer.address,
                      coordinates: newCoordinates,
                    },
                  });
                }}
              />
            </div>
          </Box>

          <TextField
            variant="outlined"
            margin="normal"
            aria-label="dob"
            required
            fullWidth
            type="date"
            id="dob"
            label="dob"
            name="dob"
            autoComplete="dob"
            autoFocus
            error={formValidErrorMessage.dob !== ""}
            helperText={formValidErrorMessage.dob}
            value={customer.dob}
            onChange={(e) => {
              setCustomer({
                ...customer,
                dob: e.target.value,
              });
            }}
          />

          <Box className="SectionContainer">
            <Typography variant="subtitle1">Driver License</Typography>

            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="driverLicense_card"
              label="Driver License Number"
              name="driverLicense_card"
              autoComplete="driverLicense_card"
              autoFocus
              error={formValidErrorMessage.driverLicense.card !== ""}
              helperText={formValidErrorMessage.driverLicense.card}
              value={customer.driverLicense.card}
              onChange={(e) => {
                setCustomer({
                  ...customer,
                  driverLicense: {
                    ...customer.driverLicense,
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
              id="driverLicense_expiry"
              label="Expiry Date"
              name="driverLicense_expiry"
              autoComplete="driverLicense_expiry"
              autoFocus
              error={formValidErrorMessage.driverLicense.expiry !== ""}
              helperText={formValidErrorMessage.driverLicense.expiry}
              value={customer.driverLicense.expiry}
              onChange={(e) => {
                setCustomer({
                  ...customer,
                  driverLicense: {
                    ...customer.driverLicense,
                    expiry: e.target.value,
                  },
                });
              }}
            />

            {common.states && (
              <FormControl required>
                <InputLabel id="state-label">State</InputLabel>
                <Select
                  labelId="state-label"
                  id="stateSelect"
                  value={customer.driverLicense.state}
                  onChange={(e) => {
                    setCustomer({
                      ...customer,
                      driverLicense: {
                        ...customer.driverLicense,
                        state: e.target.value,
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
                <FormHelperText>Required</FormHelperText>
              </FormControl>
            )}

            <Box className="SectionContainer">
              <Typography variant="subtitle1">
                Scan ( Scan of Front and Back side of Driver License in a single
                File )
              </Typography>

              {customer.driverLicense.scanLink && !customer.driverLicenseScan && (
                <Box className="SectionContainer">
                  <a href={customer.driverLicense.scanLink}>Scan</a>
                </Box>
              )}

              <input
                accept="image/jpeg, image/jpg, image/png"
                id="raised-button-file"
                multiple
                type="file"
                name="scan"
                onChange={(e) => {
                  // console.log("scan", e.target.files);
                  setCustomer({
                    ...customer,
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

          <FormGroup className="SectionContainer">
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email"
              name="email"
              autoComplete="email"
              autoFocus
              error={formValidErrorMessage.email !== ""}
              helperText={formValidErrorMessage.email}
              value={customer.email}
              onChange={(e) => {
                setCustomer({
                  ...customer,
                  email: e.target.value,
                });
              }}
            />

            {/* <FormControlLabel
              control={
                <Checkbox
                  disabled={true}
                  checked={customer.isEmailVerified}
                  name="isEmailVerified"
                  onChange={(e) => {
                    console.log("onChange isEmailVerified", e);
                    setCustomer({
                      ...customer,
                      isEmailVerified: !customer.isEmailVerified,
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
              id="mobile"
              label="Mobile"
              name="mobile"
              autoComplete="mobile"
              autoFocus
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">+61</InputAdornment>
                ),
              }}
              placeholder="Don't add country code"
              error={formValidErrorMessage.mobile !== ""}
              helperText={
                "Remove / don't add country code in text (Country code is automatically attached"
              }
              value={customer.mobile}
              onChange={(e) => {
                setCustomer({
                  ...customer,
                  mobile: e.target.value,
                });
              }}
            />

            {/* <FormControlLabel
              control={
                <Checkbox
                  disabled={true}
                  checked={customer.isMobileVerified}
                  name="isMobileVerified"
                  onChange={(e) => {
                    console.log("onChange isMobileVerified", e);
                    setCustomer({
                      ...customer,
                      isMobileVerified: !customer.isMobileVerified,
                    });
                  }}
                />
              }
              label="Is Mobile Verified?"
            /> */}
          </FormGroup>

          <Box className="SectionContainer">
            <Typography variant="subtitle1">Photo</Typography>

            {customer.photoLink && !customer.photo && (
              <Box className="SectionContainer">
                <a href={customer.photoLink}>Photo</a>
              </Box>
            )}

            <input
              accept="image/jpeg, image/jpg, image/png"
              id="raised-button-file"
              multiple
              type="file"
              name="photo"
              onChange={(e) => {
                // console.log("photo", e.target.files);
                setCustomer({
                  ...customer,
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

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
            onClick={handleSubmit}
          >
            {customerId ? "Update" : "Save"}
          </Button>
        </form>
      </div>
    </Container>
  );
}
