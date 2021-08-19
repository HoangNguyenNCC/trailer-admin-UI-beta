import React, { Component } from "react";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import Input from "@material-ui/core/Input";

import Grid from "@material-ui/core/Grid";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import Typography from "@material-ui/core/Typography";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";

import { Button, Select, MenuItem } from "@material-ui/core";

export class Filter extends Component {
  constructor(props) {
    super(props);
    let stateObj = {};
    stateObj.open = false;
    if (props.selectOptions) {
      if (props.selectOptions.length > 0) {
        props.selectOptions.forEach((option) => {
          stateObj[option.param] = "";
        });
      }
    }
    if (props.radioOptions) {
      if (props.radioOptions.length > 0) {
        props.radioOptions.forEach((option) => {
          stateObj[option.param] = "";
        });
      }
    }
    let initial = { ...stateObj };
    stateObj.initialVal = initial;
    this.state = {
      ...stateObj,
      initialVal: {
        ...stateObj,
      },
    };
  }
  handleClickOpen = () => {
    this.setState({ open: true });
  };
  handleClose = () => {
    this.setState({ open: false });
  };

  handleChange = (e) => {
    console.log(e);
    this.setState({
      [e.target.name]: e.target.value,
    });
  };

  handleSubmit = () => {
    let str = "";
    if (this.props.selectOptions) {
      if (this.props.selectOptions.length > 0) {
        this.props.selectOptions.forEach((option) => {
          if (this.state[option.param] !== "") {
            str += `${option.param}=${this.state[option.param]}&`;
          }
        });
      }
    }
    if (this.props.radioOptions) {
      if (this.props.radioOptions.length > 0) {
        this.props.radioOptions.forEach((option) => {
          if (this.state[option.param] !== "") {
            str += `${option.param}=${this.state[option.param]}&`;
          }
        });
      }
    }
    this.props.handleFilter(str);
    this.handleClose();
  };

  handleReset = () => {
    this.props.handleFilter("");
    this.setState(this.state.initialVal);
  };

  render() {
    const selectObj = this.props.selectOptions;
    const { open } = this.state;
    const radioObj = this.props.radioOptions;
    return (
      <div>
        <Button
          onClick={this.handleClickOpen}
          color="primary"
          style={{ margin: "0 0.5em" }}
          variant="contained"
        >
          Filter
        </Button>
        <Dialog
          disableBackdropClick
          disableEscapeKeyDown
          open={open}
          // width="80%"
          fullWidth="xl"
          onClose={this.handleClose}
        >
          <DialogTitle>{this.props.title} Filter</DialogTitle>
          <DialogContent
            style={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <form>
              <Grid container spacing={3}>
                {radioObj &&
                  radioObj.length > 0 &&
                  radioObj.map((inputField, index) => {
                    return (
                      <Grid item xs={6} key={"radio-" + index}>
                        <Accordion>
                          <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="panel1a-content"
                            id="panel1a-header"
                          >
                            <Typography>{inputField.name}</Typography>
                          </AccordionSummary>
                          <AccordionDetails>
                            {/* <Typography> */}
                            <RadioGroup
                              // aria-label={inputField.param}
                              name={inputField.param}
                              value={this.state[inputField.param]}
                              onChange={this.handleChange}
                            >
                              {inputField.options.map((option, idx) => {
                                return (
                                  <FormControlLabel
                                    key={inputField.param + option.value}
                                    value={option.value}
                                    control={<Radio color="default" />}
                                    label={option.text}
                                  />
                                );
                              })}
                            </RadioGroup>
                            {/* </Typography> */}
                          </AccordionDetails>
                        </Accordion>
                      </Grid>
                    );
                  })}

                {selectObj &&
                  selectObj.length > 0 &&
                  selectObj.map((inputField, index) => {
                    return (
                      <Grid item xs={6} key={"select-" + index}>
                        <Select
                          key={"select-" + index}
                          value={this.state[inputField.param]}
                          onChange={this.handleChange}
                          displayEmpty
                          fullWidth
                          name={inputField.param}
                          inputProps={{ "aria-label": "Without label" }}
                          input={<Input />}
                          style={{
                            margin: "0rem",
                          }}
                          renderValue={() => (
                            <MenuItem value={""}>{inputField.name}</MenuItem>
                          )}
                        >
                          {/* <MenuItem value="" disabled>
                            {inputField.param}
                          </MenuItem> */}
                          {!inputField.codes &&
                            inputField.values.map((name) => (
                              <MenuItem key={name} value={name}>
                                {name}
                              </MenuItem>
                            ))}
                          {inputField.codes &&
                            inputField.values.map((name, idx) => (
                              <MenuItem
                                key={name}
                                value={inputField.codes[idx]}
                              >
                                {name}
                              </MenuItem>
                            ))}
                        </Select>
                      </Grid>
                    );
                  })}
              </Grid>
            </form>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleClose} color="primary">
              Cancel
            </Button>
            <Button onClick={this.handleReset} color="secondary">
              Reset
            </Button>
            <Button onClick={this.handleSubmit} color="primary">
              Submit
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

export default Filter;
