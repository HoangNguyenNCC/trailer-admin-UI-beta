import React, { useState, Fragment } from "react";
import MaterialTable from "material-table";

import { useHistory, useLocation } from "react-router-dom";

import { makeStyles } from "@material-ui/core/styles";
import { toast } from "react-toastify";
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
const fetchLicenseeAPI = `${apiUrl}/admin/licensees`;
const saveProofOfIncorporationApproval = `${apiUrl}/admin/licensee/verify/proofOfIncorporation`;
// const generateOTPAPI = `${apiUrl}/admin/licensee/otp/resend`;
const generateOTPAPI = `${apiUrl}/licensee/otp/resend`;
// const verifyOTPAPI = `${apiUrl}/admin/licensee/otp/verify`;
const verifyOTPAPI = `${apiUrl}/licensee/otp/verify`;
// const resendInviteAPI = `${apiUrl}/admin/licensee/email/verify/resend`;
const resendInviteAPI = `${apiUrl}/licensee/email/verify/resend`;

const deleteLicenseeAPI = "";
// const forgotPasswordAPI = `${apiUrl}/admin/licensee/employee/password/forgot`;
// const resetPasswordAPI = `${apiUrl}/admin/licensee/employee/password/reset`;

function TableActionButton(props) {
  // console.log("TableActionButton", props);
  return <span>{props.title}</span>;
}

