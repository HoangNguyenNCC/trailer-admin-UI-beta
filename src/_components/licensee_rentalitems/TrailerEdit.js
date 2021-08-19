/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import { useLocation, useHistory, useParams } from "react-router-dom";

import {
  Button,
  CssBaseline,
  TextField,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Grid,
  Box,
  Typography,
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  InputLabel,
  Select,
  MenuItem,
  FormControl,
} from "@material-ui/core";

import { Alert, AlertTitle } from "@material-ui/lab";

import { makeStyles } from "@material-ui/core/styles";

import { authHeader, handleFetchErrors } from "../../_helpers";
import { common } from "../../_constants/common";

import "../../App.css";

const apiUrl = common.apiUrl;
const fetchTrailerTypesAPI = `${apiUrl}/admin/trailers`;
const getLicenseeTrailer = `${apiUrl}/admin/licensee/trailer`;
const saveLicenseeTrailer = `${apiUrl}/admin/licensee/trailer`;

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

function getReadableDuration(durationIn) {
  if (durationIn === 1) {
    return "Additional Day";
  }
  const msHours = 60 * 60 * 1000;
  const durationHours = Math.floor(durationIn / msHours);
  if (durationHours < 24) {
    return `${durationHours} Hours`;
  }
  const durationDays = Math.floor(durationHours / 24);
  return `${durationDays} Days`;
}

