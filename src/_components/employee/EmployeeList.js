import React, { useState, Fragment } from "react";
import { useHistory, useLocation } from "react-router-dom";
import MaterialTable from "material-table";
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
import { toast } from "react-toastify";
import { authHeader, handleFetchErrors } from "../../_helpers";
import { common } from "../../_constants/common";

import "../../App.css";

const apiUrl = common.apiUrl;
const fetchEmployeesAPI = `${apiUrl}/admin/employees`;
const generateOTPAPI = `${apiUrl}/admin/employee/generateotp`;
const verifyOTPAPI = `${apiUrl}/admin/employee/verifyotp`;
const resendInviteAPI = `${apiUrl}/admin/employee/invite/resend`;
const resendEmailAPI = `${apiUrl}/admin/employee/resend/email`;
const forgotPasswordAPI = `${apiUrl}/admin/employee/forgotpassword`;
const resetPasswordAPI = `${apiUrl}/admin/employee/resetpassword`;

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

  let { from } = location.state || { from: { pathname: "/adminpanel/" } };
  if (!userData.acl.TRAILER.includes("VIEW")) {
    history.replace(from);
  }

  //-------------------------------------------------------------------------

  const [dialogState, setDialogState] = useState(false);
  const [dialogType, setDialogType] = useState("");
  const [dialogContent, setDialogContent] = useState("");
  const [otp, setOTP] = useState("");
  const [otpVerifySucess, setOTPVerifySucess] = useState("");
  const [mobile, setMobile] = useState("");
  const [resetPass, setPass] = useState({
    token: "",
    password: "",
  });

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
        mobile: mobile.replace("+61", ""),
        // mobile: "919664815262",
        country: common.country,
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
        setMobile("");
        setTimeout(() => {
          handleClose();
        }, 5000);
      })
      .catch((error) => {
        console.log(`${verifyOTPAPI} Error`, error);
      });
  }

  function handleResetPassword() {
    const requestOptions = {
      method: "PUT",
      headers: {
        ...authHeader(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(resetPass),
    };
    console.log("requestOptions", requestOptions);

    fetch(resetPasswordAPI, requestOptions)
      .then(handleFetchErrors)
      .then((res) => res.json())
      .then((res) => {
        console.log(`${resetPasswordAPI} Response`, res);
        // rowData.driverLicense.verified = true;
        // rowData.driverLicense.accepted = true;
        if (tableRef.current) {
          tableRef.current.onQueryChange();
        }
        setPass({
          token: "",
          password: "",
        });
        setTimeout(() => {
          handleClose();
        }, 3000);
      })
      .catch((error) => {
        console.log(`${resetPasswordAPI} Error`, error);
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

  return (
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
          {dialogType === "resetPassword" && "Reset Password"}
          {dialogType === "deleteEmployee" && "Delete Employee"}
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
          {dialogType === "resetPassword" && (
            <Fragment>
              <DialogContentText>
                Please Enter Token & New Password
              </DialogContentText>
              <TextField
                autoFocus
                fullWidth
                margin="dense"
                id="token"
                label="Token"
                type="text"
                value={resetPass.token}
                onChange={(e) => {
                  setPass({ ...resetPass, token: e.target.value });
                }}
              />
              <TextField
                autoFocus
                fullWidth
                margin="dense"
                id="pass"
                label="Password"
                type="password"
                value={resetPass.password}
                onChange={(e) => {
                  setPass({ ...resetPass, password: e.target.value });
                }}
              />
            </Fragment>
          )}
          {dialogType === "deleteEmployee" && (
            <Fragment>
              Are you sure you want to delete employee : {dialogContent.name} ?
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
          {dialogType === "resetPassword" && (
            <Fragment>
              <Button onClick={handleClose} color="primary">
                Cancel
              </Button>
              <Button onClick={handleResetPassword} color="primary">
                Reset Password
              </Button>
            </Fragment>
          )}
          {dialogType === "deleteEmployee" && (
            <Fragment>
              <Button onClick={handleClose} color="primary">
                Cancel
              </Button>
              <Button onClick={handleClose} color="secondary">
                DELETE
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
        handleSearch={(str) => handleSearch(str)}
      />
      <MaterialTable
        title="Employees"
        tableRef={tableRef}
        columns={[
          {
            title: "ID",
            field: "adminEmployeeRef",
            render: (rowData) => {
              return rowData.adminEmployeeRef;
            },
          },
          {
            title: "Name",
            field: "name",
            render: (rowData) => {
              return rowData.name
                ? `${rowData.name.firstName} ${rowData.name.lastName}`
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
            fetch(
              `${fetchEmployeesAPI}?${searchStr}count=${rowsPerPage}&skip=${
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
            icon: "create",
            tooltip: "Edit Employee",
            onClick: (event, rowData) => {
              console.log("Edit onClick", event, rowData);
              history.push(`/adminpanel/employee/edit/${rowData._id}`);
            },
          },
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
                  mobile: rowData.mobile.replace("+61", ""),
                  // mobile: "919664815262",
                  country: common.country,
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

                  setMobile(rowData.mobile.replace("+61", ""));
                  handleClickOpen("otpDialog");
                })
                .catch((error) => {
                  console.log(`${generateOTPAPI} Error`, error);
                });
            },
          },
          {
            icon: () => {
              return <TableActionButton title="Resend Verification Email" />;
            },
            tooltip: "Resend Verification Email",
            onClick: (event, rowData) => {
              console.log("Verify Email", event, rowData);
              const requestOptions = {
                method: "POST",
                headers: {
                  ...authHeader(),
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
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
          {
            icon: () => {
              return <TableActionButton title="Forgot Password" />;
            },
            tooltip: "Forgot Password",
            onClick: (event, rowData) => {
              console.log("Forgot Password", event, rowData);
              const requestOptions = {
                method: "PUT",
                headers: {
                  ...authHeader(),
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  email: rowData.email,
                }),
              };
              console.log("requestOptions", requestOptions);

              fetch(forgotPasswordAPI, requestOptions)
                .then(handleFetchErrors)
                .then((res) => res.json())
                .then((res) => {
                  console.log(`${forgotPasswordAPI} Response`, res);
                  if (tableRef.current) {
                    tableRef.current.onQueryChange();
                  }
                  handleClickOpen("resetPassword");
                })
                .catch((error) => {
                  console.log(`${forgotPasswordAPI} Error`, error);
                });
            },
          },
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
                console.log("Resend Invite", rowData.acceptedInvite);
              }
            },
          },
          // {
          //   icon: "delete",

          //   tooltip: "Delete Admin Employee",
          //   onClick: (event, rowData) => {
          //     handleClickOpen("deleteEmployee");
          //     setDialogContent({
          //       name: rowData.name.firstName + " " + rowData.name.lastName,
          //       id: rowData._id,
          //     });
          //   },
          // },
        ]}
        options={{
          actionsColumnIndex: -1,
          actionsCellStyle: {
            width: "550px",
          },
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

export default EmployeeList;
