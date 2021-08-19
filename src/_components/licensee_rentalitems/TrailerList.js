import React, { useState, Fragment, useEffect } from "react";
import MaterialTable from "material-table";
import { useHistory, useLocation, useParams } from "react-router-dom";
import SearchBar from "../common/SearchBar";

import { makeStyles } from "@material-ui/core/styles";
import {
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
} from "@material-ui/core";

import { authHeader, handleFetchErrors } from "../../_helpers";
import { common } from "../../_constants/common";

import "../../App.css";

const apiUrl = common.apiUrl;
const fetchTrailersAPI = `${apiUrl}/admin/licenseeTrailers`;
const fetchFiltersAPI = `${apiUrl}/rentalitemfilters`;
const setTrailerAvailabilityAPI = `${apiUrl}/admin/licensee/trailer/setAvailability`;
const deleteTrailerAPI = `${apiUrl}/admin/licensee/trailer/delete`;

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

function TableActionButton(props) {
  return <span>{props.title}</span>;
}

function TrailerList(props) {
  const classes = useStyles();

  let userData = localStorage.getItem("user");
  userData = JSON.parse(userData);
  // console.log("userData", userData);

  let history = useHistory();
  // console.log("history", history);

  let location = useLocation();
  // console.log("location", location);

  const { licenseeId } = useParams();
  // console.log("licenseeId", licenseeId);

  let { from } = location.state || { from: { pathname: "/adminpanel/" } };
  if (!userData.acl.TRAILER.includes("VIEW")) {
    history.replace(from);
  }

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
  const [loading, setLoading] = useState(true);
  const [selectOptions, setSelectOptions] = useState([]);
  let select = [];
  let trailerTypeList = [];
  let trailerModelList = [];
  let trailerModelIds = [];
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
        trailerModelList = res.filtersObj.trailerModelList.map(
          (item) => item.name
        );
        trailerModelIds = res.filtersObj.trailerModelList.map(
          (item) => item.code
        );
        trailerTypeList = res.filtersObj.trailerTypesList.map(
          (item) => item.code
        );
        select = [
          {
            name: "Type Of Trailer",
            param: "type",
            values: trailerTypeList,
          },
          {
            name: "Trailer Model",
            param: "trailerModel",
            codes: trailerModelIds,
            values: trailerModelList,
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

  function handleDeleteTrailer() {
    const requestOptions = {
      method: "POST",
      headers: {
        ...authHeader(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        trailerId: dialogContent.id,
        licenseeId: licenseeId,
      }),
    };
    console.log("requestOptions", requestOptions);

    fetch(deleteTrailerAPI, requestOptions)
      .then(handleFetchErrors)
      .then((res) => res.json())
      .then((res) => {
        console.log(`${deleteTrailerAPI} Response`, res);
        // rowData.driverLicense.verified = true;
        // rowData.driverLicense.accepted = true;
        if (tableRef.current) {
          tableRef.current.onQueryChange();
        }

        // setOTPVerifySucess("OTP Verified Successfully")
        // setOTPVerifyDetails(otpVerifyDetailsStart);
        setTimeout(() => handleClose(), 2000);
      })
      .catch((error) => {
        console.log(`${deleteTrailerAPI} Error`, error);
      });
  }

  return (
    <div className={`t2y-list ${classes.root}`}>
      <Dialog
        open={dialogState}
        onClose={handleClose}
        aria-labelledby="form-dialog-title"
        disableBackdropClick={true}
        disableEscapeKeyDown={true}
      >
        <DialogTitle id="form-dialog-title">
          {/* {dialogType === "otpDialog" && "OTP Verification"} */}
          {dialogType === "deleteLicenseeTrailer" && "Delete Licensee Trailer"}
        </DialogTitle>
        <DialogContent>
          {/* {dialogType === "otpDialog" && (
            <Fragment>
              <DialogContentText>Please Enter OTP</DialogContentText>
              {otpVerifySucess !== "" && (
                <DialogContentText>{otpVerifySucess}</DialogContentText>
              )}
              <TextField
                autoFocus
                fullWidth
                margin="dense"
                id="name"
                label="OTP"
                type="otp"
                value={otp}
                onChange={(e) => {
                  setOTP(e.target.value);
                }}
              />
            </Fragment>
          )} */}
          {dialogType === "deleteLicenseeTrailer" && (
            <Fragment>
              Are you sure you want to delete licensee trailer:
              <b>{" " + dialogContent.name}</b>
            </Fragment>
          )}
        </DialogContent>
        <DialogActions>
          {/* {dialogType === "otpDialog" && (
            <Fragment>
              <Button onClick={handleClose} color="primary">
                Cancel
              </Button>
              <Button onClick={handleVerifyOTP} color="primary">
                Verify
              </Button>
            </Fragment>
          )} */}
          {dialogType === "deleteLicenseeTrailer" && (
            <Fragment>
              <Button onClick={handleClose} color="primary">
                Cancel
              </Button>
              <Button onClick={handleDeleteTrailer} color="secondary">
                DELETE
              </Button>
            </Fragment>
          )}
        </DialogActions>
      </Dialog>
      {!loading && (
        <SearchBar
          selectOptions={[["VIN", "vin"]]}
          filterSelect={selectOptions}
          filterRadio={radioOptions}
          title="Licensee Trailers"
          handleSearch={(str) => handleSearch(str)}
          handleFilter={(str) => handleFilter(str)}
        />
      )}

      <MaterialTable
        title="Trailer List"
        tableRef={tableRef}
        search={false}
        columns={[
          {
            title: "ID",
            field: "trailerRef",
            render: (rowData) => {
              return rowData.trailerRef;
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
            title: "VIN",
            field: "vin",
            render: (rowData) => {
              return rowData.vin;
            },
          },
          {
            title: "Age",
            field: "age",
            render: (rowData) => {
              return rowData.age;
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
            title: "Description",
            field: "description",
            cellStyle: {
              minWidth: "400px",
            },
            render: (rowData) => {
              return (
                <div
                  style={
                    {
                      /* height: "100px", 
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis"  */
                    }
                  }
                >
                  {rowData.description}
                </div>
              );
            },
          },
          {
            title: "Size",
            field: "size",
            render: (rowData) => {
              return rowData.size;
            },
          },
          {
            title: "Capacity",
            field: "capacity",
            render: (rowData) => {
              return rowData.capacity;
            },
          },
          {
            title: "Tare",
            field: "tare",
            render: (rowData) => {
              return rowData.tare;
            },
          },
          {
            title: "Features",
            field: "features",
            render: (rowData) => {
              return rowData.features;
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
                      <div>
                        <a
                          key={rowData._id + "_photo" + photoIndex}
                          href={photo.data}
                        >
                          <img
                            src={photo.data}
                            style={{
                              maxHeight: "100px",
                              maxWidth: "100px",
                            }}
                          />
                        </a>
                      </div>
                    );
                  })}
                </div>
              );
            },
          },
          {
            title: "Is Available?",
            field: "availability",
            render: (rowData) => {
              return rowData.availability ? "Yes" : "No";
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
            // fetch(`${fetchTrailersAPI}?licenseeId=${licenseeId}&count=${rowsPerPage}&skip=${(page * rowsPerPage)}`, requestOptions)
            fetch(
              `${fetchTrailersAPI}?${filterStr}${searchStr}id=${licenseeId}&count=${rowsPerPage}&skip=${
                page * rowsPerPage
              }`,
              requestOptions
            )
              .then(handleFetchErrors)
              .then((res) => res.json())
              .then((res) => {
                console.log(`${fetchTrailersAPI} Response`, res);
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
                console.log(`${fetchTrailersAPI} Error`, error);
                resolve({
                  data: [],
                  page: 0,
                  totalCount: 0,
                });
              });
          });
        }}
        actions={[
          (rowData) => ({
            icon: () => {
              return (
                <span
                  style={{
                    minWidth: "150px",
                  }}
                >
                  <TableActionButton
                    title={
                      rowData.availability
                        ? "Set as Unavailable"
                        : "Set as Available"
                    }
                  />
                </span>
              );
            },
            tooltip: rowData.availability
              ? "Set as Unavailable"
              : "Set as Available",
            onClick: (event, rowData) => {
              console.log("Set as Unavailable", event, rowData);
              const requestOptions = {
                method: "POST",
                headers: {
                  ...authHeader(),
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  trailerId: rowData._id,
                  licenseeId: licenseeId,
                  availability: !rowData.availability,
                }),
              };
              console.log("requestOptions", requestOptions);

              fetch(setTrailerAvailabilityAPI, requestOptions)
                .then(handleFetchErrors)
                .then((res) => res.json())
                .then((res) => {
                  console.log(`${setTrailerAvailabilityAPI} Response`, res);
                  if (tableRef.current) {
                    tableRef.current.onQueryChange();
                  }
                })
                .catch((error) => {
                  console.log(`${setTrailerAvailabilityAPI} Error`, error);
                });
            },
          }),
          {
            icon: "create",
            tooltip: "Edit Trailer",
            onClick: (event, rowData) => {
              console.log("Edit onClick", event, rowData);
              history.push(
                `/adminpanel/licensee/${licenseeId}/trailer/edit/${rowData._id}`
              );
            },
          },
          // {
          //   icon: "delete",
          //   tooltip: "Delete Trailer",
          //   onClick: (event, rowData) => {
          //     handleClickOpen("deleteLicenseeTrailer");
          //     setDialogContent({ name: rowData.name, id: rowData._id });
          //   },
          // },
          {
            icon: "add_circle",
            tooltip: "Add Trailer",
            isFreeAction: true,
            onClick: (event, rowData) => {
              console.log("Add onClick", event, rowData);
              history.push(`/adminpanel/licensee/${licenseeId}/trailer/add`);
            },
          },
        ]}
        options={{
          actionsColumnIndex: -1,
          rowStyle: {
            height: "100px",
            maxHeight: "100px",
            overflow: "scroll",
          },
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

// cancel, check-circle

export default TrailerList;
