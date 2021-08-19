import React from "react";
import MaterialTable from "material-table";

import { makeStyles } from "@material-ui/core/styles";

import { authHeader, handleFetchErrors } from "../../_helpers";
import { common } from "../../_constants/common";

import "../../App.css";

const apiUrl = common.apiUrl;
const fetchCustomerPaymentsAPI = `${apiUrl}/admin/customer/payments`;

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

function CustomerPayment(props) {
  const classes = useStyles();

  const tableRef = React.createRef();

  return (
    <div className={classes.root}>
      <MaterialTable
        title="Payments - Inward (From Customers to T2Y)"
        tableRef={tableRef}
        columns={[
          {
            title: "Customer Name",
            field: "customerName",
            render: (rowData) => {
              return rowData.customerName;
            },
          },
          {
            title: "Licensee Name",
            field: "licenseeName",
            render: (rowData) => {
              return rowData.licenseeName;
            },
          },
          {
            title: "Total Paid",
            field: "totalPaid",
            render: (rowData) => {
              return rowData.totalPaid ? rowData.totalPaid : 0;
            },
          },
          {
            title: "Authorization Transaction ID",
            field: "transactionIdAuth",
            render: (rowData) => {
              return rowData.transactionIdAuth ? rowData.transactionIdAuth : "";
            },
          },
          {
            title: "Authorization Transaction Date",
            field: "transactionAuthDate",
            render: (rowData) => {
              return rowData.transactionAuthDate
                ? rowData.transactionAuthDate
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
            title: "Action Transaction ID",
            field: "transactionIdAction",
            render: (rowData) => {
              return rowData.transactionIdAction
                ? rowData.transactionIdAction
                : "";
            },
          },
          {
            title: "Action Transaction Date",
            field: "transactionActionDate",
            render: (rowData) => {
              return rowData.transactionActionDate
                ? rowData.transactionActionDate
                : "";
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
              `${fetchCustomerPaymentsAPI}?count=${rowsPerPage}&skip=${
                page * rowsPerPage
              }`,
              requestOptions
            )
              .then(handleFetchErrors)
              .then((res) => res.json())
              .then((res) => {
                console.log(`${fetchCustomerPaymentsAPI} Response`, res);
                const customerPaymentsList = res.customerPaymentsList || [];
                const totalCount = res.totalCount || 0;

                // let newRows = [];
                // setRows((currentRows) => {
                //     console.log((typeof currentRows), (typeof customerPaymentsList));
                //     newRows = [
                //         ...currentRows,
                //         ...customerPaymentsList
                //     ];
                //     console.log("newRows", newRows);
                //     return newRows;
                // });

                // setTotalCount(totalCount);

                resolve({
                  data: customerPaymentsList,
                  page: page,
                  totalCount: totalCount,
                });
              })
              .catch((error) => {
                console.log(`${fetchCustomerPaymentsAPI} Error`, error);
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

export default CustomerPayment;
