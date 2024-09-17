import React, { useContext } from "react";
import { Box } from "@mui/system"
import LoadingPage from "./LoadingPage";
import ErrorPage from "./ErrorPage";
import { useQuery } from "react-query";
import { fetchFromApi, patchToApi } from "../util/apiCalls";
import { Button, TextField, Typography } from "@mui/material";
import MainPageColumn from "../components/MainPageColumn";
import AvatarCustomization from "../components/avatar/AvatarCustomization";
import { useTranslation } from "react-i18next";
import { GamificationContext } from "../contexts";

function ProfilePage() {
    
	// Get gamification context
	const gamified = useContext(GamificationContext)

	if (!gamified) {
		window.location.href = '/'
	}

	// Add translation
	const { t } = useTranslation()

    // TODO Get page data from API
	const profileQuery = useQuery({ queryKey: [`/auth/users/me/`], queryFn: fetchFromApi })
	// const avatarQuery = useQuery({ queryKey: [`/auth/users/me/avatar/`], queryFn: fetchFromApi })
	
	// // Editing state
	// const [editing, setEditing] = React.useState(false)
	// const [email, setEmail] = React.useState('')
	// const [firstName, setFirstName] = React.useState('')
	// const [lastName, setLastName] = React.useState('')

	// // Submit profile function
	// const submitProfile = async () => {
	// 	// TODO Submit profile changes
	// 	await patchToApi({ queryKey: `/auth/users/me/`, data: { email: email, first_name: firstName, last_name: lastName } })
	// 	setEditing(false)
	// }

	// Reset tutorial
	const resetTutorial = async () => {
		await patchToApi({ queryKey: `/auth/users/me/`, data: { tutorial: 0 } })
		window.location.href = '/'
	}

    return (
		profileQuery.isLoading ? (
			<LoadingPage />
		) : (
			profileQuery.isError ? (
				<ErrorPage />
			) :	(
				<Box sx={{ display: 'flex', flexDirection: 'row', width: '100%' }}>
					{/* Left menu */}
					<MainPageColumn title={profileQuery.data.username} sx={{ width: 'fit-content' }} contentBoxSx={{ gap: 2 }}>
						{/* {editing ? 
							<>
								<TextField 
									label={t('profile.email')} 
									size="small" 
									value={email}
									onChange={(e) => setEmail(e.target.value)}
								/>
								<TextField 
									label={t('profile.first_name')}
									size="small" 
									value={firstName}
									onChange={(e) => setFirstName(e.target.value)}
								/>
								<TextField 
									label={t('profile.last_name')}
									size="small" 
									value={lastName}
									onChange={(e) => setLastName(e.target.value)}
								/>
								<Box sx={{ display: 'flex', flexDirection: 'row' }}>
									<Button variant="contained" color="primary" onClick={() => {
										setEmail('')
										setFirstName('')
										setLastName('')
										setEditing(false)
									}}>{t('profile.cancel')}</Button>
									<Button variant="contained" color="primary" sx={{marginLeft: 1}} onClick={submitProfile}>{t('profile.save')}</Button>
								</Box>
							</>
						:					
							<>
								<Typography variant="body">{t('profile.email')}: {email || profileQuery.data.email}</Typography>
								<Typography variant="body">{t('profile.first_name')}: {firstName || profileQuery.data.first_name}</Typography>
								<Typography variant="body">{t('profile.last_name')}: {lastName || profileQuery.data.last_name}</Typography>
								<Button variant="contained" color="primary" onClick={() => {
									setEmail(profileQuery.data.email)
									setFirstName(profileQuery.data.first_name)
									setLastName(profileQuery.data.last_name)
									setEditing(true)
								}}>{t('profile.edit')}</Button>
							</>
						} */}
						<Button variant="contained" color="primary" onClick={resetTutorial}>{t('profile.reset_tutorial')}</Button>
					</MainPageColumn>
					{/* Avatar customisation */}
					<MainPageColumn title="Avatar" sx={{ display: 'flex', flexGrow: 1 }} fullHeight>
						<AvatarCustomization avatar={profileQuery.data?.avatar} />
					</MainPageColumn>
				</Box>
			)
		)
	)
}

export default ProfilePage