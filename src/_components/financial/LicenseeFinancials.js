import React, { useState, Fragment } from "react";
import MaterialTable from "material-table";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import moment from "moment";
import { authHeader, handleFetchErrors } from "../../_helpers";
import { common } from "../../_constants/common";

import "../../App.css";
import SearchBar from "../common/SearchBar";

const apiUrl = common.apiUrl;
const fetchLicenseePayoutsAPI = `${apiUrl}/admin/licensee/payouts`;

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

function LicenseeFinancial(props) {
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
                              dialogContent.upsellNames[rentedItemIndex]
                                .itemName.name
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
        selectOptions={[["Licensee Email", "licenseeEmail"]]}
        handleSearch={(str) => handleSearch(str)}
      />
      <MaterialTable
        title="Licensee Financials"
        tableRef={tableRef}
        columns={[
          {
            title: "Invoice ID",
            field: "invoiceId",
            render: (rowData) => {
              return rowData.rentalObject._id;
            },
          },
          {
            title: "Customer Name",
            field: "customerName",
            render: (rowData) => {
              return rowData.rentalObject.customerName.name;
            },
          },
          {
            title: "Licensee Name",
            field: "licenseeName",
            render: (rowData) => {
              return rowData.rentalObject.licenseeName;
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
                      customerName: rowData.rentalObject.customerName.name,
                      licenseeName: rowData.rentalObject.licenseeName,
                      trailerName: rowData.rentalObject.rented[0].itemName.name,
                      upsellNames: rowData.rentalObject.rented.splice(1),
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
              return moment(revisionObj.start).format("DD-MM-YYYY");
            },
          },
          {
            title: "Booking End Date",
            field: "endDate",
            render: (rowData) => {
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
              return moment(revisionObj.end).format("DD-MM-YYYY");
            },
          },
          {
            title: "Status",
            field: "rentalStatus",
            render: (rowData) => {
              return rowData.rentalObject.rentalStatus;
            },
          },
          {
            title: "Total Amount",
            field: "total",
            render: (rowData) => {
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
              return revisionObj.charges.totalPayableAmount + " AUD";
            },
          },
          {
            title: "Amount Transferred",
            field: "amountTransferred",
            render: (rowData) => {
              return rowData.amount + " AUD";
            },
          },
          {
            title: "Remarks",
            field: "payoutRemarks",
            render: (rowData) => {
              return rowData.remarks;
            },
          },
        ]}
        // data={data.licenseePayoutsList}
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
              `${fetchLicenseePayoutsAPI}?${searchStr}count=${rowsPerPage}&skip=${
                page * rowsPerPage
              }`,
              requestOptions
            )
              .then(handleFetchErrors)
              .then((res) => res.json())
              .then((res) => {
                console.log(`${fetchLicenseePayoutsAPI} Response`, res);
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
                  data: res.licenseePayoutsList,
                  page: page,
                  totalCount: totalCount,
                };
                console.log("resolve object", resolveObject);
                resolve(resolveObject);
              })
              .catch((error) => {
                console.log(`${fetchLicenseePayoutsAPI} Error`, error);
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
      />
    </div>
  );
}

export default LicenseeFinancial;

