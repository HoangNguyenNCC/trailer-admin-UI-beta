/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import { useLocation, useHistory, useParams } from "react-router-dom";

import moment from "moment";

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
const getTrailers = `${apiUrl}/admin/licensee/trailers`;
const getUpsellItems = `${apiUrl}/admin/licensee/upsellitems`;
const saveBlockTrailer = `${apiUrl}/admin/licensee/trailer/block`;
const getBlockTrailer = `${apiUrl}/admin/licensee/trailer/block`;

export default function BlockTrailerEdit(props) {
  console.log("BlockTrailerEdit");

  const classes = useStyles();

  let userData = localStorage.getItem("user");
  userData = JSON.parse(userData);
  // console.log("userData", userData);

  let history = useHistory();
  // console.log("history", history);

  let location = useLocation();
  // console.log("location", location);

  // const { licenseeId, blockingId } = useParams();
  let { licenseeId, blockingId } = useParams();
  // console.log("licenseeId", licenseeId, "blockingId", blockingId);

  let { from } = location.state || { from: { pathname: "/adminpanel/" } };
  if (
    !userData.acl.BLOCK.includes("ADD") ||
    !userData.acl.BLOCK.includes("UPDATE")
  ) {
    history.replace(from);
  }

  const blockingStart = {
    startDate: moment().add(1, "day").format("YYYY-MM-DD"),
    startTime: moment().add(1, "day").format("HH:mm"),
    endDate: moment().add(2, "day").format("YYYY-MM-DD"),
    endTime: moment().add(2, "day").format("HH:mm"),
    isDeleted: false,

    items: [],
  };

  const loadOnce = 0;
  const [trailers, setTrailers] = useState([]);
  const [upsellItems, setUpsellItems] = useState([]);
  const [blockingData, setBlockingData] = useState(blockingStart);

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const requestOptions = {
      method: "GET",
      headers: authHeader(),
    };

    //--------------------------------------------------------------

    if (blockingId) {
      fetch(`${getBlockTrailer}?id=${blockingId}`, requestOptions)
        .then(handleFetchErrors)
        .then((res) => res.json())
        .then((res) => {
          const blockingObj = res.blockingObj;

          setBlockingData({
            ...blockingData,
            ...blockingObj,
          });
        })
        .catch((error) => {
          console.log(
            "Error occurred while fetching Trailer Blocking data",
            error
          );
        });
    }

    //--------------------------------------------------------------

    fetch(`${getTrailers}?licenseeId=${licenseeId}`, requestOptions)
      .then(handleFetchErrors)
      .then((res) => res.json())
      .then((res) => {
        const trailersList = res.trailersList;

        setTrailers({
          ...trailers,
          ...trailersList,
        });
      })
      .catch((error) => {
        console.log("Error occurred while fetching Trailers data", error);
      });

    //--------------------------------------------------------------

    fetch(`${getUpsellItems}?licenseeId=${licenseeId}`, requestOptions)
      .then(handleFetchErrors)
      .then((res) => res.json())
      .then((res) => {
        const upsellItemsList = res.upsellItemsList;

        setUpsellItems({
          ...upsellItems,
          ...upsellItemsList,
        });
      })
      .catch((err) => {
        console.log("Error occurred while fetching Upsell Items data", err);
      });

    //--------------------------------------------------------------
  }, [loadOnce]);

  const formValidError = {
    startDate: false,
    startTime: false,
    endDate: false,
    endTime: false,
    isDeleted: false,
    items: false,
  };

  // const [formValidErrorMessage, setFormValidErrorMessage] = useState({
  //     startDate: "",
  //     starTime: "",
  //     endDate: "",
  //     endTime: "",
  //     isDeleted: "",
  //     items: ""
  // });
  const formValidErrorMessage = {
    startDate: "",
    starTime: "",
    endDate: "",
    endTime: "",
    isDeleted: "",
    items: "",
  };

  async function handleSubmit(e) {
    e.preventDefault();

    const isError =
      formValidError.startDate ||
      formValidError.startTime ||
      formValidError.endDate ||
      formValidError.endTime ||
      formValidError.isDeleted ||
      formValidError.items;

    if (isError) {
      return false;
    }

    let requestOptions = {
      method: "POST",
    };

    // console.log("blockingData.startDate", blockingData.startDate);
    // console.log("blockingData.endDate", blockingData.endDate);

    const reqObj = {
      startDate: moment(
        `${blockingData.startDate} ${blockingData.startTime}`
      ).format("YYYY-MM-DD HH:mm"),
      endDate: moment(`${blockingData.endDate} ${blockingData.endTime}`).format(
        "YYYY-MM-DD HH:mm"
      ),
      isDeleted: blockingData.isDeleted,

      items: blockingData.items,
    };

    if (blockingId) {
      reqObj._id = blockingId;
    }

    requestOptions.headers = {
      ...authHeader(),
      "Content-Type": "application/json",
    };
    requestOptions.body = JSON.stringify(reqObj);

    console.log("requestOptions", requestOptions);

    fetch(saveBlockTrailer, requestOptions)
      .then(handleFetchErrors)
      .then((res) => res.json())
      .then((res) => {
        console.log(`${saveBlockTrailer} Response`, res);

        const blockingObj = res.blockingObj;

        blockingId = blockingObj._id;

        setBlockingData({
          ...blockingData,

          startDate: moment(blockingObj.startDate).format("YYYY-MM-DD"),
          startTime: moment(blockingObj.startDate).format("HH:mm"),
          endDate: moment(blockingObj.endDate).format("YYYY-MM-DD"),
          endTime: moment(blockingObj.endDate).format("HH:mm"),
          isDeleted: blockingObj.isDeleted,

          items: blockingObj.items,
        });

        setErrorMessage("");
        setSuccessMessage("Successfully saved Trailer Blocking data");

        setTimeout(() => {
          setSuccessMessage("");
        }, 5000);
      })
      .catch((error) => {
        console.log(`${saveBlockTrailer} Error`, error);
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
          {blockingId ? "Edit Block Trailer Data" : "Add Block Trailer Data"}
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
            aria-label="Start Date"
            required
            fullWidth
            type="date"
            id="startDate"
            label="Start Date"
            name="startDate"
            autoComplete="startDate"
            autoFocus
            error={formValidErrorMessage.startDate !== ""}
            helperText={formValidErrorMessage.startDate}
            value={blockingData.startDate}
            onChange={(e) => {
              setBlockingData({
                ...blockingData,
                startDate: e.target.value,
              });
            }}
          />

          <TextField
            variant="outlined"
            margin="normal"
            aria-label="Start Time"
            required
            fullWidth
            type="time"
            id="startTime"
            label="Start Time"
            name="startTime"
            autoComplete="startTime"
            autoFocus
            error={formValidErrorMessage.startTime !== ""}
            helperText={formValidErrorMessage.startTime}
            value={blockingData.startTime}
            onChange={(e) => {
              setBlockingData({
                ...blockingData,
                startTime: e.target.value,
              });
            }}
          />

          <TextField
            variant="outlined"
            margin="normal"
            aria-label="End Date"
            required
            fullWidth
            type="date"
            id="endDate"
            label="End Date"
            name="endDate"
            autoComplete="endDate"
            autoFocus
            error={formValidErrorMessage.endDate !== ""}
            helperText={formValidErrorMessage.endDate}
            value={blockingData.endDate}
            onChange={(e) => {
              setBlockingData({
                ...blockingData,
                endDate: e.target.value,
              });
            }}
          />

          <TextField
            variant="outlined"
            margin="normal"
            aria-label="End Time"
            required
            fullWidth
            type="time"
            id="endTime"
            label="End Time"
            name="endTime"
            autoComplete="endTime"
            autoFocus
            error={formValidErrorMessage.endTime !== ""}
            helperText={formValidErrorMessage.endTime}
            value={blockingData.endTime}
            onChange={(e) => {
              setBlockingData({
                ...blockingData,
                endTime: e.target.value,
              });
            }}
          />

          <FormGroup className="SectionContainer">
            <FormControlLabel
              control={
                <Checkbox
                  checked={blockingData.isDeleted}
                  name="isDeleted"
                  onChange={(e) => {
                    console.log("onChange isDeleted", e);
                    setBlockingData({
                      ...blockingData,
                      isDeleted: !blockingData.isDeleted,
                    });
                  }}
                />
              }
              label="Is Deleted?"
            />
          </FormGroup>

          {
            <FormGroup className="SectionContainer">
              <Grid container spacing={0}>
                <Grid item sm={6}>
                  <Typography variant="subtitle1">Rental Items</Typography>
                </Grid>
                <Grid item sm={6} className="TextAlignRight">
                  <Button
                    type="button"
                    variant="contained"
                    color="primary"
                    className={classes.submit}
                    onClick={(e) => {
                      const newItems = [...blockingData.items];
                      newItems.push({
                        itemType: "trailer",
                        itemId:
                          trailers && trailers.length > 0
                            ? trailers[0]._id
                            : "",
                        quantity: 1,
                      });
                      setBlockingData({
                        ...blockingData,
                        items: newItems,
                      });
                    }}
                  >
                    Add
                  </Button>
                </Grid>
              </Grid>

              {blockingData.items.map((item, itemIndex) => {
                return (
                  <React.Fragment key={`rentalitem-${itemIndex}`}>
                    {
                      <FormControl required>
                        <InputLabel id="itemType-label">Item Type</InputLabel>
                        <Select
                          labelId="itemType-label"
                          id="itemType-Select"
                          value={item.itemType}
                          onChange={(e) => {
                            const newItems = [...blockingData.items];
                            newItems[itemIndex].itemType = e.target.value;
                            setBlockingData({
                              ...blockingData,
                              items: newItems,
                            });
                          }}
                          className={classes.selectEmpty}
                        >
                          <MenuItem value="trailer">Trailer</MenuItem>
                          <MenuItem value="upsellitem">Upsell Item</MenuItem>
                        </Select>
                      </FormControl>
                    }

                    {item.type === "trailer" && trailers && (
                      <Box className="SectionContainer">
                        <FormControl required>
                          <InputLabel id="itemId-trailer-label">
                            Select Trailer
                          </InputLabel>
                          <Select
                            labelId="itemId-trailer-label"
                            id="itemId-trailer-Select"
                            value={item.itemId}
                            onChange={(e) => {
                              const newItems = [...blockingData.items];
                              newItems[itemIndex].itemId = e.target.value;
                              setBlockingData({
                                ...blockingData,
                                items: newItems,
                              });
                            }}
                            className={classes.selectEmpty}
                          >
                            {trailers.map((trailer, trailerIndex) => {
                              return (
                                <MenuItem
                                  key={`type-${trailer._id}`}
                                  value={trailer._id}
                                >
                                  {trailer.name} ({trailer.vin})
                                </MenuItem>
                              );
                            })}
                          </Select>
                        </FormControl>
                      </Box>
                    )}

                    {item.type === "upsellitem" && upsellItems && (
                      <Box className="SectionContainer">
                        <FormControl required>
                          <InputLabel id="itemId-upsellitem-label">
                            Select Upsell Item
                          </InputLabel>
                          <Select
                            labelId="itemId-upsellitem-label"
                            id="itemId-upsellitem-Select"
                            value={item.itemId}
                            onChange={(e) => {
                              const newItems = [...blockingData.items];
                              newItems[itemIndex].itemId = e.target.value;
                              setBlockingData({
                                ...blockingData,
                                items: newItems,
                              });
                            }}
                            className={classes.selectEmpty}
                          >
                            {upsellItems.map((upsellItem, upsellItemIndex) => {
                              return (
                                <MenuItem
                                  key={`type-${upsellItem._id}`}
                                  value={upsellItem._id}
                                >
                                  {upsellItem.name} ({upsellItem.vin})
                                </MenuItem>
                              );
                            })}
                          </Select>
                        </FormControl>
                      </Box>
                    )}

                    <TextField
                      key={`quantity-${itemIndex}`}
                      variant="outlined"
                      margin="normal"
                      required
                      fullWidth
                      label="Quantity"
                      name="quantity"
                      autoComplete="quantity"
                      autoFocus
                      error={formValidError.quantity}
                      helperText={formValidErrorMessage.quantity}
                      value={item.quantity}
                      onChange={(e) => {
                        const newItems = [...blockingData.items];
                        newItems[itemIndex] = e.target.value;
                        setBlockingData({
                          ...blockingData,
                          items: newItems,
                        });
                      }}
                    />
                  </React.Fragment>
                );
              })}
            </FormGroup>
          }
        </form>

        <Button
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
          className={classes.submit}
          onClick={handleSubmit}
        >
          {blockingId ? "Save" : "Update"}
        </Button>
      </div>
    </Container>
  );
}
