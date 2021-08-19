import React, { Fragment } from "react";

import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  ListItemText,
  Menu,
  MenuItem,
} from "@material-ui/core";

// import MenuIcon from '@material-ui/icons/Menu';
// import CloseIcon from '@material-ui/icons/Close';

import { makeStyles, withStyles } from "@material-ui/core/styles";

import {
  // Link,
  // useLocation,
  useHistory,
  // useParams
} from "react-router-dom";

// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import "../../App.css";

const useStyles = makeStyles((theme) => ({
  appBar: {
    background: "#000000",
    // zIndex: theme.zIndex.drawer + 1
  },
  root: {
    display: "flex",
    // flexGrow: 1,
  },
  title: {
    margin: "10px 30px 10px 10px",
  },
  headerLink: {
    margin: theme.spacing(2),
    color: "#FFFFFF",
  },
  navButton: {
    paddingLeft: "10px",
    paddingRight: "10px",
    boxShadow: "none",
    height: "100%",
    margin: "0",
    "&:hover": {
      background: "pink",
    },
  },
  navButtonGroupRight: {
    position: "absolute",
    right: "10px",
  },
}));

const StyledMenu = withStyles({
  paper: {
    // border: '1px solid #000000',
    backgroundColor: "#3f50b5",
    borderRadius: 0,
  },
})((props) => (
  <Menu
    elevation={0}
    getContentAnchorEl={null}
    anchorOrigin={{
      vertical: "bottom",
      horizontal: "left",
    }}
    transformOrigin={{
      vertical: "top",
      horizontal: "left",
    }}
    {...props}
  />
));

const StyledMenuItem = withStyles((theme) => ({
  // root: {
  //     backgroundColor: theme.palette.common.black,
  //     color: theme.palette.common.white,
  //     '&:focus': {
  //         // backgroundColor: theme.palette.common.black,
  //         backgroundColor: "#3f50b5",
  //         '& .MuiListItemIcon-root, & .MuiListItemText-primary': {
  //             color: theme.palette.common.white,
  //         },
  //     },
  // },
  root: {
    // backgroundColor: theme.palette.common.black,
    backgroundColor: "#3f50b5",
    color: theme.palette.common.white,
    "&:hover": {
      backgroundColor: theme.palette.common.white,
      "& .MuiListItemIcon-root, & .MuiListItemText-primary": {
        color: theme.palette.common.black,
      },
    },
  },
}))(MenuItem);

