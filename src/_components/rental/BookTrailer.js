import React, { useState, useEffect, Fragment } from "react";
import { useLocation, useHistory } from "react-router-dom";
import moment from "moment";

import {
  CssBaseline,
  TextField,
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

import { lighten, makeStyles, withStyles } from "@material-ui/core/styles";

import { authHeader, handleFetchErrors } from "../../_helpers";
import { common } from "../../_constants/common";

import "../../App.css";

const apiUrl = common.apiUrl;
// const getAdminTrailers = `${apiUrl}/admin/trailers`;
// const getAdminUpsellItems = `${apiUrl}/admin/upsellitems`;
const getCustomersAPI = `${apiUrl}/admin/customers`;
const getLicenseeAPI = `${apiUrl}/admin/licensee`;
const bookTrailerAPI = `${apiUrl}/admin/invoice`;

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

const StyledTableCell = withStyles((theme) => ({
  head: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  body: {
    fontSize: 14,
  },
}))(TableCell);

const StyledTableRow = withStyles((theme) => ({
  root: {
    "&:nth-of-type(odd)": {
      backgroundColor: theme.palette.background.default,
    },
  },
}))(TableRow);

export default function UpsellEdit(props) {
  console.log("UpsellEdit", props);

  const classes = useStyles();

  let userData = localStorage.getItem("user");
  userData = JSON.parse(userData);
  // console.log("userData", userData);

  let storedSearchResultData = localStorage.getItem("searchResultData");
  storedSearchResultData = JSON.parse(storedSearchResultData);
  // console.log("storedSearchResultData", storedSearchResultData);

  let searchParamsData = localStorage.getItem("searchParamsData");
  searchParamsData = JSON.parse(searchParamsData);
  // console.log("searchParamsData", searchParamsData);

  let history = useHistory();
  // console.log("history", history);

  let location = useLocation();
  // console.log("location", location);

  const { licenseeId, upsellItemId } = useParams();
  // console.log("upsellItemId", upsellItemId);

  const [loadOnce, setLoadOnce] = useState(0);
  const [licenseeData, setLicenseeData] = useState({});
  const [customers, setCustomers] = useState([]);
  const [searchResultData, setSearchResultData] = useState(
    storedSearchResultData
  );
  const [searchParams, setSearchParams] = useState({
    ...searchParamsData,
    customerId: "",
    rentedItems: [
      {
        itemType: searchResultData.rentalItemType,
        name: searchResultData.name,
        itemId: searchResultData.rentalItemId,
        units: 1,
      },
    ],
  });

  if (searchResultData.upsellItems) {
    const searchParemsRentedItems = [...searchParams.rentedItems];

    searchResultData.upsellItems.forEach((upsellItem) => {
      searchParemsRentedItems.push({
        itemType: upsellItem.rentalItemType,
        name: upsellItem.name,
        itemId: upsellItem.rentalItemId,
        units: 1,
      });
    });

    setSearchParams({
      ...searchParams,
      rentedItems: searchParemsRentedItems,
    });
  }

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const requestOptions = {
      method: "GET",
      headers: authHeader(),
    };
    fetch(`${getCustomersAPI}`, requestOptions)
      .then(handleFetchErrors)
      .then((res) => res.json())
      .then((res) => {
        const customersList = res.customersList;

        setCustomers([...customers, ...customersList]);
      })
      .catch((err) => {
        console.log(
          `Error occurred while fetching ${getCustomersAPI} data`,
          err
        );
      });

    //----------------------------------------------------------------------

    fetch(`${getLicenseeAPI}?id=${searchResultData.licenseeId}`, requestOptions)
      .then(handleFetchErrors)
      .then((res) => res.json())
      .then((res) => {
        const licenseeObj = res.licenseeObj;

        setLicenseeData([...licenseeData, ...licenseeObj]);
      })
      .catch((err) => {
        console.log(
          `Error occurred while fetching ${getLicenseeAPI} data`,
          err
        );
      });

    //----------------------------------------------------------------------
  }, [loadOnce]);

  const [formValidError, setFormValidError] = useState({
    customerId: false,
    units: [],
  });

  const [formValidErrorMessage, setFormValidErrorMessage] = useState({
    customerId: "",
    units: [],
  });

  if (searchParams.rentedItems) {
    const formValidErrorUnits = [...formValidError.units];
    const formValidErrorMessageUnits = [...formValidErrorMessage.units];

    searchParams.rentedItems.forEach((rentedItem) => {
      formValidErrorUnits.push(false);
      formValidErrorMessageUnits.push("");
    });

    setFormValidError({
      ...formValidError,
      units: formValidErrorUnits,
    });

    setFormValidErrorMessage({
      ...formValidErrorMessage,
      units: formValidErrorMessageUnits,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const isError = formValidError.customerId;

    if (isError) {
      return false;
    }

    let requestOptions = {
      method: "POST",
      headers: {
        ...authHeader(),
        "Content-Type": "application/json",
      },
    };

    const reqObj = {
      licenseeId: searchResultData.licenseeId,
      bookedByUserId: searchResultData.customerId,

      rentalPeriod: {
        // required
        start: moment(searchParams.startDate).format("YYYY-MM-DD HH:MM"),
        end: moment(searchParams.endDate).format("YYYY-MM-DD HH:MM"),
      },
      doChargeDLR: searchParams.doChargeDLR,
      isPickUp: searchParams.delivery === "pickup",

      rentedItems: [],
    };

    if (searchParams.rentedItems) {
      searchParams.rentedItems.forEach((rentedItem) => {
        reqObj.rentedItems.push({
          itemType: rentedItem.rentalItemType,
          itemId: rentedItem.rentalItemId,
          units: rentedItem.units,
        });
      });
    }

    let addressObj;
    if (reqObj.isPickUp) {
      addressObj = licenseeData.address;
    } else {
      const customerObj = customers.find((customer) => {
        return customer._id === searchResultData.customerId;
      });
      addressObj = customerObj.address;
    }

    reqObj.pickUpLocation = { ...addressObj };
    reqObj.dropOffLocation = { ...addressObj };

    requestOptions.body = JSON.stringify(reqObj);

    console.log("requestOptions", requestOptions);

    fetch(bookTrailerAPI, requestOptions)
      .then(handleFetchErrors)
      .then((res) => res.json())
      .then((res) => {
        console.log(`${bookTrailerAPI} Response`, res);

        const invoiceObj = res.invoiceObj;

        setErrorMessage("");
        setSuccessMessage("Successfully booked a Trailer");

        setTimeout(() => {
          setSuccessMessage("");
        }, 5000);
      })
      .catch((error) => {
        console.log(`${bookTrailerAPI} Error`, error);
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
          {customers && (
            <Box className="SectionContainer">
              <FormControl required fullWidth className="SectionContainer">
                <InputLabel id="customers-label">Select Customer</InputLabel>
                <Select
                  labelId="customers-label"
                  id="customers-Select"
                  value={searchParams.customerId}
                  onChange={(e) => {
                    setSearchParams({
                      ...searchParams,
                      customerId: searchParams.customerId,
                    });
                  }}
                  className={classes.selectEmpty}
                >
                  {customers.map((customer, customerIndex) => {
                    // console.log("customer", customer._id, customer.name);
                    return (
                      <MenuItem
                        key={`type-${customer._id}`}
                        value={customer._id}
                      >
                        {customer.name} ( customer.customerRef )
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            </Box>
          )}

          <Box className="SectionContainer">
            <Typography component="h6" variant="h6">
              Invoice Details
            </Typography>

            <TableContainer component={Paper}>
              <Table className={classes.table} aria-label="customized table">
                <TableHead>
                  <TableRow>
                    <StyledTableCell>Property</StyledTableCell>
                    <StyledTableCell align="right">Value</StyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <StyledTableRow key="LicenseeId">
                    <StyledTableCell component="th" scope="row">
                      Licensee Id
                    </StyledTableCell>
                    <StyledTableCell align="right">
                      {searchResultData.licenseeId}
                    </StyledTableCell>
                  </StyledTableRow>

                  <StyledTableRow key="CustomerId">
                    <StyledTableCell component="th" scope="row">
                      Customer Id
                    </StyledTableCell>
                    <StyledTableCell align="right">
                      {searchResultData.customerId}
                    </StyledTableCell>
                  </StyledTableRow>

                  <StyledTableRow key="startDate">
                    <StyledTableCell component="th" scope="row">
                      Start Date
                    </StyledTableCell>
                    <StyledTableCell align="right">
                      {moment(searchParams.startDate).format(
                        "YYYY-MM-DD HH:MM"
                      )}
                    </StyledTableCell>
                  </StyledTableRow>

                  <StyledTableRow key="endDate">
                    <StyledTableCell component="th" scope="row">
                      End Date
                    </StyledTableCell>
                    <StyledTableCell align="right">
                      {moment(searchParams.endDate).format("YYYY-MM-DD HH:MM")}
                    </StyledTableCell>
                  </StyledTableRow>

                  <StyledTableRow key="doChargeDLR">
                    <StyledTableCell component="th" scope="row">
                      Do charge Damage Liability Reduction?
                    </StyledTableCell>
                    <StyledTableCell align="right">
                      {searchParams.doChargeDLR ? "Yes" : "No"}
                    </StyledTableCell>
                  </StyledTableRow>

                  <StyledTableRow key="delivery">
                    <StyledTableCell component="th" scope="row">
                      Delivery Type
                    </StyledTableCell>
                    <StyledTableCell align="right">
                      {searchParams.delivery === "pickup"
                        ? "Pickup"
                        : "Dropoff"}
                    </StyledTableCell>
                  </StyledTableRow>

                  <StyledTableRow key="rentalItemType">
                    <StyledTableCell component="th" scope="row">
                      Rental Items
                    </StyledTableCell>
                    <StyledTableCell align="right"></StyledTableCell>
                  </StyledTableRow>

                  {searchParams.rentedItems &&
                    searchParams.rentedItems.map(
                      (rentedItem, rentedItemIndex) => {
                        return (
                          <Fragment>
                            <StyledTableRow
                              key={`rentalItem-${rentedItemIndex}-type`}
                            >
                              <StyledTableCell component="th" scope="row">
                                Rental Item Type
                              </StyledTableCell>
                              <StyledTableCell align="right">
                                {searchResultData.rentalItemType === "trailer"
                                  ? "Trailer"
                                  : "Upsell Item"}
                              </StyledTableCell>
                            </StyledTableRow>

                            <StyledTableRow
                              key={`rentalItem-${rentedItemIndex}-name`}
                            >
                              <StyledTableCell component="th" scope="row">
                                Rental Item Name
                              </StyledTableCell>
                              <StyledTableCell align="right">
                                {searchResultData.name}
                              </StyledTableCell>
                            </StyledTableRow>

                            <StyledTableRow
                              key={`rentalItem-${rentedItemIndex}-units`}
                            >
                              <StyledTableCell component="th" scope="row">
                                Rental Item Units
                              </StyledTableCell>
                              <StyledTableCell align="right">
                                <TextField
                                  variant="outlined"
                                  margin="normal"
                                  required
                                  fullWidth
                                  id={`rentalItem-${rentedItemIndex}-units`}
                                  name={`rentalItem-${rentedItemIndex}-units`}
                                  autoComplete="units"
                                  autoFocus
                                  error={
                                    formValidErrorMessage.units[
                                      rentedItemIndex
                                    ] !== ""
                                  }
                                  helperText={
                                    formValidErrorMessage.units[rentedItemIndex]
                                  }
                                  value={rentedItem.units}
                                  onChange={(e) => {
                                    setSearchParams({
                                      ...searchParams,
                                      units: parseInt(e.target.value),
                                    });
                                  }}
                                />
                              </StyledTableCell>
                            </StyledTableRow>
                          </Fragment>
                        );
                      }
                    )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
            onClick={handleSubmit}
          >
            Book a Trailer
          </Button>
        </form>
      </div>
    </Container>
  );
}
