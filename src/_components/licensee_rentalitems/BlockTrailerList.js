/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import MaterialTable from "material-table";
import { useHistory, useLocation, useParams } from "react-router-dom";

import { makeStyles } from "@material-ui/core/styles";

import { authHeader, handleFetchErrors } from "../../_helpers";
import { common } from "../../_constants/common";

import "../../App.css";

const apiUrl = common.apiUrl;
const getBlockTrailer = `${apiUrl}/admin/licensee/trailer/block`;
const getTrailers = `${apiUrl}/admin/licensee/trailers`;
const getUpsellItems = `${apiUrl}/admin/licensee/upsellitems`;

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

// function TableActionButton(props) {
//     // console.log("TableActionButton", props);
//     return (
//         <span>{props.title}</span>
//     );
// }

function RentalItemDetails(props) {
  let rentalItem;
  if (props.item.itemType === "trailer") {
    rentalItem = props.trailers.find((trailer) => {
      return trailer._id === props.item.itemId;
    });
  } else if (props.item.itemType === "upsellitem") {
    rentalItem = props.upsellItems.find((upsellitem) => {
      return upsellitem._id === props.item.itemId;
    });
  }

  if (rentalItem) {
    return (
      <span>
        {rentalItem.name} ({rentalItem.vin})
      </span>
    );
  } else {
    return <span>Rental Item Not found</span>;
  }
}

export default function BlockTrailerList(props) {
  console.log("BlockTrailerList loaded");

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
  if (!userData.acl.BLOCK.includes("VIEW")) {
    history.replace(from);
  }

  const [loadOnce, setLoadOnce] = useState(0);

  const [trailers, setTrailers] = useState([]);
  const [upsellItems, setUpsellItems] = useState([]);

  //--------------------------------------------------------------

  useEffect(() => {
    const requestOptions = {
      method: "GET",
      headers: authHeader(),
    };

    //--------------------------------------------------------------

    fetch(`${getTrailers}?licenseeId=${licenseeId}`, requestOptions)
      .then(handleFetchErrors)
      .then((res) => res.json())
      .then((res) => {
        const trailersList = res.trailersList;

        setTrailers({
          ...trailers,
          ...trailersList,
        });
      })
      .catch((err) => {
        console.log("Error occurred while fetching Trailers data", err);
      });

    //--------------------------------------------------------------

    fetch(`${getUpsellItems}?licenseeId=${licenseeId}`, requestOptions)
      .then(handleFetchErrors)
      .then((res) => res.json())
      .then((res) => {
        const upsellItemsList = res.upsellItemsList;

        setUpsellItems({
          ...upsellItems,
          ...upsellItemsList,
        });
      })
      .catch((err) => {
        console.log("Error occurred while fetching Upsell Items data", err);
      });

    //--------------------------------------------------------------
  }, [loadOnce]);

  //--------------------------------------------------------------

  const tableRef = React.createRef();

  return (
    <div className={classes.root}>
      <MaterialTable
        title="Blocking Schedule List"
        tableRef={tableRef}
        search={false}
        columns={[
          {
            title: "ID",
            field: "blockingRef",
            render: (rowData) => {
              return rowData.blockingRef;
            },
          },
          {
            title: "Start Date",
            field: "startDate",
            render: (rowData) => {
              return rowData.startDate;
            },
          },
          {
            title: "End Date",
            field: "endDate",
            render: (rowData) => {
              return rowData.endDate;
            },
          },
          {
            title: "isDeleted",
            field: "isDeleted",
            render: (rowData) => {
              return rowData.isDeleted ? "Yes" : "No";
            },
          },
          {
            title: "Items",
            field: "items",
            render: (rowData) => {
              return (
                <div>
                  {rowData.items.map((item, itemIndex) => {
                    return (
                      <div key={`${rowData._id}_${itemIndex}`}>
                        <div>Type : {item.itemType}</div>
                        <div>
                          Details :{" "}
                          <RentalItemDetails
                            item={item}
                            trailers={trailers}
                            upsellItems={upsellItems}
                          />
                        </div>
                        <div>Quantity : {item.quantity}</div>
                      </div>
                    );
                  })}
                </div>
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
              `${getBlockTrailer}?licenseeId=${licenseeId}&count=${rowsPerPage}&skip=${
                page * rowsPerPage
              }`,
              requestOptions
            )
              .then(handleFetchErrors)
              .then((res) => res.json())
              .then((res) => {
                console.log(`${getBlockTrailer} Response`, res);
                const blockingList = res.blockingList || [];
                const totalCount = res.totalCount ? res.totalCount : 0;

                // let newRows = [];
                // setRows((currentRows) => {
                //     console.log((typeof currentRows), (typeof blockingList));
                //     newRows = [
                //         ...currentRows,
                //         ...blockingList
                //     ];
                //     console.log("newRows", newRows);
                //     return newRows;
                // });

                // setTotalCount(totalCount);

                resolve({
                  data: blockingList,
                  page: page,
                  totalCount: totalCount,
                });
              })
              .catch((error) => {
                console.log(`${getBlockTrailer} Error`, error);
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
            tooltip: "Edit Blocking Schedule",
            onClick: (event, rowData) => {
              console.log("Edit onClick", event, rowData);
              history.push(
                `/adminpanel/licensee/${licenseeId}/rentalitem/block/edit/${rowData._id}`
              );
            },
          },
          {
            icon: "add_circle",
            tooltip: "Add Blocking Schedule",
            isFreeAction: true,
            onClick: (event, rowData) => {
              console.log("Add onClick", event, rowData);
              history.push(
                `/adminpanel/licensee/${licenseeId}/rentalitem/block/add`
              );
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
