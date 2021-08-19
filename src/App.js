import React from "react";
import {
  Router,
  Route,
  Switch,
  Redirect,
  // useHistory
} from "react-router-dom";

import { history } from "./_helpers";
import { PrivateRoute } from "./_components";

import { Container } from "@material-ui/core";

import AppHeader from "./_components/common/AppHeader";
import AppFooter from "./_components/common/AppFooter";

import Welcome from "./_components/Welcome/Welcome";

import CustomerList from "./_components/customer/CustomerList";
import CustomerEdit from "./_components/customer/CustomerEdit";
import CustomerResetPassword from "./_components/customer/CustomerResetPassword";

import EmployeeSignIn from "./_components/employee/EmployeeSignIn";
import EmployeeInvite from "./_components/employee/EmployeeInvite";
import EmployeeInviteAccept from "./_components/employee/EmployeeInviteAccept";
import EmployeeEdit from "./_components/employee/EmployeeEdit";
import EmployeeList from "./_components/employee/EmployeeList";
import EmployeeResetPassword from "./_components/employee/EmployeeResetPassword";

// import FinancialLicensee from "./_components/financial/FinancialLicensee";
// import FinancialTrailer from "./_components/financial/FinancialTrailer";
import CustomerFinancials from "./_components/financial/CustomerFinancials";
import LicenseeFinancials from "./_components/financial/LicenseeFinancials";

import LicenseeList from "./_components/licensee/LicenseeList";
import LicenseeSignup from "./_components/licensee/LicenseeSignup";
import LicenseeEdit from "./_components/licensee/LicenseeEdit";
import LicenseeEmployeeEdit from "./_components/licensee/LicenseeEmployeeEdit";
import LicenseeEmployeeInvite from "./_components/licensee/LicenseeEmployeeInvite";
import LicenseeEmployeeInviteAccept from "./_components/licensee/LicenseeEmployeeInviteAccept";
import LicenseeEmployeeList from "./_components/licensee/LicenseeEmployeeList";
import LicenseeEmployeeResetPassword from "./_components/licensee/LicenseeEmployeeResetPassword";

import LicenseeTrailerEdit from "./_components/licensee_rentalitems/TrailerEdit";
import LicenseeTrailerList from "./_components/licensee_rentalitems/TrailerList";
import LicenseeUpsellItemEdit from "./_components/licensee_rentalitems/UpsellItemEdit";
import LicenseeUpsellItemList from "./_components/licensee_rentalitems/UpsellItemList";

import BlockTrailerList from "./_components/licensee_rentalitems/BlockTrailerList";
import BlockTrailerEdit from "./_components/licensee_rentalitems/BlockTrailerEdit";

import LicenseeTrailerInsurance from "./_components/licensee_rentalitems/TrailerInsurance";
import LicenseeTrailerServicing from "./_components/licensee_rentalitems/TrailerServicing";

// import PaymentInward from "./_components/payments/PaymentInward";
// import PaymentOutward from "./_components/payments/PaymentOutward";
import DeliveredOrders from "./_components/payments/DeliveredOrders";
import CancelledOrders from "./_components/payments/CancelledOrders";

import RentalItemTypeEdit from "./_components/adminrentalitem/RentalItemTypeEdit";
import RentalItemTypeList from "./_components/adminrentalitem/RentalItemTypeList";

import TrailerTypeEdit from "./_components/adminrentalitem/TrailerTypeEdit";
import TrailerTypeList from "./_components/adminrentalitem/TrailerTypeList";

import UpsellItemTypeEdit from "./_components/adminrentalitem/UpsellItemTypeEdit";
import UpsellItemTypeList from "./_components/adminrentalitem/UpsellItemTypeList";

import RentalList from "./_components/rental/RentalList";

import "./index.css";
import "./App.css";
// import { func } from 'prop-types';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const mainContainerStyle = {
  paddingTop: "40px",
  paddingBottom: "40px",
  flexGrow: 1,
};

