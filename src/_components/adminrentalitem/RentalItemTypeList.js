/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import MaterialTable from "material-table";
import { useHistory, useLocation } from "react-router-dom";
import SearchBar from "../common/SearchBar";

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
const fetchRentalItemTypesAPI = `${apiUrl}/admin/rentalitemtypes`;

export default function RentalItemTypesList(props) {
  const classes = useStyles();

  let userData = localStorage.getItem("user");
  userData = JSON.parse(userData);

  let history = useHistory();

  let location = useLocation();

  let { from } = location.state || { from: { pathname: "/adminpanel/" } };
  if (!userData.acl.TRAILER.includes("VIEW")) {
    history.replace(from);
  }

  const [rows, setRows] = useState([]);

  // const [totalCount, setTotalCount] = useState(0);

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
        setRows(rentalItemTypesList);
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
    <div className={classes.root}>
      <SearchBar
        selectOptions={[["Name", "name"]]}
        filterSelect={selectOptions}
        filterRadio={radioOptions}
        title="Rental Item Types"
        handleSearch={(str) => handleSearch(str)}
        handleFilter={(str) => handleFilter(str)}
      />
      <MaterialTable
        title="Rental Item Types List"
        tableRef={tableRef}
        search={false}
        columns={[
          {
            title: "ID",
            field: "rentalItemTypeRef",
            render: (rowData) => {
              return rowData.rentalItemTypeRef;
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
            title: "Code",
            field: "code",
            render: (rowData) => {
              return rowData.code;
            },
          },
          {
            title: "Item Type",
            field: "itemtype",
            render: (rowData) => {
              return rowData.itemtype;
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
              `${fetchRentalItemTypesAPI}?${filterStr}${searchStr}count=${rowsPerPage}&skip=${
                page * rowsPerPage
              }`,
              requestOptions
            )
              .then(handleFetchErrors)
              .then((res) => res.json())
              .then((res) => {
                console.log(`${fetchRentalItemTypesAPI} Response`, res);
                const totalCount = res.totalCount || 0;

                resolve({
                  data: res.rentalItemTypes,
                  page: page,
                  totalCount: totalCount,
                });
              })
              .catch((error) => {
                console.log(`${fetchRentalItemTypesAPI} Error`, error);
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
            tooltip: "Edit Rental Item",
            onClick: (event, rowData) => {
              console.log("Edit onClick", event, rowData);
              history.push(`/adminpanel/rentalitemtype/edit/${rowData._id}`);
            },
          },
          {
            icon: "add_circle",
            tooltip: "Add  Rental Item",
            isFreeAction: true,
            onClick: (event, rowData) => {
              console.log("Add onClick", rowData);
              history.push("/adminpanel/rentalitemtype/add");
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
    name: "Item Type",
    param: "itemType",
    options: [
      {
        text: "Trailer",
        value: "trailer",
      },
      {
        text: "Upsell Item",
        value: "upsellitem",
      },
      {
        text: "Both",
        value: "",
      },
    ],
  },
];
const selectOptions = [
  // {
  //   name: "States",
  //   param: "state",
  //   values: common.states,
  // },
];
