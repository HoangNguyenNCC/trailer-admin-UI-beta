import React, { useState,  Fragment } from 'react';
import {
    useLocation,
    useHistory,
    
} from "react-router-dom";
import moment from 'moment';

import MaterialTable from 'material-table';

import {
    
    Button,
    
    TextField,
    FormGroup,
    FormControlLabel,
    Checkbox,
    
    
    Box,
   
    InputLabel, 
    Select,
    MenuItem, 
    
    FormControl,
    List, 
    ListItem, 
    ListItemText, 
    ListItemAvatar,
    Divider, 
    Avatar, 
    Typography
} from '@material-ui/core';

import { Alert, AlertTitle } from '@material-ui/lab';

import {  makeStyles } from '@material-ui/core/styles';

import { authHeader, handleFetchErrors } from '../../_helpers';
import { common } from '../../_constants/common';

import '../../App.css';

const apiUrl = common.apiUrl;
// const fetchTrailerTypesAPI = `${apiUrl}/admin/trailers`;
// const fetchUpsellItemTypesAPI = `${apiUrl}/admin/upsellitems`;
const searchAPI = `${apiUrl}/admin/search`;

const useStyles = makeStyles((theme) => ({
	root: {
		width: '100%',
	},
	paper: {
		width: '100%',
		marginBottom: theme.spacing(2),
    },
    paperCenter: {
        width: '100%',
        textAlign: 'center',
		marginBottom: theme.spacing(2),
	},
	table: {
		minWidth: 750,
	},
	visuallyHidden: {
		border: 0,
		clip: 'rect(0 0 0 0)',
		height: 1,
		margin: -1,
		overflow: 'hidden',
		padding: 0,
		position: 'absolute',
		top: 20,
		width: 1,
    }
}));

function SearchResultItem(props) {
    const classes = useStyles();
    // let history = useHistory();
    // console.log("history", history);

    const searchResultData = props.searchResultData;
    const history = props.history;
    const searchParams = props.searchParams;

    const handleClick = (e) => {
        // e.target.dataset.searchResultData
        localStorage.setItem("searchResultData",JSON.stringify(searchResultData));
        localStorage.setItem("searchParams",JSON.stringify({
            locationCoord: searchParams.locationCoord.join(","),
            startDate: `${searchParams.startDate} ${searchParams.startTime}`,
            endDate: `${searchParams.endDate} ${searchParams.endTime}`,
            delivery: searchParams.delivery,
            doChargeDLR: searchParams.doChargeDLR
        }));
        history.push('/adminpanel/book-a-trailer');
    };

    return (
        <List>
            <ListItem alignItems="flex-start">
                <ListItemAvatar>
                    <Avatar alt={searchResultData.name} src={searchResultData.photo} />
                </ListItemAvatar>
                <ListItemText
                    primary={searchResultData.name}
                    secondary={
                        <Fragment>
                            <Typography
                                component="span"
                                variant="body2"
                                className={classes.inline}
                                color="textPrimary"
                            >
                                {searchResultData.licenseeName}
                            </Typography>
                            <ListItemText
                                primary={searchResultData.price}
                                secondary={searchResultData.licenseeDistance}
                            />
                        </Fragment>
                    }
                />
            </ListItem>
            <Divider variant="inset" component="li" />
            <ListItem alignItems="flex-start">
                <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                    // data-searchResultData={searchResultData}
                    onClick={handleClick}
                >
                    Book
                </Button>
            </ListItem>
        </List>
    )
}