export default function TrailerEdit(props) {
  console.log("TrailerEdit", props);

  const classes = useStyles();

  let userData = localStorage.getItem("user");
  userData = JSON.parse(userData);
  // console.log("userData", userData);

  let history = useHistory();
  // console.log("history", history);

  let location = useLocation();
  // console.log("location", location);

  const { licenseeId, trailerId } = useParams();
  // console.log("licenseeId", licenseeId, "trailerId", trailerId);

  let { from } = location.state || { from: { pathname: "/adminpanel/" } };
  if (!trailerId && !userData.acl.TRAILER.includes("ADD")) {
    history.replace(from);
  }
  if (trailerId && !userData.acl.TRAILER.includes("UPDATE")) {
    history.replace(from);
  }

  // let rentalItemTypesList = localStorage.getItem('rentalitemtypes');
  // rentalItemTypesList = JSON.parse(rentalItemTypesList);
  // console.log("rentalItemTypesList", rentalItemTypesList);

  // const rentalItemTypesTrailersList = rentalItemTypesList.filter(rentalItemType => {
  //     return (rentalItemType.itemtype === "trailer");
  // });

  const trailerStart = {
    name: "",
    type: "",
    description: "",
    size: "",
    capacity: "",
    tare: "",
    features: [],

    rentalCharges: [],
    dlrCharges: 0,
    isFeatured: false,

    photosLinks: [],

    adminRentalItemId: "",
    availability: false,
    vin: "",
    age: 0,
  };

  const loadOnce = 0;
  const [adminTrailers, setAdminTrailers] = useState([]);
  const [trailer, setTrailer] = useState(trailerStart);

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const requestOptions = {
      method: "GET",
      headers: authHeader(),
      redirect: "follow",
    };
    fetch(`${fetchTrailerTypesAPI}`, requestOptions)
      .then(handleFetchErrors)
      .then((res) => res.json())
      .then((res) => {
        const trailersList = res.trailersList;

        const adminTrailer = trailersList[0];
        trailerStart.adminRentalItemId = adminTrailer._id;

        setAdminTrailers([...adminTrailers, ...trailersList]);

        // console.log("adminTrailers", trailersList, "trailerStart.adminRentalItemId", trailerStart.adminRentalItemId);
        setTrailer({
          ...trailer,
          adminRentalItemId: adminTrailer._id,
          name: adminTrailer.name,
          type: adminTrailer.type,
          description: adminTrailer.description,
          size: adminTrailer.size,
          capacity: adminTrailer.capacity,
          tare: adminTrailer.tare,
          features: adminTrailer.features,
          rentalCharges: adminTrailer.rentalCharges,
          dlrCharges: adminTrailer.dlrCharges,
          isFeatured: adminTrailer.isFeatured,
        });
      })
      .catch((err) => {
        console.log("Error occurred while fetching Trailer data", err);
      });

    //----------------------------------------------------------------------

    if (trailerId) {
      fetch(
        `${getLicenseeTrailer}?id=${trailerId}&licenseeId=${licenseeId}`,
        requestOptions
      )
        // .then(handleFetchErrors)
        .then((res) => res.json())
        .then((res) => {
          console.log("res is :", res);
          const trailerObj = res.trailerObj;
          //   console.log("inside second then");
          setTrailer({
            ...trailer,
            name: trailerObj.name,
            type: trailerObj.type,
            description: trailerObj.description,
            size: trailerObj.size,
            capacity: trailerObj.capacity,
            tare: trailerObj.tare,
            features: trailerObj.features,

            rentalCharges: trailerObj.rentalCharges,
            dlrCharges: trailerObj.dlrCharges,

            photosLinks: trailerObj.photos,

            adminRentalItemId: trailerObj.adminRentalItemId,
            availability: trailerObj.availability
              ? trailerObj.availability
              : false,
            vin: trailerObj.vin ? trailerObj.vin : "",
            age: trailerObj.age ? trailerObj.age : 0,
          });
        })
        .catch((err) => {
          console.log(
            "vaibhav Error occurred while fetching Trailer data",
            err
          );
        });
    }
  }, [loadOnce]);

  const formValidError = {
    name: false,
    type: false,
    description: false,
    size: false,
    capacity: false,
    tare: false,
    features: false,
    rentalCharges: false,
    dlrCharges: false,
    isFeatured: false,
    photos: false,

    adminRentalItemId: false,
    availability: false,
    vin: false,
    age: false,
  };

  const formValidErrorMessage = {
    name: "",
    type: "",
    description: "",
    size: "",
    capacity: "",
    tare: "",
    features: "",
    rentalCharges: "",
    dlrCharges: "",
    isFeatured: "",
    photos: "",

    adminRentalItemId: "",
    availability: "",
    vin: "",
    age: "",
  };

  async function handleSubmit(e) {
    e.preventDefault();

    const isError =
      formValidError.name ||
      formValidError.type ||
      formValidError.description ||
      formValidError.size ||
      formValidError.capacity ||
      formValidError.tare ||
      formValidError.features ||
      formValidError.rentalCharges ||
      formValidError.dlrCharges ||
      formValidError.isFeatured ||
      formValidError.photos ||
      formValidError.adminRentalItemId ||
      formValidError.availability ||
      formValidError.vin ||
      formValidError.age;

    if (isError) {
      return false;
    }

    let requestOptions = {
      method: "POST",
    };
    const reqObj = {
      name: trailer.name,
      type: trailer.type,
      description: trailer.description,
      size: trailer.size,
      capacity: trailer.capacity,
      tare: trailer.tare,
      features: trailer.features,
      adminRentalItemId: trailer.adminRentalItemId,
      availability: trailer.availability,
      vin: trailer.vin,
      age: trailer.age,
      licenseeId: licenseeId,
    };

    // if (trailer.photos) {
    const formData = new FormData();
    if (trailerId) {
      reqObj._id = trailerId;
    }
    // formData.append("name", trailer.name);
    // formData.append("type", trailer.type);
    // formData.append("description", trailer.description);
    // formData.append("size", trailer.size);
    // formData.append("capacity", trailer.capacity);
    // formData.append("tare", trailer.tare);
    // formData.append("features", trailer.features);

    // formData.append("adminRentalItemId", trailer.adminRentalItemId);
    // formData.append("availability", trailer.availability);
    // formData.append("vin", trailer.vin);
    // formData.append("age", trailer.age);
    formData.append("reqBody", JSON.stringify(reqObj));
    formData.append("licenseeId", licenseeId);

    if (trailer.photos && trailer.photos.length > 0) {
      for (let i = 0; i < trailer.photos.length; i++) {
        console.log(trailer.photos);
        formData.append("photos", trailer.photos[i], trailer.photos[i].name);
      }
    }

    // if (trailerId) {
    //   formData.append("_id", trailerId);
    // }

    // console.log("formData", formData);

    requestOptions.headers = {
      ...authHeader(),
    };
    requestOptions.body = formData;
    // }
    // else {
    //   const reqObj = {
    //     name: trailer.name,
    //     type: trailer.type,
    //     description: trailer.description,
    //     size: trailer.size,
    //     capacity: trailer.capacity,
    //     tare: trailer.tare,
    //     features: trailer.features,

    //     adminRentalItemId: trailer.adminRentalItemId,
    //     availability: trailer.availability,
    //     vin: trailer.vin,
    //     age: trailer.age,

    //     licenseeId: licenseeId,
    //   };

    //   if (trailerId) {
    //     reqObj._id = trailerId;
    //   }

    //   requestOptions.headers = {
    //     ...authHeader(),
    //     "Content-Type": "application/json",
    //   };
    //   requestOptions.body = JSON.stringify(reqObj);
    // }

    console.log("requestOptions", requestOptions);

    fetch(saveLicenseeTrailer, requestOptions)
      .then(handleFetchErrors)
      .then((res) => res.json())
      .then((res) => {
        console.log(`${saveLicenseeTrailer} Response`, res);

        const trailerObj = res.trailerObj;

        setTrailer({
          ...trailer,
          name: trailerObj.name,
          type: trailerObj.type,
          description: trailerObj.description,
          size: trailerObj.size,
          capacity: trailerObj.capacity,
          tare: trailerObj.tare,
          features: trailerObj.features,

          adminRentalItemId: trailerObj.adminRentalItemId
            ? trailerObj.adminRentalItemId
            : false,
          availability: trailerObj.availability
            ? trailerObj.availability
            : false,
          vin: trailerObj.vin,
          age: trailerObj.age,

          photosLinks: trailerObj.photos,
        });

        setErrorMessage("");
        setSuccessMessage("Successfully saved Trailer data");

        setTimeout(() => {
          setSuccessMessage("");
          history.push(`/adminpanel/licensee/${licenseeId}/trailers`);
        }, 5000);
      })
      .catch((error) => {
        console.log(`${saveLicenseeTrailer} Error`, error);
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
          {trailerId ? "Edit Trailer" : "Add Trailer"}
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

        <form className={classes.form} encType="multipart/form-data" noValidate>
          {adminTrailers && trailer.adminRentalItemId && (
            <Box className="SectionContainer">
              <FormControl required fullWidth className="SectionContainer">
                <InputLabel id="adminRentalItemId-label">
                  Select Trailer Type
                </InputLabel>
                <Select
                  labelId="adminRentalItemId-label"
                  id="adminRentalItemId-Select"
                  value={trailer.adminRentalItemId}
                  onChange={(e) => {
                    const adminTrailer = adminTrailers.find((adminTrailer) => {
                      return e.target.value === adminTrailer._id;
                    });
                    setTrailer({
                      ...trailer,
                      adminRentalItemId: adminTrailer._id,
                      name: adminTrailer.name,
                      type: adminTrailer.type,
                      description: adminTrailer.description,
                      size: adminTrailer.size,
                      capacity: adminTrailer.capacity,
                      tare: adminTrailer.tare,
                      features: adminTrailer.features,
                      rentalCharges: adminTrailer.rentalCharges,
                      dlrCharges: adminTrailer.dlrCharges,
                      isFeatured: adminTrailer.isFeatured,
                    });
                  }}
                  className={classes.selectEmpty}
                >
                  {adminTrailers.map((adminTrailer, adminTrailerIndex) => {
                    // console.log("adminTrailer", adminTrailer._id, adminTrailer.name);
                    return (
                      <MenuItem
                        key={`type-${adminTrailer._id}`}
                        value={adminTrailer._id}
                      >
                        {adminTrailer.name}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            </Box>
          )}

          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="vin"
            label="VIN"
            name="vin"
            autoComplete="vin"
            autoFocus
            error={formValidError.vin}
            helperText={formValidErrorMessage.vin}
            value={trailer.vin}
            onChange={(e) => {
              setTrailer({
                ...trailer,
                vin: e.target.value,
              });
            }}
          />

          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="age"
            label="Age"
            name="age"
            autoComplete="age"
            autoFocus
            error={formValidError.age}
            helperText={formValidErrorMessage.age}
            value={trailer.age}
            onChange={(e) => {
              setTrailer({
                ...trailer,
                age: parseInt(e.target.value) || 0,
              });
            }}
          />

          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            disabled={true}
            id="name"
            label="Name"
            name="name"
            autoComplete="name"
            autoFocus
            error={formValidError.name}
            helperText={formValidErrorMessage.name}
            value={trailer.name}
            onChange={(e) => {
              setTrailer({
                ...trailer,
                name: e.target.value,
              });
            }}
          />

          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            disabled={true}
            id="type"
            label="Type"
            name="type"
            autoComplete="type"
            autoFocus
            error={formValidError.type}
            helperText={formValidErrorMessage.type}
            value={trailer.type}
            onChange={(e) => {
              setTrailer({
                ...trailer,
                type: e.target.value,
              });
            }}
          />

          <TextField
            aria-label="description"
            required
            fullWidth
            id="description"
            label="Description"
            name="description"
            autoComplete="description"
            autoFocus
            multiline={true}
            error={formValidError.description}
            helperText={formValidErrorMessage.description}
            value={trailer.description}
            onChange={(e) => {
              setTrailer({
                ...trailer,
                description: e.target.value,
              });
            }}
          />

          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            disabled={true}
            id="size"
            label="Size"
            name="size"
            autoComplete="size"
            autoFocus
            error={formValidError.size}
            helperText={formValidErrorMessage.size}
            value={trailer.size}
            onChange={(e) => {
              setTrailer({
                ...trailer,
                size: e.target.value,
              });
            }}
          />

          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            disabled={true}
            id="capacity"
            label="Capacity"
            name="capacity"
            autoComplete="capacity"
            autoFocus
            error={formValidError.capacity}
            helperText={formValidErrorMessage.capacity}
            value={trailer.capacity}
            onChange={(e) => {
              setTrailer({
                ...trailer,
                capacity: e.target.value,
              });
            }}
          />

          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            disabled={true}
            id="tare"
            label="Tare"
            name="tare"
            autoComplete="tare"
            autoFocus
            error={formValidError.tare}
            helperText={formValidErrorMessage.tare}
            value={trailer.tare}
            onChange={(e) => {
              setTrailer({
                ...trailer,
                tare: e.target.value,
              });
            }}
          />

          {
            <FormGroup className="SectionContainer">
              <Grid container spacing={0}>
                <Grid item sm={6}>
                  <Typography variant="subtitle1">Features</Typography>
                </Grid>
                <Grid item sm={6} className="TextAlignRight">
                  <Button
                    type="button"
                    variant="contained"
                    color="primary"
                    className={classes.submit}
                    onClick={(e) => {
                      const newFeatures = [...trailer.features];
                      newFeatures.push("");
                      setTrailer({
                        ...trailer,
                        features: newFeatures,
                      });
                    }}
                  >
                    Add
                  </Button>
                </Grid>
              </Grid>

              {trailer.features.map((feature, featureIndex) => {
                return (
                  <TextField
                    key={featureIndex}
                    variant="outlined"
                    margin="normal"
                    required
                    fullWidth
                    label="Feature"
                    name="feature"
                    autoComplete="feature"
                    autoFocus
                    error={formValidError.features}
                    helperText={formValidErrorMessage.features}
                    value={feature}
                    onChange={(e) => {
                      const newFeatures = [...trailer.features];
                      newFeatures[featureIndex] = e.target.value;
                      setTrailer({
                        ...trailer,
                        features: newFeatures,
                      });
                    }}
                  />
                );
              })}
            </FormGroup>
          }

          {trailer.rentalCharges && (
            <Grid container spacing={0} className="SectionContainer">
              <Grid item sm={12}>
                <Typography variant="subtitle1">Rental Charges</Typography>
              </Grid>

              <Grid item sm={6}>
                <Typography variant="subtitle2">Pickup Charges</Typography>
              </Grid>
              <Grid item sm={6}>
                <Typography variant="subtitle2">Door2Door Charges</Typography>
              </Grid>

              <Grid item sm={6}>
                {trailer.rentalCharges.pickUp && (
                  <TableContainer component={Paper}>
                    <Table className={classes.table} aria-label="simple table">
                      <TableHead>
                        <TableRow>
                          <TableCell>Hire Period</TableCell>
                          <TableCell>Hire Rate</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {trailer.rentalCharges.pickUp.map(
                          (charge, chargeIndex) => (
                            <TableRow key={`pickup-${chargeIndex}`}>
                              <TableCell>
                                {getReadableDuration(charge.duration)}
                              </TableCell>
                              <TableCell>{charge.charges} AUD</TableCell>
                            </TableRow>
                          )
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Grid>

              <Grid item sm={6}>
                {trailer.rentalCharges && trailer.rentalCharges.door2Door && (
                  <TableContainer component={Paper}>
                    <Table className={classes.table} aria-label="simple table">
                      <TableHead>
                        <TableRow>
                          <TableCell>Hire Period</TableCell>
                          <TableCell>Hire Rate</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {trailer.rentalCharges.door2Door.map(
                          (charge, chargeIndex) => (
                            <TableRow key={`door2door-${chargeIndex}`}>
                              <TableCell>
                                {getReadableDuration(charge.duration)}
                              </TableCell>
                              <TableCell>{charge.charges} AUD</TableCell>
                            </TableRow>
                          )
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Grid>
            </Grid>
          )}

          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            disabled={true}
            id="dlrCharges"
            label="Damage Liability Reduction Charges (AUD)"
            name="dlrCharges"
            autoComplete="dlrCharges"
            autoFocus
            error={formValidError.dlrCharges}
            helperText={formValidErrorMessage.dlrCharges}
            value={trailer.dlrCharges}
            onChange={(e) => {
              setTrailer({
                ...trailer,
                dlrCharges: e.target.value,
              });
            }}
          />

          <FormGroup className="SectionContainer">
            <FormControlLabel
              control={
                <Checkbox
                  disabled={true}
                  checked={trailer.isFeatured}
                  name="isFeatured"
                  onChange={(e) => {
                    console.log("onChange isFeatured", e);
                    setTrailer({
                      ...trailer,
                      isFeatured: !trailer.isFeatured,
                    });
                  }}
                />
              }
              label="Is Featured Trailer Type?"
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={trailer.availability}
                  name="availability"
                  onChange={(e) => {
                    console.log(
                      "onChange availability",
                      typeof e.target.value,
                      e.target.value
                    );
                    console.log(
                      "trailer.availability",
                      typeof trailer.availability
                    );
                    setTrailer({
                      ...trailer,
                      availability: !trailer.availability,
                    });
                  }}
                />
              }
              label="Set as availability to be Rented?"
            />
          </FormGroup>

          <Box className="SectionContainer">
            <Typography variant="subtitle1">Photos</Typography>

            {!trailer.photos && (
              <Box className="SectionContainer">
                {trailer.photosLinks.map((photo, photoIndex) => {
                  return (
                    <div key={trailer._id + "_photo" + photoIndex}>
                      <a href={photo.data}>Photo {photoIndex + 1}</a>
                    </div>
                  );
                })}
              </Box>
            )}

            <input
              accept="image/jpeg, image/jpg, image/png"
              id="raised-button-file"
              multiple
              type="file"
              name="photos"
              onChange={(e) => {
                console.log(e.target.files);
                let photos = [];
                if (trailer.photos) {
                  photos = trailer.photos;
                }
                photos.push(...e.target.files);
                console.log(photos);
                setTrailer({
                  ...trailer,
                  photos: [...photos],
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
            Update
          </Button>
        </form>
      </div>
    </Container>
  );
}
