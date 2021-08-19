import React from "react";
import MaterialTable from "material-table";

import moment from "moment";
import { makeStyles } from "@material-ui/core/styles";

import { authHeader, handleFetchErrors } from "../../_helpers";
import { common } from "../../_constants/common";

import "../../App.css";

const apiUrl = common.apiUrl;
const fetchInsuranceAPI = `${apiUrl}/admin/licensee/insurance`;
const saveInsuranceApproval = `${apiUrl}/admin/licensee/verify/insurance`;

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

// function documentViewerError(e) {
//     console.log("error in file-viewer", e);
// }

function TrailerInsurance(props) {
  const classes = useStyles();

  const tableRef = React.createRef();

  return (
    <div className={classes.root}>
      <MaterialTable
        title="Trailer Insurance"
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
            title: "Insurance Document",
            field: "insuranceDocument",
            render: (rowData) => {
              // return <Link target="_blank" to={rowData.document}>Download</Link>
              return (
                <div>
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href={rowData.document}
                  >
                    Download
                  </a>
                  {/* <FileViewer
                                        fileType={rowData.documentType}
                                        filePath={rowData.document}
                                        errorComponent={CustomErrorComponent}
                                        onError={documentViewerError}/> */}
                </div>
              );
            },
          },
          {
            title: "Issue Date",
            field: "issueDate",
            render: (rowData) => {
              return moment(rowData.issueDate).format("DD-MM-YYYY");
            },
          },
          {
            title: "Expiry Date",
            field: "expiryDate",
            render: (rowData) => {
              return moment(rowData.expiryDate).format("DD-MM-YYYY");
            },
          },
          // {
          //   title: "Insurance Document Verified",
          //   field: "insuranceDocumentVerified",
          //   type: "boolean",
          //   render: (rowData) => {
          //     return rowData.verified ? "Yes" : "No";
          //   },
          // },
          {
            title: "Insurance Document Accepted",
            field: "insuranceDocumentAccepted",
            render: (rowData) => {
              return rowData.accepted ? "Yes" : "No";
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
              `${fetchInsuranceAPI}?licenseeId=${id}&count=${rowsPerPage}&skip=${
                page * rowsPerPage
              }`,
              requestOptions
            )
              .then(handleFetchErrors)
              .then((res) => res.json())
              .then((res) => {
                console.log(`${fetchInsuranceAPI} Response`, res);
                const insuranceList = res.insuranceList || [];
                const totalCount = res.totalCount || 0;

                // let newRows = [];
                // setRows((currentRows) => {
                //     console.log((typeof currentRows), (typeof insuranceList));
                //     newRows = [
                //         ...currentRows,
                //         ...insuranceList
                //     ];
                //     console.log("newRows", newRows);
                //     return newRows;
                // });

                // setTotalCount(totalCount);

                resolve({
                  data: insuranceList,
                  page: page,
                  totalCount: totalCount,
                });
              })
              .catch((error) => {
                console.log(`${fetchInsuranceAPI} Error`, error);
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
                  insuranceId: rowData._id,
                  isAccepted: true,
                }),
              };
              console.log("requestOptions", requestOptions);

              fetch(saveInsuranceApproval, requestOptions)
                .then(handleFetchErrors)
                .then((res) => res.json())
                .then((res) => {
                  console.log(`${saveInsuranceApproval} Response`, res);
                  // rowData.driverLicense.verified = true;
                  // rowData.driverLicense.accepted = true;
                  if (tableRef.current) {
                    tableRef.current.onQueryChange();
                  }
                })
                .catch((error) => {
                  console.log(`${saveInsuranceApproval} Error`, error);
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
                  insuranceId: rowData._id,
                  isAccepted: false,
                }),
              };
              console.log("requestOptions", requestOptions);

              fetch(saveInsuranceApproval, requestOptions)
                .then(handleFetchErrors)
                .then((res) => res.json())
                .then((res) => {
                  console.log(`${saveInsuranceApproval} Response`, res);
                  // rowData.driverLicense.verified = true;
                  // rowData.driverLicense.accepted = false;
                  if (tableRef.current) {
                    tableRef.current.onQueryChange();
                  }
                })
                .catch((error) => {
                  console.log(`${saveInsuranceApproval} Error`, error);
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

export default TrailerInsurance;
