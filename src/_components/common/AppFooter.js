import React from 'react';

import { 
    AppBar, 
     
    
    Typography, 
    
} from '@material-ui/core';

import { 
    makeStyles 
} from '@material-ui/core/styles';

import '../../App.css';

const useStyles = makeStyles((theme) => ({
    menuButton: {
    },
    footer: {
        position: 'fixed',
        left: '0',
        bottom: '0',
        width: '100%'
    },
    footerText: {
        color: '#FFFFFF'
    },
    footerLink: {
        margin: theme.spacing(2),
        color: '#FFFFFF'
    }
}));

function AppFooter() {
    const classes = useStyles();
    return (
        <footer className={classes.footer}>
            <AppBar position="static">
                <Typography variant="body2" align="center" className={classes.footerText}>
                    {'Copyright © '}
                    <a color="inherit" href="https://trailer2you.com/" className={classes.footerText}>
                        Trailer2You
                    </a>{' '}
                    {new Date().getFullYear()}
                </Typography>
            </AppBar>
        </footer>
    );
} 

export default AppFooter;