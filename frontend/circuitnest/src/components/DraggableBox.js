import { Draggable } from 'react-beautiful-dnd'
import { Box } from '@mui/material'

function DraggableBox(props) {
    return <Draggable draggableId={props.id} index={props.index} style={{}}>
        {(provided, snapshot) => (
            <>
                <Box
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    {...props.sx}
                    sx={{ 
                        margin: 0.5, 
                        padding: 1,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        background: (theme) => theme.palette.background.paper, 
                        border: 1, 
                        borderColor: props.error ? 'error.main' : 'primary.main', 
                        borderRadius: 1 
                    }}
                >
                    {props.children}
                </Box>
                {props.fixed && snapshot.isDragging && (
                    <Box sx={{ 
                        margin: 0.5, 
                        padding: 1, 
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        background: (theme) => theme.palette.background.paper, 
                        border: 1, 
                        borderColor: 'primary.main', 
                        borderRadius: 1, 
                    }}>
                        {props.children}
                    </Box>
                )}
            </>
        )}
    </Draggable>
}

export default DraggableBox