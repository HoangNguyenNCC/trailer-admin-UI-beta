import React from "react";
import MaterialTable from "material-table";

// import { makeStyles } from "@material-ui/core/styles";
import moment from "moment";
import "../../App.css";

// const useStyles = makeStyles((theme) => ({
//   root: {
//     width: "100%",
//   },
//   paper: {
//     width: "100%",
//     marginBottom: theme.spacing(2),
//   },
//   table: {
//     minWidth: 750,
//   },
//   visuallyHidden: {
//     border: 0,
//     clip: "rect(0 0 0 0)",
//     height: 1,
//     margin: -1,
//     overflow: "hidden",
//     padding: 0,
//     position: "absolute",
//     top: 20,
//     width: 1,
//   },
// }));

function FinancialChildTable(props) {
  // const classes = useStyles();

  const tableRef = React.createRef();

  return (
    <MaterialTable
      tableRef={tableRef}
      columns={[
        {
          title: "From",
          field: "from",
          render: (rowData) => {
            return rowData.from;
          },
        },
        {
          title: "To",
          field: "to",
          render: (rowData) => {
            return rowData.to;
          },
        },
        {
          title: "Amount",
          field: "amount",
          render: (rowData) => {
            return rowData.amount + " AUD";
          },
        },
        {
          title: "Payment Type",
          field: "type",
          render: (rowData) => {
            return rowData.paymentType;
          },
        },
        {
          title: "Transaction Date",
          field: "transDate",
          render: (rowData) => {
            return moment(rowData.revisedAt).format("DD-MM-YYYY");
          },
        },
        {
          title: "Revision Type",
          field: "revisionType",
          render: (rowData) => {
            return rowData.revisionType;
          },
        },
      ]}
      data={props.data}
      options={{
        filtering: false,
        sorting: false,
        pageSize: 20,
        toolbar: false,
        headerStyle: { position: "sticky", top: 0 },
        maxBodyHeight: "200px",
      }}
    />
  );
}

export default FinancialChildTable;
