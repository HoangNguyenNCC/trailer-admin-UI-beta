import React, { useState, Fragment, useEffect } from "react";
import MaterialTable from "material-table";
import { useHistory, useLocation } from "react-router-dom";
import SearchBar from "../common/SearchBar";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@material-ui/core";

import { makeStyles } from "@material-ui/core/styles";

import { authHeader, handleFetchErrors } from "../../_helpers";
import { common } from "../../_constants/common";

import "../../App.css";

const apiUrl = common.apiUrl;
const fetchTrailerTypesAPI = `${apiUrl}/admin/trailers`;
const fetchRentalItemTypesAPI = `${apiUrl}/admin/rentalitemtypes`;
const fetchFiltersAPI = `${apiUrl}/rentalitemfilters`;

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

export default function TrailerList(props) {
  const classes = useStyles();

  let userData = localStorage.getItem("user");
  userData = JSON.parse(userData);
  // console.log("userData", userData);

  let history = useHistory();
  // console.log("history", history);

  let location = useLocation();
  // console.log("location", location);

  let { from } = location.state || { from: { pathname: "/adminpanel/" } };
  if (!userData.acl.TRAILER.includes("VIEW")) {
    history.replace(from);
  }

  const [loading, setLoading] = useState(true);
  const [selectOptions, setSelectOptions] = useState([]);
  let select = [];
  let types = [];
  useEffect(() => {
    const requestOptions = {
      method: "GET",
      headers: authHeader(),
    };

    fetch(`${fetchFiltersAPI}`, requestOptions)
      .then(handleFetchErrors)
      .then((res) => res.json())
      .then((res) => {
        console.log(`${fetchFiltersAPI} Response`, res);

        types = res.filtersObj.trailerTypesList.map((item) => item.code);
        select = [
          {
            name: "Type Of Trailer",
            param: "type",
            values: types,
          },
        ];
        console.log(loading);
        setSelectOptions(select);
        setLoading(false);
        console.log(loading);
        // const totalCount = rentalItemTypesList.length;
        // setRows(rentalItemTypesList);
        // setTotalCount(totalCount);
      })
      .catch((error) => {
        console.log(`${fetchFiltersAPI} Error`, error);
      });
  }, 0);

  //-------------------------------------------------------------------------
  useEffect(() => {
    const requestOptions = {
      method: "GET",
      headers: authHeader(),
    };

    fetch(`${fetchRentalItemTypesAPI}`, requestOptions)
      .then(handleFetchErrors)
      .then((res) => res.json())
      .then((res) => {
        console.log(`${fetchRentalItemTypesAPI} Response`, res);
        const rentalItemTypesList = res.rentalItemTypes || [];
        // const totalCount = rentalItemTypesList.length;
        // setRows(rentalItemTypesList);
        // setTotalCount(totalCount);
        localStorage.setItem(
          "rentalitemtypes",
          JSON.stringify(rentalItemTypesList)
        );
      })
      .catch((error) => {
        console.log(`${fetchRentalItemTypesAPI} Error`, error);
      });
  }, 0);
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

  //-------------------------------------------------------------------------

  const tableRef = React.createRef();

  const [searchStr, setSearchStr] = useState("");
  function handleSearch(search) {
    setSearchStr(search);
    if (tableRef.current) {
      tableRef.current.onQueryChange();
    }
  }

  const [filterStr, setFilterStr] = useState("");
  function handleFilter(filter) {
    setFilterStr(filter);
    if (tableRef.current) {
      tableRef.current.onQueryChange();
    }
  }

  return (
    <div className={`t2y-list t2y-trailertype-list ${classes.root}`}>
      <Dialog
        open={dialogState}
        onClose={handleClose}
        aria-labelledby="form-dialog-title"
        disableBackdropClick={true}
        disableEscapeKeyDown={true}
      >
        <DialogTitle id="form-dialog-title">
          {dialogType === "otpDialog" && "OTP Verification"}
          {dialogType === "rowDetailsDialog" && "Trailer Type Details"}
        </DialogTitle>
        <DialogContent>
          {dialogType === "otpDialog" && <Fragment></Fragment>}
          {dialogType === "rowDetailsDialog" && (
            <Fragment>
              <h5>Description</h5>
              <div>{dialogContent.description}</div>
              <h5>Size</h5>
              <div>{dialogContent.size}</div>
              <h5>Features</h5>
              <ul>
                {dialogContent.features &&
                  dialogContent.features.map((feature, featureIndex) => {
                    return <li key={`feature-${featureIndex}`}>{feature}</li>;
                  })}
              </ul>
            </Fragment>
          )}
        </DialogContent>
        <DialogActions>
          {dialogType === "otpDialog" && <Fragment></Fragment>}
          {dialogType === "rowDetailsDialog" && (
            <Fragment>
              <Button onClick={handleClose} color="primary">
                Close
              </Button>
            </Fragment>
          )}
        </DialogActions>
      </Dialog>
      {!loading && (
        <SearchBar
          selectOptions={[
            ["Name", "name"],
            ["Type", "type"],
          ]}
          filterSelect={selectOptions}
          filterRadio={radioOptions}
          title="Trailer Types"
          handleSearch={(str) => handleSearch(str)}
          handleFilter={(str) => handleFilter(str)}
        />
      )}

      <MaterialTable
        title="Trailer Types List"
        tableRef={tableRef}
        search={false}
        style={{
          textAlign: "center",
        }}
        columns={[
          {
            title: "ID",
            field: "trailerTypeRef",
            render: (rowData) => {
              return rowData.trailerTypeRef;
            },
          },
          {
            title: "Name",
            field: "name",
            render: (rowData) => {
              return rowData.name;
            },
          },
          {
            title: "Type",
            field: "type",
            render: (rowData) => {
              return rowData.type;
            },
          },
          {
            title: "Capacity",
            field: "capacity",
            render: (rowData) => {
              return rowData.capacity;
            },
            cellStyle: { verticalAlign: "top" },
          },
          {
            title: "Tare",
            field: "tare",
            render: (rowData) => {
              return rowData.tare;
            },
          },
          {
            title: "Photos",
            field: "photos",
            render: (rowData) => {
              return (
                <div>
                  {rowData.photos.map((photo, photoIndex) => {
                    return (
                      <div key={rowData._id + "_photo" + photoIndex}>
                        <a
                          target="_blank"
                          href={photo.data}
                          style={{
                            display: "flex",
                            justifyContent: "center",
                          }}
                        >
                          {/* Photo {(photoIndex + 1)} */}
                          <img
                            src={photo.data}
                            style={{
                              maxHeight: "70px",
                            }}
                          />
                        </a>
                      </div>
                    );
                  })}
                </div>
              );
            },
            cellStyle: { verticalAlign: "top" },
          },
          {
            title: "Is Available?",
            field: "availability",
            render: (rowData) => {
              return rowData.availability ? "Yes" : "No";
            },
            cellStyle: { verticalAlign: "top" },
          },
          {
            title: "is Featured?",
            field: "isFeatured",
            render: (rowData) => {
              return rowData.isFeatured ? "Yes" : "No";
            },
            cellStyle: { verticalAlign: "top", height: "auto" },
          },
          {
            title: "Details",
            field: "details",
            render: (rowData) => {
              return (
                <Fragment>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={(e) => {
                      setDialogContent({
                        description: rowData.description,
                        size: rowData.size,
                        features: rowData.features,
                      });
                      handleClickOpen("rowDetailsDialog");
                    }}
                  >
                    View Details
                  </Button>
                </Fragment>
              );
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
              `${fetchTrailerTypesAPI}?${filterStr}${searchStr}count=${rowsPerPage}&skip=${
                page * rowsPerPage
              }`,
              requestOptions
            )
              .then(handleFetchErrors)
              .then((res) => res.json())
              .then((res) => {
                console.log(`${fetchTrailerTypesAPI} Response`, res);
                const trailersList = res.trailersList || [];
                const totalCount = res.totalCount ? res.totalCount : 0;

                // let newRows = [];
                // setRows((currentRows) => {
                //     console.log((typeof currentRows), (typeof trailersList));
                //     newRows = [
                //         ...currentRows,
                //         ...trailersList
                //     ];
                //     console.log("newRows", newRows);
                //     return newRows;
                // });

                // setTotalCount(totalCount);

                resolve({
                  data: trailersList,
                  page: page,
                  totalCount: totalCount,
                });
              })
              .catch((error) => {
                console.log(`${fetchTrailerTypesAPI} Error`, error);

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
            icon: "create",
            tooltip: "Edit Trailer",
            onClick: (event, rowData) => {
              console.log("Edit onClick", event, rowData);
              history.push(`/adminpanel/trailertype/edit/${rowData._id}`);
            },
            cellStyle: { verticalAlign: "top" },
          },
          {
            icon: "add_circle",
            tooltip: "Add Trailer",
            isFreeAction: true,
            onClick: (event, rowData) => {
              console.log("Add onClick", event, rowData);
              history.push("/adminpanel/trailertype/add");
            },
            cellStyle: { verticalAlign: "top" },
          },
        ]}
        options={{
          actionsColumnIndex: -1,
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

const radioOptions = [
  {
    name: "Availability",
    param: "availability",
    options: [
      {
        text: "True",
        value: "true",
      },
      {
        text: "False",
        value: "false",
      },
      {
        text: "Both",
        value: "",
      },
    ],
  },
  {
    name: "Is Featured ?",
    param: "isFeatured",
    options: [
      {
        text: "True",
        value: "true",
      },
      {
        text: "False",
        value: "false",
      },
      {
        text: "Both",
        value: "",
      },
    ],
  },
];
