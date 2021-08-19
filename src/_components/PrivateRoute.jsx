import React from 'react';
import { 
    Route, 
    Redirect,
} from 'react-router-dom';


export const PrivateRoute = ({ component: Component, ...rest }) => { 
    return (
        <Route {...rest} render={ props => {
                const expiryDate = localStorage.getItem('expiry');
                const user = localStorage.getItem('user');
                const token = localStorage.getItem('token');
                
                const isValidUser = (user && user !== 'undefined') && (token && token !== 'undefined');
                // console.log("isValidUser", isValidUser, "user", user, "token", token);
                
                if(isValidUser && expiryDate && expiryDate > (new Date()).getTime()) {
                    return (<Component {...props} />);
                }
                localStorage.removeItem('expiry');
                localStorage.removeItem('user');
                localStorage.removeItem('token');

                // console.log("props.location", props.location);
                if(props.location !== "/adminpanel/") {
                    return (<Redirect to={{ pathname: '/adminpanel/signin', state: { from: props.location } }} />);
                }
                /* (localStorage.getItem('user')
                    ? <Component {...props} />
                    : <Redirect to={{ pathname: '/signin/signin', state: { from: props.location } }} />) */
            }
        } />
    )
}