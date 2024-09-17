import React, { useContext, useEffect, useState } from "react";
import { Box } from "@mui/system"
import LoadingPage from "../pages/LoadingPage";
import ErrorPage from "../pages/ErrorPage";
import { useQuery } from "react-query";
import { fetchFromApi } from "../util/apiCalls";
import { Tab, Tabs } from "@mui/material";
import LevelPath from "../components/LevelPath";
import { useLocation } from "react-router-dom";
import { GamificationContext } from "../contexts";

function LevelSelectionPage(props) {

    // Gamification context
    const gamified = useContext(GamificationContext)

    // Scenario state
    const { state } = useLocation()
    const [currScenario, setCurrScenario] = useState(state?.prevScenario)

    // Get scenario data from API
    let scenarioQuery = useQuery({ queryKey: [`/scenarios/`], queryFn: fetchFromApi })
    // Get scenario progress data from API
    let scenarioProgressQuery = useQuery({ queryKey: [`/progress/`], queryFn: fetchFromApi })
    // Get level data when scenario is selected
    let levelQuery = useQuery({ queryKey: [`/scenarios/${currScenario}/levels/`], queryFn: fetchFromApi, enabled: currScenario != null})
    // Get progress data
    let progressQuery = useQuery({ queryKey: [`/scenarios/${currScenario}/progress/`], queryFn: fetchFromApi, enabled: currScenario != null})

    const startLevel = (selectedLevel) => {
        window.location.href = `/level/${currScenario}/${selectedLevel}`
    }

    // Scenario list
    const scenarioTabs = scenarioQuery.isLoading || scenarioQuery.isError || scenarioProgressQuery.isLoading ? null :
        <Tabs 
            value={currScenario || scenarioQuery.data[0]?.id} 
            onChange={(e, value) => setCurrScenario(value)} 
            variant="scrollable" 
            scrollButtons="auto" 
        >
            {scenarioQuery.data.map((scenario) => {
                const missingPrereqs = scenario.prerequisites?.filter(prereq => !scenarioProgressQuery.data.map(progress => progress.scenario).includes(prereq))
                return <Tab 
                    key={scenario.name} 
                    value={scenario.id} 
                    label={scenario.name}
                    disabled={gamified && missingPrereqs?.length > 0}
                    sx={{ fontWeight: 'bold' }}
                />
            })}
        </Tabs>
    
    useEffect(() => {
        if (scenarioQuery.data && !currScenario) {
            setCurrScenario(scenarioQuery.data[0]?.id)
        }
    }, [scenarioQuery.data, currScenario])

    return (
		scenarioQuery.isLoading ? (
			<LoadingPage />
		) : (
			scenarioQuery.isError ? (
				<ErrorPage />
			) :	(
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', overflow: 'visible', width: '100%' }}>
                    {/* Scenario selection */}
                    <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', zIndex: 100 }}> 
                        {scenarioTabs}
                    </Box>
                    {/* Level selection */}
                    {currScenario 
                        && !levelQuery.isLoading && !levelQuery.isError 
                        && !progressQuery.isLoading && !progressQuery.isError
                    ? (
                        // Show levels if data is loaded
                        <LevelPath levelData={levelQuery.data} progress={progressQuery.data} startLevel={startLevel} prevLevel={state?.prevLevel} avatar={props.avatar} />
                    ) : null}
                </Box>
			)
		)
	)
}

export default LevelSelectionPage