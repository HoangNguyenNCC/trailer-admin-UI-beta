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
const getAdminUpsellItems = `${apiUrl}/admin/upsellitems`;
const getLicenseeTrailers = `${apiUrl}/admin/licenseeTrailers`;
const getLicenseeUpsellItem = `${apiUrl}/admin/licensee/upsellitem`;
const saveLicenseeUpsellItem = `${apiUrl}/admin/licensee/upsellitem`;

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

  const { licenseeId, upsellItemId } = useParams();
  // console.log("upsellItemId", upsellItemId);

  let { from } = location.state || { from: { pathname: "/adminpanel/" } };
  if (!upsellItemId && !userData.acl.UPSELL.includes("ADD")) {
    history.replace(from);
  }
  if (upsellItemId && !userData.acl.UPSELL.includes("UPDATE")) {
    history.replace(from);
  }

  // let rentalItemTypesList = localStorage.getItem('rentalitemtypes');
  // rentalItemTypesList = JSON.parse(rentalItemTypesList);
  // // console.log("rentalItemTypesList", rentalItemTypesList);

  // const rentalItemTypesUpsellList = rentalItemTypesList.filter(rentalItemType => {
  //     return (rentalItemType.itemtype === "upsellitem");
  // });

  const upsellItemStart = {
    name: "",
    type: "",
    description: "",

    rentalCharges: {},
    dlrCharges: 0,
    // isFeatured: false,

    photosLinks: [],

    trailerId: "",
    adminRentalItemId: "",
    availability: false,
    quantity: "",
  };

  const [loadOnce, setLoadOnce] = useState(0);
  const [trailers, setTrailers] = useState([]);
  const [adminUpsellItems, setAdminUpsellItems] = useState([]);
  const [upsellItem, setUpsellItem] = useState(upsellItemStart);

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let adminUpsellItemsList = [];
    const requestOptions = {
      method: "GET",
      headers: authHeader(),
    };
    fetch(`${getAdminUpsellItems}`, requestOptions)
      .then(handleFetchErrors)
      .then((res) => res.json())
      .then((res) => {
        adminUpsellItemsList = res.upsellItemsList;

        const adminUpsellItem = adminUpsellItemsList[0];
        upsellItemStart.adminRentalItemId = adminUpsellItem._id;

        setAdminUpsellItems([...adminUpsellItems, ...adminUpsellItemsList]);

        // console.log("adminUpsellItems", upsellItemsList, "upsellItemStart.adminRentalItemId", upsellItemStart.adminRentalItemId);
        setUpsellItem({
          ...upsellItem,
          adminRentalItemId: adminUpsellItem._id,

          name: adminUpsellItem.name,
          type: adminUpsellItem.type,
          description: adminUpsellItem.description,

          rentalCharges: adminUpsellItem.rentalCharges,
          dlrCharges: adminUpsellItem.dlrCharges,
          // isFeatured: adminUpsellItem.isFeatured,
        });
      })
      .catch((err) => {
        console.log("Error occurred while fetching Trailer data", err);
      });

    //----------------------------------------------------------------------

    fetch(`${getLicenseeTrailers}?id=${licenseeId}`, requestOptions)
      .then(handleFetchErrors)
      .then((res) => res.json())
      .then((res) => {
        console.log(`${getLicenseeTrailers} Response`, res);
        const trailersList = res.trailersList || [];

        setTrailers([...trailers, ...trailersList]);
      })
      .catch((error) => {
        console.log(`${getLicenseeTrailers} Error`, error);
      });

    //----------------------------------------------------------------------

    if (upsellItemId) {
      fetch(
        `${getLicenseeUpsellItem}?id=${upsellItemId}&licenseeId=${licenseeId}`,
        requestOptions
      )
        .then(handleFetchErrors)
        .then((res) => res.json())
        .then((res) => {
          const upsellItemObj = res.upsellItemObj;
          // const adminUpsellItem=adminUpsellItemsList.find(item=>item._id===upsellItemObj.)
          setUpsellItem({
            ...upsellItem,
            adminRentalItemId: upsellItemObj.adminRentalItemId,
            name: upsellItemObj.name,
            type: upsellItemObj.type,
            quantity: upsellItemObj.quantity,
            description: upsellItemObj.description,
            rentalCharges: upsellItemObj.rentalCharges,
            dlrCharges: upsellItemObj.dlrCharges,
            trailerId: upsellItemObj.trailerId,
            // isFeatured: upsellItemObj.isFeatured
            //   ? upsellItemObj.isFeatured
            //   : false,
            availability: upsellItemObj.availability
              ? upsellItemObj.availability
              : false,
            photosLinks: upsellItemObj.photos,
          });
        })
        .catch((err) => {
          console.log("Error occurred while fetching Upsell Item data", err);
        });
    }
  }, [loadOnce]);

  const [formValidError, setFormValidError] = useState({
    name: false,
    type: false,
    description: false,

    rentalCharges: false,
    dlrCharges: false,
    // isFeatured: false,

    photos: false,

    trailerId: false,
    adminRentalItemId: false,
    availability: false,
    quantity: false,
  });

  const [formValidErrorMessage, setFormValidErrorMessage] = useState({
    name: "",
    type: "",
    description: "",

    rentalCharges: "",
    dlrCharges: "",
    // isFeatured: "",

    photos: "",

    trailerId: "",
    adminRentalItemId: "",
    availability: "",
    quantity: "",
  });

  async function handleSubmit(e) {
    e.preventDefault();

    const isError =
      formValidError.name ||
      formValidError.type ||
      formValidError.description ||
      formValidError.rentalCharges ||
      formValidError.dlrCharges ||
      formValidError.photos ||
      formValidError.trailerId ||
      formValidError.adminRentalItemId ||
      formValidError.availability ||
      formValidError.quantity;

    if (isError) {
      return false;
    }

    let requestOptions = {
      method: "POST",
    };

    // if(upsellItem.rates || upsellItem.photos) {
    const formData = new FormData();
    const reqObj = {
      name: upsellItem.name,
      type: upsellItem.type,
      description: upsellItem.description,
      adminRentalItemId: upsellItem.adminRentalItemId,
      trailerId: upsellItem.trailerId,
      availability: upsellItem.availability,
      quantity: upsellItem.quantity,
    };
    if (upsellItemId) {
      reqObj._id = upsellItemId;
    }
    formData.append("reqBody", JSON.stringify(reqObj));
    // const reqObj={
    //     name:upsellItem.name,
    //     type:upsellItem.type,
    //     description:upsellItem.description,
    //     adminRentalItemId:upsellItem.adminRentalItemId,
    //     trailerId:upsellItem.trailerId,
    //     availability:upsellItem.availability,
    //     quantity:upsellItem.quantity,
    //     licenseeId:licenseeId,
    //     _id:upsellItemId
    // }

    // formData.append('name', upsellItem.name);
    // formData.append('type', upsellItem.type);
    // formData.append('description', upsellItem.description);

    // formData.append('adminRentalItemId', upsellItem.adminRentalItemId);
    // formData.append('trailerId', upsellItem.trailerId);
    // formData.append('availability', upsellItem.availability);
    // formData.append('quantity', upsellItem.quantity);

    if (upsellItem.photos && upsellItem.photos.length > 0) {
      for (let i = 0; i < upsellItem.photos.length; i++) {
        formData.append(
          "photos",
          upsellItem.photos[i],
          upsellItem.photos[i].name
        );
      }
    }

    formData.append("licenseeId", licenseeId);
    // if(upsellItemId) {
    //     formData.append('_id', upsellItemId);
    // }

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

    //         adminRentalItemId: upsellItem.adminRentalItemId,
    //         trailerId: upsellItem.trailerId,
    //         availability: upsellItem.availability,
    //         quantity: upsellItem.quantity,

    //         licenseeId: licenseeId
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

    fetch(saveLicenseeUpsellItem, requestOptions)
      .then(handleFetchErrors)
      .then((res) => res.json())
      .then((res) => {
        console.log(`${saveLicenseeUpsellItem} Response`, res);
        const upsellItemObj = res.upsellItemObj;

        setUpsellItem({
          ...upsellItem,
          name: upsellItemObj.name,
          type: upsellItemObj.type,
          description: upsellItemObj.description,

          photosLinks: upsellItemObj.photos,

          adminRentalItemId: upsellItemObj.adminRentalItemId,
          trailerId: upsellItemObj.trailerId ? upsellItemObj.trailerId : "",
          availability: upsellItemObj.availability
            ? upsellItemObj.availability
            : false,
          quantity: upsellItemObj.quantity,
        });

        setErrorMessage("");
        setSuccessMessage("Successfully saved Upsell Item data");

        setTimeout(() => {
          setSuccessMessage("");
          history.push(`/adminpanel/licensee/${licenseeId}/upsellitems`);
        }, 5000);
      })
      .catch((error) => {
        console.log(`${saveLicenseeUpsellItem} Error`, error);
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
          {adminUpsellItems && upsellItem.adminRentalItemId && (
            <Box className="SectionContainer">
              <FormControl required fullWidth className="SectionContainer">
                <InputLabel id="adminRentalItemId-label">
                  Select Upsell Item Type
                </InputLabel>
                <Select
                  labelId="adminRentalItemId-label"
                  id="adminRentalItemId-Select"
                  value={upsellItem.adminRentalItemId}
                  onChange={(e) => {
                    const adminUpsellItem = adminUpsellItems.find(
                      (adminUpsellItem) => {
                        return e.target.value === adminUpsellItem._id;
                      }
                    );
                    setUpsellItem({
                      ...upsellItem,

                      adminRentalItemId: adminUpsellItem._id,

                      name: adminUpsellItem.name,
                      type: adminUpsellItem.type,
                      description: adminUpsellItem.description,

                      rentalCharges: adminUpsellItem.rentalCharges,
                      dlrCharges: adminUpsellItem.dlrCharges,
                      // isFeatured: adminUpsellItem.isFeatured,
                    });
                  }}
                  className={classes.selectEmpty}
                >
                  {adminUpsellItems.map(
                    (adminUpsellItem, adminUpsellItemIndex) => {
                      // console.log("adminUpsellItem", adminUpsellItem._id, adminUpsellItem.name);
                      return (
                        <MenuItem
                          key={`type-${adminUpsellItem._id}`}
                          value={adminUpsellItem._id}
                        >
                          {adminUpsellItem.name}
                        </MenuItem>
                      );
                    }
                  )}
                </Select>
              </FormControl>
            </Box>
          )}

          {trailers && (
            <Box className="SectionContainer">
              <FormControl required fullWidth className="SectionContainer">
                <InputLabel id="trailerId-label">Select TrailerId</InputLabel>
                <Select
                  labelId="trailerId-label"
                  id="trailerId-Select"
                  value={upsellItem.trailerId}
                  onChange={(e) => {
                    setUpsellItem({
                      ...upsellItem,
                      trailerId: e.target.value,
                    });
                  }}
                  className={classes.selectEmpty}
                >
                  {trailers.map((trailer, trailerIndex) => {
                    // console.log("trailer", trailer._id, trailer.name);
                    return (
                      <MenuItem
                        key={`type-${trailer._id}`}
                        value={trailer._id}
                      >{`${trailer.name} (${trailer.vin})`}</MenuItem>
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
            id="quantity"
            label="quantity"
            name="quantity"
            autoComplete="quantity"
            autoFocus
            error={formValidError.quantity}
            helperText={formValidErrorMessage.quantity}
            value={upsellItem.quantity}
            onChange={(e) => {
              setUpsellItem({
                ...upsellItem,
                quantity: e.target.value,
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
            value={upsellItem.name}
            onChange={(e) => {
              setUpsellItem({
                ...upsellItem,
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
            value={upsellItem.type}
            onChange={(e) => {
              setUpsellItem({
                ...upsellItem,
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
                  disabled={true}
                  checked={upsellItem.isFeatured}
                  name="isFeatured"
                  onChange={(e) => {
                    console.log("onChange isFeatured", e);
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
                    console.log(
                      "onChange availability",
                      typeof e.target.value,
                      e.target.value
                    );
                    console.log(
                      "upsellItem.availability",
                      typeof upsellItem.availability
                    );
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
