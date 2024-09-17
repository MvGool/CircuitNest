import { forwardRef, useContext, useEffect, useState } from "react";
import { Box, Dialog, DialogContent, Grow, Slide, Typography } from "@mui/material";
import teacherOwl from '../assets/teacher_owl.svg';
import { GamificationContext } from "../contexts";

const Transition = forwardRef(function Transition(props, ref) {
    return <Grow ref={ref} {...props} />;
});

function TeacherDialog({ open, setOpen, text, ...props }) {

    // Get gamification context
    const gamified = useContext(GamificationContext)

    // State for the dialog reveal
    const [revealedText, setRevealedText] = useState('')

    useEffect(() => {
        if (open) {
            let i = revealedText.length
            let newText = revealedText
            const interval = setInterval(() => {
                newText += text.charAt(i)
                setRevealedText(newText)
                i++
                if (i > text.length) {
                    clearInterval(interval)
                }
            }, 25)
            return () => clearInterval(interval)
        }
    }, [open, text, revealedText])

    return <>
        <Dialog 
            open={open} 
            onClose={() => {setOpen(false)}} 
            onClick={() => {setOpen(false)}} 
            sx={{ overflow: 'visible' }} 
            TransitionComponent={Transition}
            fullWidth
        >
            <DialogContent sx={{ display: 'flex', textWrap: 'wrap' }}>
                <Typography sx={{ whiteSpace: 'pre-wrap'}}>{revealedText}</Typography>
            </DialogContent>
        </Dialog>
        {gamified && <Slide
            direction="right" 
            in={open} 
            mountOnEnter 
            easing={{
                enter: "cubic-bezier(0, 1.5, .7, 1)",
                exit: "linear"
            }}
        >
            <Box sx={{ display: 'flex', zIndex: 1500, justifyContent: 'flex-end', position: 'absolute', left: 0, bottom: 0, height: '50vh', width: 'calc(50vw - 250px)' }}>
                <img src={teacherOwl} alt="" />
            </Box>
        </Slide>}
    </>
}

export default TeacherDialog;