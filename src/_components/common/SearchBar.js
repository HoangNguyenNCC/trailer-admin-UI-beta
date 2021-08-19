import React, { useState, Fragment } from "react";

import { makeStyles } from "@material-ui/core/styles";

import { Button, TextField, Select, MenuItem, Paper } from "@material-ui/core";

import "../../App.css";
import Filter from "./Filter";

const useStyles = makeStyles((theme) => ({
  search: {
    // padding: "0 1em 1em 1em",
    padding: "1rem",
    marginBottom: "10px",
    display: "flex",
  },
  searchBox: {
    // padding: "10px",
    // marginRight: "10px",
  },
}));

export default function SearchBar(props) {
  const classes = useStyles();

  const [searchValue, setSearchValue] = useState("");
  const [searchField, setSearchField] = useState("");
  const [searchError, setSearchError] = useState(false);

  function handleReset() {
    setSearchError(false);
    setSearchField("");
    setSearchValue("");
    props.handleSearch("");
  }
  function handleSubmit() {
    if (searchField !== "" && searchValue !== "") {
      let str = searchField + "=" + searchValue + "&";
      props.handleSearch(str);
      setSearchError(false);
    } else {
      setSearchError(true);
    }
  }
  return (
    <Paper className={classes.search}>
      <Select
        value={searchField}
        className={classes.searchBox}
        variant="outlined"
        margin="dense"
        onChange={(e) => {
          setSearchField(e.target.value);
        }}
        error={searchError}
        displayEmpty
        className={classes.selectEmpty}
        inputProps={{
          "aria-label": "Without label",
        }}
      >
        <MenuItem value="" disabled>
          Search By :
        </MenuItem>
        {props.selectOptions.map((option) => (
          <MenuItem value={option[1]}>{option[0]}</MenuItem>
        ))}
      </Select>
      <TextField
        margin="none"
        label="Search for ..."
        type="text"
        style={{
          marginLeft: "20px",
          marginRight: "10px",
          //   width: "65%",
          flex: 1,
          verticalAlign: "bottom",
        }}
        helperText={searchError && "Fields cannot be empty"}
        error={searchError}
        value={searchValue}
        onChange={(e) => {
          setSearchValue(e.target.value);
        }}
      />
      <Button
        color="primary"
        width="40%"
        onClick={handleSubmit}
        onClick={handleSubmit}
        style={{ margin: "0 0.5em" }}
        variant="outlined"
      >
        SUBMIT
      </Button>
      <Button
        color="secondary"
        style={{ margin: "0 0.5em" }}
        onClick={handleReset}
        variant="outlined"
      >
        RESET
      </Button>
      {props.filterSelect && props.filterRadio && (
        <Filter
          selectOptions={props.filterSelect}
          radioOptions={props.filterRadio}
          handleFilter={(str) => props.handleFilter(str)}
          title={props.title}
        />
      )}
    </Paper>
  );
}
