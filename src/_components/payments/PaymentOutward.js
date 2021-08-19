import React from "react";
import MaterialTable from "material-table";

import { makeStyles } from "@material-ui/core/styles";

import { authHeader, handleFetchErrors } from "../../_helpers";
import { common } from "../../_constants/common";

import "../../App.css";

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

function LicenseePayout(props) {
  const classes = useStyles();

  const tableRef = React.createRef();

  return (
    <div className={classes.root}>
      <MaterialTable
        title="Payments - Outward (From T2Y to Licensee)"
        tableRef={tableRef}
        columns={[
          {
            title: "Licensee Name",
            field: "licenseeName",
            render: (rowData) => {
              return rowData.licenseeName;
            },
          },
          {
            title: "Total Paid",
            field: "totalAmount",
            render: (rowData) => {
              return rowData.totalAmount ? rowData.totalAmount : 0;
            },
          },
          {
            title: "Stripe Account ID",
            field: "stripeAccountId",
            render: (rowData) => {
              return rowData.stripeAccountId ? rowData.stripeAccountId : "";
            },
          },
          {
            title: "Stripe Payout Status",
            field: "stripePayoutStatus",
            render: (rowData) => {
              return rowData.stripePayoutStatus
                ? rowData.stripePayoutStatus
                : "";
            },
          },
          {
            title: "Transaction Auth Action",
            field: "authTransactionAction",
            render: (rowData) => {
              return rowData.authTransactionAction
                ? rowData.authTransactionAction
                : "";
            },
          },
          {
            title: "Payment At",
            field: "createdAt",
            render: (rowData) => {
              return rowData.createdAt ? rowData.createdAt : "";
            },
          },
          {
            title: "Updated At",
            field: "updatedAt",
            render: (rowData) => {
              return rowData.updatedAt ? rowData.updatedAt : "";
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
              `${fetchLicenseePayoutsAPI}?count=${rowsPerPage}&skip=${
                page * rowsPerPage
              }`,
              requestOptions
            )
              .then(handleFetchErrors)
              .then((res) => res.json())
              .then((res) => {
                console.log(`${fetchLicenseePayoutsAPI} Response`, res);
                const licenseePayoutsList = res.licenseePayoutsList || [];
                const totalCount = res.totalCount || 0;

                // let newRows = [];
                // setRows((currentRows) => {
                //     console.log((typeof currentRows), (typeof licenseePayoutsList));
                //     newRows = [
                //         ...currentRows,
                //         ...licenseePayoutsList
                //     ];
                //     console.log("newRows", newRows);
                //     return newRows;
                // });

                // setTotalCount(totalCount);

                resolve({
                  data: licenseePayoutsList,
                  page: page,
                  totalCount: totalCount,
                });
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
          actionsColumnIndex: -1,
          sorting: false,
          filtering: false,
          pageSize: 20,
          headerStyle: { position: "sticky", top: 0 },
          maxBodyHeight: "700px",
        }}
      />
    </div>
  );
}

// cancel, check-circle

export default LicenseePayout;
