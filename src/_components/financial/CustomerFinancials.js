import React, { useState, Fragment } from "react";
import MaterialTable from "material-table";

import { makeStyles } from "@material-ui/core/styles";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemText,
  Typography,
  Button,
} from "@material-ui/core";
import moment from "moment";
import { authHeader, handleFetchErrors } from "../../_helpers";
import { common } from "../../_constants/common";
import FinancialChildTable from "./FinancialChildTable";
import SearchBar from "../common/SearchBar";

import "../../App.css";

const apiUrl = common.apiUrl;
const fetchCustomerFinancialAPI = `${apiUrl}/admin/financial`;

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
  bookingElement: {
    padding: "5px",
  },
  finalBookingElement: {
    padding: "10px",
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

function CustomerFinancial(props) {
  const classes = useStyles();
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
  const approvalStatusEnum = {
    0: "Booked",
    1: "Approved",
    2: "Cancelled",
  };
  const tableRef = React.createRef();
  const [searchStr, setSearchStr] = useState("");
  function handleSearch(search) {
    setSearchStr(search);
    if (tableRef.current) {
      tableRef.current.onQueryChange();
    }
  }

  return (
    <div className={classes.root}>
      <Dialog
        open={dialogState}
        onClose={handleClose}
        aria-labelledby="form-dialog-title"
        // disableBackdropClick={true}
        disableEscapeKeyDown={true}
      >
        <DialogTitle id="form-dialog-title">
          {dialogType === "viewBooking" && "View Booking"}
        </DialogTitle>
        <DialogContent>
          {dialogType === "viewBooking" && (
            <Fragment>
              <div>
                <Typography
                  className={classes.bookingElement}
                  component="div"
                  variant="body1"
                >
                  <b>Customer : </b>
                  {dialogContent.customerName}
                </Typography>
                <Typography
                  className={classes.bookingElement}
                  component="div"
                  variant="body1"
                >
                  <b>Licensee : </b>
                  {dialogContent.licenseeName}
                </Typography>
              </div>
              <div>
                <Typography
                  className={classes.bookingElement}
                  component="div"
                  variant="body1"
                >
                  <b>Address : </b>
                  {dialogContent.dropOffLocation.text}
                </Typography>
              </div>
              <div>
                <Typography
                  className={classes.bookingElement}
                  component="div"
                  variant="body1"
                >
                  <b>Booking Start Date :</b>{" "}
                  {moment(dialogContent.revisionObj.start).format("DD-MM-YYYY")}
                </Typography>
                <Typography
                  className={classes.bookingElement}
                  component="div"
                  variant="body1"
                >
                  <b>Booking End Date :</b>{" "}
                  {moment(dialogContent.revisionObj.end).format("DD-MM-YYYY")}
                </Typography>
              </div>
              <List className={classes.root}>
                <Fragment>
                  <ListItem alignItems="flex-start">
                    <ListItemText
                      primary={"1 x " + dialogContent.trailerName}
                      secondary={
                        <Fragment>
                          <Typography component="span" variant="overline">
                            Rental Charges :{" "}
                            {
                              dialogContent.revisionObj.charges.trailerCharges
                                .rentalCharges
                            }{" "}
                            AUD
                          </Typography>
                        </Fragment>
                      }
                    />
                  </ListItem>
                </Fragment>
                {dialogContent.revisionObj.charges.upsellCharges.map(
                  (rentedItem, rentedItemIndex) => {
                    return (
                      <Fragment>
                        <ListItem
                          alignItems="flex-start"
                          key={`rentedItem-${rentedItemIndex}`}
                        >
                          <ListItemText
                            primary={
                              rentedItem.quantity +
                              " x " +
                              dialogContent.upsellNames[rentedItemIndex].name
                            }
                            secondary={
                              <Fragment>
                                <Typography component="span" variant="overline">
                                  Rental Charges :{" "}
                                  {(
                                    rentedItem.charges.rentalCharges *
                                    rentedItem.quantity
                                  ).toFixed(2)}{" "}
                                  AUD || Units : {rentedItem.quantity}
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
              <div className={classes.finalBookingElement}>
                {" "}
                <strong>Taxes :</strong>
                <Typography component="span" variant="button">
                  {dialogContent.totalTax} AUD
                </Typography>
              </div>
              {dialogContent.doChargeDLR && (
                <div className={classes.finalBookingElement}>
                  {" "}
                  DLR Charges :
                  <Typography component="span" variant="overline">
                    {dialogContent.totalDlr} AUD
                  </Typography>
                </div>
              )}
              <div className={classes.finalBookingElement}>
                {" "}
                <strong>Total :</strong>
                <Typography component="span" variant="button">
                  {dialogContent.revisionObj.charges.totalPayableAmount} AUD
                </Typography>
              </div>
            </Fragment>
          )}
        </DialogContent>
      </Dialog>
      <SearchBar
        selectOptions={[["Customer Email", "customerEmail"]]}
        handleSearch={(str) => handleSearch(str)}
      />
      <MaterialTable
        title="Customer Financials"
        tableRef={tableRef}
        columns={[
          {
            title: "Invoice ID",
            field: "invoiceId",
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
            title: "Booking",
            field: "booking",
            render: (rowData) => {
              return (
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={(e) => {
                    const lastRevision =
                      rowData.rentalObject.revisions[
                        rowData.rentalObject.revisions.length - 1
                      ];
                    let revisionObj = lastRevision.charges
                      ? lastRevision
                      : rowData.rentalObject.revisions[0];
                    // : rowData.rentalObject.revisions[
                    //     rowData.rentalObject.revisions.length - 2
                    //   ];
                    let totalTax = revisionObj.charges.trailerCharges.taxes;
                    let totalDlr =
                      revisionObj.charges.trailerCharges.dlrCharges;
                    revisionObj.charges.upsellCharges.forEach((item) => {
                      totalTax = totalTax + item.quantity * item.charges.taxes;
                      totalDlr =
                        totalDlr + item.quantity * item.charges.dlrCharges;
                    });
                    totalDlr = totalDlr.toFixed(2);
                    totalTax = totalTax.toFixed(2);
                    setDialogContent({
                      ...rowData.rentalObject,
                      revisionObj,
                      totalTax,
                      totalDlr,
                      customerName: rowData.customerName.name,
                      licenseeName: rowData.licenseeName.name,
                      trailerName: rowData.trailerNames[0].name,
                      upsellNames: rowData.upsellNames,
                    });
                    handleClickOpen("viewBooking");
                  }}
                >
                  View Booking
                </Button>
              );
            },
          },
          {
            title: "Booking Start Date",
            field: "startDate",
            render: (rowData) => {
              return moment(
                rowData.rentalObject.revisions[
                  rowData.rentalObject.revisions.length - 1
                ].start
              ).format("DD-MM-YYYY");
            },
          },
          {
            title: "Booking End Date",
            field: "endDate",
            render: (rowData) => {
              return moment(
                rowData.rentalObject.revisions[
                  rowData.rentalObject.revisions.length - 1
                ].end
              ).format("DD-MM-YYYY");
            },
          },
          {
            title: "Status",
            field: "rentalStatus",
            render: (rowData) => {
              return approvalStatusEnum[
                rowData.rentalObject.revisions[
                  rowData.rentalObject.revisions.length - 1
                ].isApproved
              ];
            },
          },
          {
            title: "Total Amount",
            field: "total",
            render: (rowData) => {
              return rowData.rentalObject.revisions[
                rowData.rentalObject.revisions.length - 1
              ].charges
                ? rowData.rentalObject.revisions[
                    rowData.rentalObject.revisions.length - 1
                  ].charges.totalPayableAmount.toFixed(2) + " AUD"
                : rowData.rentalObject.charges.totalPayableAmount.toFixed(2) +
                    " AUD";
              // : rowData.rentalObject.revisions[
              //     rowData.rentalObject.revisions.length - 2
              //   ].charges.totalPayableAmount;
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
            fetch(
              `${fetchCustomerFinancialAPI}?${searchStr}count=${rowsPerPage}&skip=${
                page * rowsPerPage
              }`,
              requestOptions
            )
              .then(handleFetchErrors)
              .then((res) => res.json())
              .then((res) => {
                console.log(`${fetchCustomerFinancialAPI} Response`, res);
                // let totalByItemList = res.financialsObj.totalByItemList || [];
                const totalCount = res.totalCount || 0;

                // let newRows = [];
                // setRows((currentRows) => {
                //     console.log((typeof currentRows), (typeof totalByItemList));
                //     newRows = [
                //         ...currentRows,
                //         ...totalByItemList
                //     ];
                //     console.log("newRows", newRows);
                //     return newRows;
                // });

                // setTotalCount(totalCount);
                const resolveObject = {
                  data: res.finances,
                  page: page,
                  totalCount: totalCount,
                };
                console.log("resolve object", resolveObject);
                resolve(resolveObject);
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
        options={{
          filtering: false,
          sorting: false,
          pageSize: 20,
          headerStyle: { position: "sticky", top: 0 },
          maxBodyHeight: "700px",
        }}
        detailPanel={(rowData) => {
          let propData = [];
          rowData.incoming.forEach((item) => {
            propData.push({
              from: rowData.customerName.name,
              to: "Trailer 2 You",
              paymentType: "Incoming",
              ...item,
            });
          });
          rowData.outgoing.forEach((item) => {
            propData.push({
              to: rowData.customerName.name,
              from: "Trailer 2 You",
              paymentType: "Outgoing",
              ...item,
            });
          });
          return <FinancialChildTable data={propData} />;
        }}
      />
    </div>
  );
}

export default CustomerFinancial;
