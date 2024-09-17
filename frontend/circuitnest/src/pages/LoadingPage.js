import React from "react";
import { Box } from "@mui/system"
import { CircularProgress, Typography } from "@mui/material"
import { useTranslation } from "react-i18next";

function LoadingPage() {

    // Add translation
    const { t } = useTranslation();

    // TODO: Improve loading page
	return (
        <Box sx={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
            <Typography variant="body1">{t('loading.title')}</Typography>
            <br/>
            <CircularProgress />
        </Box>
	)
}

export default LoadingPage