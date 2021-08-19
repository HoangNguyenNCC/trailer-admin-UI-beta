import React, { useState, Fragment } from "react";
import MaterialTable from "material-table";
import SearchBar from "../common/SearchBar";

import {
  ButtonGroup,
  Button,
  List,
  ListItem,
  ListItemText,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@material-ui/core";
import moment from "moment";

import { makeStyles } from "@material-ui/core/styles";

import { authHeader, handleFetchErrors } from "../../_helpers";
import { common } from "../../_constants/common";

import "../../App.css";

const apiUrl = common.apiUrl;
const fetchRentalsAPI = `${apiUrl}/admin/rentals`;
const saveRentalApproval = `${apiUrl}/admin/rental/approval`;
// const saveRentalApproval = `${apiUrl}/rental/approval`;

const approvalStatusEnum = {
  0: "Booked",
  1: "Approved",
  2: "Cancelled",
};

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
  },
  paper: {
    width: "100%",
    marginBottom: theme.spacing(2),
  },
  paperCenter: {
    width: "100%",
    textAlign: "center",
    marginBottom: theme.spacing(2),
  },
  table: {
    minWidth: 750,
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
}));

function Rentals(props) {
  const classes = useStyles();

  // const [rows, setRows] = React.useState([]);
  // const [totalCount, setTotalCount] = React.useState(0);
  const [requestType, setRequestType] = React.useState("rental"); //other values: extension, reschedule

  //-------------------------------------------------------------------------

  const [dialogState, setDialogState] = useState(false);
  const [dialogType, setDialogType] = useState("");
  const [dialogContent, setDialogContent] = useState("");

  function handleClickOpen(dialogTypeIn) {
    setDialogState(true);
    setDialogType(dialogTypeIn);
  }

  function handleClose() {
    setDialogState(false);
    setDialogType("");
  }

  //-------------------------------------------------------------------------

  const tableRef = React.createRef();

  const [searchStr, setSearchStr] = useState("");
  function handleSearch(search) {
    setSearchStr(search);
    if (tableRef.current) {
      tableRef.current.onQueryChange();
    }
  }

  const [filterStr, setFilterStr] = useState("");
  function handleFilter(filter) {
    setFilterStr(filter);
    if (tableRef.current) {
      tableRef.current.onQueryChange();
    }
  }

  return (
    <div className={`t2y-list t2y-rentalrequest-list ${classes.root}`}>
      <Dialog
        open={dialogState}
        onClose={handleClose}
        aria-labelledby="form-dialog-title"
        // disableBackdropClick={true}
        disableEscapeKeyDown={true}
      >
        <DialogTitle id="form-dialog-title">
          {dialogType === "rentedItemsDialog" && "Rental Items"}
          {dialogType === "rowDetailsDialog" && "Driver License Details"}
        </DialogTitle>
        <DialogContent>
          {dialogType === "rentedItemsDialog" && (
            <Fragment>
              {dialogContent.rentedItems.length === 0 &&
                "List of rented Items can't be loaded"}
              {dialogContent.rentedItems.length > 0 && (
                <List className={classes.root}>
                  <ListItem alignItems="flex-start">
                    <ListItemText
                      primary={dialogContent.rentedItems[0].itemName}
                      secondary={
                        <Fragment>
                          <Typography component="span" variant="body1">
                            Units : {dialogContent.rentedItems[0].units} ---
                            Charges :{" "}
                            {dialogContent.charges.trailerCharges.rentalCharges}{" "}
                            AUD
                          </Typography>
                        </Fragment>
                      }
                    />
                  </ListItem>
                  {dialogContent.upsellItems.map(
                    (rentedItem, rentedItemIndex) => {
                      return (
                        <Fragment>
                          <ListItem
                            alignItems="flex-start"
                            key={`rentedItem-${rentedItemIndex}`}
                          >
                            <ListItemText
                              primary={rentedItem.itemName}
                              secondary={
                                <Fragment>
                                  <Typography component="span" variant="body1">
                                    Units : {rentedItem.units} --- Charges :{" "}
                                    {(
                                      dialogContent.charges.upsellCharges[
                                        rentedItemIndex
                                      ].charges.rentalCharges * rentedItem.units
                                    ).toFixed(2)}{" "}
                                    AUD
                                  </Typography>
                                </Fragment>
                              }
                            />
                          </ListItem>
                        </Fragment>
                      );
                    }
                  )}
                </List>
              )}
            </Fragment>
          )}
          {dialogType === "rowDetailsDialog" && <Fragment></Fragment>}
        </DialogContent>
        <DialogActions>
          {dialogType === "rentedItemsDialog" && (
            <Fragment>
              <Button onClick={handleClose} color="primary">
                Close
              </Button>
            </Fragment>
          )}
          {dialogType === "rowDetailsDialog" && (
            <Fragment>
              <Button onClick={handleClose} color="primary">
                Close
              </Button>
            </Fragment>
          )}
        </DialogActions>
      </Dialog>

      <div className={classes.paperCenter}>
        <ButtonGroup
          size="large"
          color="primary"
          aria-label="large outlined primary button group"
        >
          <Button
            variant={requestType === "rental" ? "contained" : "outlined"}
            onClick={() => {
              console.log("Rental Button Clicked");
              setRequestType("rental");
              if (tableRef.current) {
                tableRef.current.onQueryChange();
              }
            }}
          >
            Rental
          </Button>
          <Button
            variant={requestType === "extension" ? "contained" : "outlined"}
            onClick={() => {
              console.log("Extension Button Clicked");
              setRequestType("extension");
              if (tableRef.current) {
                tableRef.current.onQueryChange();
              }
            }}
          >
            Extension
          </Button>
          <Button
            variant={requestType === "reschedule" ? "contained" : "outlined"}
            onClick={() => {
              console.log("Reschedule Button Clicked");
              setRequestType("reschedule");
              if (tableRef.current) {
                tableRef.current.onQueryChange();
              }
            }}
          >
            Reschedule
          </Button>
        </ButtonGroup>
      </div>
      <SearchBar
        selectOptions={[
          ["Customer Email", "customerEmail"],
          ["Licensee Email", "licenseeEmail"],
        ]}
        filterSelect={selectOptions}
        filterRadio={radioOptions}
        title="Rental"
        handleSearch={(str) => handleSearch(str)}
        handleFilter={(str) => handleFilter(str)}
      />
      <MaterialTable
        title={`${
          requestType === "rental"
            ? "Rentals List"
            : requestType === "extension"
            ? "Extensions List"
            : "Reschedule List"
        }`}
        tableRef={tableRef}
        columns={[
          {
            title: "Invoice Reference",
            field: "invoiceReference",
            render: (rowData) => {
              return `${rowData.rentalId}`;
            },
          },
          {
            title: "Rental Period Start Date",
            field: "rentalPeriodStart",
            render: (rowData) => {
              return rowData.revisions[rowData.revisions.length - 1].charges
                ? moment(
                    rowData.revisions[rowData.revisions.length - 1].start
                  ).format("DD-MM-YYYY")
                : moment(
                    rowData.revisions[rowData.revisions.length - 2].start
                  ).format("DD-MM-YYYY");
            },
          },
          {
            title: "Rental Period End Date",
            field: "rentalPeriodEnd",
            render: (rowData) => {
              return rowData.revisions[rowData.revisions.length - 1].charges
                ? moment(
                    rowData.revisions[rowData.revisions.length - 1].end
                  ).format("DD-MM-YYYY")
                : moment(
                    rowData.revisions[rowData.revisions.length - 2].end
                  ).format("DD-MM-YYYY");
            },
          },
          {
            title: "Rented Items",
            field: "rentedItems",
            render: (rowData) => {
              return (
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={(e) => {
                    setDialogContent({
                      rentedItems: rowData.rentedItems,
                      upsellItems: rowData.rentedItems.splice(1),
                      charges: rowData.revisions[rowData.revisions.length - 1]
                        .charges
                        ? rowData.revisions[rowData.revisions.length - 1]
                            .charges
                        : rowData.revisions[0].charges,
                      // : rowData.revisions[rowData.revisions.length - 2]
                      //     .charges,
                    });
                    console.log(rowData.rentedItems.splice(1));
                    handleClickOpen("rentedItemsDialog");
                  }}
                >
                  View Rented Items
                </Button>
              );
            },
          },
          {
            title: "Licensee Name",
            field: "licenseeName",
            render: (rowData) => {
              return (
                <a href={`/adminpanel/licensee/edit/${rowData.licenseeId}`}>
                  {rowData.licenseeName}
                </a>
              );
            },
          },
          {
            title: "Customer Name",
            field: "customerName",
            render: (rowData) => {
              return (
                <a href={`/adminpanel/customer/edit/${rowData.customerId}`}>
                  {rowData.customerName}
                </a>
              );
            },
          },
          {
            title: "Delivery Type",
            field: "deliveryType",
            render: (rowData) => {
              return rowData.isPickUp ? "PICK UP" : "DROP OFF";
            },
          },
          {
            title: "Total",
            field: "total",
            render: (rowData) => {
              return rowData.revisions[rowData.revisions.length - 1].charges
                ? rowData.revisions[
                    rowData.revisions.length - 1
                  ].charges.totalPayableAmount.toFixed(2) + " AUD"
                : rowData.charges.totalPayableAmount.toFixed(2) + " AUD";
            },
          },

          {
            title: "Rental Request Status",
            field: "isApproved",
            render: (rowData) => {
              return approvalStatusEnum[
                rowData.revisions[rowData.revisions.length - 1].isApproved
              ];
            },
          },
        ]}
        data={(query) => {
          console.log("MaterialTable data", query);
          const rowsPerPage = query.pageSize;
          const page = query.page;

          const requestOptions = {
            method: "GET",
            headers: authHeader(),
          };
          return new Promise((resolve, reject) => {
            // fetch(`${fetchRentalsAPI}?type=${requestType}&count=${rowsPerPage}&skip=${(page * rowsPerPage)}`, requestOptions)
            fetch(
              `${fetchRentalsAPI}?${filterStr}${searchStr}type=${requestType}&count=${rowsPerPage}&skip=${
                page * rowsPerPage
              }&upcoming=true`,
              requestOptions
            )
              .then(handleFetchErrors)
              .then((res) => res.json())
              .then((res) => {
                console.log(`${fetchRentalsAPI} Response`, res);
                const requestList = res.requestList || [];
                const totalCount = res.totalCount || 0;

                // let newRows = [];
                // setRows((currentRows) => {
                //     console.log((typeof currentRows), (typeof requestList));
                //     newRows = [
                //         ...currentRows,
                //         ...requestList
                //     ];
                //     console.log("newRows", newRows);
                //     return newRows;
                // });

                // setTotalCount(totalCount);

                resolve({
                  data: requestList,
                  page: page,
                  totalCount: totalCount,
                });
              })
              .catch((error) => {
                console.log(`${fetchRentalsAPI} Error`, error);
                resolve({
                  data: [],
                  page: 0,
                  totalCount: 0,
                });
              });
          });
        }}
        actions={[
          {
            icon: "check_circle",
            tooltip: "Approve",
            // disabled: (rowData.isApproved !== 0),
            onClick: (event, rowData) => {
              console.log("Approve onClick", event, rowData);
              // if((rowData.isApproved !== 0)) {

              let requestBody = {
                rentalId: rowData.rentalId,
                revisionId: rowData.revisions[rowData.revisions.length - 1]._id,
                approvalStatus: "approved",
                NOPAYMENT: true,
              };

              const requestOptions = {
                method: "PUT",
                headers: {
                  ...authHeader(),
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
              };
              console.log("requestOptions", requestOptions);

              fetch(saveRentalApproval, requestOptions)
                .then(handleFetchErrors)
                .then((res) => res.json())
                .then((res) => {
                  console.log(`${saveRentalApproval} Response`, res);
                  // rowData.driverLicense.verified = true;
                  // rowData.driverLicense.accepted = true;
                  if (tableRef.current) {
                    tableRef.current.onQueryChange();
                  }
                })
                .catch((error) => {
                  console.log(`${saveRentalApproval} Error`, error);
                });
              // }
            },
          },
          {
            icon: "cancel",
            tooltip: "Reject",
            onClick: (event, rowData) => {
              console.log("Reject onClick", event, rowData);
              // if((rowData.isApproved !== 0)) {
              console.log("Hello!", rowData);
              let requestBody = {
                rentalId: rowData._id,
                revisionId: rowData.revisions[rowData.revisions.length - 1]._id,
                approvalStatus: "rejected",
              };

              const requestOptions = {
                method: "PUT",
                headers: {
                  ...authHeader(),
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
              };
              console.log("requestOptions", requestOptions);

              fetch(saveRentalApproval, requestOptions)
                .then(handleFetchErrors)
                .then((res) => res.json())
                .then((res) => {
                  console.log(`${saveRentalApproval} Response`, res);
                  // rowData.driverLicense.verified = true;
                  // rowData.driverLicense.accepted = false;
                  if (tableRef.current) {
                    tableRef.current.onQueryChange();
                  }
                })
                .catch((error) => {
                  console.log(`${saveRentalApproval} Error`, error);
                });
              // }
            },
          },
        ]}
        options={{
          actionsColumnIndex: -1,
          filtering: false,
          sorting: false,
          pageSize: 20,
          headerStyle: { position: "sticky", top: 0 },
          maxBodyHeight: "700px",
        }}
      />
    </div>
  );
}

const radioOptions = [
  {
    name: "Booking Approved?",
    param: "approved",
    options: [
      {
        text: "True",
        value: "true",
      },
      {
        text: "False",
        value: "false",
      },
      {
        text: "Anything",
        value: "",
      },
    ],
  },

  // {
  //   name: "DL Accepted",
  //   param: "dlAccepted",
  //   options: [
  //     {
  //       text: "True",
  //       value: "true",
  //     },
  //     {
  //       text: "False",
  //       value: "false",
  //     },
  //     {
  //       text: "Both",
  //       value: "",
  //     },
  //   ],
  // },
];
const selectOptions = [
  // {
  //   name: "States",
  //   param: "state",
  //   values: common.states,
  // },
];
// cancel, check-circle

export default Rentals;
