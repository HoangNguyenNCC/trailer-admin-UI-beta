import React, { useState, Fragment } from "react";
import MaterialTable from "material-table";
import SearchBar from "../common/SearchBar";

import { makeStyles } from "@material-ui/core/styles";
import {
  Button,
  TextField,
  Dialog,
  DialogActions,
  List,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Avatar,
  ListItem,
  ListItemText,
  Typography,
} from "@material-ui/core";
import { authHeader, handleFetchErrors } from "../../_helpers";
import "./Payments.css";
import { common } from "../../_constants/common";
import { toast } from "react-toastify";

import "../../App.css";

const apiUrl = common.apiUrl;
const fetchCustomerFinancialAPI = `${apiUrl}/admin/financial`;
const savePayoutAPI = `${apiUrl}/admin/licenseePayout`;

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
  },
  paper: {
    width: "100%",
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

function DeliveredOrders(props) {
  const [dialogState, setDialogState] = useState(false);
  const [dialogType, setDialogType] = useState("");
  const [dialogContent, setDialogContent] = useState("");
  const [amount, setAmount] = useState("");
  const [payoutRemark, setPayoutRemark] = useState("");
  // const [confirmAmount, setConfirmAmount] = useState("");
  const approvalStatusEnum = {
    0: "Booked",
    1: "Approved",
    2: "Cancelled",
  };
  function handleClickOpen(dialogTypeIn) {
    setDialogState(true);
    setDialogType(dialogTypeIn);
  }

  function handleClose() {
    setDialogState(false);
    setDialogType("");
  }

  const classes = useStyles();

  const tableRef = React.createRef();

  const [searchStr, setSearchStr] = useState("");
  function handleSearch(search) {
    setSearchStr(search);
    if (tableRef.current) {
      tableRef.current.onQueryChange();
    }
  }
  function handleProcessPayment(licenseeId, amount, rentalId) {
    const user = JSON.parse(localStorage.getItem("user"));
    // alert("Request Rejected");
    const requestOptions = {
      method: "POST",
      headers: {
        ...authHeader(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        licenseeId: licenseeId,
        amount: amount,
        sentBy: user._id,
        rentalId: rentalId,
        remarks: payoutRemark,
      }),
    };
    console.log("requestOptions", requestOptions);

    fetch(savePayoutAPI, requestOptions)
      .then(handleFetchErrors)
      .then((res) => res.json())
      .then((res) => {
        console.log(`${savePayoutAPI} Response`, res);
        // rowData.driverLicense.verified = true;
        // rowData.driverLicense.accepted = false;
        toast.success("Payout Successful");
        if (tableRef.current) {
          tableRef.current.onQueryChange();
        }
        setDialogState(false);
      })
      .catch((error) => {
        toast.success("Payout Failed. Try again");
        console.log(`${savePayoutAPI} Error`, error);
      });
    // if (tableRef.current) {
    //     tableRef.current.onQueryChange();
    //   }
  }

  return (
    <div className={`t2y-list t2y-customerlist ${classes.root}`}>
      <Dialog
        open={dialogState}
        onClose={handleClose}
        aria-labelledby="form-dialog-title"
        // disableBackdropClick={true}
        disableEscapeKeyDown={true}
      >
        <DialogTitle id="form-dialog-title">
          {dialogType === "processPayment" && "Process Payment"}
          {dialogType === "rentedItemsDialog" && "Rented Items"}
        </DialogTitle>
        <DialogContent>
          {dialogType === "rentedItemsDialog" && (
            <Fragment>
              <List className={classes.root}>
                {dialogContent.map((rentedItem, rentedItemIndex) => {
                  return (
                    <Fragment>
                      <ListItem
                        divider={true}
                        alignItems="flex-start"
                        key={`rentedItem-${rentedItemIndex}`}
                      >
                        <ListItemText
                          primary={rentedItem.units + " x " + rentedItem.name}
                          secondary={
                            <Fragment>
                              <Typography component="span" variant="body1">
                                Type : {rentedItem.itemType}
                              </Typography>
                            </Fragment>
                          }
                        />
                      </ListItem>
                    </Fragment>
                  );
                })}
              </List>
            </Fragment>
          )}
          {dialogType === "processPayment" && (
            <Fragment>
              <DialogContentText>Charges :</DialogContentText>
              <DialogContentText>
                Total : {dialogContent.totalPayableAmount} AUD
              </DialogContentText>
              <DialogContentText>
                DLR : {dialogContent.totalDLR} AUD
              </DialogContentText>
              <DialogContentText>
                Taxes : {dialogContent.totalTax} AUD
              </DialogContentText>

              <TextField
                autoFocus
                fullWidth
                margin="dense"
                id="name"
                label="Payment Amount"
                type="text"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                }}
              />
              <TextField
                fullWidth
                margin="dense"
                id="remark"
                label="Remarks"
                variant="outlined"
                multiline={true}
                type="text"
                rows={3}
                value={payoutRemark}
                onChange={(e) => {
                  setPayoutRemark(e.target.value);
                }}
              />
            </Fragment>
          )}
        </DialogContent>
        <DialogActions>
          {dialogType === "processPayment" && (
            <Fragment>
              <Button onClick={handleClose} color="primary">
                Cancel
              </Button>
              <Button
                onClick={() =>
                  handleProcessPayment(
                    dialogContent.licenseeId,
                    amount,
                    dialogContent.rentalId
                  )
                }
                color="primary"
              >
                Submit
              </Button>
            </Fragment>
          )}
        </DialogActions>
      </Dialog>

      <SearchBar
        selectOptions={[["Licensee Email", "licenseeEmail"]]}
        handleSearch={(str) => handleSearch(str)}
      />

      <MaterialTable
        title="Delivered Orders - Payment to Licensee"
        tableRef={tableRef}
        columns={[
          {
            title: "Rental ID",
            field: "rentalId",
            render: (rowData) => {
              return rowData.rentalId;
            },
          },
          {
            title: "Customer Name",
            field: "customerName",
            render: (rowData) => {
              return rowData.customerName.name;
            },
          },
          {
            title: "Licensee Name",
            field: "licenseeName",
            render: (rowData) => {
              return rowData.licenseeName.name;
            },
          },
          {
            title: "Trailer Name",
            field: "trailerName",
            render: (rowData) => {
              return rowData.trailerNames ? rowData.trailerNames[0].name : "";
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
                    let items = [];
                    items.push({
                      name: rowData.trailerNames[0].name,
                      units: rowData.rentalObject.rentedItems[0].units,
                      itemType: "Trailer",
                    });
                    rowData.upsellNames.forEach((item, idx) => {
                      items.push({
                        name: item.name,
                        units: rowData.rentalObject.rentedItems[idx + 1].units,
                        itemType: "Upsell Item",
                      });
                    });
                    setDialogContent(items);
                    handleClickOpen("rentedItemsDialog");
                  }}
                >
                  View Rented Items
                </Button>
              );
            },
          },
          {
            title: "Status",
            field: "status",
            render: (rowData) => {
              return approvalStatusEnum[
                rowData.rentalObject.revisions[
                  rowData.rentalObject.revisions.length - 1
                ].isApproved
              ];
            },
          },
          {
            title: "Total Paid",
            field: "totalPaid",
            render: (rowData) => {
              return rowData.rentalObject.revisions[
                rowData.rentalObject.revisions.length - 1
              ].charges
                ? rowData.rentalObject.revisions[
                    rowData.rentalObject.revisions.length - 1
                  ].charges.totalPayableAmount + " AUD"
                : rowData.rentalObject.revisions[0].charges.totalPayableAmount +
                    "  AUD";
              // : rowData.rentalObject.revisions[
              //     rowData.rentalObject.revisions.length - 2
              //   ].charges.totalPayableAmount;
            },
          },

          // {
          //   title: "Booking Date",
          //   field: "bookingDate",
          //   render: (rowData) => {
          //     return rowData.bookingDate ? rowData.bookingDate : "";
          //   },
          // },
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
            fetch(
              `${fetchCustomerFinancialAPI}?${searchStr}isLicenseePaid=false&count=${rowsPerPage}&skip=${
                page * rowsPerPage
              }`,
              requestOptions
            )
              .then(handleFetchErrors)
              .then((res) => res.json())
              .then((res) => {
                console.log(`${fetchCustomerFinancialAPI} Response`, res);
                const customerPaymentsList = res.customerPaymentsList || [];
                const totalCount = res.totalCount || 0;

                resolve({
                  data: res.finances,
                  page: page,
                  totalCount: totalCount,
                });
              })
              .catch((error) => {
                console.log(`${fetchCustomerFinancialAPI} Error`, error);
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
            // icon: ()=><Button variant="outlined" color="primary" id="actionButtons">Process Payment</Button>,
            tooltip: "Process Payment",
            icon: "process",
            onClick: (event, rowData) => {
              // let dialogInput = {
              //   ...rowData.totalCharges,
              //   licenseeId: rowData.licenseeId,
              // };
              // console.log(dialogInput);
              let revisObj = rowData.rentalObject.revisions[
                rowData.rentalObject.revisions.length - 1
              ].charges
                ? rowData.rentalObject.revisions[
                    rowData.rentalObject.revisions.length - 1
                  ].charges
                : rowData.rentalObject.revisions[0].charges;
              let totalTax = revisObj.trailerCharges.taxes;
              let totalDLR = revisObj.trailerCharges.dlrCharges;
              revisObj.upsellCharges.forEach((item) => {
                totalTax = totalTax + item.charges.taxes;
                totalDLR = totalDLR + item.charges.dlrCharges;
              });
              setDialogContent({
                ...revisObj,
                licenseeId: rowData.licenseeId,
                rentalId: rowData.rentalId,
                totalDLR: totalDLR.toFixed(2),
                totalTax: totalTax.toFixed(2),
              });
              handleClickOpen("processPayment");
            },
          },
        ]}
        components={{
          Action: (props) => {
            if (props.action.icon === "process") {
              return (
                <Button
                  onClick={(event) => props.action.onClick(event, props.data)}
                  color="primary"
                  variant="contained"
                  id="actionButtons"
                  // style={{textTransform: 'none'}}
                  size="medium"
                >
                  Process Payment
                </Button>
              );
            }
          },
        }}
        options={{
          actionsColumnIndex: -1,
          sorting: false,
          filtering: false,
          pageSize: 10,
          headerStyle: { position: "sticky", top: 0 },
          maxBodyHeight: "700px",
        }}
      />
    </div>
  );
}

// cancel, check-circle

export default DeliveredOrders;
