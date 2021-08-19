import React, { useState, Fragment, useEffect } from "react";
import MaterialTable from "material-table";
import SearchBar from "../common/SearchBar";

import { useHistory, useLocation } from "react-router-dom";

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

const apiUrl = common.apiUrl;
const fetchUpsellItemTypesAPI = `${apiUrl}/admin/upsellitems`;
const fetchRentalItemTypesAPI = `${apiUrl}/admin/rentalitemtypes`;
const fetchFiltersAPI = `${apiUrl}/rentalitemfilters`;

export default function UpsellItemsList(props) {
  const classes = useStyles();

  let userData = localStorage.getItem("user");
  userData = JSON.parse(userData);
  // console.log("userData", userData);

  let history = useHistory();
  // console.log("history", history);

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

        types = res.filtersObj.upsellItemTypesList.map((item) => item.code);
        select = [
          {
            name: "Type Of Upsell Item",
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
  let location = useLocation();
  // console.log("location", location);

  let { from } = location.state || { from: { pathname: "/adminpanel/" } };
  if (!userData.acl.UPSELL.includes("VIEW")) {
    history.replace(from);
  }

  //-------------------------------------------------------------------------

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
    <div className={`t2y-list t2y-upselltype-list ${classes.root}`}>
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
          selectOptions={[["Type", "type"]]}
          filterSelect={selectOptions}
          filterRadio={radioOptions}
          title="Upsell Item Types"
          handleSearch={(str) => handleSearch(str)}
          handleFilter={(str) => handleFilter(str)}
        />
      )}
      <MaterialTable
        title="Upsell Item Types List"
        tableRef={tableRef}
        search={false}
        columns={[
          {
            title: "ID",
            field: "upsellItemTypeRef",
            render: (rowData) => {
              return rowData.upsellItemTypeRef;
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
            title: "Photos",
            field: "photos",
            render: (rowData) => {
              return (
                <div>
                  {rowData.photos.map((photo, photoIndex) => {
                    return (
                      <div key={rowData._id + "_photo" + photoIndex}>
                        <a target="_blank" href={photo.data}>
                          {/* Photo {(photoIndex + 1)} */}
                          <img
                            src={photo.data}
                            style={{ maxHeight: "70px" }}
                          ></img>
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
              return rowData.availability ? "true" : "false";
            },
          },
          // {
          //   title: "is Featured?",
          //   field: "isFeatured",
          //   render: (rowData) => {
          //     return rowData.isFeatured ? "true" : "false";
          //   },
          // },
          {
            title: "Description",
            field: "description",
            render: (rowData) => {
              // return rowData.description

              return (
                <Fragment>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={(e) => {
                      setDialogContent({
                        description: rowData.description,
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
              `${fetchUpsellItemTypesAPI}?${filterStr}${searchStr}count=${rowsPerPage}&skip=${
                page * rowsPerPage
              }`,
              requestOptions
            )
              .then(handleFetchErrors)
              .then((res) => res.json())
              .then((res) => {
                console.log(`${fetchUpsellItemTypesAPI} Response`, res);
                const upsellItemsList = res.upsellItemsList || [];
                const totalCount = res.totalCount ? res.totalCount : 0;

                // let newRows = [];
                // setRows((currentRows) => {
                //     console.log((typeof currentRows), (typeof upsellItemsList));
                //     newRows = [
                //         ...currentRows,
                //         ...upsellItemsList
                //     ];
                //     console.log("newRows", newRows);
                //     return newRows;
                // });

                // setTotalCount(totalCount);

                resolve({
                  data: upsellItemsList,
                  page: page,
                  totalCount: totalCount,
                });
              })
              .catch((error) => {
                console.log(`${fetchUpsellItemTypesAPI} Error`, error);
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
            tooltip: "Edit Upsell Item",
            onClick: (event, rowData) => {
              console.log("Edit onClick", event, rowData);
              history.push(`/adminpanel/upsellitemtype/edit/${rowData._id}`);
            },
          },
          {
            icon: "add_circle",
            tooltip: "Add Upsell Item",
            isFreeAction: true,
            onClick: (event, rowData) => {
              console.log("Add onClick", event, rowData);
              history.push("/adminpanel/upsellitemtype/add");
            },
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
];
