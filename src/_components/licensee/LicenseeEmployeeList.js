import React, { useState, Fragment } from "react";
import { useHistory, useLocation, useParams } from "react-router-dom";
import MaterialTable from "material-table";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SearchBar from "../common/SearchBar";

import {
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@material-ui/core";

import { makeStyles } from "@material-ui/core/styles";

import { authHeader, handleFetchErrors } from "../../_helpers";
import { common } from "../../_constants/common";

import "../../App.css";

const apiUrl = common.apiUrl;
const fetchEmployeesAPI = `${apiUrl}/admin/licensee/employees`;

const generateOTPAPI = `${apiUrl}/admin/licensee/employee/otp/resend`;
const verifyOTPAPI = `${apiUrl}/admin/licensee/employee/otp/verify`;

const resendInviteAPI = `${apiUrl}/admin/employee/resendinvite`;
const forgotPasswordAPI = `${apiUrl}/admin/employee/forgotpassword`;
// const resetPasswordAPI = `${apiUrl}/admin/employee/resetpassword`;
const deleteLicenseeEmployeeAPI = `${apiUrl}/admin/licensee/employee/delete`;
const resendEmailAPI = `${apiUrl}/admin/licensee/employee/email/resend`;
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
  // console.log("TableActionButton", props);
  return <span>{props.title}</span>;
}

