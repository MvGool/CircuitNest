import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Box, Typography, useTheme } from "@mui/material";
import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import grassBackground from '../assets/grass_background.jpg';
import { useTranslation } from "react-i18next";
import { useQuery } from "react-query";
import { checkToken, fetchFromApi, patchToApi } from "../util/apiCalls";
import { GamificationContext } from "../contexts";
import ErrorPage from "./ErrorPage";
import ClassroomRegisterPage from "./ClassroomRegisterPage";

function PageLayout() {

	// Add translation
	const { t, i18n } = useTranslation()

	// Get MUI theme
	const theme = useTheme()

	// Logged in state
	const [loggedIn, setLoggedIn] = useState(false)
	const [checkingToken, setCheckingToken] = useState(true)

	// Check if user is logged in
	useEffect(() => {
		if (localStorage.getItem('token')) {
			checkToken(localStorage.getItem('token'))
				.then((res) => {
					setLoggedIn(res)
					setCheckingToken(false)
				})
		} else {
			setLoggedIn(false)
			setCheckingToken(false)
		}
	}, [])

	// Get user profile if logged in
	const profileQuery = useQuery({ queryKey: [`/auth/users/me/`], queryFn: fetchFromApi, enabled: loggedIn && !checkingToken })

	// Use state for the title
	const [title, setTitle] = useState('')

	// Language selection
	const [language, setLanguage] = useState(i18n.resolvedLanguage || 'nl')

	// Change language
	const changeLanguage = useCallback((lang) => {
		i18n.changeLanguage(lang)
		setLanguage(lang)
		loggedIn && patchToApi({queryKey: `/auth/users/me/`, data: { language: lang }})
	}, [i18n, setLanguage])
	
	// Set language
	useEffect(() => {
		if (profileQuery.data) {
			setLanguage(profileQuery.data.language)
		}
	}, [profileQuery.data])

	// Logout user if profile can't load
	useEffect(() => {
		if (profileQuery.isError) {
			localStorage.removeItem('token')
			localStorage.removeItem('refresh_token')
			setLoggedIn(false)
		}
	}, [profileQuery.isError])

	return <GamificationContext.Provider value={profileQuery.data?.class_related?.gamified}>
		<Box sx={{ height: `100vh` }}>
			<Header title={title} language={language} changeLanguage={changeLanguage} />
			<Box sx={{ 
				display: 'flex', 
				direction: 'column',
				justifyContent: 'center',
				width: '100vw',
				height: `calc(100% - ${theme.spacing(8)})`,
			}}>
				<Box sx={{
					display: 'block',
					position: 'absolute',
					content: '" "',
					left: 0,
					top: 0,
					width: '100%',
					height: '100%',
					backgroundImage: `url(${grassBackground})`,
					opacity: 0.4,
					zIndex: -1,
				}}/>
				{!loggedIn ?
					<Outlet context={[title, setTitle, language, changeLanguage]} />
				: !profileQuery.data?.class_related ?
					<ClassroomRegisterPage />
				: profileQuery.data?.class_related?.active ? 
					<Outlet context={[title, setTitle, language, changeLanguage]} /> /* Page content will be here */
				:
					<Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center', height: '100%', width: '60%' }}>
						<Typography variant='h4'>{t('classroom.inactive')}</Typography>
					</Box>
				}
			</Box>
		</Box>
	</GamificationContext.Provider>
}

export default PageLayout