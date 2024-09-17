import React, { useState } from 'react';
import { AppBar, Box, Button, Divider, MenuItem, TextField, Toolbar, Typography } from '@mui/material';
import { LANGUAGES } from '../translations/constants';
import { useTranslation } from 'react-i18next';

function Header(props) {
    // Get language
    const { t, i18n } = useTranslation()

    // Logout function
    const handleLogout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('refresh_token')
        window.location.replace('/login')
    }

    return <Box zIndex={10} sx={{ flexGrow: 1 }}>
        <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
            <Toolbar sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                {/* Title */}
                <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', flexGrow: 1 }}>
                    <Typography variant='h4' onClick={() => window.location.href='/'} sx={{ width: 'fit-content', '&:hover': {cursor: 'pointer'} }}>CircuitNest</Typography>
                    {props.title && <Divider orientation='vertical' flexItem sx={{ background: 'white', px: '1px', mx: 2 }} />}
                    <Typography variant='h6' sx={{ flexGrow: 1 }}>{props.title}</Typography>
                </Box>
                {/* Language selection */}
                <Box sx={{ display: 'flex', justifySelf: 'flex-end', '& *': { color: (theme) => `${theme.palette.primary.contrastText} !important` }}}>
                    <TextField
                        select
                        variant='standard'
                        size='small'
                        value={props.language}
                        onChange={(e) => props.changeLanguage(e.target.value)}
                        sx={{ '& .MuiSelect-select': { padding: 0 } }}
                        InputProps={{
                            disableUnderline: true
                        }}
                    >
                        {LANGUAGES.map((lang) => (
                            <MenuItem key={lang.code} value={lang.code}>{lang.label}</MenuItem>
                        ))}
                    </TextField>                
                </Box>
                {/* Logout button */}
                {localStorage.getItem('token') ? (
                    <Box>
                        <Button color='inherit' onClick={handleLogout}>{t('header.logout')}</Button>
                    </Box>
                ) : null}
            </Toolbar>
        </AppBar>
        <Toolbar /> {/* This is needed to prevent the content from being hidden behind the header */}
    </Box>
}

export default Header