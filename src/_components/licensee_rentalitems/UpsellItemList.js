import React, { Fragment, useState, useEffect } from "react";
import MaterialTable from "material-table";
import { useHistory, useLocation, useParams } from "react-router-dom";
import SearchBar from "../common/SearchBar";

import { makeStyles } from "@material-ui/core/styles";

import { authHeader, handleFetchErrors } from "../../_helpers";
import { common } from "../../_constants/common";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@material-ui/core";

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
const fetchFiltersAPI = `${apiUrl}/rentalitemfilters`;
const fetchUpsellItemsAPI = `${apiUrl}/admin/licenseeUpsellItems`;
const setUpsellItemAvailabilityAPI = `${apiUrl}/admin/licensee/upsellitem/setAvailability`;
const deleteUpsellAPI = `${apiUrl}/admin/licensee/upsellitem/delete`;

function TableActionButton(props) {
  // console.log("TableActionButton", props);
  return <span>{props.title}</span>;
}

export default function UpsellItemsList(props) {
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
  if (!userData.acl.UPSELL.includes("VIEW")) {
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
  let upsellItemTypesList = [];
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
        upsellItemTypesList = res.filtersObj.upsellItemTypesList.map(
          (item) => item.code
        );
        select = [
          {
            name: "Type Of Upsell Item",
            param: "type",
            values: upsellItemTypesList,
          },
          {
            name: "Trailer Model",
            param: "trailerModel",
            values: trailerModelList,
            codes: trailerModelIds,
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

  function handleDeleteUpsell() {
    const requestOptions = {
      method: "POST",
      headers: {
        ...authHeader(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        upsellId: dialogContent.id,
        licenseeId: licenseeId,
      }),
    };
    console.log("requestOptions", requestOptions);

    fetch(deleteUpsellAPI, requestOptions)
      .then(handleFetchErrors)
      .then((res) => res.json())
      .then((res) => {
        console.log(`${deleteUpsellAPI} Response`, res);
        // rowData.driverLicense.verified = true;
        // rowData.driverLicense.accepted = true;
        if (tableRef.current) {
          tableRef.current.onQueryChange();
        }

        // setOTPVerifySucess("OTP Verified Successfully")
        // setOTPVerifyDetails(otpVerifyDetailsStart);
        setTimeout(() => {
          handleClose();
        }, 5000);
      })
      .catch((error) => {
        console.log(`${deleteUpsellAPI} Error`, error);
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
          {dialogType === "deleteUpsellItem" && "Delete Customer"}
        </DialogTitle>
        <DialogContent>
          {dialogType === "deleteUpsellItem" && (
            <Fragment>
              Are you sure you want to delete Upsell Item : {dialogContent.name}{" "}
              ?
            </Fragment>
          )}
        </DialogContent>
        <DialogActions>
          {dialogType === "deleteUpsellItem" && (
            <Fragment>
              <Button onClick={handleClose} color="primary">
                Cancel
              </Button>
              <Button onClick={handleDeleteUpsell} color="secondary">
                DELETE
              </Button>
            </Fragment>
          )}
        </DialogActions>
      </Dialog>
      {!loading && (
        <SearchBar
          selectOptions={[["Name", "name"]]}
          filterSelect={selectOptions}
          filterRadio={radioOptions}
          title="Licensee Upsell Item"
          handleSearch={(str) => handleSearch(str)}
          handleFilter={(str) => handleFilter(str)}
        />
      )}
      <MaterialTable
        title="Upsell Items List"
        tableRef={tableRef}
        search={false}
        columns={[
          {
            title: "ID",
            field: "upsellItemRef",
            render: (rowData) => {
              return rowData.upsellItemRef;
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
            title: "Description",
            field: "description",
            cellStyle: {
              minWidth: "400px",
            },
            render: (rowData) => {
              return rowData.description;
            },
          },
          {
            title: "Photos",
            field: "photos",
            render: (rowData) => {
              return (
                <div>
                  <a href={rowData.photo}>
                    <img
                      src={rowData.photo}
                      style={{
                        maxHeight: "100px",
                        maxWidth: "100px",
                      }}
                    />
                  </a>
                </div>
              );
            },
          },
          {
            title: "Quantity",
            field: "quantity",
            render: (rowData) => {
              return rowData.quantity;
            },
          },
          {
            title: "Is Available?",
            field: "availability",
            render: (rowData) => {
              return rowData.availability ? "true" : "false";
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
            // fetch(`${fetchUpsellItemsAPI}?id=${licenseeId}&count=${rowsPerPage}&skip=${(page * rowsPerPage)}`, requestOptions)
            fetch(
              `${fetchUpsellItemsAPI}?${filterStr}${searchStr}id=${licenseeId}&count=${rowsPerPage}&skip=${
                page * rowsPerPage
              }`,
              requestOptions
            )
              .then(handleFetchErrors)
              .then((res) => res.json())
              .then((res) => {
                console.log(`${fetchUpsellItemsAPI} Response`, res);
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
                console.log(`${fetchUpsellItemsAPI} Error`, error);
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
                <TableActionButton
                  title={
                    rowData.availability
                      ? "Set as Unavailable"
                      : "Set as Available"
                  }
                />
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
                  upsellId: rowData._id,
                  licenseeId: licenseeId,
                  availability: !rowData.availability,
                }),
              };
              console.log("requestOptions", requestOptions);

              fetch(setUpsellItemAvailabilityAPI, requestOptions)
                .then(handleFetchErrors)
                .then((res) => res.json())
                .then((res) => {
                  console.log(`${setUpsellItemAvailabilityAPI} Response`, res);
                  if (tableRef.current) {
                    tableRef.current.onQueryChange();
                  }
                })
                .catch((error) => {
                  console.log(`${setUpsellItemAvailabilityAPI} Error`, error);
                });
            },
          }),
          {
            icon: "create",
            tooltip: "Edit Upsell Item",
            onClick: (event, rowData) => {
              console.log("Edit onClick", event, rowData);
              history.push(
                `/adminpanel/licensee/${licenseeId}/upsellitem/edit/${rowData._id}`
              );
            },
          },
          // {
          //   icon: "delete",

          //   tooltip: "Delete Upsell Item",
          //   onClick: (event, rowData) => {
          //     handleClickOpen("deleteUpsellItem");
          //     setDialogContent({ name: rowData.name, id: rowData._id });
          //   },
          // },
          {
            icon: "add_circle",
            tooltip: "Add Upsell Item",
            isFreeAction: true,
            onClick: (event, rowData) => {
              console.log("Add onClick", event, rowData);
              history.push(`/adminpanel/licensee/${licenseeId}/upsellitem/add`);
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
