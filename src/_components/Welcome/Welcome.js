import React, { Component } from "react";

import { Container, Typography, Paper } from "@material-ui/core";
class Welcome extends Component {
  render() {
    return (
      <Container component="main">
        <Paper>
          <Container
            style={{
              padding: "2rem",
            }}
          >
            <Typography
              variant="h3"
              style={{
                fontWeight: "bold",
              }}
            >
              Hi There Tester 👋
            </Typography>
            <hr />
            <p>
              If you are new here, here are a few gotchas you should know about!
              <ul>
                <li>
                  This app gives you express control to each and every
                  functionality and record in the Trailer2You ecosystem. You can
                  practically change anything from this panel about the
                  application.
                </li>
                <li>
                  Here are a few generic instructions about what input fields
                  expect from you (unless specified otherwise):
                  <ul>
                    <li>
                      <b>Mobile numbers :</b>just specify your phone number{" "}
                      <b>without</b> the country code (like +91 or +61). We
                      generally automatically add this code in the backend based
                      on the country you specified in your profile.
                    </li>
                    <li>
                      <b>Tax Id :</b> should be 9 digits
                    </li>
                    <li>
                      <b>BSB Number :</b> should be 6 digits
                    </li>
                    <li>
                      <b>MCC Number :</b> should be 4 digits
                    </li>
                    <li>
                      <b>Pincode :</b> should be 4 digits
                    </li>
                  </ul>
                </li>
                <li>
                  <p>
                    If you run into any problems or errors, try getting a screen
                    recording (prefered) or screenshots of the app as well as
                    the console(right click on webpage and click inspect element
                    to open it).
                  </p>
                  <p>This will help us fix stuff faster.</p>
                </li>
                <li>
                  That's it! Hope this message helps you. I hope you have a
                  great time exploring this app 🖖.
                </li>
              </ul>
            </p>
          </Container>
        </Paper>
      </Container>
    );
  }
}

export default Welcome;
