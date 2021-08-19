import React from "react";
import MaterialTable from "material-table";

import { makeStyles } from "@material-ui/core/styles";

import { authHeader, handleFetchErrors } from "../../_helpers";
import { common } from "../../_constants/common";

import "../../App.css";

const apiUrl = common.apiUrl;
const fetchFinancialTrailerAPI = `${apiUrl}/admin/financial/trailer`;

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

function FinancialTrailer(props) {
  const classes = useStyles();

  const tableRef = React.createRef();

  return (
    <div className={classes.root}>
      <MaterialTable
        title="Financials per Rental Item"
        tableRef={tableRef}
        columns={[
          {
            title: "Rented Item",
            field: "rentedItem",
            render: (rowData) => {
              return rowData.rentedItem;
            },
          },
          {
            title: "Rented Item Name",
            field: "rentedItemName",
            render: (rowData) => {
              return rowData.rentedItemName;
            },
          },
          {
            title: "Total",
            field: "total",
            render: (rowData) => {
              return rowData.total ? rowData.total : 0;
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
              `${fetchFinancialTrailerAPI}?count=${rowsPerPage}&skip=${
                page * rowsPerPage
              }`,
              requestOptions
            )
              .then(handleFetchErrors)
              .then((res) => res.json())
              .then((res) => {
                console.log(`${fetchFinancialTrailerAPI} Response`, res);
                let totalByItemList = res.financialsObj.totalByItemList || [];
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
                  data: totalByItemList,
                  page: page,
                  totalCount: totalCount,
                };
                console.log("resolve object", resolveObject);
                resolve(resolveObject);
              })
              .catch((error) => {
                console.log(`${fetchFinancialTrailerAPI} Error`, error);
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

export default FinancialTrailer;
