import { Box, Divider, Paper, Tooltip, Typography, styled, tooltipClasses } from "@mui/material"
import { useTranslation } from "react-i18next";

const AchievementTooltip = styled(({ className, ...props }) => (
        <Tooltip {...props} classes={{ popper: className }} disableInteractive />
    ))(({ theme }) => ({
        [`& .${tooltipClasses.tooltip}`]: {
            backgroundColor: theme.palette.background.paper2,
            color: theme.palette.text.primary,
            maxWidth: 450,
            boxShadow: '0px 0px 5px black',
        },
    }));  

function Achievement(props) {

    // Use translation
    const { t } = useTranslation()

    const achievementDate = new Date(Date.parse(props.achieved_at) || props.achieved_at)
    const formatedDate = achievementDate.toLocaleString('en-US', { weekday:"long", year:"numeric", month:"short", day:"numeric"})

    const compactAchievement = 
        <Paper sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            width: '50px', 
            height: '50px', 
            backgroundColor: 'white',
            borderRadius: '5px',
            filter: `grayscale(${props.achieved ? 0 : 1})`
        }}>
            {console.log(props.visual?.visual)}
            <img 
                src={props.visual?.visual} 
                width='100%' 
                height='100%' 
                style={{ borderRadius: '5px', objectFit: 'contain' }} 
                alt="Achievement visual" 
            />
        </Paper>

    const normalAchievement = 
        <Paper sx={{ 
            display: 'flex', 
            flexDirection: 'row', 
            backgroundColor: (theme) => theme.palette.background.paper2, 
            filter: `grayscale(${props.achieved ? 0 : 1})`,
            opacity: props.achieved ? 1 : 0.5,
            borderRadius: '5px',
            ...props.sx
        }}>
            {/* Achievement icon */}
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 0.5 }}>
                <img src={props.visual?.visual} width='50px' height='50px' style={{ borderRadius: '5px', objectFit: 'contain' }} alt="Achievement visual" />
            </Box>
            <Divider orientation="vertical" flexItem />
            {/* Achievement details */}
            <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', padding: (theme) => theme.spacing(1) }}>
                <Typography variant='body1'>{props.name}</Typography>
            </Box>
        </Paper>

    const detailedAchievement = 
        <Paper sx={{ 
            display: 'flex', 
            flexDirection: 'row', 
            backgroundColor: (theme) => theme.palette.background.paper2, 
            filter: `grayscale(${props.achieved ? 0 : 1})`,
            opacity: props.achieved ? 1 : 0.5,
            borderRadius: '5px',
            ...props.sx
        }}>
            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, width: '100%' }}>
                <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    width: '80px', 
                    height: '80px', 
                    margin: '8px', 
                }}>
                    <img src={props.visual?.visual} width='100%' height='100%' style={{ borderRadius: '5px', objectFit: 'contain' }} alt="Achievement visual" />
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, padding: 2, flexGrow: 1, marginRight: 5 }}>
                    <Typography variant="h6">{props.name}</Typography>
                    <Typography variant="body1" color='#777777'>{props.achieved ? props.description : props.hint}</Typography>
                </Box>
                <Box sx={{ display: 'flex', padding: 2, alignItems: 'center' }}>
                    <Typography variant="subtitle2" color='#777777'>
                        {props.achieved && `${t('achievements.unlocked')} ${formatedDate}`}
                    </Typography>
                </Box>
            </Box>
        </Paper>

    return props.detailed ? detailedAchievement :
        <AchievementTooltip 
            placement={props.compact ? 'top' : 'top-start'}
            slotProps={{
                popper: {
                    modifiers: [
                        {
                            name: 'offset',
                            options: {
                                offset: [props.compact ? 0 : -2, -14],
                            },
                        },
                    ],
                },
            }}
            title={
                <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center', 
                        width: '100px', 
                        height: '100px', 
                        margin: '8px', 
                        borderRadius: '5px', 
                        backgroundColor: 'white',
                        filter: `grayscale(${props.achieved ? 0 : 1})`,
                        boxShadow: '0px 0px 20px rgba(28, 149, 155, 0.50)' 
                    }}>
                        <img src={props.visual?.visual} width='100px' height='100px' style={{ borderRadius: '5px', objectFit: 'contain' }} alt="Achievement visual" />
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, padding: 2 }}>
                        <Typography variant="h6">{props.name}</Typography>
                        <Typography variant="body1" color='#777777'>{props.achieved ? props.description : props.hint}</Typography>
                    </Box>
                </Box>
            } 
        >
            {props.compact ? compactAchievement : normalAchievement}
        </AchievementTooltip>
}

export default Achievement

export const AchievementNumber = (props) => {
    return props.number > 0 && 
    <Paper 
        sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            width: '50px', 
            height: '50px', 
            backgroundColor: 'white',
            borderRadius: '5px',
            cursor: 'pointer'
        }}
        onClick={props.onClick}
    >
        <Typography variant="h6">+{props.number}</Typography>
    </Paper>
}