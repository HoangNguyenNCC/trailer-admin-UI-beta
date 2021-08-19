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
const fetchPendingRefundsAPI = `${apiUrl}/admin/pendingCustomerRefunds`;
const saveRefundAPI = `${apiUrl}/admin/refundCustomer`;

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

function CancelledOrders(props) {
  const [dialogState, setDialogState] = useState(false);
  const [dialogType, setDialogType] = useState("");
  const [dialogContent, setDialogContent] = useState("");
  const [amount, setAmount] = useState("");
  const [refundRemark, setRefundRemark] = useState("");
  // const [confirmAmount, setConfirmAmount] = useState("");

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
  function handleProcessRefund({ customerId, rentalId, bookingId }) {
    const user = JSON.parse(localStorage.getItem("user"));
    // alert("Request Rejected");

    const requestOptions = {
      method: "POST",
      headers: {
        ...authHeader(),
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        customerId: dialogContent.customerId,
        bookingId: dialogContent.bookingId,
        rentalId: dialogContent.rentalId,
        sentBy: user._id,
        remarks: refundRemark,
        amount: amount,
      }),
    };
    console.log("requestOptions", requestOptions);

    fetch(saveRefundAPI, requestOptions)
      .then(handleFetchErrors)
      .then((res) => res.json())
      .then((res) => {
        console.log(`${saveRefundAPI} Response`, res);
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
        console.log(`${saveRefundAPI} Error`, error);
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
          {dialogType === "processRefund" && "Process Refund"}
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
          {dialogType === "processRefund" && (
            <Fragment>
              <DialogContentText>Charges :</DialogContentText>
              <DialogContentText>
                Total Rental Charges : {dialogContent.rentalCharges} AUD
              </DialogContentText>
              <DialogContentText>
                DLR Charges : {dialogContent.dlrCharges} AUD
              </DialogContentText>
              <DialogContentText>
                Taxes : {dialogContent.taxes} AUD
              </DialogContentText>
              <DialogContentText>
                Total : {dialogContent.total} AUD
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
                value={refundRemark}
                onChange={(e) => {
                  setRefundRemark(e.target.value);
                }}
              />
            </Fragment>
          )}
        </DialogContent>
        <DialogActions>
          {dialogType === "processRefund" && (
            <Fragment>
              <Button onClick={handleClose} color="primary">
                Cancel
              </Button>
              <Button
                onClick={() =>
                  handleProcessRefund(
                    dialogContent.customerId,
                    dialogContent.rentalId,
                    dialogContent.bookingId
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
        selectOptions={[["Customer Email", "customerEmail"]]}
        handleSearch={(str) => handleSearch(str)}
      />

      <MaterialTable
        title="Cancelled Orders - Refunds to Customer"
        tableRef={tableRef}
        columns={[
          {
            title: "Rental ID",
            field: "rentalId",
            render: (rowData) => {
              return rowData.rentalId ? rowData.rentalId.rentalId : "";
            },
          },
          {
            title: "Customer Name",
            field: "customerName",
            render: (rowData) => {
              return rowData.customerDetails.name;
            },
          },
          {
            title: "Licensee Name",
            field: "licenseeName",
            render: (rowData) => {
              return rowData.licenseeDetails.name;
            },
          },
          {
            title: "Trailer Name",
            field: "trailerName",
            render: (rowData) => {
              return rowData.trailerDetails ? rowData.trailerDetails.name : "";
            },
          },
          {
            title: "Rented Items",
            field: "rentedItems",
            render: (rowData) => {
              console.log(rowData);
              return (
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={(e) => {
                    let items = [];
                    items.push({
                      name: rowData.trailerDetails.name,
                      units: 1,
                      itemType: "Trailer",
                    });
                    rowData.upsellDetails.forEach((item, idx) => {
                      items.push({
                        name: item.upsellInfo.name,
                        units: item.quantity,
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
            render: () => {
              return "Cancelled";
            },
          },
          {
            title: "Total Paid",
            field: "totalPaid",
            render: (rowData) => {
              return rowData.charges
                ? rowData.charges.totalPayableAmount + " AUD"
                : 0;
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
              `${fetchPendingRefundsAPI}?${searchStr}&count=${rowsPerPage}&skip=${
                page * rowsPerPage
              }`,
              requestOptions
            )
              .then(handleFetchErrors)
              .then((res) => res.json())
              .then((res) => {
                console.log(`${fetchPendingRefundsAPI} Response`, res);
                const totalCount = res.totalCount || 0;

                resolve({
                  data: res.pendingRefunds,
                  page: page,
                  totalCount: totalCount,
                });
              })
              .catch((error) => {
                console.log(`${fetchPendingRefundsAPI} Error`, error);
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
            // icon: ()=><Button variant="outlined" color="primary" id="actionButtons">Process Refund</Button>,
            tooltip: "Process Refund",
            icon: "process",
            onClick: (event, rowData) => {
              // let dialogInput = {
              //   ...rowData.totalCharges,
              //   licenseeId: rowData.licenseeId,
              // };
              // console.log(dialogInput);
              let totalRentalCharges =
                rowData.charges.trailerCharges.rentalCharges;
              let totalTax = rowData.charges.trailerCharges.taxes;
              let totalDLR = rowData.charges.trailerCharges.dlrCharges;

              rowData.charges.upsellCharges.forEach((item) => {
                totalRentalCharges =
                  totalRentalCharges +
                  item.charges.rentalCharges * item.quantity;
                totalTax = totalTax + item.charges.taxes * item.quantity;
                totalDLR = totalDLR + item.charges.dlrCharges * item.quantity;
              });
              console.log(totalRentalCharges);
              setDialogContent({
                customerId: rowData.customerDetails._id,
                bookingId: rowData._id,
                rentalId: rowData.rentalId ? rowData.rentalId.rentalId : "",
                rentalCharges: totalRentalCharges.toFixed(2),
                taxes: totalTax.toFixed(2),
                dlrCharges: totalDLR.toFixed(2),
                total: rowData.charges.totalPayableAmount,
              });
              handleClickOpen("processRefund");
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
                  Process Refund
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

export default CancelledOrders;