function AppHeader() {
  const classes = useStyles();

  const history = useHistory();

  let showLoggedInMenu = true;
  let expiryDate = localStorage.getItem("expiry");
  if (!expiryDate || expiryDate <= new Date().getTime()) {
    showLoggedInMenu = false;
  }

  const leftMenuList = [
    {
      id: "welcome-menu",
      name: "Welcome",
      link: "/adminpanel/welcome",

      // submenu: [
      //     {
      //         name: "Customer List",
      //         link: "/adminpanel/customers"
      //     }
      // ]
    },
    {
      id: "customer-menu",
      name: "Customer",
      link: "/adminpanel/customers",

      // submenu: [
      //     {
      //         name: "Customer List",
      //         link: "/adminpanel/customers"
      //     }
      // ]
    },
    {
      id: "licensee-menu",
      name: "Licensee",
      link: "/adminpanel/licensees",
      // submenu: [
      //     {
      //         name: "Licensee List",
      //         link: "/adminpanel/licensees"
      //     }
      // ]
    },
    {
      id: "payments-menu",
      name: "Payments",

      submenu: [
        {
          name: "Cancelled Orders",
          link: "/adminpanel/payments/cancelled",
        },
        {
          name: "Delivered Orders",
          link: "/adminpanel/payments/delivered",
        },
      ],
    },
    {
      id: "financial-menu",
      name: "Financials",

      submenu: [
        {
          name: "Customer Financials",
          link: "/adminpanel/financial/customer",
        },
        {
          name: "Licensee Financials",
          link: "/adminpanel/financial/licensee",
        },
      ],
    },
    {
      id: "rentals-menu",
      name: "Rentals",
      link: "/adminpanel/rentals",
      // submenu: [
      //     {
      //         name: "Rentals List",
      //         link: "/adminpanel/rentals"
      //     }
      // ]
    },
    {
      id: "rental-item-menu",
      name: "Rental Item",

      submenu: [
        {
          name: "Rental Item Types",
          link: "/adminpanel/rentalitemtypes",
        },
        {
          name: "Trailer Types",
          link: "/adminpanel/trailertypes",
        },
        {
          name: "Upsell Items Types",
          link: "/adminpanel/upsellItemtypes",
        },
      ],
    },
    {
      id: "employee-menu",
      name: "Admin Employee",

      submenu: [
        {
          name: "Invite Employee",
          link: "/adminpanel/employee/invite",
        },
        {
          name: "Employee List",
          link: "/adminpanel/employee/list",
        },
      ],
    },
  ];

  const rightMenuList = [
    {
      id: "profile-menu",
      name: "Profile",

      submenu: [
        /* {
                    name: "My Profile",
                    link: "/adminpanel/profile"
                }, */
        {
          name: "Edit Profile",
          link: "/adminpanel/employee/edit",
        },
        {
          name: "Logout",
          link: "/adminpanel/logout",
        },
      ],
    },
  ];

  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = (event) => {
    // console.log("event.currentTarget", event.currentTarget, event.currentTarget.attributes);
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  function isOpen(menuId) {
    if (anchorEl === null) {
      return false;
    }
    const anchorElemMenuId = anchorEl.attributes.getNamedItem("aria-controls")
      .value;
    return anchorElemMenuId === menuId;
  }

  return (
    <div className={classes.root}>
      <AppBar position="static" className={classes.appBar}>
        <Toolbar variant="dense">
          <Typography variant="h6" className={classes.title}>
            <strong> Trailer 2 You </strong>
          </Typography>

          {showLoggedInMenu && (
            <div style={{ margin: "auto" }}>
              {leftMenuList.map((menu, i) => {
                return (
                  <Fragment key={menu.name}>
                    {menu.submenu ? (
                      <Fragment>
                        <Button
                          className={classes.navButton}
                          aria-controls={menu.id}
                          aria-haspopup="true"
                          variant="contained"
                          color="primary"
                          onClick={handleClick}
                        >
                          {menu.name}
                        </Button>
                        <StyledMenu
                          id={menu.id}
                          anchorEl={anchorEl}
                          keepMounted
                          open={isOpen(menu.id)}
                          onClose={handleClose}
                        >
                          {menu.submenu.map((subMenu) => {
                            return (
                              <StyledMenuItem
                                key={subMenu.name}
                                onClick={(e) => {
                                  history.push(`${subMenu.link}`);
                                  handleClose();
                                }}
                              >
                                <ListItemText primary={subMenu.name} />
                              </StyledMenuItem>
                            );
                          })}
                        </StyledMenu>
                      </Fragment>
                    ) : (
                      <Fragment>
                        <Button
                          className={classes.navButton}
                          aria-haspopup="true"
                          variant="contained"
                          color="primary"
                          onClick={(e) => {
                            history.push(`${menu.link}`);
                          }}
                        >
                          {menu.name}
                        </Button>
                      </Fragment>
                    )}
                  </Fragment>
                );
              })}
            </div>
          )}

          {showLoggedInMenu && (
            <div
              className={classes.navButtonGroupRight}
              style={
                {
                  // marginLeft: "200px"
                }
              }
            >
              {rightMenuList.map((menu) => {
                return (
                  <Fragment key={menu.name}>
                    <Button
                      className={classes.navButton}
                      aria-controls={menu.id}
                      aria-haspopup="true"
                      variant="contained"
                      color="primary"
                      onClick={handleClick}
                    >
                      {menu.name}
                    </Button>

                    <StyledMenu
                      id={menu.id}
                      anchorEl={anchorEl}
                      keepMounted
                      open={isOpen(menu.id)}
                      onClose={handleClose}
                    >
                      {menu.submenu.map((subMenu) => {
                        return (
                          <StyledMenuItem
                            key={subMenu.name}
                            onClick={(e) => {
                              if (subMenu.name === "Logout") {
                                localStorage.clear();
                              }
                              // history.push("/adminpanel")
                              history.push(`${subMenu.link}`);
                              handleClose();
                            }}
                          >
                            <ListItemText primary={subMenu.name} />
                          </StyledMenuItem>
                        );
                      })}
                    </StyledMenu>
                  </Fragment>
                );
              })}
            </div>
          )}
        </Toolbar>
      </AppBar>
    </div>
  );
}

export default AppHeader;
