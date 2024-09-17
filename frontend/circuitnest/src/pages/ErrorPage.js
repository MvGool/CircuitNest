import React from "react";
import { Box } from "@mui/system"
import { Typography } from "@mui/material";
import { Trans, useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

function ErrorPage() {

    // Add translation
    const { t } = useTranslation();

	return (
        <Box>
            <br/>
            <Typography variant="h1" textAlign={"center"}>{t('error.title')}</Typography>
            <br/>
            <Typography variant="body1" textAlign={"center"}>
                <Trans i18nKey='error.back' components={[<Link to="/" />]}>
                    Click <Link to="/">here</Link> to go back!
                </Trans>
            </Typography>
        </Box>
	)
}

export default ErrorPage;