export default function Rentals(props) {
    const classes = useStyles();

    let userData = localStorage.getItem('user');
    userData = JSON.parse(userData);
    // console.log("userData", userData);

    let history = useHistory();
    // console.log("history", history);

    let location = useLocation();
    // console.log("location", location);

    //--------------------------------------------------------------------------

    let rentalItemTypesList = localStorage.getItem('rentalitemtypes');
    rentalItemTypesList = JSON.parse(rentalItemTypesList);
    // console.log("rentalItemTypesList", rentalItemTypesList);

    const rentalItemTypesTrailersList = rentalItemTypesList.filter(rentalItemType => {
        return (rentalItemType.itemtype === "trailer");
    });

    const rentalItemTypesUpsellList = rentalItemTypesList.filter(rentalItemType => {
        return (rentalItemType.itemtype === "upsellitem");
    });

    //--------------------------------------------------------------------------

    const serachParamsStart = {
        locationCoord: "",
        startDate: moment().add(1, "day").format("YYYY-MM-DD"),
        startTime: moment().add(1, "day").format("HH:mm"),
        endDate: moment().add(1, "day").add(1, "hour").format("YYYY-MM-DD"),
        endTime: moment().add(1, "day").add(1, "hour").format("HH:mm"),
        trailerTypes: [],
        upsellTypes: [],
        delivery: "door2door",
        doChargeDLR: true
    };
    
    const [searchParams, setSearchParams] = React.useState(serachParamsStart);

    const [loadOnce, setLoadOnce] = useState(0);

    //--------------------------------------------------------------------------

    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const [formValidError, setFormValidError] = useState({
        locationCoord: false,
        startDate: false,
        startTime: false,
        endDate: false,
        endTime: false,
        trailerTypes: false,
        upsellTypes: false,
        delivery: false,
        doChargeDLR: false
    });

    const [formValidErrorMessage, setFormValidErrorMessage] = useState({
        locationCoord: "",
        startDate: "",
        starTime: "",
        endDate: "",
        endTime: "",
        trailerTypes: "",
        upsellTypes: "",
        delivery: "",
        doChargeDLR: ""
    });


    //--------------------------------------------------------------------------

    async function handleSubmit(e) {
        e.preventDefault();

        const isError = (
            formValidError.locationCoord ||
            formValidError.startDate ||
            formValidError.startTime ||
            formValidError.endDate ||
            formValidError.endTime ||
            formValidError.trailerTypes ||
            formValidError.upsellTypes ||
            formValidError.delivery ||
            formValidError.doChargeDLR
        );

        if(isError) {
            return false;
        }

        if(tableRef.current) {
            tableRef.current.onQueryChange();
        }
    }
    
    const tableRef = React.createRef();

    return (
        <div className={classes.root}>

                { 
                    (successMessage !== "") &&
                    <Alert severity="success">
                        <AlertTitle>Success</AlertTitle>
                        {successMessage}
                    </Alert>
                }

                { 
                    (errorMessage !== "") &&
                    <Alert severity="error">
                        <AlertTitle>Error</AlertTitle>
                        {errorMessage}
                    </Alert>
                }

            <form className={classes.form} noValidate>

                <TextField
                    variant="outlined"
                    margin="normal"
                    required
                    fullWidth
                    id="locationCoord"
                    label="Coordinates (Latitude,Longitude format)"
                    name="locationCoord"
                    autoComplete="locationCoord"
                    autoFocus
                    error={(formValidErrorMessage.locationCoord !== "")}
                    helperText={formValidErrorMessage.locationCoord}
                    value={searchParams.locationCoord}
                    onChange={ (e) => { 
                        setSearchParams({
                            ...searchParams,
                            locationCoord: e.target.value
                        });
                    } }
                />  

                <TextField 
                    variant="outlined"
                    margin="normal"
                    aria-label="Start Date" 
                    required
                    fullWidth
                    type="date"
                    id="startDate"
                    label="Start Date"
                    name="startDate"
                    autoComplete="startDate"
                    autoFocus
                    error={(formValidErrorMessage.startDate !== "")}
                    helperText={formValidErrorMessage.startDate}
                    value={searchParams.startDate}
                    onChange={ (e) => { 
                        setSearchParams({
                            ...searchParams,
                            startDate: e.target.value
                        });
                    } } 
                />

                <TextField 
                    variant="outlined"
                    margin="normal"
                    aria-label="Start Time" 
                    required
                    fullWidth
                    type="time"
                    id="startTime"
                    label="Start Time"
                    name="startTime"
                    autoComplete="startTime"
                    autoFocus
                    error={(formValidErrorMessage.startTime !== "")}
                    helperText={formValidErrorMessage.startTime}
                    value={searchParams.startTime}
                    onChange={ (e) => { 
                        setSearchParams({
                            ...searchParams,
                            startTime: e.target.value
                        });
                    } } 
                />

                <TextField 
                    variant="outlined"
                    margin="normal"
                    aria-label="End Date" 
                    required
                    fullWidth
                    type="date"
                    id="endDate"
                    label="End Date"
                    name="endDate"
                    autoComplete="endDate"
                    autoFocus
                    error={(formValidErrorMessage.endDate !== "")}
                    helperText={formValidErrorMessage.endDate}
                    value={searchParams.endDate}
                    onChange={ (e) => { 
                        setSearchParams({
                            ...searchParams,
                            endDate: e.target.value
                        });
                    } } 
                />

                <TextField 
                    variant="outlined"
                    margin="normal"
                    aria-label="End Time" 
                    required
                    fullWidth
                    type="time"
                    id="endTime"
                    label="End Time"
                    name="endTime"
                    autoComplete="endTime"
                    autoFocus
                    error={(formValidErrorMessage.endTime !== "")}
                    helperText={formValidErrorMessage.endTime}
                    value={searchParams.endTime}
                    onChange={ (e) => { 
                        setSearchParams({
                            ...searchParams,
                            endTime: e.target.value
                        });
                    } } 
                />

                {  
                    rentalItemTypesTrailersList && 
                    <Box className="SectionContainer">
                        <FormControl required  className="SectionContainer">
                            <InputLabel id="itemType-trailer-label">Select Trailer Type</InputLabel>
                            <Select
                                labelId="itemType-trailer-label"
                                id="itemType-trailer-select"
                                value={searchParams.trailerTypes}
                                onChange={ (e) => { 
                                    setSearchParams({
                                        ...searchParams,
                                        trailerTypes: e.target.value
                                    });
                                } }
                                className={classes.selectEmpty}
                            >
                                {
                                    rentalItemTypesTrailersList.map((itemType, itemTypeIndex) => {
                                        // console.log("itemType Trailer", itemType);
                                        return (<MenuItem key={`type-${itemType.code}`} value={itemType.code}>{itemType.name}</MenuItem>)
                                    })
                                }
                            </Select>
                        </FormControl>
                    </Box>
                }

                {  
                    rentalItemTypesUpsellList && 
                    <Box className="SectionContainer">
                        <FormControl required fullWidth className="SectionContainer">
                            <InputLabel id="itemType-upsell-label">Select Upsell Item Type</InputLabel>
                            <Select
                                labelId="itemType-upsell-label"
                                id="itemType-upsell-Select"
                                value={searchParams.upsellTypes}
                                onChange={ (e) => { 
                                    setSearchParams({
                                        ...searchParams,
                                        upsellTypes: e.target.value
                                    });
                                } }
                                className={classes.selectEmpty}
                            >
                                {
                                    rentalItemTypesUpsellList.map((itemType, itemTypeIndex) => {
                                        // console.log("itemType UpsellItem", itemType);
                                        return (<MenuItem key={`type-${itemType.code}`} value={itemType.code}>{itemType.name}</MenuItem>)
                                    })
                                }
                            </Select>
                        </FormControl>
                    </Box>
                }

                <Box className="SectionContainer">
                    <FormControl required fullWidth className="SectionContainer">
                        <InputLabel id="itemType-upsell-label">Select Upsell Item Type</InputLabel>
                        <Select
                            labelId="itemType-upsell-label"
                            id="itemType-upsell-Select"
                            value={searchParams.upsellTypes}
                            onChange={ (e) => { 
                                setSearchParams({
                                    ...searchParams,
                                    upsellTypes: e.target.value
                                });
                            } }
                            className={classes.selectEmpty}
                        >
                            {
                                rentalItemTypesUpsellList.map((itemType, itemTypeIndex) => {
                                    // console.log("itemType UpsellItem", itemType);
                                    return (<MenuItem key={`type-${itemType.code}`} value={itemType.code}>{itemType.name}</MenuItem>)
                                })
                            }
                        </Select>
                    </FormControl>
                </Box>

                <Box className="SectionContainer">
                    <FormControl required fullWidth className="SectionContainer">
                        <InputLabel id="delivery-label">Delivery Type</InputLabel>
                        <Select
                            labelId="delivery-label"
                            id="delivery-select"
                            value={searchParams.delivery}
                            onChange={ (e) => { 
                                setSearchParams({
                                    ...searchParams,
                                    delivery: e.target.value
                                });
                            } }
                            className={classes.selectEmpty}
                        >
                            <MenuItem value="pickup">Pickup</MenuItem>
                            <MenuItem value="door2door">Door to Door</MenuItem>
                        </Select>
                    </FormControl>
                </Box>

                <FormGroup className="SectionContainer">
                    <FormControlLabel
                        control={
                            <Checkbox 
                                checked={searchParams.doChargeDLR} 
                                name="doChargeDLR"
                                onChange={(e) => { 
                                    console.log("onChange doChargeDLR", e);
                                    setSearchParams({
                                        ...searchParams,
                                        doChargeDLR: !searchParams.doChargeDLR
                                    });
                                }}  />
                        }
                        label="Do charge Damage Liability Reduction?"
                    />
                </FormGroup>

                <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                    className={classes.submit}
                    onClick={handleSubmit}
                >
                    Search
                </Button>

            </form>

            
            <MaterialTable 
                title="Search Results"
                tableRef={tableRef}
                columns={[
                    { 
                        title: 'Search Results', 
                        field: 'searchResult', 
                        render: rowData => {
                            return <SearchResultItem searchResultData={rowData} searchParams={searchParams} history={history} />
                        } 
                    }
                ]}
                data={ 
                    query => {
                        console.log("MaterialTable data", query);
                        const rowsPerPage = query.pageSize;
                        const page = query.page;

                        // ?type=${requestType}&count=${rowsPerPage}&skip=${(page * rowsPerPage)}

                        const requestOptions = {
                            method: 'POST',
                            headers: authHeader(),
                            'Content-Type': 'application/json',
                            body: JSON.stringify({
                                location: searchParams.locationCoord.join(","),
                                dates: [ 
                                    moment(searchParams.startDate).format("DD MMM, YYYY"),
                                    moment(searchParams.endDate).format("DD MMM, YYYY")
                                ],
                                times: [ 
                                    moment(searchParams.startTime).format("hh:mm A"),
                                    moment(searchParams.endTime).format("hh:mm A")
                                ],
                                delivery: searchParams.delivery,
                                type: searchParams.trailerTypes.concat(searchParams.upsellTypes)
                            })
                        };
                        return new Promise((resolve, reject) => {
                            fetch(`${searchAPI}`, requestOptions)
                            .then(handleFetchErrors)
                            .then( res => res.json() )
                            .then( res => {
                                console.log(`${searchAPI} Response`, res);
                                const trailers = res.trailers || [];
                                const totalCount = res.totalCount || 0;
                                
                                // let newRows = [];
                                // setRows((currentRows) => {
                                //     console.log((typeof currentRows), (typeof trailers));
                                //     newRows = [
                                //         ...currentRows,
                                //         ...trailers
                                //     ];
                                //     console.log("newRows", newRows);
                                //     return newRows;
                                // });

                                // setTotalCount(totalCount);

                                resolve({
                                    data: trailers,
                                    page: page,
                                    totalCount: totalCount
                                })
                            })
                            .catch( error => {
                                console.log(`${searchAPI} Response`, error);
                                reject(error);
                            });
                        });
                    }
                }
                actions={
                    [
                        {
                            icon: "check_circle",
                            tooltip: "Approve",
                            // disabled: (rowData.isApproved !== 0),
                            onClick: (event, rowData) => {
                                console.log("Approve onClick", event, rowData);
                                // if((rowData.isApproved !== 0)) {

                                    let requestBody = { 
                                        rentalId: rowData.rentalId, 
                                        requestType: rowData.requestType,
                                        approvalStatus: "approved"
                                    };

                                    if(rowData.requestType === "extension") {
                                        requestBody.extensionId = rowData.extensionId;
                                    }
                                    if(rowData.requestType === "reschedule") {
                                        requestBody.scheduleId = rowData.scheduleId;
                                    }

                                    const requestOptions = {
                                        method: 'PUT',
                                        headers: { 
                                            ...authHeader(),
                                            'Content-Type': 'application/json'
                                        },
                                        body: JSON.stringify(requestBody)
                                    };
                                    console.log("requestOptions", requestOptions);
                                
                                    fetch(saveRentalApproval, requestOptions)
                                    .then(handleFetchErrors)
                                    .then( res => res.json() )
                                    .then( res => {
                                        console.log(`${saveRentalApproval} Response`, res);
                                        // rowData.driverLicense.verified = true;
                                        // rowData.driverLicense.accepted = true;
                                        if(tableRef.current) {
                                            tableRef.current.onQueryChange();
                                        }
                                    })
                                    .catch( error => {
                                        console.log(`${saveRentalApproval} Error`, error);
                                    });
                                // }
                            }
                        }
                    ]
                }
                options={
                    {
                        actionsColumnIndex: -1,
                        filtering: false,
                        sorting: false
                    }
                }
            />
        
        </div>
    )
}
