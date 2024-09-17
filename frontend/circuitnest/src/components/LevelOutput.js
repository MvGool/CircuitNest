import React from 'react';
import { Box } from '@mui/material';
import { Typography } from "@mui/material";
import { useQuery } from "react-query";
import { useParams } from "react-router-dom";
import BooleanOutput from "./LevelTypes/BooleanOutput";
import TruthTableOutput from './LevelTypes/TruthTableOutput';
import GraphicalOutput from './LevelTypes/GraphicalOutput';
import { useTranslation } from 'react-i18next';

function LevelOutput(props) {

    // Add translation
    const { t } = useTranslation();

    // Get level ID from URL
	const { scenarioId, levelId } = useParams()

    // Get data from API
    let dataQuery = useQuery({ queryKey: [`/scenarios/${scenarioId}/levels/${levelId}/`] })

    switch (props.type) {
        case "boolean_function":
            return <Box>
                    {/* TODO add input here */}
                    <BooleanOutput 
                        data={dataQuery.data} 
                        levelInfo={props.levelInfo} 
                        error={props.error}
                        setError={props.setError} 
                        setCompleted={props.setCompleted}
                    />
                </Box>
        case "truth_table":
            return <Box>
                    {/* TODO add input here */}
                    <TruthTableOutput 
                        data={dataQuery.data} 
                        levelInfo={props.levelInfo} 
                        error={props.error}
                        setError={props.setError} 
                        setCompleted={props.setCompleted}
                    />
                </Box>
        case "graphical":
            /* TODO add input here */
            return <GraphicalOutput 
                    data={dataQuery.data} 
                    levelInfo={props.levelInfo} 
                    error={props.error}
                    setError={props.setError} 
                    setCompleted={props.setCompleted}
                    />
        case "code":
            return <Box>
                    {/* TODO add input here */}
                    {props.type} should be code
                </Box>
        default:
            return <Typography>{t('level.invalid_level_type')}</Typography>
    }
}

export default LevelOutput