function EmployeeList(props) {
  console.log("EmployeeList called");
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
  if (!userData.acl.LICENSEEEMPLOYEE.includes("VIEW")) {
    history.replace(from);
  }

  //-------------------------------------------------------------------------

  const otpVerifyDetailsStart = {
    // customerId: "",
    mobile: "",
    country: common.country,
    user: "employee",
    otp: "",
    testMode: false,
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

  function handleDeleteLicenseeEmployee() {
    const requestOptions = {
      method: "POST",
      headers: {
        ...authHeader(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: dialogContent.id,
      }),
    };
    console.log("requestOptions", requestOptions);

    fetch(deleteLicenseeEmployeeAPI, requestOptions)
      .then(handleFetchErrors)
      .then((res) => res.json())
      .then((res) => {
        console.log(`${deleteLicenseeEmployeeAPI} Response`, res);
        if (tableRef.current) {
          tableRef.current.onQueryChange();
        }
        setTimeout(() => {
          handleClose();
        }, 5000);
      })
      .catch((error) => {
        console.log(`${deleteLicenseeEmployeeAPI} Error`, error);
      });
  }

  function handleVerifyOTP() {
    const requestOptions = {
      method: "POST",
      headers: {
        ...authHeader(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // mobile: otpVerifyDetails.mobile,
        // // mobile: "919664815262",
        // country: common.country,
        ...otpVerifyDetails,
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
        setOTPVerifyDetails("");
        setTimeout(() => {
          handleClose();
          toast.success("OTP Verified Successfully!");
        }, 5000);
      })
      .catch((error) => {
        toast.error("OTP Not Verified!");
        handleClose();
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
    <React.Fragment>
      <ToastContainer />
      <div className={`t2y-list t2y-employeelist ${classes.root}`}>
        <Dialog
          open={dialogState}
          onClose={handleClose}
          aria-labelledby="form-dialog-title"
          disableBackdropClick={true}
          disableEscapeKeyDown={true}
        >
          <DialogTitle id="form-dialog-title">
            {dialogType === "otpDialog" && "OTP Verification"}
            {dialogType === "deleteEmployee" && "Delete Employee"}
            {dialogType === "rowDetailsDialog" && "Driver License Details"}
            {dialogType === "ACLDialog" && "ACL View"}
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
                      style={{
                        maxWidth: "150px",
                        maxHeight: "150px",
                      }}
                      src={dialogContent.scan.data}
                      alt="preview not available for pdf. Click to Download"
                    />
                    <a
                      target="_blank"
                      rel="noopener noreferrer"
                      href={dialogContent.scan.data}
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
            {dialogType === "deleteEmployee" && (
              <Fragment>
                Are you sure you want to delete employee : {dialogContent.name}{" "}
                ?
              </Fragment>
            )}
            {dialogType === "ACLDialog" && (
              <Fragment>
                <table>
                  <thead>
                    <tr>
                      <th>Priviledge</th>
                      <th>Add</th>
                      <th>View</th>
                      <th>Update</th>
                      <th>Delete</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.keys(dialogContent).map((priviledge) => {
                      return (
                        <tr>
                          <td>{priviledge}</td>
                          <td>
                            {dialogContent[priviledge].includes("ADD")
                              ? "✅"
                              : "❌"}
                          </td>
                          <td>
                            {dialogContent[priviledge].includes("VIEW")
                              ? "✅"
                              : "❌"}
                          </td>
                          <td>
                            {dialogContent[priviledge].includes("UPDATE")
                              ? "✅"
                              : "❌"}
                          </td>
                          <td>
                            {dialogContent[priviledge].includes("DELETE")
                              ? "✅"
                              : "❌"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
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
            {dialogType === "deleteEmployee" && (
              <Fragment>
                <Button onClick={handleClose} color="primary">
                  Cancel
                </Button>
                <Button
                  onClick={handleDeleteLicenseeEmployee}
                  color="secondary"
                >
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
            {dialogType === "ACLDialog" && (
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
          title="Licensee Employee"
          handleSearch={(str) => handleSearch(str)}
          handleFilter={(str) => handleFilter(str)}
        />
        <MaterialTable
          title="Employees"
          tableRef={tableRef}
          columns={[
            {
              title: "ID",
              field: "employeeRef",
              render: (rowData) => {
                return rowData.employeeRef;
              },
            },
            {
              title: "Name",
              field: "name",
              render: (rowData) => {
                return rowData.name && rowData.name
                  ? `${rowData.name}`
                  : rowData.name;
              },
            },
            {
              title: "Email",
              field: "email",
              render: (rowData) => {
                return rowData.email;
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
              title: "Is Owner",
              field: "isOwner",
              render: (rowData) => {
                return rowData.isOwner ? "Yes" : "No";
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
              },
            },
            {
              title: "ACL",
              field: "acl",
              render: (rowData) => {
                return (
                  <div>
                    {rowData.acl ? (
                      <div>
                        <Button
                          variant="outlined"
                          color="primary"
                          onClick={(e) => {
                            setDialogContent(rowData.acl);
                            handleClickOpen("ACLDialog");
                          }}
                        >
                          View ACL
                        </Button>
                      </div>
                    ) : (
                      <div>Data Not available</div>
                    )}
                  </div>
                );
              },
            },
          ]}
          data={(query) => {
            console.log("Employee MaterialTable data", query);
            const rowsPerPage = query.pageSize;
            const page = query.page;

            const requestOptions = {
              method: "GET",
              headers: authHeader(),
            };
            return new Promise((resolve, reject) => {
              // fetch(`${fetchEmployeesAPI}?count=${rowsPerPage}&skip=${(page * rowsPerPage)}`, requestOptions)
              fetch(
                `${fetchEmployeesAPI}?${filterStr}${searchStr}id=${licenseeId}&count=${rowsPerPage}&skip=${
                  page * rowsPerPage
                }`,
                requestOptions
              )
                .then(handleFetchErrors)
                .then((res) => res.json())
                .then((res) => {
                  console.log(`${fetchEmployeesAPI} Response`, res);
                  const employeeList = res.employeeList || [];
                  const totalCount = res.totalCount ? res.totalCount : 0;

                  // let newRows = [];
                  // setRows((currentRows) => {
                  //     console.log((typeof currentRows), (typeof employeeList));
                  //     newRows = [
                  //         ...currentRows,
                  //         ...employeeList
                  //     ];
                  //     console.log("newRows", newRows);
                  //     return newRows;
                  // });

                  // setTotalCount(totalCount);

                  resolve({
                    data: employeeList,
                    page: page,
                    totalCount: totalCount,
                  });
                })
                .catch((error) => {
                  console.log("getEmployees Error", error);
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
                    //   employeeId: rowData._id,
                    mobile: rowData.mobile.replace("+61", ""),
                    country: common.country,
                    user: "",
                    testMode: false,
                    user: "employee",
                  }),
                };
                console.log("requestOptions", requestOptions);

                fetch(generateOTPAPI, requestOptions)
                  // .then(handleFetchErrors)
                  .then((res) => res.json())
                  .then((res) => {
                    console.log(`${generateOTPAPI} Response`, res);
                    // rowData.driverLicense.verified = true;
                    // rowData.driverLicense.accepted = true;
                    if (tableRef.current) {
                      tableRef.current.onQueryChange();
                    }

                    setOTPVerifyDetails({
                      // customerId: rowData._id,
                      mobile: rowData.mobile.replace("+61", ""),
                      country: rowData.address.country || common.country,
                      testMode: false,
                      user: "employee",
                    });
                    handleClickOpen("otpDialog");
                  })
                  .catch((error) => {
                    console.log(`${generateOTPAPI} Error`, error);
                  });
              },
            },
            // {
            //   icon: () => {
            //     return <TableActionButton title="View ACL" />;
            //   },
            //   tooltip: "View ACL",
            //   onClick: (event, rowData) => {
            //     //set dialog content will have to be changed to acl details
            //     console.log("vaibhav rowdata", rowData);
            //     setDialogContent(rowData.acl);
            //     handleClickOpen("ACLDialog");
            //   },
            // },
            {
              icon: () => {
                return <TableActionButton title="Verify Email" />;
              },
              tooltip: "Verify Email",
              onClick: (event, rowData) => {
                console.log("Verify Email", event, rowData);
                const requestOptions = {
                  method: "POST",
                  headers: {
                    ...authHeader(),
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    employeeId: rowData._id,
                    email: rowData.email,
                  }),
                };
                console.log("requestOptions", requestOptions);

                fetch(resendEmailAPI, requestOptions)
                  .then(handleFetchErrors)
                  .then((res) => res.json())
                  .then((res) => {
                    console.log(`${resendEmailAPI} Response`, res);
                    if (tableRef.current) {
                      tableRef.current.onQueryChange();
                    }
                  })
                  .catch((error) => {
                    console.log(`${resendEmailAPI} Error`, error);
                  });
              },
            },
            // {
            //   icon: () => {
            //     return <TableActionButton title="Send Reset Password Link" />;
            //   },
            //   tooltip: "Send Reset Password Link",
            //   onClick: (event, rowData) => {
            //     console.log("Forgot Password", event, rowData);
            //     const requestOptions = {
            //       method: "PUT",
            //       headers: {
            //         ...authHeader(),
            //         "Content-Type": "application/json",
            //       },
            //       body: JSON.stringify({
            //         employeeId: rowData._id,
            //         email: rowData.email,
            //       }),
            //     };
            //     console.log("requestOptions", requestOptions);

            //     fetch(forgotPasswordAPI, requestOptions)
            //       .then(handleFetchErrors)
            //       .then((res) => res.json())
            //       .then((res) => {
            //         console.log(`${forgotPasswordAPI} Response`, res);
            //         if (tableRef.current) {
            //           tableRef.current.onQueryChange();
            //         }
            //       })
            //       .catch((error) => {
            //         console.log(`${forgotPasswordAPI} Error`, error);
            //       });
            //   },
            // },
            {
              icon: () => {
                return <TableActionButton title="Resend Invite" />;
              },
              tooltip: "Resend Invite",
              onClick: (event, rowData) => {
                if (!rowData.acceptedInvite) {
                  console.log("Resend Invite", event, rowData);
                  const requestOptions = {
                    method: "POST",
                    headers: {
                      ...authHeader(),
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      employeeId: rowData._id,
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
                } else {
                  toast.warn("Already accepted Invite");
                  console.log("already accepted invite");
                  console.log("Resend Invite", rowData.acceptedInvite);
                }
              },
            },
            {
              icon: "create",
              tooltip: "Edit Employee",
              onClick: (event, rowData) => {
                console.log("Edit onClick", event, rowData);
                history.push(
                  `/adminpanel/licensee/${licenseeId}/employee/edit/${rowData._id}`
                );
              },
            },
            // {
            //   icon: "delete",

            //   tooltip: "Delete Licensee Employee",
            //   onClick: (event, rowData) => {
            //     if (rowData.isOwner) {
            //       alert("Can't delete owner!");
            //     } else {
            //       handleClickOpen("deleteEmployee");
            //       setDialogContent({ name: rowData.name, id: rowData._id });
            //     }
            //   },
            // },
            {
              icon: "add_circle",
              tooltip: "Invite Licensee Employee",
              isFreeAction: true,
              onClick: (event, rowData) => {
                console.log("Invite Licensee Employee onClick", event, rowData);
                history.push(
                  `/adminpanel/licensee/${licenseeId}/employee/invite`
                );
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
    </React.Fragment>
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
  {
    name: "Is Owner?",
    param: "isOwner",
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
// cancel, check-circle

export default EmployeeList;
