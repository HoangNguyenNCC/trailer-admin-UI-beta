/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import { useLocation, useHistory, useParams } from "react-router-dom";

import {
  Button,
  CssBaseline,
  TextField,
  Typography,
  Container,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@material-ui/core";

import { Alert, AlertTitle } from "@material-ui/lab";

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
    minWidth: 200,
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
  selectEmpty: {
    marginTop: theme.spacing(1),
    minWidth: "200px",
    marginBottom: theme.spacing(1),
  },
}));

const apiUrl = common.apiUrl;
// const getRentalItemType = `${apiUrl}/admin/rentalitemtype`;
const saveRentalItemType = `${apiUrl}/admin/rentalitemtype`;
const fetchRentalItemTypesAPI = `${apiUrl}/admin/rentalitemtypes`;

export default function RentalItemTypeEdit(props) {
  console.log("rentalItemTypeEdit", props);

  const classes = useStyles();

  let userData = localStorage.getItem("user");
  userData = JSON.parse(userData);

  let history = useHistory();

  let location = useLocation();

  const { rentalItemId } = useParams();

  let { from } = location.state || { from: { pathname: "/adminpanel/" } };
  if (!rentalItemId && !userData.acl.TRAILER.includes("ADD")) {
    history.replace(from);
  }
  if (rentalItemId && !userData.acl.TRAILER.includes("UPDATE")) {
    history.replace(from);
  }

  const rentalItemTypeStart = {
    name: "",
    code: "",
    itemType: "",
  };

  const [loadOnce, setLoadOnce] = useState(0);
  const [rentalItemType, setRentalItemType] = useState(rentalItemTypeStart);

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

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

  useEffect(() => {
    if (rentalItemId) {
      rentalItemTypesList.forEach((rentalItemTypeObj) => {
        if (rentalItemTypeObj._id === rentalItemId) {
          setRentalItemType({
            ...rentalItemType,
            name: rentalItemTypeObj.name,
            code: rentalItemTypeObj.code,
            itemType: rentalItemTypeObj.itemtype,
          });
        }
      });
    }
  }, [loadOnce]);

  let rentalItemTypesList = localStorage.getItem("rentalitemtypes");
  rentalItemTypesList = JSON.parse(rentalItemTypesList);

  /* useEffect(() => {
        // if(rentalItemId) {
                const requestOptions = {
                    method: 'GET',
                    headers: authHeader(),

                };
                fetch(`${getRentalItemType}?id=${rentalItemId}`, requestOptions)
                .then(handleFetchErrors)
                .then( res => res.json() )
                .then( res => {
                    const rentalItemTypeObj = res.rentalItemType;

                    console.log("rentalItemTypeObj", rentalItemTypeObj);
                    console.log(rentalItemTypeObj.name, rentalItemTypeObj.code, rentalItemTypeObj.itemtype);
                    
                    setRentalItemType({
                        ...rentalItemType,
                        name: rentalItemTypeObj.name,
                        code: rentalItemTypeObj.code,
                        itemType: rentalItemTypeObj.itemtype
                    });
                })
                .catch( error => {
                    console.log("Error occurred while fetching rentalItemType data", error);
                })
            // }
    }, [loadOnce]); */

  const [formValidError, setFormValidError] = useState({
    name: false,
    code: false,
    itemType: false,
  });
  const [formValidErrorMessage, setFormValidErrorMessage] = useState({
    name: "",
    code: "",
    itemType: "",
  });

  async function handleSubmit(e) {
    e.preventDefault();

    const isError =
      formValidError.name || formValidError.code || formValidError.itemType;

    if (isError) {
      return false;
    }

    let requestOptions = {
      method: "POST",
    };

    const reqObj = {
      name: rentalItemType.name,
      code: rentalItemType.code,
      itemtype: rentalItemType.itemType,
    };

    if (rentalItemId) {
      reqObj.id = rentalItemId;
    }

    requestOptions.headers = {
      ...authHeader(),
      "Content-Type": "application/json",
    };
    requestOptions.body = JSON.stringify(reqObj);

    console.log("requestOptions", requestOptions);

    fetch(saveRentalItemType, requestOptions)
      .then(handleFetchErrors)
      .then((res) => res.json())
      .then((res) => {
        console.log(`${saveRentalItemType} Response`, res);

        setErrorMessage("");
        setSuccessMessage("Successfully saved rentalItemType data");

        setTimeout(() => {
          setSuccessMessage("");
        }, 5000);
      })
      .catch((error) => {
        console.log(`${saveRentalItemType} Error`, error);
        setErrorMessage(
          typeof error.message === "string" ? error.message : "Error"
        );
      });
  }

  return (
    <Container component="main" maxWidth="sm">
      <CssBaseline />

      <div className={classes.paper}>
        <Typography component="h1" variant="h5">
          {rentalItemId ? "Edit Rental Item Type" : "Add Rental Item Type"}
        </Typography>

        {successMessage !== "" && (
          <Alert severity="success">
            <AlertTitle>Success</AlertTitle>
            {successMessage}
          </Alert>
        )}

        {errorMessage !== "" && (
          <Alert severity="error">
            <AlertTitle>Error</AlertTitle>
            {errorMessage}
          </Alert>
        )}

        <form className={classes.form} noValidate>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="name"
            label="Name"
            name="name"
            autoComplete="name"
            autoFocus
            error={formValidError.name}
            helperText={formValidErrorMessage.name}
            value={rentalItemType.name}
            onChange={(e) => {
              setRentalItemType({
                ...rentalItemType,
                name: e.target.value,
              });
            }}
          />

          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="code"
            label="Code"
            name="code"
            autoComplete="code"
            autoFocus
            error={formValidError.code}
            helperText={formValidErrorMessage.code}
            value={rentalItemType.code}
            onChange={(e) => {
              setRentalItemType({
                ...rentalItemType,
                code: e.target.value,
              });
            }}
          />

          {rentalItemId && (
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="itemType"
              label="Item Type"
              name="itemType"
              autoComplete="itemType"
              autoFocus
              error={formValidError.itemType}
              helperText={formValidErrorMessage.itemType}
              value={rentalItemType.itemType}
              onChange={(e) => {
                setRentalItemType({
                  ...rentalItemType,
                  itemType: e.target.value,
                });
              }}
            />
          )}

          {!rentalItemId && (
            <FormControl required className={classes.selectEmpty}>
              <InputLabel id="itemType-label">Item Type</InputLabel>
              <Select
                labelId="itemType-label"
                id="itemTypeSelect"
                value={rentalItemType.itemType}
                onChange={(e) => {
                  setRentalItemType({
                    ...rentalItemType,
                    itemType: e.target.value,
                  });
                }}
                className={classes.selectEmpty}
              >
                <MenuItem value="trailer">Trailer</MenuItem>
                <MenuItem value="upsellitem">Upsell Item</MenuItem>
              </Select>
            </FormControl>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
            onClick={handleSubmit}
          >
            Update
          </Button>
        </form>
      </div>
    </Container>
  );
}
