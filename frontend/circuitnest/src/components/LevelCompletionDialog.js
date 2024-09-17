import { useCallback, useContext, useState } from 'react';
import * as d3 from 'd3';
import { Backdrop, Box, Button, Dialog, DialogActions, DialogContent, Popper, Typography } from "@mui/material"
import { Trans, useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom"
import Achievement from "./Achievement";
import TutorialDialog from './TutorialDialog';
import { GamificationContext } from '../contexts';

function LevelCompletionDialog(props) {

    // Get gamification context
    const gamified = useContext(GamificationContext)

    // Add translation
    const { t } = useTranslation();

    // Use navigation to redirect
    const navigate = useNavigate()

    // Get scenario from URL
    const { scenarioId, levelId } = useParams()

    // Anchor element for popper
    const [anchorEl, setAnchorEl] = useState(null)
    const [popperContent, setPopperContent] = useState(null)

    // Get completed achievements
    const achievements = props.allAchievements.filter(
        (achievement) => props.completed.achievements?.map(a => a.id).includes(achievement.id)
    )

    const drawStars = useCallback((node) => {
        // Clear node
        d3.select(node).selectAll("*").remove()

        // Prepare svg
        const svg = d3.select(node)
            .append("svg")
            .attr("viewBox", "-150 0 300 150")
            .attr("width", 300)
            .attr("height", 150)

        // Draw stars
        const stars = svg.append("g")
            .attr("transform", "translate(0, 225)")
            .selectAll("polygon")
            .data(props.completed.stars)
            .enter()
            .append("polygon")
            .attr("points", "0,-5 -1.29,-1.78 -4.76,-1.55 -2.09,0.68 -2.94,4.05 0,2.2 2.94,4.05 2.09,0.68 4.76,-1.55 1.29,-1.78")
            .attr("transform", (d, i) => `rotate(${i * 30 - 30}) translate(0, -160) scale(6)`)
            .style("fill", d => d ? "#FFD700" : "#D3D3D3")
            .style("stroke", d => d ? "#ccad00" : "#a0a0a0")
            .style("stroke-width", 0.5)
            .style("opacity", 0)
            .on("mouseover", function(e, d) {
                let el = d3.select(this)._groups[0][0]
                // Add text to explain stars
                let i = stars.nodes().indexOf(this)
                setAnchorEl(el)
                setPopperContent(<Typography>{t(`level.completed.star${i + 1}.${d ? 'success' : 'failure'}`)}</Typography>)
            })
            .on("mouseout", function() {
                setAnchorEl(null)
            })
            
        stars.transition()
            .styleTween("opacity", (d) => d3.interpolateNumber(0, 1))
            .attrTween("transform", (d, i) => d3.interpolateTransformSvg(`rotate(${i * 30 - 30}) translate(0, -160) scale(${d ? 8 : 6})`, `rotate(${i * 30 - 30}) translate(0, -160) scale(${d ? 10 : 7})`))
            .delay((d, i) => i * 500)
            .duration(500)
            .transition()
            .attrTween("transform", (d, i) => d3.interpolateTransformSvg(`rotate(${i * 30 - 30}) translate(0, -160) scale(${d ? 10 : 7})`, `rotate(${i * 30 - 30}) translate(0, -160) scale(${d ? 6 : 6})`))
            .duration(500)
        }, [props.completed.stars])

    // Return completion dialog
    return <>
        <Dialog
            open={true}
            onClose={() => navigate('/', { state: { prevScenario: scenarioId, prevLevel: levelId } })}
            sx={{ '& .MuiBackdrop-root': { opacity: '0 !important' } }}
            PaperProps={{ sx: { borderRadius: 2, overflow: 'visible' } }}
        >
            {gamified ? 
                <DialogContent sx={{ overflow: 'visible' }}>
                    <Box ref={drawStars} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }} />
                    <Typography variant="h5" textAlign={'center'} paddingBottom={1}>{t('level.completed.title')}</Typography>
                    <Typography textAlign={'center'}>
                        <Trans i18nKey='level.completed.text_time' >
                            You successfully finished the level in {{minutes: Math.floor(props.completed.total_time / 60)}} minutes and {{seconds: props.completed.total_time % 60}} seconds!
                        </Trans>
                    </Typography>
                    {achievements?.length > 0 && <>
                        <Typography textAlign={'center'}>{t('level.completed.achievement_text')}</Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 1, gap: 1, maxHeight: '40vh', overflow: 'visible' }}>
                        {achievements.map((achievement, index) => 
                            <Achievement 
                                key={`achievement-${index}`} 
                                {...achievement} achieved={true} 
                                sx={{ 
                                    opacity: 0,
                                    animation: 'achievement-appear 0.5s forwards',
                                    animationDelay: `${2 + index * 0.5}s`,
                                }}
                            />
                        )}
                        </Box>
                    </>}
                </DialogContent>
            :
                <DialogContent>
                    <Typography variant="h5" textAlign={'center'} paddingBottom={1}>{t('level.completed.title')}</Typography>
                    <Typography textAlign={'center'}>{t('level.completed.text')}</Typography>
                </DialogContent>
            }
            <DialogActions>
                <Button onClick={() => navigate('/', { state: { prevScenario: scenarioId, prevLevel: levelId } })} color="primary">
                    {t('level.completed.continue')}
                </Button>
            </DialogActions>
        </Dialog>
        <Backdrop open={true} sx={{ zIndex: 1250 }} />
        <Popper open={Boolean(anchorEl)} anchorEl={anchorEl} placement='top' sx={{ zIndex: 2000 }}>
            <Box sx={{
                padding: '0.5rem 1rem',
                border: '1px solid',
                borderColor: 'rgba(0,0,0,0.2)',
                margin: '0.5rem',
                backgroundColor: (theme) => theme.palette.background.paper,
                borderRadius: '0.5rem',
                boxShadow: '0 2px 8px 0 rgba(0,0,0,0.1)',
            }}>
                {popperContent}
            </Box>
        </Popper>
        <TutorialDialog page='completion' />
    </>
}

export default LevelCompletionDialog