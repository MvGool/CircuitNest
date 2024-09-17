import React from "react";
import { Button, Input, Typography, Stack } from "@mui/material";
import { useTheme } from "@emotion/react";
import { login, postToApi, refresh } from "../util/apiCalls";
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useTranslation } from "react-i18next";

import LinkTypography from "../components/LinkTypography";
import ContentBox from "../components/ContentBox";

function LoginPage() {
    
    // Add translation
    const { t } = useTranslation()

    // Get MUI theme
    const theme = useTheme()

    // Username state
    const [username, setUsername] = React.useState('')
    // Password state
    const [password, setPassword] = React.useState('')

    // Login function
    const handleLogin = () => {
        login(username, password)
    }
	
    return (
        <ContentBox sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginX: 'auto', marginY: 5, height: 'fit-content' }}>
            <Typography variant='h3'>{t('login.title')}</Typography>
            {/* TODO fix password manager recognition */}
            <Stack direction={'column'} sx={{ gap: 0.5, minWidth: '350px', '& > *': { margin: theme.spacing(1) } }}>
                <Input placeholder={t('login.username')} type="text" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" />
                <Input placeholder={t('login.password')} type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
                <Button variant='contained' onClick={handleLogin}>{t('login.submit')}</Button>
                <LinkTypography to="/register" sx={{ textAlign: 'center' }}>{t('login.register')}</LinkTypography>
            </Stack>
        </ContentBox>
	)
}

export default LoginPage