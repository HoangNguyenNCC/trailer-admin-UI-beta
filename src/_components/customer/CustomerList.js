import React, { useState, Fragment } from "react";
import MaterialTable from "material-table";

import { useHistory, useLocation } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import SearchBar from "../common/SearchBar";
import Filter from "../common/Filter";
import {
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@material-ui/core";

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
  search: {
    padding: "0 1em 1em 1em",
    marginBottom: "10px",
  },
  searchBox: {
    padding: "10px",
    marginRight: "10px",
  },
}));

const apiUrl = common.apiUrl;
const fetchCustomersAPI = `${apiUrl}/admin/customers`;
const saveCustomerLicenseApproval = `${apiUrl}/admin/customer/verify/driverLicense`;
const generateOTPAPI = `${apiUrl}/admin/customer/otp/resend`;
const verifyOTPAPI = `${apiUrl}/admin/customer/otp/verify`;
const deleteCustomerAPI = `${apiUrl}/user`;
const resendInviteAPI = `${apiUrl}/admin/customer/email/verify/resend`;
const forgotPasswordAPI = `${apiUrl}/admin/customer/password/forgot`;
// const resetPasswordAPI = `${apiUrl}/admin/customer/password/reset`;

function TableActionButton(props) {
  // console.log("inside TableActionButton")
  // console.log("inside TableActionButton", props);
  return <span>{props.title}</span>;
}

