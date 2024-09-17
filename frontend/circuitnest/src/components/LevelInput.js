import React from 'react';
import { Box } from '@mui/material';
import { Typography } from "@mui/material";
import { useQuery } from "react-query";
import { useParams } from "react-router-dom";
import BooleanInput from "./LevelTypes/BooleanInput";
import TruthTableInput from './LevelTypes/TruthTableInput';
import GraphicalInput from './LevelTypes/GraphicalInput';
import { useTranslation } from 'react-i18next';

function LevelInput(props) {

    // Add translation
    const { t } = useTranslation();

    // Get level ID from URL
	const { scenarioId, levelId } = useParams()

    // Get data from API
    let dataQuery = useQuery({ queryKey: [`/scenarios/${scenarioId}/levels/${levelId}/`] })
    
    switch (props.type) {
        case "boolean_function":
            return <Box>
                    <BooleanInput data={dataQuery.data} error={props.error} />
                </Box>
        case "truth_table":
            return <Box>
                    <TruthTableInput data={dataQuery.data} error={props.error} />
                </Box>
        case "graphical":
            return <GraphicalInput data={dataQuery.data} error={props.error} />
        case "code":
            return <Box>
                    {props.type} should be code
                </Box>
        default:
            return <Typography>{t('level.invalid_level_type')}</Typography>
    }
}

export default LevelInput