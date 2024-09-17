import React, { useContext, useEffect, useRef, useState } from "react";
import { Box } from "@mui/system"
import { Fireworks } from "@fireworks-js/react";
import DOMPurify from "dompurify";
import LoadingPage from "./LoadingPage";
import ErrorPage from "./ErrorPage";
import { useQuery } from "react-query";
import { fetchFromApi, postToApi } from "../util/apiCalls";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import ContentBox from "../components/ContentBox";
import { Button, Typography } from "@mui/material";
import LevelInput from "../components/LevelInput";
import LevelOutput from "../components/LevelOutput";
import LevelCompletionDialog from "../components/LevelCompletionDialog";
import { formatTime } from "../util/helperFunctions";
import { useTranslation } from "react-i18next";
import TeacherDialog from "../components/TeacherDialog";
import QuestionMarkIcon from "@mui/icons-material/QuestionMark";
import TutorialDialog from "../components/TutorialDialog";
import { GamificationContext } from "../contexts";
import HelpDrawer from "../components/HelpDrawer";

function LevelPage() {

	// Get gamification context
	const gamified = useContext(GamificationContext)

	// Use translation
	const { t } = useTranslation()

	// Use navigation to redirect
	const navigate = useNavigate()

	// Get level ID from URL
	const { scenarioId, levelId } = useParams()

	// Get outlet props
	const [, setTitle] = useOutletContext()

    // TODO Get page data from API
    const levelQuery = useQuery({ queryKey: [`/scenarios/${scenarioId}/levels/${levelId}/`], queryFn: fetchFromApi })
    const achievementQuery = useQuery({ queryKey: [`/achievements/`], queryFn: fetchFromApi })

	// Use state for the timer
	const [time, setTime] = useState(0)

	// Use state for the teacher dialog
	const [teacherDialogOpen, setTeacherDialogOpen] = useState(true)

	// Use state for the help drawer
	const [helpDrawerOpen, setHelpDrawerOpen] = useState(false)

	// Use state for the error
	const [error, setError] = useState(null)

	// Use state for level completion
	const [completed, setCompleted] = useState(false)

	// Fireworks handlers
	const fireworkRef = useRef(null)

	// Create timer
	useEffect(() => {
		let interval
		if (!completed && !teacherDialogOpen) {
			interval = setInterval(() => {
				setTime(time + 1)
			}, 1000)
		} else {
		 	clearInterval(interval)
		}
		return () => clearInterval(interval)
	}, [completed, teacherDialogOpen, time])

	// State input and output type
	const [inputType, setInputType] = useState("")
	const [outputType, setOutputType] = useState("")

	useEffect(() => {
		if (levelQuery.data) {
			if (levelQuery.data.level_type === 'Exercise') {
				setInputType(levelQuery.data.start_type)
				setOutputType(levelQuery.data.end_type)
			}
			if (levelQuery.data.level_type === 'Information') {
				postToApi({queryKey: `/answer/complete-information/`, data: { levelId }})
			}

			// Set title in header
			setTitle(levelQuery.data.title)
		}

		return () => {
			setTitle('')
		}
	}, [levelQuery.data, levelId, setTitle])

	// Set fireworks
	const fireworks = <Fireworks
		ref={fireworkRef}
		options={{
			intensity: 60,
			opacity: 0.2,
			particles: 120,
			friction: 0.97
		}}
		style={{
			top: 0,
			left: 0,
			width: '100%',
			height: '100%',
			position: 'fixed',
			zIndex: 1275
		}}
	/>

	// Exercise level
	const exerciseLevel = <>
		<Box sx={{ display: 'flex', flexDirection: 'row', width: '100%', justifyContent: 'space-between' }}>
			{/* Timer */}
			<Box sx={{ width: '25%' }}>
				<Button variant='contained' onClick={() => navigate('/', { state: { prevScenario: scenarioId, prevLevel: levelId } })}>{t('level.home')}</Button>
			</Box>
			<Box sx={{ width: '50%', textAlign: 'center' }}>
				{gamified && <Typography variant='h6' color={(theme) => time > levelQuery.data?.time_goal ? theme.palette.grey[500] : 'primary'}>{formatTime(time)} / {formatTime(levelQuery.data?.time_goal)}</Typography>}
			</Box>
			<Box sx={{ width: '25%', display: 'flex', justifyContent: 'flex-end' }}>
				<Button variant='contained' onClick={() => setHelpDrawerOpen(true)}>
					<QuestionMarkIcon />
				</Button>
			</Box>
		</Box>
		<Box sx={{ display: 'flex', flexDirection: 'row', flexGrow: 1, width: '100%', gap: 3 }}>
			<ContentBox sx={{ flexGrow: 1, width: (theme) => `calc(50vw - ${theme.spacing(5.5)})` }}>
				{/* level input (left side) */}
				<LevelInput type={inputType} error={!(gamified && levelQuery.data?.challenge) && error} />
			</ContentBox>
			<ContentBox sx={{ flexGrow: 1, width: (theme) => `calc(50vw - ${theme.spacing(5.5)})` }}>
				{/* level output (right side) */}
				<LevelOutput type={outputType} 
					levelInfo={{levelId, startType: inputType, endType: outputType, total_time: time}} 
					error={!(gamified && levelQuery.data?.challenge) && error} setError={setError}
					setCompleted={setCompleted}
				/>
			</ContentBox>
			{/* Show level completion dialog */}
			{completed && <LevelCompletionDialog completed={completed} allAchievements={achievementQuery.data} />}
			{/* Show fireworks */}
			{completed && fireworks}
		</Box>
		<TutorialDialog page={'exercise'} />
		<HelpDrawer open={helpDrawerOpen} setOpen={setHelpDrawerOpen} />
	</>

	// Redirect images to correct path
	const informationContent = levelQuery.data?.content?.replaceAll("src='", 
		!process.env.NODE_ENV || process.env.NODE_ENV === 'development' ? 
			"src='http://localhost:8000/mediafiles/visuals/"
		:
			"src='http://circuitnest.mazyar.co.nl/mediafiles/visuals/"
		)

	// Information level
	const informationLevel = <>
		<ContentBox sx={{ display: 'flex', flexDirection: 'column', padding: 3, width: '60vw', maxHeight: '100%' }}>
			<Typography variant='h5'>{levelQuery.data?.title}</Typography>
			<Box dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(informationContent)}} sx={{ overflowY: 'auto' }} />
			<Button variant='contained' sx={{ marginTop: 2, alignSelf: 'end' }} onClick={() => navigate('/', { state: { prevScenario: scenarioId, prevLevel: levelId } })}>{t('level.information.continue')}</Button>
		</ContentBox>
		<TutorialDialog page={'information'} />
	</>

	return (
		levelQuery.isLoading ? (
			<LoadingPage />
		) : (
			<>
				{/* Only log error as the query sometimes gives error without reason */}
				{levelQuery.isError && console.log(levelQuery.error)}
				<Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', alignItems: 'center', padding: 4, gap: 2 }}>
					{levelQuery.data?.level_type === 'Exercise' ? exerciseLevel : informationLevel}
					<TeacherDialog open={teacherDialogOpen} setOpen={setTeacherDialogOpen} text={levelQuery.data?.description} />
				</Box>
			</>
		)
	)
}

export default LevelPage