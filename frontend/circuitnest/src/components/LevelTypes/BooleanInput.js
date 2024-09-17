import React from 'react';
import { Box } from '@mui/material';
import { Typography } from "@mui/material";
import { convertToBitwise, convertToMathematicalExpression } from "../../util/booleanConversion";
import { useTranslation } from 'react-i18next';

function BooleanInput(props) {

    // Add translation
    const { t } = useTranslation();

    return <Box>
        <Typography variant='h6'>{t('level.mathematical_representation')}</Typography>
        <Typography variant='h6'>{convertToMathematicalExpression(convertToBitwise(props.data.boolean_function))}</Typography>
        {/* <br/>
        <Typography variant='h6'>{t('level.code_representation')}</Typography>
        <Typography variant='h6'>{props.data.boolean_function}</Typography>
        <br/>
        <Typography variant='h6'>{t('level.boolean_algebra_representation')}</Typography>
        <Typography variant='h6'>{convertToBooleanAlgebra(props.data.boolean_function)}</Typography> */}
    </Box>
}

export default BooleanInput