export default function App() {
  return (
    <Router history={history}>
      <AppHeader />

      <Container style={mainContainerStyle}>
        <Switch>
          {/* <PrivateRoute exact path="/adminpanel/" component={CustomerList} /> */}
          <PrivateRoute exact path="/adminpanel" component={Welcome} />
          <PrivateRoute
            exact
            path="/adminpanel/customers"
            component={CustomerList}
          />
          <PrivateRoute
            exact
            path="/adminpanel/customer/edit/:customerId"
            component={CustomerEdit}
          />
          <PrivateRoute
            exact
            path="/adminpanel/customer/add"
            component={CustomerEdit}
          />
          <Route
            exact
            path="/adminpanel/admin/customer/password/reset"
            component={CustomerResetPassword}
          />

          <PrivateRoute
            exact
            path="/adminpanel/employee/invite"
            component={EmployeeInvite}
          />
          <Route
            exact
            path="/adminpanel/employee/invite/accept"
            component={EmployeeInviteAccept}
          />
          <PrivateRoute
            exact
            path="/adminpanel/employee/list"
            component={EmployeeList}
          />
          <PrivateRoute
            exact
            path="/adminpanel/employee/edit/:employeeId?"
            component={EmployeeEdit}
          />
          <Route
            exact
            path="/adminpanel/employee/password/reset"
            component={EmployeeResetPassword}
          />

          <PrivateRoute
            exact
            path="/adminpanel/licensees"
            component={LicenseeList}
          />
          <PrivateRoute
            exact
            path="/adminpanel/licensee/signup"
            component={LicenseeSignup}
          />
          <PrivateRoute
            exact
            path="/adminpanel/licensee/edit/:licenseeId"
            component={LicenseeEdit}
          />
          <PrivateRoute
            exact
            path="/adminpanel/licensee/:licenseeId/employee/edit/:employeeId"
            component={LicenseeEmployeeEdit}
          />
          <PrivateRoute
            exact
            path="/adminpanel/licensee/:licenseeId/employee/invite"
            component={LicenseeEmployeeInvite}
          />
          <PrivateRoute
            exact
            path="/adminpanel/licensee/:licenseeId/employee/invite/accept"
            component={LicenseeEmployeeInviteAccept}
          />
          <PrivateRoute
            exact
            path="/adminpanel/licensee/:licenseeId/employee/list"
            component={LicenseeEmployeeList}
          />
          <PrivateRoute
            exact
            path="/adminpanel/admin/licensee/password/reset"
            component={LicenseeEmployeeResetPassword}
          />

          <PrivateRoute
            exact
            path="/adminpanel/licensee/:licenseeId/trailers"
            component={LicenseeTrailerList}
          />
          <PrivateRoute
            exact
            path="/adminpanel/licensee/:licenseeId/trailer/add"
            component={LicenseeTrailerEdit}
          />
          <PrivateRoute
            exact
            path="/adminpanel/licensee/:licenseeId/trailer/edit/:trailerId?"
            component={LicenseeTrailerEdit}
          />
          <PrivateRoute
            exact
            path="/adminpanel/licensee/:licenseeId/upsellitems"
            component={LicenseeUpsellItemList}
          />
          <PrivateRoute
            exact
            path="/adminpanel/licensee/:licenseeId/upsellitem/add"
            component={LicenseeUpsellItemEdit}
          />
          <PrivateRoute
            exact
            path="/adminpanel/licensee/:licenseeId/upsellitem/edit/:upsellItemId?"
            component={LicenseeUpsellItemEdit}
          />

          <PrivateRoute
            exact
            path="/adminpanel/licensee/:licenseeId/rentalitem/block/list"
            component={BlockTrailerList}
          />
          <PrivateRoute
            exact
            path="/adminpanel/licensee/:licenseeId/rentalitem/block/add"
            component={BlockTrailerEdit}
          />
          <PrivateRoute
            exact
            path="/adminpanel/licensee/:licenseeId/rentalitem/block/edit/:blockingId?"
            component={BlockTrailerEdit}
          />

          <PrivateRoute
            exact
            path="/adminpanel/licensee/:licenseeId/insurance"
            component={LicenseeTrailerInsurance}
          />
          <PrivateRoute
            exact
            path="/adminpanel/licensee/:licenseeId/servicing"
            component={LicenseeTrailerServicing}
          />

          <PrivateRoute
            exact
            path="/adminpanel/payments/cancelled"
            component={CancelledOrders}
          />
          <PrivateRoute
            exact
            path="/adminpanel/payments/delivered"
            component={DeliveredOrders}
          />

          <PrivateRoute
            exact
            path="/adminpanel/financial/customer"
            component={CustomerFinancials}
          />
          <PrivateRoute
            exact
            path="/adminpanel/financial/licensee"
            component={LicenseeFinancials}
          />

          <PrivateRoute
            exact
            path="/adminpanel/rentals"
            component={RentalList}
          />

          <PrivateRoute
            exact
            path="/adminpanel/rentalitemtype/edit/:rentalItemId"
            component={RentalItemTypeEdit}
          />
          <PrivateRoute
            exact
            path="/adminpanel/rentalitemtype/add"
            component={RentalItemTypeEdit}
          />
          <PrivateRoute
            exact
            path="/adminpanel/rentalitemtypes"
            component={RentalItemTypeList}
          />

          <PrivateRoute
            exact
            path="/adminpanel/trailertype/edit/:trailerId"
            component={TrailerTypeEdit}
          />
          <PrivateRoute
            exact
            path="/adminpanel/trailertype/add"
            component={TrailerTypeEdit}
          />
          <PrivateRoute
            exact
            path="/adminpanel/trailertypes"
            component={TrailerTypeList}
          />

          <PrivateRoute
            exact
            path="/adminpanel/upsellitemtype/edit/:upsellItemId"
            component={UpsellItemTypeEdit}
          />
          <PrivateRoute
            exact
            path="/adminpanel/upsellitemtype/add"
            component={UpsellItemTypeEdit}
          />
          <PrivateRoute
            exact
            path="/adminpanel/upsellitemtypes"
            component={UpsellItemTypeList}
          />

          <Route path="/adminpanel/signin" component={EmployeeSignIn} />

          <Redirect from="*" to="/adminpanel/" />
        </Switch>
        <ToastContainer />
      </Container>

      <AppFooter />
    </Router>
  );
}
