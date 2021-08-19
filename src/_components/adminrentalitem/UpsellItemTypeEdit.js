/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import { useLocation, useHistory, useParams } from "react-router-dom";
import readXlsxFile from "read-excel-file";

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
const getUpsellItem = `${apiUrl}/admin/upsellitem`;
const saveUpsellItem = `${apiUrl}/admin/upsellitem`;
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

export default function UpsellEdit(props) {
  console.log("UpsellEdit", props);

  const classes = useStyles();

  let userData = localStorage.getItem("user");
  userData = JSON.parse(userData);
  // console.log("userData", userData);

  let history = useHistory();
  // console.log("history", history);

  let location = useLocation();
  // console.log("location", location);

  const { upsellItemId } = useParams();
  // console.log("upsellItemId", upsellItemId);

  let { from } = location.state || { from: { pathname: "/adminpanel/" } };
  if (!upsellItemId && !userData.acl.UPSELL.includes("ADD")) {
    history.replace(from);
  }
  if (upsellItemId && !userData.acl.UPSELL.includes("UPDATE")) {
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
  // console.log("rentalItemTypesList", rentalItemTypesList);
  console.log("rentalItemTypesList", rentalItemTypesList);
  const rentalItemTypesUpsellList = rentalItemTypesList.filter(
    (rentalItemType) => {
      return rentalItemType.itemtype === "upsellitem";
    }
  );
  console.log("rentalItemTypesUpsellList", rentalItemTypesUpsellList);

  const upsellItemStart = {
    name: "",
    type: "",
    description: "",
    rentalCharges: {},
    dlrCharges: 0,
    // isFeatured: false,
    availability: false,
    photosLinks: [],
    rates: {},
  };

  const loadOnce = 0;
  const [upsellItem, setUpsellItem] = useState(upsellItemStart);

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (upsellItemId) {
      const requestOptions = {
        method: "GET",
        headers: authHeader(),
      };
      fetch(`${getUpsellItem}?id=${upsellItemId}`, requestOptions)
        .then(handleFetchErrors)
        .then((res) => res.json())
        .then((res) => {
          const upsellItemObj = res.upsellItemObj;

          setUpsellItem({
            ...upsellItem,
            name: upsellItemObj.name,
            type: upsellItemObj.type,
            description: upsellItemObj.description,
            rentalCharges: upsellItemObj.rentalCharges,
            dlrCharges: upsellItemObj.dlrCharges,
            // isFeatured: upsellItemObj.isFeatured
            //   ? upsellItemObj.isFeatured
            //   : false,
            availability: upsellItemObj.availability
              ? upsellItemObj.availability
              : false,
            photosLinks: upsellItemObj.photos,
          });
        })
        .catch((error) => {
          console.log("Error occurred while fetching Upsell Item data", error);
        });
    }
  }, [loadOnce]);

  const formValidError = {
    name: false,
    type: false,
    description: false,
    rentalCharges: false,
    dlrCharges: false,
    // isFeatured: false,
    availability: false,
    photos: false,
  };

  const [formValidErrorMessage, setFormValidErrorMessage] = useState({
    name: "",
    type: "",
    description: "",
    rentalCharges: "",
    dlrCharges: "",
    // isFeatured: "",
    availability: "",
    photos: "",
  });

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
      setUpsellItem({ ...upsellItem, rentalCharges: chargesObj });
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const isError =
      formValidError.name ||
      formValidError.type ||
      formValidError.description ||
      formValidError.rentalCharges ||
      formValidError.dlrCharges ||
      formValidError.availability ||
      formValidError.photos;

    if (isError) {
      return false;
    }

    let requestOptions = {
      method: "POST",
    };

    // if(upsellItem.rates || upsellItem.photos) {
    const formData = new FormData();

    formData.append("name", upsellItem.name);
    formData.append("type", upsellItem.type);
    formData.append("description", upsellItem.description);
    formData.append("dlrCharges", upsellItem.dlrCharges);
    formData.append("availability", upsellItem.availability);
    // formData.append("isFeatured", upsellItem.isFeatured);

    // if(upsellItem.rates) {
    //     formData.append('rates', upsellItem.rates, upsellItem.rates.name);
    // }
    if (upsellItem.rentalCharges) {
      formData.append(
        "rentalCharges",
        JSON.stringify(upsellItem.rentalCharges)
      );
    }
    if (upsellItem.photos && upsellItem.photos.length > 0) {
      for (let i = 0; i < upsellItem.photos.length; i++) {
        formData.append(
          "photos",
          upsellItem.photos[i],
          upsellItem.photos[i].name
        );
      }
    }

    if (upsellItemId) {
      formData.append("_id", upsellItemId);
    }

    // console.log("formData", formData);

    requestOptions.headers = {
      ...authHeader(),
    };
    requestOptions.body = formData;
    // } else {
    //     const reqObj = {
    //         name: upsellItem.name,
    //         type: upsellItem.type,
    //         description: upsellItem.description,
    //         rentalCharges: upsellItem.rentalCharges,
    //         dlrCharges: upsellItem.dlrCharges,
    //         availability: upsellItem.availability,
    //         isFeatured: upsellItem.isFeatured
    //     };

    //     if(upsellItemId) {
    //         reqObj._id = upsellItemId;
    //     }

    //     requestOptions.headers = {
    //         ...authHeader(),
    //         'Content-Type': 'application/json'
    //     };
    //     requestOptions.body = JSON.stringify(reqObj);
    // }

    console.log("requestOptions", requestOptions);

    fetch(saveUpsellItem, requestOptions)
      .then(handleFetchErrors)
      .then((res) => res.json())
      .then((res) => {
        console.log(`${saveUpsellItem} Response`, res);

        const upsellItemObj = res.upsellItemObj;

        setUpsellItem({
          ...upsellItem,
          name: upsellItemObj.name,
          type: upsellItemObj.type,
          description: upsellItemObj.description,
          rentalCharges: upsellItemObj.rentalCharges,
          dlrCharges: upsellItemObj.dlrCharges,
          // isFeatured: upsellItemObj.isFeatured
          //   ? upsellItemObj.isFeatured
          //   : false,
          availability: upsellItemObj.availability
            ? upsellItemObj.availability
            : false,
          photosLinks: upsellItemObj.photos,
        });

        setErrorMessage("");
        setSuccessMessage("Successfully saved Upsell Item data");

        setTimeout(() => {
          setSuccessMessage("");
          history.push("/adminpanel/upsellItemtypes");
        }, 5000);
      })
      .catch((error) => {
        console.log(`${saveUpsellItem} Error`, error);
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
          {upsellItemId ? "Edit Upsell Item" : "Add Upsell Item"}
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
            value={upsellItem.name}
            onChange={(e) => {
              setUpsellItem({
                ...upsellItem,
                name: e.target.value,
              });
            }}
          />

          {rentalItemTypesUpsellList && (
            <Box className="SectionContainer">
              <FormControl required>
                <InputLabel id="itemType-label">Type</InputLabel>
                <Select
                  labelId="itemType-label"
                  id="itemTypeSelect"
                  value={upsellItem.type}
                  onChange={(e) => {
                    setUpsellItem({
                      ...upsellItem,
                      type: e.target.value,
                    });
                  }}
                  className={classes.selectEmpty}
                >
                  {rentalItemTypesUpsellList.map((itemType, itemTypeIndex) => {
                    return (
                      <MenuItem
                        key={`type-${itemType.code}`}
                        value={itemType.code}
                      >
                        {itemType.name}
                      </MenuItem>
                    );
                  })}
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
            value={upsellItem.description}
            onChange={(e) => {
              setUpsellItem({
                ...upsellItem,
                description: e.target.value,
              });
            }}
          />

          {upsellItem.rentalCharges && (
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
                {upsellItem.rentalCharges.pickUp && (
                  <TableContainer component={Paper}>
                    <Table className={classes.table} aria-label="simple table">
                      <TableHead>
                        <TableRow>
                          <TableCell>Hire Period</TableCell>
                          <TableCell>Hire Rate</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {upsellItem.rentalCharges.pickUp.map(
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
                {upsellItem.rentalCharges &&
                  upsellItem.rentalCharges.door2Door && (
                    <TableContainer component={Paper}>
                      <Table
                        className={classes.table}
                        aria-label="simple table"
                      >
                        <TableHead>
                          <TableRow>
                            <TableCell>Hire Period</TableCell>
                            <TableCell>Hire Rate</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {upsellItem.rentalCharges.door2Door.map(
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
              name="rentalCharges"
              onChange={(e) => {
                // console.log(e.target.files);
                parseExcelFile(e.target.files[0]);
                // setUpsellItem({
                //   ...upsellItem,
                //   rentalCharges: parseExcelFile(e.target.files[0]),
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
            value={upsellItem.dlrCharges}
            onChange={(e) => {
              setUpsellItem({
                ...upsellItem,
                dlrCharges: e.target.value,
              });
            }}
          />

          <FormGroup className="SectionContainer">
            {/* <FormControlLabel
              control={
                <Checkbox
                  checked={upsellItem.isFeatured}
                  name="isFeatured"
                  onChange={(e) => {
                    // console.log("onChange isFeatured", e);
                    setUpsellItem({
                      ...upsellItem,
                      isFeatured: !upsellItem.isFeatured,
                    });
                  }}
                />
              }
              label="Is Featured Upsell Item Type?"
            /> */}

            <FormControlLabel
              control={
                <Checkbox
                  checked={upsellItem.availability}
                  name="availability"
                  onChange={(e) => {
                    // console.log("onChange availability", (typeof e.target.value), e.target.value);
                    // console.log("upsellItem.availability", (typeof upsellItem.availability));
                    setUpsellItem({
                      ...upsellItem,
                      availability: !upsellItem.availability,
                    });
                  }}
                />
              }
              label="Set as availability to be Rented?"
            />
          </FormGroup>

          <Box className="SectionContainer">
            <Typography variant="subtitle1">Photos</Typography>

            {!upsellItem.photos && (
              <Box className="SectionContainer">
                {upsellItem.photosLinks.map((photo, photoIndex) => {
                  return (
                    <div key={upsellItem._id + "_photo" + photoIndex}>
                      <a href={photo.data}>Photo {photoIndex + 1}</a>
                    </div>
                  );
                })}
              </Box>
            )}

            <input
              accept="image/jpeg, image/jpg, image/png, application/pdf"
              id="raised-button-file"
              multiple
              type="file"
              name="photos"
              onChange={(e) => {
                // console.log(e.target.files);
                console.log(e.target.files);
                let photos = [];
                if (upsellItem.photos) {
                  photos = upsellItem.photos;
                }
                photos.push(...e.target.files);
                console.log(photos);
                setUpsellItem({
                  ...upsellItem,
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
