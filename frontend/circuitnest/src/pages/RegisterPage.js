import React, { useState } from "react";
import { Button, Input, Typography, Select, MenuItem, Stack, FormControl } from "@mui/material";
import { useTheme } from "@emotion/react";
import { register, refresh } from "../util/apiCalls";
import { Navigate, useOutletContext } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useTranslation } from "react-i18next";

import LinkTypography from "../components/LinkTypography";
import ContentBox from "../components/ContentBox";
import { LANGUAGES } from '../translations/constants';

function RegisterPage() {
    
    // Add translation
    const { t } = useTranslation()

    // Get MUI theme
    const theme = useTheme()

    // Get outlet context
    const [,, language, changeLanguage] = useOutletContext()

    // Username state
    const [username, setUsername] = useState('')
    // Password state
    const [password, setPassword] = useState('')

    // Error state
    const [error, setError] = useState({username: [], password: [], classroom: []})

    // Check if user is already logged in
    if (localStorage.getItem('token')) {
        let decodedToken = jwtDecode(localStorage.getItem('token'))
        let currentDate = new Date();

        // JWT exp is in seconds
        if (decodedToken.exp * 1000 < currentDate.getTime()) {
            refresh(localStorage.getItem('refresh_token'))
        } else {
            return <Navigate to="/" />
        }
    }

    // Login function
    const handleRegister = () => {
        let newErrors = {username: [], password: [], classroom: []}
        if (username === '' || password === '') {
            if (username === '') {
                newErrors.username = [t('register.error.required')]
            }
            if (password === '') {
                newErrors.password = [t('register.error.required')]
            }
            setError(newErrors)
            return
        }

        if (username.indexOf(' ') >= 0) {
            newErrors.username = [t('register.error.space')]
            setError(newErrors)
            return
        }

        register(username, password, language)
            .then((res) => {
                if (res.status === 400) {
                    newErrors.password = res.data.password || []
                    setError(newErrors)
                }
            })

    }

    return (
        <ContentBox sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginX: 'auto', marginY: 5, height: 'fit-content' }}>
            <Typography variant='h3'>{t('register.title')}</Typography>
            {/* TODO fix password manager recognition */}
            <Stack direction={'column'} sx={{ gap: 0.5, minWidth: '350px', '& > *': { margin: theme.spacing(1) } }}>
                <FormControl error={error.username.length > 0}>
                    <Input placeholder={t('register.username')} type="text" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" />
                    {error.username.map((err) => (
                        <Typography key={err} variant='caption'>{err}</Typography>
                    ))}
                </FormControl>
                <FormControl error={error.password.length > 0}>
                    <Input placeholder={t('register.password')} type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
                    {error.password.map((err) => (
                        <Typography key={err} variant='caption'>{err}</Typography>
                    ))}
                </FormControl>
                <Select value={language} onChange={(e) => changeLanguage(e.target.value)}>
                    {LANGUAGES.map((lang) => (
                        <MenuItem key={lang.code} value={lang.code}>{lang.label}</MenuItem>
                    ))}
                </Select>
                <Button variant='contained' onClick={handleRegister}>{t('register.submit')}</Button>
                <LinkTypography to="/login" sx={{ textAlign: 'center' }}>{t('register.login')}</LinkTypography>
            </Stack>
        </ContentBox>
	)
}

export default RegisterPage