export default function LicenseeList(props) {
  const classes = useStyles();

  let userData = localStorage.getItem("user");
  userData = JSON.parse(userData);
  // console.log("userData", userData);

  let history = useHistory();
  // console.log("history", history);

  let location = useLocation();
  // console.log("location", location);

  let { from } = location.state || { from: { pathname: "/adminpanel/" } };
  if (!userData.acl.LICENSEE.includes("VIEW")) {
    history.replace(from);
  }

  //-------------------------------------------------------------------------

  const otpVerifyDetailsStart = {
    licenseeId: "",
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
        licenseeId: otpVerifyDetails.licenseeId,
        mobile: otpVerifyDetails.mobile.replace("+61", ""),
        // mobile: "919664815262",
        country: otpVerifyDetails.country,
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

  function handleDeleteLicensee() {
    const requestOptions = {
      method: "DELETE",
      headers: {
        ...authHeader(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        licenseeId: otpVerifyDetails.customerId,
      }),
    };
    console.log("requestOptions", requestOptions);

    fetch(deleteLicenseeAPI, requestOptions)
      .then(handleFetchErrors)
      .then((res) => res.json())
      .then((res) => {
        console.log(`${deleteLicenseeAPI} Response`, res);
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
    <div className={`t2y-list t2y-licenseelist ${classes.root}`}>
      <Dialog
        open={dialogState}
        onClose={handleClose}
        aria-labelledby="form-dialog-title"
        disableBackdropClick={true}
        disableEscapeKeyDown={true}
      >
        <DialogTitle id="form-dialog-title">
          {dialogType === "otpDialog" && "OTP Verification"}
          {dialogType === "deleteLicensee" && "Delete Licensee"}
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
          {dialogType === "deleteLicensee" && (
            <Fragment>
              Are you sure you want to delete licensee : {dialogContent.name} ?
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
          {dialogType === "deleteLicensee" && (
            <Fragment>
              <Button onClick={handleClose} color="primary">
                Cancel
              </Button>
              <Button onClick={handleClose} color="secondary">
                DELETE
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
        title="Licensee"
        handleSearch={(str) => handleSearch(str)}
        handleFilter={(str) => handleFilter(str)}
      />
      <MaterialTable
        title="Licensee"
        tableRef={tableRef}
        columns={[
          {
            title: "ID",
            field: "licenseeRef",
            render: (rowData) => {
              return rowData.licenseeRef;
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
            title: "Trailers",
            field: "trailers",
            render: (rowData) => {
              return (
                <div>
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href={`/adminpanel/licensee/${rowData._id}/trailers`}
                  >
                    <Button
                      className="wideButton"
                      style={{
                        textTransform: "capitalize",
                        fontSize: "15px",
                      }}
                    >
                      View
                    </Button>
                  </a>
                </div>
              );
            },
          },
          {
            title: "Upsell Items",
            field: "upsellItems",
            render: (rowData) => {
              return (
                <div>
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href={`/adminpanel/licensee/${rowData._id}/upsellitems`}
                  >
                    <Button
                      className="wideButton"
                      style={{
                        textTransform: "capitalize",
                        fontSize: "15px",
                        minWidth: "150px",
                      }}
                    >
                      View Upsell Items
                    </Button>
                  </a>
                </div>
              );
            },
          },
          {
            title: "Employee List",
            field: "employeeList",
            render: (rowData) => {
              return (
                <div>
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href={`/adminpanel/licensee/${rowData._id}/employee/list`}
                  >
                    <Button
                      className="wideButton"
                      style={{
                        textTransform: "capitalize",
                        fontSize: "15px",
                        minWidth: "150px",
                      }}
                    >
                      Employee List
                    </Button>
                  </a>
                </div>
              );
            },
          },
          {
            title: "Insurance Documents",
            field: "insurance",
            render: (rowData) => {
              return (
                <div>
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href={`/adminpanel/licensee/${rowData._id}/insurance`}
                  >
                    <Button
                      className="wideButton"
                      style={{
                        textTransform: "capitalize",
                        fontSize: "15px",
                        minWidth: "150px",
                      }}
                    >
                      View Insurance
                    </Button>
                  </a>
                </div>
              );
            },
          },
          {
            title: "Servicing Documents",
            field: "servicing",
            render: (rowData) => {
              return (
                <div>
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href={`/adminpanel/licensee/${rowData._id}/servicing`}
                  >
                    <Button
                      className="wideButton"
                      style={{
                        textTransform: "capitalize",
                        fontSize: "15px",
                        minWidth: "150px",
                      }}
                    >
                      Servicing Documents
                    </Button>
                  </a>
                </div>
              );
            },
          },
          {
            title: "Proof of Incorporation",
            field: "proofOfIncorporation",
            render: (rowData) => {
              return (
                <div>
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href={
                      rowData.proofOfIncorporation &&
                      rowData.proofOfIncorporation.data
                    }
                  >
                    <Button
                      className="wideButton"
                      style={{
                        textTransform: "capitalize",
                        fontSize: "15px",
                        minWidth: "150px",
                      }}
                    >
                      Download
                    </Button>
                  </a>
                </div>
              );
            },
          },
          // {
          //   title: "Proof of Incorporation Verified",
          //   field: "proofOfIncorporationVerified",
          //   type: "boolean",
          //   render: (rowData) => {
          //     return rowData.proofOfIncorporation &&
          //       rowData.proofOfIncorporation.verified
          //       ? "Yes"
          //       : "No";
          //   },
          // },
          {
            title: "Proof of Incorporation Accepted",
            field: "proofOfIncorporationAccepted",
            render: (rowData) => {
              return rowData.proofOfIncorporation &&
                rowData.proofOfIncorporation.accepted
                ? "Yes"
                : "No";
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
              `${fetchLicenseeAPI}?${filterStr}${searchStr}count=${rowsPerPage}&skip=${
                page * rowsPerPage
              }`,
              requestOptions
            )
              .then(handleFetchErrors)
              .then((res) => res.json())
              .then((res) => {
                console.log(`${fetchLicenseeAPI} Response`, res);
                const licenseeList = res.licenseeList || [];
                const totalCount = res.totalCount || 0;

                // let newRows = [];
                // setRows((currentRows) => {
                //     console.log((typeof currentRows), (typeof licenseeList));
                //     newRows = [
                //         ...currentRows,
                //         ...licenseeList
                //     ];
                //     console.log("newRows", newRows);
                //     return newRows;
                // });

                // setTotalCount(totalCount);

                resolve({
                  data: licenseeList,
                  page: page,
                  totalCount: totalCount,
                });
              })
              .catch((error) => {
                console.log(`${fetchLicenseeAPI} Error`, error);
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
            icon: "check_circle",
            tooltip: "Approve Proof Of Incorporation",
            onClick: (event, rowData) => {
              console.log("Approve onClick", event, rowData);
              const requestOptions = {
                method: "PUT",
                headers: {
                  ...authHeader(),
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  licenseeId: rowData._id,
                  isAccepted: true,
                }),
              };
              console.log("requestOptions", requestOptions);

              fetch(saveProofOfIncorporationApproval, requestOptions)
                .then(handleFetchErrors)
                .then((res) => res.json())
                .then((res) => {
                  console.log(
                    `${saveProofOfIncorporationApproval} Response`,
                    res
                  );
                  // rowData.driverLicense.verified = true;
                  // rowData.driverLicense.accepted = true;
                  if (tableRef.current) {
                    tableRef.current.onQueryChange();
                  }
                })
                .catch((error) => {
                  console.log(
                    `${saveProofOfIncorporationApproval} Error`,
                    error
                  );
                });
            },
          }),
          (rowData) => ({
            icon: "cancel",
            tooltip: "Reject Proof Of Incorporation",
            onClick: (event, rowData) => {
              console.log("Reject onClick", event, rowData);
              const requestOptions = {
                method: "PUT",
                headers: {
                  ...authHeader(),
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  licenseeId: rowData._id,
                  isAccepted: false,
                }),
              };
              console.log("requestOptions", requestOptions);

              fetch(saveProofOfIncorporationApproval, requestOptions)
                .then(handleFetchErrors)
                .then((res) => res.json())
                .then((res) => {
                  console.log(
                    `${saveProofOfIncorporationApproval} Response`,
                    res
                  );
                  // rowData.driverLicense.verified = true;
                  // rowData.driverLicense.accepted = false;
                  if (tableRef.current) {
                    tableRef.current.onQueryChange();
                  }
                })
                .catch((error) => {
                  console.log(
                    `${saveProofOfIncorporationApproval} Error`,
                    error
                  );
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
                  licenseeId: rowData._id,
                  mobile: rowData.mobile.replace("+61", ""),
                  country: rowData.address.country || common.country,
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
                  });
                  handleClickOpen("otpDialog");
                })
                .catch((error) => {
                  toast.error(error.message);
                  console.log(`${generateOTPAPI} Error`, error.message);
                });
            },
          }),
          (rowData) => ({
            icon: () => {
              return <TableActionButton title="Resend Verification Email" />;
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
                  user: "licensee",
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
          {
            icon: "create",
            tooltip: "Edit Licensee",
            onClick: (event, rowData) => {
              console.log("Edit onClick", event, rowData);
              history.push(`/adminpanel/licensee/edit/${rowData._id}`);
            },
          },
          // {
          //   icon: "delete",

          //   tooltip: "Delete Licensee",
          //   onClick: (event, rowData) => {
          //     handleClickOpen("deleteLicensee");
          //     setDialogContent({ name: rowData.name });
          //   },
          // },
          {
            icon: "add_circle",
            tooltip: "Add Licensee",
            isFreeAction: true,
            onClick: (event, rowData) => {
              console.log("Licensee Signup onClick", event, rowData);
              history.push("/adminpanel/licensee/signup");
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
    name: "POI Accepted",
    param: "proofOfIncorporationValid",
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
    name: "Business Type",
    param: "businessType",
    options: [
      {
        text: "Individual",
        value: "individual",
      },
      {
        text: "Company",
        value: "company",
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
