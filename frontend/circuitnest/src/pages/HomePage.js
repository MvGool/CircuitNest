import React, { useContext, useEffect, useState } from "react";
import { Box } from "@mui/system"
import LoadingPage from "./LoadingPage";
import ErrorPage from "./ErrorPage";
import { Button, Dialog, DialogContent, DialogTitle, Divider, IconButton, Input, Tab, Tabs, Typography } from "@mui/material";
import { useQuery } from "react-query";
import { fetchFromApi, postToApi } from "../util/apiCalls";
import { useTranslation } from "react-i18next";
import Achievement, { AchievementNumber } from "../components/Achievement";
import MainPageColumn from "../components/MainPageColumn";

import CloseIcon from '@mui/icons-material/Close';
import StarIcon from '@mui/icons-material/Star';
import AvatarBird from "../components/avatar/AvatarBird";
import LeaderboardEntry from "../components/LeaderboardEntry";
import LevelSelectionPage from "./LevelSelectionPage";
import Podium from "../components/Podium";
import TutorialDialog from "../components/TutorialDialog";
import { GamificationContext } from "../contexts";

function HomePage() {
    
    // Get gamification context
    const gamified = useContext(GamificationContext)

    // Add translation
    const { t } = useTranslation()

    // Get page data from API
	const profileQuery = useQuery({ queryKey: [`/auth/users/me/`], queryFn: fetchFromApi })
	const leaderboardQuery = useQuery({ queryKey: [`/auth/user/leaderboard/`], queryFn: fetchFromApi })
    const achievementQuery = useQuery({ queryKey: [`/achievements/`], queryFn: fetchFromApi })
    const userAchievementQuery = useQuery({ queryKey: [`/user-achievements/`], queryFn: fetchFromApi })
    const cosmeticQuery = useQuery({ queryKey: [`/cosmetics/`], queryFn: fetchFromApi })

    // Achievement state
    const [achievements, setAchievements] = useState([])
    const [achievementOpen, setAchievementOpen] = useState(false)

    // Leaderboard tab state
    const [value, setValue] = useState('stars')

    // Avatar state
    const [avatar, setAvatar] = useState(null)

    // Setup avatar
    useEffect(() => {
        if (profileQuery.data?.avatar && cosmeticQuery.data) {
            // Cosmetic state
            let equippedCosmetics = {}
            profileQuery.data?.avatar.cosmetics.forEach((cosmetic) => {
                equippedCosmetics[cosmetic.slot] = cosmetic
            })

            let ava = {
                avatar: profileQuery.data?.avatar,
                cosmeticData: cosmeticQuery.data,
                cosmetics: equippedCosmetics
            }

            setAvatar(ava)
        }
    }, [profileQuery.data?.avatar, cosmeticQuery.data])

    // Check if any query is loading
    const isLoading = profileQuery.isLoading || leaderboardQuery.isLoading
    const isError = profileQuery.isError || leaderboardQuery.isError

    useEffect(() => {
        if (achievementQuery.data && userAchievementQuery.data) {
            var newAchievements = achievementQuery.data
            // Check if user has achieved any achievements
            newAchievements.forEach((achievement) => {
                // Check if user has achieved this achievement
                const userAchievement = userAchievementQuery.data.find((userAchievement) => userAchievement.achievement.id === achievement.id)
                if (userAchievement) {
                    // User has achieved this achievement
                    achievement.achieved = true
                    achievement.achieved_at = userAchievement.unlocked_at
                }
            })
            setAchievements(newAchievements)
        }
    }, [achievementQuery.data, userAchievementQuery.data])

    // Avatar and achievement column
    const avatarColumn =
        <MainPageColumn title={profileQuery.data?.username} onClick={() => window.location.href = "/profile"} sx={{ cursor: 'pointer' }} invertedColor>
            <AvatarBird avatar={profileQuery.data?.avatar} />
        </MainPageColumn>
    
    const achievementsColumn =
            <MainPageColumn title={t('achievements.title')} invertedColor contentBoxSx={{gap: 1}}>
                {achievements?.filter(a => a.achieved).length > 0 && <Box>
                    <Typography 
                        variant="h6" 
                        sx={{ cursor: 'pointer' }}
                        onClick={() => setAchievementOpen(true)}
                    >
                        {t('achievements.unlocked_achievements')}
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', flexWrap: 'wrap', gap: 1 }}>
                        {/* Render the 3 most recently achieved achievements */}
                        {achievements?.filter(a => a.achieved)
                            .sort((a,b) => Date.parse(b.achieved_at) - Date.parse(a.achieved_at))
                            .splice(0,3)
                            .map((achievement) => 
                            <Achievement key={`key-${achievement.name}`} {...achievement} />
                        )}
                    </Box>
                </Box>}
                {achievements?.filter(a => a.achieved).length > 3 && <Box>
                    <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, padding: 0.5 }}>
                        {/* Render the other achieved achievements to a max of 5 */}
                        {achievements?.filter(a => a.achieved)
                            .sort((a,b) => Date.parse(b.achieved_at) - Date.parse(a.achieved_at))
                            .splice(3, 4)
                            .map((achievement, index) => 
                            <Achievement key={`key-${achievement.name}-${index}`} {...achievement} compact />
                        )}
                        <AchievementNumber number={achievements?.filter(a => a.achieved).length - 7} onClick={() => setAchievementOpen(true)} />
                    </Box>
                </Box>}
                {achievements?.filter(a => !a.achieved).length > 0 && <Box>
                    <Typography 
                        variant="h6" 
                        sx={{ cursor: 'pointer' }}
                        onClick={() => setAchievementOpen(true)}
                    >
                        {t('achievements.locked_achievements')}
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, padding: 0.5 }}>
                        {/* Render the locked achievements to a max of 5 */}
                        {achievements?.filter(a => !a.achieved)
                            .splice(0, 4)
                            .map((achievement, index) => 
                            <Achievement key={`key-${achievement.name}-${index}`} {...achievement} compact />
                        )}
                        <AchievementNumber number={achievements?.filter(a => !a.achieved).length - 4} onClick={() => setAchievementOpen(true)} />
                    </Box>
                </Box>}
            </MainPageColumn>

    // Achievement dialog
    const achievementModal = 
    <Dialog 
        open={achievementOpen} 
        onClose={() => setAchievementOpen(false)}
        sx={{
            '& .MuiDialog-paper': {
                maxWidth: '60vw',
            },
            '& .MuiDialogContent-root': {
                padding: 2,
            }
        }}
    >
        <DialogTitle>{t('achievements.title')}</DialogTitle>
        <IconButton
            aria-label="close"
            onClick={() => setAchievementOpen(false)}
            sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                color: (theme) => theme.palette.grey[500],
            }}
        >
            <CloseIcon />
        </IconButton>
        <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, height: '70vh', overflowY: 'auto' }}>
                {/* Unlocked achievements */}
                {achievements?.filter(a => a.achieved).map((achievement, index) => 
                    <Achievement key={`key-achievement-${index}`} {...achievement} detailed />
                )}
                {/* Locked achievements */}
                <Typography variant="h6">{t('achievements.locked_achievements')}</Typography>
                {achievements?.filter(a => !a.achieved).map((achievement, index) => 
                    <Achievement key={`key-achievement-${index}`} {...achievement} detailed />
                )}
            </Box>
        </DialogContent>
    </Dialog>

    const starLeaderboard = leaderboardQuery.data?.leaderboard.sort((a,b) => b.total_stars - a.total_stars).slice(0,10)
    const levelLeaderboard = leaderboardQuery.data?.leaderboard.sort((a,b) => b.total_levels - a.total_levels).slice(0,10)

    // Leaderboard column
    const leaderboardColumn = 
        <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
            <MainPageColumn title={t('leaderboard.title')} invertedColor>
                <Tabs 
                    value={value} 
                    onChange={(e, value) => setValue(value)} 
                    variant="fullWidth"
                >
                    <Tab value='stars' label={t('leaderboard.stars')} />
                    <Tab value='levels' label={t('leaderboard.levels')} />
                </Tabs>
                <Box role="tabpanel" hidden={value !== 'stars'} padding={2}>
                    {starLeaderboard && <Podium firstPlace={starLeaderboard[0]} secondPlace={starLeaderboard[1]} thirdPlace={starLeaderboard[2]} />}
                    <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body">{t('leaderboard.username')}</Typography>
                        <StarIcon sx={{ width: '32px' }} />
                    </Box>
                    <Divider sx={{ marginY: 1 }} />
                    {starLeaderboard?.map((user) => (
                        <LeaderboardEntry key={`leaderboard-stars-${user.username}`} user={user} type={'stars'} />
                    ))}
                </Box>
                <Box role="tabpanel" hidden={value !== 'levels'} padding={2}>
                    {levelLeaderboard && <Podium firstPlace={levelLeaderboard[0]} secondPlace={levelLeaderboard[1]} thirdPlace={levelLeaderboard[2]} />}
                    <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body">{t('leaderboard.username')}</Typography>
                        <Typography variant="body">{t('leaderboard.levels_completed')}</Typography>
                    </Box>
                    <Divider sx={{ marginY: 1 }} />
                    {levelLeaderboard?.map((user) => (
                        <LeaderboardEntry key={`leaderboard-levels-${user.username}`} user={user} type={'levels'} />
                    ))}
                </Box>
            </MainPageColumn>
        </Box>

    // Classroom and start button column
    // const classroomColumn =
    //     <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
    //         {profileQuery.data?.class_related ? 
    //             <MainPageColumn title={t('classroom.title')} invertedColor>
    //                 <Typography variant="body">{profileQuery.data.class_related.name}</Typography>
    //                 <Typography variant="body">{profileQuery.data.class_related.code}</Typography>
    //                 <Typography variant="body">{profileQuery.data.class_related.description}</Typography>
    //             </MainPageColumn>
    //         :
    //             <MainPageColumn title={t('classroom.title')} invertedColor>
    //                 <Typography variant="body">{t('classroom.not_enrolled')}</Typography>
    //                 <Box sx={{ display: 'flex', flexDirection: 'row' }} >
    //                     <Input placeholder={t('classroom.enter_code')} value={classroomCode} onChange={(e) => setClassroomCode(e.target.value)} />
    //                     <Button variant="contained" sx={{ marginLeft: 1 }} onClick={joinClassroom}>{t('classroom.join_button')}</Button>
    //                 </Box>
    //             </MainPageColumn>
    //         }
    //     </Box>

    return (
		isLoading ? (
			<LoadingPage />
		) : (
			isError ? (
				<ErrorPage />
			) :	(
                <>
                    {gamified && <Box sx={{ width: '360px', height: '100%', backgroundColor: '#00000066', zIndex: 100, overflowY: 'auto', scrollbarWidth: 0 }}>
                        {avatarColumn}
                        {achievementsColumn}
                    </Box>}
                    <Box sx={{ display: 'flex', flexGrow: 1 }}>
                        <LevelSelectionPage avatar={avatar} />
                    </Box>
                    {gamified && <Box sx={{ width: '360px', height: '100%', backgroundColor: '#00000066', zIndex: 100, overflowY: 'auto', scrollbarWidth: 0 }}>
                        {/* {classroomColumn} */}
                        {leaderboardColumn}
                    </Box>}
                    {gamified && achievementModal}
                    <TutorialDialog 
                        page='home' 
                        updateAchievements={(achs) => {
                            const newAchievements = achievements.map(achievement => { 
                                return Boolean(achs.find(ach => ach.id === achievement.id)) ? 
                                    {
                                        achieved: true,
                                        achieved_at: Date.now(),
                                        ...achievement
                                    }
                                    : achievement
                            })
                            setAchievements(newAchievements)
                        }} 
                    />
                </>
			)
		)
	)
}

export default HomePage