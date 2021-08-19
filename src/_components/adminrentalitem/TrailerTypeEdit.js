/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import readXlsxFile from "read-excel-file";
import { useLocation, useHistory, useParams } from "react-router-dom";

import {
  Button,
  CssBaseline,
  TextField,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Box,
  Grid,
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
const getTrailer = `${apiUrl}/admin/trailer`;
const saveTrailer = `${apiUrl}/admin/trailer`;
const fetchRentalItemTypesAPI = `${apiUrl}/admin/rentalitemtypes`;

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

// const chargesObj = {
//   pickUp: [...pickUpArr],
//   door2Door: [...door2DoorArr],
// };
// console.log(pickUpArr, door2DoorArr);

export default function TrailerEdit(props) {
  const classes = useStyles();

  let userData = localStorage.getItem("user");
  userData = JSON.parse(userData);

  let history = useHistory();

  let location = useLocation();

  const { trailerId } = useParams();

  let { from } = location.state || { from: { pathname: "/adminpanel/" } };
  if (!trailerId && !userData.acl.TRAILER.includes("ADD")) {
    history.replace(from);
  }
  if (trailerId && !userData.acl.TRAILER.includes("UPDATE")) {
    history.replace(from);
  }

  useEffect(() => {
    const requestOptions = {
      method: "GET",
      headers: authHeader(),
    };

    fetch(`${fetchRentalItemTypesAPI}`, requestOptions)
      .then(handleFetchErrors)
      .then((res) => res.json())
      .then((res) => {
        console.log(`${fetchRentalItemTypesAPI} Response`, res);
        const rentalItemTypesList = res.rentalItemTypes || [];
        // const totalCount = rentalItemTypesList.length;
        // setRows(rentalItemTypesList);
        // setTotalCount(totalCount);
        localStorage.setItem(
          "rentalitemtypes",
          JSON.stringify(rentalItemTypesList)
        );
      })
      .catch((error) => {
        console.log(`${fetchRentalItemTypesAPI} Error`, error);
      });
  }, 0);

  let rentalItemTypesList = localStorage.getItem("rentalitemtypes");
  rentalItemTypesList = JSON.parse(rentalItemTypesList);

  const rentalItemTypesTrailersList = rentalItemTypesList.filter(
    (rentalItemType) => {
      return rentalItemType.itemtype === "trailer";
    }
  );

  const trailerStart = {
    name: "",
    type: "",
    description: "",
    size: "",
    capacity: "",
    tare: "",
    features: [],
    rentalCharges: [],
    rates: {},
    dlrCharges: 0,
    isFeatured: false,
    availability: false,
    photosLinks: [],
  };

  const loadOnce = 0;
  const [trailer, setTrailer] = useState(trailerStart);

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const requestOptions = {
      method: "GET",
      headers: authHeader(),
    };
    if (trailerId) {
      fetch(`${getTrailer}?id=${trailerId}`, requestOptions)
        .then(handleFetchErrors)
        .then((res) => res.json())
        .then((res) => {
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
            rates: trailerObj.rentalCharges,
            dlrCharges: trailerObj.dlrCharges,
            isFeatured: trailerObj.isFeatured ? trailerObj.isFeatured : false,
            availability: trailerObj.availability
              ? trailerObj.availability
              : false,
            photosLinks: trailerObj.photos,
          });
        })
        .catch((error) => {
          console.log("Error occurred while fetching Trailer data", error);
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
    availability: false,
    photos: false,
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
    availability: "",
    photos: "",
  };
  function parseExcelFile(file) {
    let pickUpArr = [],
      door2DoorArr = [];
    let chargesObj;
    readXlsxFile(file).then((rows) => {
      rows.shift();
      rows.forEach((row) => {
        console.log(pickUpArr);
        pickUpArr.push({ duration: row[0], charges: row[1] });
        door2DoorArr.push({ duration: row[2], charges: row[3] });
      });
      chargesObj = {
        pickUp: pickUpArr,
        door2Door: door2DoorArr,
      };
      setTrailer({ ...trailer, rates: chargesObj });
    });
  }
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
      formValidError.availability ||
      formValidError.photos;

    if (isError) {
      return false;
    }

    let requestOptions = {
      method: "POST",
    };

    // if (trailer.rates || trailer.photos) {
    const formData = new FormData();

    formData.append("name", trailer.name);
    formData.append("type", trailer.type);
    formData.append("description", trailer.description);
    formData.append("size", trailer.size);
    formData.append("capacity", trailer.capacity);
    formData.append("tare", trailer.tare);
    formData.append("features", trailer.features);
    formData.append("dlrCharges", trailer.dlrCharges);
    formData.append("availability", trailer.availability);
    formData.append("isFeatured", trailer.isFeatured);

    if (trailer.rates) {
      formData.append("rates", JSON.stringify(trailer.rates));
    } else if (trailer.rentalCharges) {
      formData.append("rates", JSON.stringify(trailer.rentalCharges));
    }
    if (trailer.photos && trailer.photos.length > 0) {
      for (let i = 0; i < trailer.photos.length; i++) {
        formData.append("photos", trailer.photos[i], trailer.photos[i].name);
      }
    }

    if (trailerId) {
      formData.append("_id", trailerId);
    }

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
    //     rentalCharges: trailer.rentalCharges,
    //     dlrCharges: trailer.dlrCharges,
    //     availability: trailer.availability,
    //     isFeatured: trailer.isFeatured,
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

    fetch(saveTrailer, requestOptions)
      .then(handleFetchErrors)
      .then((res) => res.json())
      .then((res) => {
        console.log(`${saveTrailer} Response`, res);

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
          rates: trailerObj.rentalCharges,
          dlrCharges: trailerObj.dlrCharges,
          isFeatured: trailerObj.isFeatured ? trailerObj.isFeatured : false,
          availability: trailerObj.availability
            ? trailerObj.availability
            : false,
          photosLinks: trailerObj.photos,
        });

        setErrorMessage("");
        setSuccessMessage("Successfully saved Trailer data");

        setTimeout(() => {
          setSuccessMessage("");
          history.push("/adminpanel/trailertypes");
        }, 5000);
      })
      .catch((error) => {
        console.log(`${saveTrailer} Error`, error);
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
            value={trailer.name}
            onChange={(e) => {
              setTrailer({
                ...trailer,
                name: e.target.value,
              });
            }}
          />

          {rentalItemTypesTrailersList && (
            <Box className="SectionContainer">
              <FormControl required className="SectionContainer">
                <InputLabel id="itemType-label">Type</InputLabel>
                <Select
                  labelId="itemType-label"
                  id="itemTypeSelect"
                  value={trailer.type}
                  onChange={(e) => {
                    setTrailer({
                      ...trailer,
                      type: e.target.value,
                    });
                  }}
                  className={classes.selectEmpty}
                >
                  {rentalItemTypesTrailersList.map(
                    (itemType, itemTypeIndex) => {
                      return (
                        <MenuItem
                          key={`type-${itemType.code}`}
                          value={itemType.code}
                        >
                          {itemType.name}
                        </MenuItem>
                      );
                    }
                  )}
                </Select>
              </FormControl>
            </Box>
          )}

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

          {trailer.rates && (
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
                {trailer.rates.pickUp && (
                  <TableContainer component={Paper}>
                    <Table className={classes.table} aria-label="simple table">
                      <TableHead>
                        <TableRow>
                          <TableCell>Hire Period</TableCell>
                          <TableCell>Hire Rate</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {console.log(trailer.rates)}
                        {trailer.rates.pickUp.map((charge, chargeIndex) => (
                          <TableRow key={`pickup-${chargeIndex}`}>
                            <TableCell>
                              {getReadableDuration(charge.duration)}
                            </TableCell>
                            <TableCell>{charge.charges} AUD</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Grid>

              <Grid item sm={6}>
                {trailer.rates && trailer.rates.door2Door && (
                  <TableContainer component={Paper}>
                    <Table className={classes.table} aria-label="simple table">
                      <TableHead>
                        <TableRow>
                          <TableCell>Hire Period</TableCell>
                          <TableCell>Hire Rate</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {trailer.rates.door2Door.map((charge, chargeIndex) => (
                          <TableRow key={`door2door-${chargeIndex}`}>
                            <TableCell>
                              {getReadableDuration(charge.duration)}
                            </TableCell>
                            <TableCell>{charge.charges} AUD</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Grid>
            </Grid>
          )}
          <Box className="SectionContainer">
            <div className="my-2">
              Format for Rental Charges File Upload :{" "}
              <a
                target="_blank"
                href="https://t2y-applutions-images-bucket.s3.ap-south-1.amazonaws.com/charges/Trailer+Charges.xlsx"
              >
                Click Here
              </a>
              <div>Value 86400000 is mandatory.</div>
            </div>
            <Typography variant="subtitle1">Upload Rental Charges</Typography>

            <input
              accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
              id="raised-button-file"
              multiple
              type="file"
              name="rates"
              onChange={(e) => {
                parseExcelFile(e.target.files[0]);
                // setTrailer({
                //   ...trailer,
                //   rates: parseExcelFile(e.target.files[0]),
                // });
              }}
            />

            {/* <label htmlFor="raised-button-file">
                            <Button variant="raised" component="span" className={classes.button}>
                                Upload
                            </Button>
                        </label>  */}
          </Box>

          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
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
