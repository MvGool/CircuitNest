import { Box } from "@mui/material";
import BlockIcon from "@mui/icons-material/Block"

function CosmeticOption(props) {
    const disabledStyle = {
        opacity: 0.5,
        filter: 'grayscale(100%)'
    }
    return <Box 
        sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            border: (theme) => `1px solid ${theme.palette.grey[400]}`, 
            borderRadius: 1,
            cursor: 'pointer',
            padding: 1,

            ...(props.unlocked ? {} : disabledStyle)
        }}
        onClick={props.unlocked ? props.onClick : undefined}
    >
        {props.visual ? <img src={props.visual} alt={props.name} style={{ width: 50, height: 50 }} /> : <BlockIcon sx={{ width: 50, height: 50 }} />}
        {/* <Typography variant="body">{props.name}</Typography> */}
    </Box>
}

export default CosmeticOption;