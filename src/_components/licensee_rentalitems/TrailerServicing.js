import React from "react";
import MaterialTable from "material-table";

import moment from "moment";
import { makeStyles } from "@material-ui/core/styles";
import { Button } from "@material-ui/core";
import { authHeader, handleFetchErrors } from "../../_helpers";
import { common } from "../../_constants/common";

import "../../App.css";

const apiUrl = common.apiUrl;
const fetchServicingAPI = `${apiUrl}/admin/licensee/servicing`;
const saveServicingApproval = `${apiUrl}/admin/licensee/verify/servicing`;

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

function TrailerServicing(props) {
  const classes = useStyles();

  const tableRef = React.createRef();

  return (
    <div className={classes.root}>
      <MaterialTable
        title="Trailer Servicing"
        tableRef={tableRef}
        columns={[
          {
            title: "Licensee Name",
            field: "licenseeName",
            render: (rowData) => {
              console.log("rowData", rowData);
              return rowData.licenseeName;
            },
          },
          {
            title: "Issue",
            field: "issue",
            render: (rowData) => {
              console.log("rowData", rowData);
              return rowData.name;
            },
          },
          {
            title: "Trailer Name",
            field: "itemName",
            render: (rowData) => {
              return rowData.itemName;
            },
          },
          {
            title: "Trailer VIN",
            field: "vin",
            render: (rowData) => {
              return rowData.vin;
            },
          },
          {
            title: "Due Date",
            field: "dueDate",
            render: (rowData) => {
              return moment(rowData.nextDueDate).format("DD-MM-YYYY");
            },
          },
          {
            title: "Service Date",
            field: "serviceDate",
            render: (rowData) => {
              return moment(rowData.serviceDate).format("DD-MM-YYYY");
            },
          },
          {
            title: "Servicing Document",
            field: "servicingDocument",
            render: (rowData) => {
              // return <Link target="_blank" to={rowData.document}>Download</Link>
              return (
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href={rowData.document}
                >
                  <Button
                    className="wideButton"
                    style={{
                      textTransform: "capitalize",
                      fontSize: "15px",
                      minWidth: "150px",
                    }}
                  >
                    Download
                  </Button>
                </a>
              );
            },
          },
          // {
          //   title: "Servicing Document Verified",
          //   field: "servicingDocumentVerified",
          //   type: "boolean",
          //   render: (rowData) => {
          //     return rowData.documentVerified ? "Yes" : "No";
          //   },
          // },
          {
            title: "Servicing Document Accepted",
            field: "servicingDocumentAccepted",
            render: (rowData) => {
              return rowData.documentAccepted ? "Yes" : "No";
            },
          },
        ]}
        data={(query) => {
          console.log("MaterialTable data", query);
          const rowsPerPage = query.pageSize;
          const page = query.page;
          const id = props.match.params.licenseeId;

          const requestOptions = {
            method: "GET",
            headers: authHeader(),
          };
          return new Promise((resolve, reject) => {
            fetch(
              `${fetchServicingAPI}?licenseeId=${id}&count=${rowsPerPage}&skip=${
                page * rowsPerPage
              }`,
              requestOptions
            )
              .then(handleFetchErrors)
              .then((res) => res.json())
              .then((res) => {
                console.log(`${fetchServicingAPI} Response`, res);
                const servicingList = res.servicingList || [];
                const totalCount = res.totalCount || 0;

                // let newRows = [];
                // setRows((currentRows) => {
                //     console.log((typeof currentRows), (typeof servicingList));
                //     newRows = [
                //         ...currentRows,
                //         ...servicingList
                //     ];
                //     console.log("newRows", newRows);
                //     return newRows;
                // });

                // setTotalCount(totalCount);

                resolve({
                  data: servicingList,
                  page: page,
                  totalCount: totalCount,
                });
              })
              .catch((error) => {
                console.log(`${fetchServicingAPI} Error`, error);
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
            onClick: (event, rowData) => {
              console.log("Approve onClick", event, rowData);
              const requestOptions = {
                method: "PUT",
                headers: {
                  ...authHeader(),
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  servicingId: rowData._id,
                  isAccepted: true,
                }),
              };
              console.log("requestOptions", requestOptions);

              fetch(saveServicingApproval, requestOptions)
                .then(handleFetchErrors)
                .then((res) => res.json())
                .then((res) => {
                  console.log(`${saveServicingApproval} Response`, res);
                  // rowData.driverLicense.verified = true;
                  // rowData.driverLicense.accepted = true;
                  if (tableRef.current) {
                    tableRef.current.onQueryChange();
                  }
                })
                .catch((error) => {
                  console.log(`${saveServicingApproval} Error`, error);
                });
            },
          },
          {
            icon: "cancel",
            tooltip: "Reject",
            onClick: (event, rowData) => {
              console.log("Reject onClick", event, rowData);
              const requestOptions = {
                method: "PUT",
                headers: {
                  ...authHeader(),
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  servicingId: rowData._id,
                  isAccepted: false,
                }),
              };
              console.log("requestOptions", requestOptions);

              fetch(saveServicingApproval, requestOptions)
                .then(handleFetchErrors)
                .then((res) => res.json())
                .then((res) => {
                  console.log(`${saveServicingApproval} Response`, res);
                  // rowData.driverLicense.verified = true;
                  // rowData.driverLicense.accepted = false;
                  if (tableRef.current) {
                    tableRef.current.onQueryChange();
                  }
                })
                .catch((error) => {
                  console.log(`${saveServicingApproval} Error`, error);
                });
            },
          },
        ]}
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

export default TrailerServicing;
