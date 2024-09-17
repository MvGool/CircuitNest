import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useQuery } from "react-query";

import { tutorialStepsGamified, tutorialStepsNormal } from "../util/tutorialSteps";
import { fetchFromApi, postToApi } from "../util/apiCalls";
import { useContext, useEffect, useState } from "react";
import Achievement from "./Achievement";
import { GamificationContext } from "../contexts";

function TutorialDialog(props) {

    // Get gamification context
    const gamified = useContext(GamificationContext)

    // Set tutorial steps
    const tutorialSteps = gamified ? tutorialStepsGamified : tutorialStepsNormal

    // Use translation
    const { t } = useTranslation()
    
    const profileQuery = useQuery({ queryKey: [`/auth/users/me/`], queryFn: fetchFromApi })

    // Tutorial dialog state
    const [open, setOpen] = useState(false)
    const [step, setStep] = useState(-1)

    // Achievements state
    const [achievements, setAchievements] = useState([])

    // Tutorial next step function
    const nextTutorialStep = () => {
        postToApi({ queryKey: `/tutorial/`, data: { tutorial: step + 1, completed: step >= tutorialSteps.length - 1 } })
            .then((response) => {
                if (response.achievements?.length > 0) {
                    setAchievements(response.achievements)
                    props.updateAchievements(response.achievements)
                }
            })
        setStep(step + 1)
        if (step >= tutorialSteps.length - 1) {
            setOpen(false)
        }   
    }    

    // Check if the user has completed the tutorial
    useEffect(() => {
        if (profileQuery.data?.tutorial < tutorialSteps.length) {
            setOpen(true)
            setStep(profileQuery.data.tutorial)
        }    
    }, [profileQuery.data])    

    return (<>
        {step >= 0 && step < tutorialSteps.length && props.page === tutorialSteps[step].page && 
            <Dialog open={open}>
                <DialogTitle sx={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
                    {t(tutorialSteps[step].title)}
                    <Typography variant='body1'>{step+1}/{tutorialSteps.length}</Typography>
                </DialogTitle>
                <DialogContent sx={{paddingBottom: 0}}>
                    {t(tutorialSteps[step].text)}
                </DialogContent>
                <DialogActions>
                    <Button
                        aria-label="next-step"
                        onClick={nextTutorialStep}
                    >
                        {t('tutorial.continue')}
                    </Button>
                </DialogActions>
            </Dialog>
        }
        {/* Show achievements if they have been achieved */}
        {gamified && <Dialog
            open={achievements.length > 0}
            onClose={() => setAchievements([])}
            PaperProps={{ sx: { borderRadius: 2, overflow: 'visible' } }}
        >
            <DialogContent sx={{ overflow: 'visible', paddingBottom: 0 }}>
                <Typography textAlign={'center'}>{t('avatar.new_achievements')}</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 1, gap: 1, maxHeight: '40vh', overflow: 'visible' }}>
                {achievements.map((achievement, index) => 
                    <Achievement 
                        key={`achievement-${index}`} 
                        {...achievement} achieved={true} 
                        sx={{ 
                            opacity: 0,
                            animation: 'achievement-appear 0.5s forwards',
                            animationDelay: `${index * 0.5}s`,
                        }}
                    />
                )}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setAchievements([])} color="primary">
                    {t('avatar.continue')}
                </Button>
            </DialogActions>
        </Dialog>}
    </>)
}

export default TutorialDialog;