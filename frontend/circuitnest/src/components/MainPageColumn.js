import { Box, Typography } from "@mui/material"
import ContentBox from "./ContentBox"

function MainPageColumn (props) {
    return <Box sx={{ display: 'flex', flexDirection: 'column', padding: (theme) => theme.spacing(2), height: props.fullHeight && '100%', ...props.sx }} onClick={props.onClick}>
        {/* Column title */}
        <Typography variant="h5" color={(theme) => props.invertedColor ? theme.palette.primary.contrastText : 'primary'}>{props.title}</Typography>
        {/* Column content */}
        <ContentBox sx={{ margin: 0, display: 'flex', flexDirection: 'column', height: props.fullHeight && '100%', ...props.contentBoxSx }}>
            {props.children}
        </ContentBox>
    </Box>
}

export default MainPageColumn