import { Droppable } from 'react-beautiful-dnd'
import { Box, Typography } from '@mui/material'
import DraggableBox from './DraggableBox'
import { useTranslation } from 'react-i18next';

function DroppableBox(props) {

    // Add translation
    const { t } = useTranslation();

    // Create groups for when itemsPerRow is set
    const group = (items, n) => items.reduce((acc, item, i) => {
        const groupIndex = Math.floor(i / n)
        acc[groupIndex] = [...(acc[groupIndex] || []), item]
        return acc    
    }, [])

    const itemsPerRow = props.itemsPerRow || props.items.length

    return props.isDropDisabled ? (
        <Box sx={{ display: 'flex', flexDirection: props.direction === 'vertical' ? 'row' : 'column' }}>
            {group(props.items, itemsPerRow).map((group, groupIndex) =>
                <Box key={`key-${props.droppableId}-${groupIndex}`} sx={{ display: 'flex', flexDirection: props.direction === 'vertical' ? 'column' : 'row' }}>
                    {group.map((item, index) =>
                        <Droppable {...props} key={`key-${props.droppableId}-${index+groupIndex*itemsPerRow}`} droppableId={`${props.droppableId}-${index+groupIndex*itemsPerRow}`}>
                            {(provided) => (
                                <>
                                    <Box 
                                        ref={provided.innerRef} 
                                        {...provided.droppableProps} 
                                        sx={{ 
                                            width: `${100/itemsPerRow}%`,
                                            userSelect: 'none', 
                                            ...props.sx 
                                        }}
                                    >
                                        <DraggableBox
                                            key={item.id} 
                                            index={index+groupIndex*itemsPerRow} 
                                            id={item.id} 
                                            fixed={props.isDropDisabled} 
                                            error={index === props.error}
                                            sx={{ flexGrow: 1 }}
                                            >
                                            <Typography>{item.name}</Typography>
                                        </DraggableBox>
                                    </Box>
                                    <Box style={{ display: 'none' }}>{provided.placeholder}</Box>
                                </>
                            )}
                        </Droppable>
                    )}
                </Box>
            )}
        </Box>
    ) : (
        <Droppable {...props}>
            {(provided) => (
                <Box 
                    ref={provided.innerRef} 
                    {...provided.droppableProps} 
                    sx={{ 
                        display: 'flex', 
                        flexDirection: props.direction === 'vertical' ? 'column' : 'row', 
                        userSelect: 'none', 
                        width: '100%',
                        overflow: 'auto',
                        ...props.sx 
                    }}
                >
                    {props.items.length ? (
                        <>
                            {props.items.map((item, index) => 
                                <DraggableBox 
                                    key={item.id} 
                                    index={index} 
                                    id={item.id} 
                                    fixed={props.isDropDisabled} 
                                    error={index === props.error}
                                >
                                    <Typography>{item.name}</Typography>
                                </DraggableBox>
                            )}
                            {provided.placeholder}
                        </>
                    ) : (
                        <Box sx={{ margin: 1, padding: 0.5, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <Typography>{t('level.drag_elements')}</Typography>
                            <Box style={{ display: 'none' }}>{provided.placeholder}</Box>
                        </Box>
                    )}
                </Box>
            )}
        </Droppable>
    )
}

export default DroppableBox