export default function CustomersList(props) {
  const classes = useStyles();

  let userData = localStorage.getItem("user");
  userData = JSON.parse(userData);
  // console.log("userData", userData);

  let history = useHistory();
  // console.log("history", history);

  let location = useLocation();
  // console.log("location", location);

  let { from } = location.state || { from: { pathname: "/adminpanel/" } };
  if (!userData.acl.CUSTOMERS.includes("VIEW")) {
    history.replace(from);
  }

  // const materialTableData = (query) => {

  // }
  //-------------------------------------------------------------------------

  const otpVerifyDetailsStart = {
    customerId: "",
    mobile: "",
    country: common.country,
  };

  const [dialogState, setDialogState] = useState(false);
  const [dialogType, setDialogType] = useState("");
  const [dialogContent, setDialogContent] = useState("");

  const [otp, setOTP] = useState("");
  const [otpVerifySucess, setOTPVerifySucess] = useState("");
  const [otpVerifyDetails, setOTPVerifyDetails] = useState(
    otpVerifyDetailsStart
  );

  function handleClickOpen(dialogTypeIn) {
    setDialogState(true);
    setDialogType(dialogTypeIn);
  }

  function handleClose() {
    setDialogState(false);
    setDialogType("");
  }

  function handleVerifyOTP() {
    const requestOptions = {
      method: "POST",
      headers: {
        ...authHeader(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        customerId: otpVerifyDetails.customerId,
        mobile: otpVerifyDetails.mobile.replace("+61", ""),
        // mobile: "919664815262",
        country: otpVerifyDetails.country,
        testMode: true,
        otp: otp,
      }),
    };
    console.log("requestOptions", requestOptions);

    fetch(verifyOTPAPI, requestOptions)
      .then(handleFetchErrors)
      .then((res) => res.json())
      .then((res) => {
        console.log(`${verifyOTPAPI} Response`, res);
        // rowData.driverLicense.verified = true;
        // rowData.driverLicense.accepted = true;
        if (tableRef.current) {
          tableRef.current.onQueryChange();
        }

        setOTPVerifySucess("OTP Verified Successfully");
        setOTPVerifyDetails(otpVerifyDetailsStart);
        setTimeout(() => {
          handleClose();
        }, 5000);
      })
      .catch((error) => {
        console.log(`${verifyOTPAPI} Error`, error);
      });
  }

  function handleDeleteCustomer() {
    const requestOptions = {
      method: "DELETE",
      headers: {
        ...authHeader(),
        "Content-Type": "application/json",
      },
      // body: JSON.stringify({
      //   customerId: otpVerifyDetails.customerId,
      // }),
    };
    console.log("requestOptions", requestOptions);

    fetch(`${deleteCustomerAPI}/${dialogContent.email}`, requestOptions)
      .then(handleFetchErrors)
      // .then((res) => res.json())
      .then((res) => {
        console.log(`${deleteCustomerAPI} Response`, res);
        // rowData.driverLicense.verified = true;
        // rowData.driverLicense.accepted = true;
        if (tableRef.current) {
          tableRef.current.onQueryChange();
        }

        // setOTPVerifySucess("OTP Verified Successfully")
        // setOTPVerifyDetails(otpVerifyDetailsStart);
        setTimeout(() => {
          handleClose();
        }, 2000);
      })
      .catch((error) => {
        console.log(`${verifyOTPAPI} Error`, error);
      });
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
    <div className={`t2y-list t2y-customerlist ${classes.root}`}>
      <Dialog
        open={dialogState}
        onClose={handleClose}
        aria-labelledby="form-dialog-title"
        disableBackdropClick={true}
        disableEscapeKeyDown={true}
      >
        <DialogTitle id="form-dialog-title">
          {dialogType === "otpDialog" && "OTP Verification"}
          {dialogType === "deleteCustomer" && "Delete Customer"}
          {dialogType === "rowDetailsDialog" && "Driver License Details"}
        </DialogTitle>
        <DialogContent>
          {dialogType === "otpDialog" && (
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
          )}
          {dialogType === "rowDetailsDialog" && (
            <Fragment>
              {dialogContent.card ? (
                <div>
                  <b>Card</b> : {dialogContent.card}
                </div>
              ) : (
                <div>
                  <b>Card</b> : Not Available
                </div>
              )}
              {dialogContent.expiry ? (
                <div>
                  <b>Expiry</b> : {dialogContent.expiry}
                </div>
              ) : (
                <div>
                  <b>Expiry</b> : Not Available
                </div>
              )}
              {dialogContent.state ? (
                <div>
                  <b>State</b> : {dialogContent.state}
                </div>
              ) : (
                <div>
                  <b>State</b> : Not Available
                </div>
              )}
              {dialogContent.scan ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <p>
                    <strong>Scan:</strong>
                  </p>
                  <img
                    src={dialogContent.scan}
                    alt="Preview not available for pdf. Click to download."
                  />
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href={dialogContent.scan}
                  >
                    <Button color="primary" className="wideButton">
                      {" "}
                      Download{" "}
                    </Button>
                  </a>
                </div>
              ) : (
                <div>
                  <b>Scan</b> : Not Available
                </div>
              )}
            </Fragment>
          )}
          {dialogType === "deleteCustomer" && (
            <Fragment>
              Are you sure you want to delete customer : {dialogContent.name} ?
            </Fragment>
          )}
        </DialogContent>
        <DialogActions>
          {dialogType === "otpDialog" && (
            <Fragment>
              <Button onClick={handleClose} color="primary">
                Cancel
              </Button>
              <Button onClick={handleVerifyOTP} color="primary">
                Verify
              </Button>
            </Fragment>
          )}
          {dialogType === "deleteCustomer" && (
            <Fragment>
              <Button onClick={handleClose} color="primary">
                Cancel
              </Button>
              <Button onClick={handleDeleteCustomer} color="secondary">
                DELETE
              </Button>
            </Fragment>
          )}
          {dialogType === "rowDetailsDialog" && (
            <Fragment>
              <Button onClick={handleClose} color="primary">
                Close
              </Button>
            </Fragment>
          )}
        </DialogActions>
      </Dialog>

      <SearchBar
        selectOptions={[
          ["Mobile", "mobile"],
          ["Email", "email"],
        ]}
        filterSelect={selectOptions}
        filterRadio={radioOptions}
        title="Customer"
        handleSearch={(str) => handleSearch(str)}
        handleFilter={(str) => handleFilter(str)}
      />

      <MaterialTable
        title="Customers"
        tableRef={tableRef}
        columns={[
          {
            title: "ID",
            field: "userRef",
            render: (rowData) => {
              return rowData.userRef;
              // return "Yes"
            },
          },
          {
            title: "Name",
            field: "name",
            render: (rowData) => {
              // console.log("vaibhav name",rowData)
              return rowData.name;
              // return "Yes"
            },
          },
          {
            title: "Email",
            field: "email",
            render: (rowData) => {
              return rowData.email;
              // return "Yes"
            },
          },
          {
            title: "Email Verified",
            field: "isEmailVerified",
            render: (rowData) => {
              return rowData.isEmailVerified ? "Yes" : "No";
            },
          },
          {
            title: "Mobile",
            field: "mobile",
            render: (rowData) => {
              return rowData.mobile.replace("+61", "");
            },
          },
          {
            title: "Mobile Verified",
            field: "isMobileVerified",
            render: (rowData) => {
              return rowData.isMobileVerified ? "Yes" : "No";
            },
          },
          {
            title: "Photo",
            field: "photo",
            render: (rowData) => {
              if (rowData.photo) {
                return (
                  <div>
                    <a
                      target="_blank"
                      rel="noopener noreferrer"
                      href={rowData.photo}
                    >
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
              } else {
                return <div>Not Available</div>;
              }
              // return "Yes"
            },
          },
          {
            title: "Driver License",
            field: "driverLicense",
            render: (rowData) => {
              return (
                <div>
                  {rowData.driverLicense ? (
                    <div>
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={(e) => {
                          setDialogContent(rowData.driverLicense);
                          handleClickOpen("rowDetailsDialog");
                        }}
                      >
                        View Details
                      </Button>
                    </div>
                  ) : (
                    <div>Data Not available</div>
                  )}
                </div>
              );
              // return "Yes"
            },
          },
          // {
          //   title: "License Verified",
          //   field: "driverLicenseVerified",
          //   type: "boolean",
          //   render: (rowData) => {
          //     return rowData.driverLicense.verified ? "Yes" : "No";
          //     // return "Yes"
          //   },
          // },
          {
            title: "License Accepted",
            field: "driverLicenseAccepted",
            render: (rowData) => {
              return rowData.driverLicense.accepted ? "Yes" : "No";
              // return "Yes"
            },
          },
        ]}
        data={(query) => {
          console.log("MaterialTable data", query);
          const rowsPerPage = query.pageSize;
          const page = query.page;
          // console.log("PAGE",page)

          const requestOptions = {
            method: "GET",
            headers: authHeader(),
          };
          return new Promise((resolve, reject) => {
            fetch(
              `${fetchCustomersAPI}?${filterStr}${searchStr}count=${rowsPerPage}&skip=${
                page * rowsPerPage
              }`,
              requestOptions
            )
              // fetch(`https://reqres.in/api/users?page=${page+1}&per_page=${rowsPerPage}`)
              .then(handleFetchErrors)
              .then((res) => res.json())
              .then((res) => {
                // console.log(`${fetchCustomersAPI} Response`, res);
                const customerList = res.customerList || [];
                const totalCount = res.totalCount ? res.totalCount : 0;
                // setRows(res.customerList)
                // let newRows = [];
                // setRows((currentRows) => {
                //     console.log((typeof currentRows), (typeof customerList));
                //     newRows = [
                //         ...currentRows,
                //         ...customerList
                //     ];
                //     console.log("newRows", newRows);
                //     return newRows;
                // });

                // setTotalCount(totalCount);

                resolve({
                  data: customerList,
                  page: page,
                  totalCount: totalCount,
                });
              })
              .catch((error) => {
                console.log(`${fetchCustomersAPI} Error`, error);
                resolve({
                  data: [],
                  page: 0,
                  totalCount: 0,
                  // page: page,
                  // totalCount: totalCount
                });
              });
          });
        }}
        actions={[
          (rowData) => ({
            icon: "check_circle",
            tooltip: "Approve Driver License",
            onClick: (event, rowData) => {
              console.log("Approve onClick", event, rowData);
              const requestOptions = {
                method: "PUT",
                headers: {
                  ...authHeader(),
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  customerId: rowData._id,
                  isAccepted: true,
                }),
              };
              console.log("requestOptions", requestOptions);

              fetch(saveCustomerLicenseApproval, requestOptions)
                .then(handleFetchErrors)
                .then((res) => res.json())
                .then((res) => {
                  console.log(`${saveCustomerLicenseApproval} Response`, res);
                  // rowData.driverLicense.verified = true;
                  // rowData.driverLicense.accepted = true;
                  if (tableRef.current) {
                    tableRef.current.onQueryChange();
                  }
                })
                .catch((error) => {
                  console.log(`${saveCustomerLicenseApproval} Error`, error);
                });
            },
          }),
          (rowData) => ({
            icon: "cancel",
            tooltip: "Reject Driver License",
            onClick: (event, rowData) => {
              console.log("Reject onClick", event, rowData);
              const requestOptions = {
                method: "PUT",
                headers: {
                  ...authHeader(),
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  customerId: rowData._id,
                  isAccepted: false,
                }),
              };
              console.log("requestOptions", requestOptions);

              fetch(saveCustomerLicenseApproval, requestOptions)
                .then(handleFetchErrors)
                .then((res) => res.json())
                .then((res) => {
                  console.log(`${saveCustomerLicenseApproval} Response`, res);
                  // rowData.driverLicense.verified = true;
                  // rowData.driverLicense.accepted = false;
                  if (tableRef.current) {
                    tableRef.current.onQueryChange();
                  }
                })
                .catch((error) => {
                  console.log(`${saveCustomerLicenseApproval} Error`, error);
                });
            },
          }),
          (rowData) => ({
            icon: () => {
              return <TableActionButton title="Resend OTP" />;
            },
            tooltip: "Resend OTP",
            onClick: (event, rowData) => {
              console.log("Resend OTP onClick", event, rowData);
              const requestOptions = {
                method: "POST",
                headers: {
                  ...authHeader(),
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  customerId: rowData._id,
                  mobile: rowData.mobile.replace("+61", ""),
                  country: rowData.address.country || common.country,
                  testMode: true,
                }),
              };
              console.log("requestOptions", requestOptions);

              fetch(generateOTPAPI, requestOptions)
                .then(handleFetchErrors)
                .then((res) => res.json())
                .then((res) => {
                  console.log(`${generateOTPAPI} Response`, res);
                  // rowData.driverLicense.verified = true;
                  // rowData.driverLicense.accepted = true;
                  if (tableRef.current) {
                    tableRef.current.onQueryChange();
                  }

                  setOTPVerifyDetails({
                    customerId: rowData._id,
                    mobile: rowData.mobile.replace("+61", ""),
                    country: rowData.address.country || common.country,
                    testMode: true,
                  });
                  handleClickOpen("otpDialog");
                })
                .catch((error) => {
                  console.log(`${generateOTPAPI} Error`, error);
                });
            },
          }),
          (rowData) => ({
            icon: () => {
              return <TableActionButton title="Resend Verification Email" />;
            },
            tooltip: "Resend Verification Email",
            onClick: (event, rowData) => {
              const requestOptions = {
                method: "POST",
                headers: {
                  ...authHeader(),
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  customerId: rowData._id,
                  email: rowData.email,
                }),
              };
              console.log("requestOptions", requestOptions);

              fetch(resendInviteAPI, requestOptions)
                .then(handleFetchErrors)
                .then((res) => res.json())
                .then((res) => {
                  console.log(`${resendInviteAPI} Response`, res);
                  if (tableRef.current) {
                    tableRef.current.onQueryChange();
                  }
                })
                .catch((error) => {
                  console.log(`${resendInviteAPI} Error`, error);
                });
            },
          }),
          // (rowData) => ({
          //   icon: () => {
          //     return <TableActionButton title="Send Reset Password Link" />;
          //   },
          //   tooltip: "Send Reset Password Link",
          //   onClick: (event, rowData) => {
          //     console.log("Resend OTP onClick", event, rowData);
          //     const requestOptions = {
          //       method: "PUT",
          //       headers: {
          //         ...authHeader(),
          //         "Content-Type": "application/json",
          //       },
          //       body: JSON.stringify({
          //         customerId: rowData._id,
          //         email: rowData.email,
          //         platform: "web",
          //       }),
          //     };
          //     console.log("requestOptions", requestOptions);

          //     fetch(forgotPasswordAPI, requestOptions)
          //       .then(handleFetchErrors)
          //       .then((res) => res.json())
          //       .then((res) => {
          //         console.log(`${forgotPasswordAPI} Response`, res);
          //         // rowData.driverLicense.verified = true;
          //         // rowData.driverLicense.accepted = true;
          //         if (tableRef.current) {
          //           tableRef.current.onQueryChange();
          //         }
          //       })
          //       .catch((error) => {
          //         console.log(`${forgotPasswordAPI} Error`, error);
          //       });
          //   },
          // }),
          {
            icon: "create",

            tooltip: "Edit Customer",
            onClick: (event, rowData) => {
              console.log("Edit onClick", event, rowData);
              history.push(`/adminpanel/customer/edit/${rowData._id}`);
            },
          },
          // {
          //   icon: "delete",

          //   tooltip: "Delete Customer",
          //   onClick: (event, rowData) => {
          //     handleClickOpen("deleteCustomer");
          //     setDialogContent({ name: rowData.name, email: rowData.email });
          //   },
          // },
          {
            icon: "add_circle",
            tooltip: "Add Customer",
            isFreeAction: true,
            onClick: (event, rowData) => {
              console.log("Add onClick", event, rowData);
              history.push("/adminpanel/customer/add");
            },
          },
        ]}
        options={{
          actionsColumnIndex: -1,
          filtering: false,
          sorting: true,
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
    name: "Email Verified",
    param: "emailVerified",
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
    name: "Mobile Verified",
    param: "mobileVerified",
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
    name: "DL Accepted",
    param: "dlAccepted",
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
const selectOptions = [
  {
    name: "States",
    param: "state",
    values: common.states,
  },
];