// const data = {
//   success: true,
//   message: "Successfully fetched Licensee Payout List",
//   licenseePayoutsList: [
//     {
//       completed: false,
//       _id: "5f520415294b300017f6aba4",
//       stripePayoutId: "tr_1HNauOGLBR8nomTlu14TcLTN",
//       licenseeId: "5f52022d294b300017f6aafb",
//       amount: 170,
//       destination: "acct_1HNamaJTqHKLxlqn",
//       rentalId: "5f5202f0294b300017f6ab3f",
//       remarks: "Charges for cancellation = 10",
//       sentBy: "5e9893c5c4b01d5a13d1ea3f",
//       transfer: {
//         _id: "5f520415294b300017f6aba5",
//         id: "tr_1HNauOGLBR8nomTlu14TcLTN",
//         object: "transfer",
//         amount: 170,
//         amount_reversed: 0,
//         balance_transaction: "txn_1HNauOGLBR8nomTlwNreMLxG",
//         created: 1599210516,
//         currency: "aud",
//         description: null,
//         destination: "acct_1HNamaJTqHKLxlqn",
//         destination_payment: "py_1HNauOJTqHKLxlqnqTiYgVRG",
//         livemode: false,
//         reversals: {
//           data: [],
//           _id: "5f520415294b300017f6aba6",
//           object: "list",
//           has_more: false,
//           total_count: 0,
//           url: "/v1/transfers/tr_1HNauOGLBR8nomTlu14TcLTN/reversals",
//         },
//         reversed: false,
//         source_transaction: null,
//         source_type: "card",
//         transfer_group: null,
//       },
//       __v: 0,
//       rentalObject: {
//         _id: "5f5202f0294b300017f6ab3f",
//         total: 194.81,
//         isTrackingPickUp: false,
//         isTrackingDropOff: false,
//         isApproved: 1,
//         rentalStatus: "approved",
//         description: "",
//         bookedByUserId: "5f46719ba66b940017db87f8",
//         licenseeId: "5f52022d294b300017f6aafb",
//         doChargeDLR: false,
//         isPickUp: false,
//         rentedItems: [
//           {
//             units: 1,
//             _id: "5f5202f0294b300017f6ab40",
//             itemType: "trailer",
//             itemId: "5f5202aa294b300017f6ab1c",
//             totalCharges: {
//               total: 194.81,
//               rentalCharges: 154,
//               dlrCharges: 23.1,
//               t2yCommission: 0,
//               discount: 0,
//               lateFees: 0,
//               cancellationCharges: 0,
//               taxes: 17.71,
//             },
//           },
//         ],
//         bookingId: "5f5202c4294b300017f6ab35",
//         rentalPeriod: {
//           start: "2020-10-29T08:59:00.000Z",
//           end: "2020-10-30T09:45:00.000Z",
//         },
//         charges: {
//           _id: "5f5202f0294b300017f6ab41",
//           totalPayableAmount: 194.81,
//           trailerCharges: {
//             _id: "5f5202f0294b300017f6ab42",
//             total: 194.81,
//             rentalCharges: 154,
//             dlrCharges: 23.1,
//             t2yCommission: 0,
//             discount: 0,
//             lateFees: 0,
//             cancellationCharges: 0,
//             taxes: 17.71,
//           },
//           upsellCharges: [],
//         },
//         pickUpLocation: {
//           text:
//             "121, Northbridge Golf Club, Sailors Bay Road, Northbridge NSW 2063, Australia",
//           pincode: "2063",
//           location: {
//             type: "Point",
//             coordinates: [151.22275114059448, -33.81309907738366],
//           },
//         },
//         dropOffLocation: {
//           text:
//             "121, Northbridge Golf Club, Sailors Bay Road, Northbridge NSW 2063, Australia",
//           pincode: "2063",
//           location: {
//             type: "Point",
//             coordinates: [151.22275114059448, -33.81309907738366],
//           },
//         },
//         invoiceNumber: 34,
//         invoiceReference: "INV0000000034",
//         revisions: [
//           {
//             revisionType: "rental",
//             isApproved: 1,
//             approvedBy: "licensee",
//             paidAmount: 0,
//             _id: "5f5202f0294b300017f6ab43",
//             start: "2020-10-29T08:59:00.000Z",
//             end: "2020-10-30T09:45:00.000Z",
//             requestOn: "2020-09-04T09:03:44.523Z",
//             requestUpdatedOn: "2020-09-04T09:03:44.523Z",
//             charges: {
//               _id: "5f5202f0294b300017f6ab44",
//               upsellCharges: [],
//               totalPayableAmount: 194.81,
//               trailerCharges: {
//                 _id: "5f5202f0294b300017f6ab45",
//                 total: 194.81,
//                 rentalCharges: 154,
//                 dlrCharges: 23.1,
//                 t2yCommission: 0,
//                 discount: 0,
//                 lateFees: 0,
//                 cancellationCharges: 0,
//                 taxes: 17.71,
//               },
//             },
//             approvedOn: "2020-09-04T09:30:14.290Z",
//             approvedById: "5f52022e294b300017f6ab00",
//           },
//         ],
//         createdAt: "2020-09-04T09:03:44.531Z",
//         updatedAt: "2020-09-04T09:30:14.293Z",
//         __v: 0,
//         licenseeName: "Applutions",
//         customerName: {
//           _id: "5f46719ba66b940017db87f8",
//           name: "Aaryan Kothari",
//         },
//         rented: [
//           {
//             itemName: {
//               _id: "5f5202aa294b300017f6ab1c",
//               name: "Tradesman's Trailers",
//             },
//           },
//         ],
//       },
//     },
//   ],
//   totalCount: 1,
// };
