import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Box, IconButton } from '@mui/material';
import { Typography, Button } from "@mui/material";
import { convertToBitwise, convertToBooleanAlgebra, convertToCode, convertToLiteral, convertToMathematicalExpression } from "../../util/booleanConversion";
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import DroppableBox from '../DroppableBox';
import { Delete } from '@mui/icons-material';
import { submitAnswer } from '../../util/apiCalls';
import { useTranslation } from 'react-i18next';
import TeacherDialog from '../TeacherDialog';
import { v4 as uuidv4 } from 'uuid';
import { GamificationContext } from '../../contexts';

const POSSIBLE_GATES = ["AND", "OR", "XOR", "NOT", "(", ")"]

function BooleanOutput(props) {

    // Get gamification context
    const gamified = useContext(GamificationContext)

    // Add translation
    const { t } = useTranslation();

    // Representation state
    const [representation, setRepresentation] = useState("Mathematical")

    // Answer state
    const [answer, setAnswer] = useState([])
    const [error, setError] = useState(null)
    const [mistakes, setMistakes] = useState(0)

    // Teacher dialog state
    const [teacherDialogOpen, setTeacherDialogOpen] = useState(false)

    // Elements state
    const [variableElements, setVariableElements] = useState([])
    const [operatorElements, setOperatorElements] = useState([])

    // Get the elements from the boolean function
    const getElementsFromString = useCallback((operatorString) => {
        let elements = convertToRepresentation(operatorString, representation).split(" ")

        let elementsList = elements.filter((a) => a).map((element, index) => {
            return {name: element, id: uuidv4()}
        })

        return elementsList
    }, [representation])

    useEffect(() => {
        // Convert the boolean and split the function into elements
        setVariableElements(props.data.inputs.map((input) => {
            return {name: input, id: uuidv4()}
        }))    
        let operatorString = props.data.gates.filter((gate) => POSSIBLE_GATES.includes(gate)).join(" ").concat(" ( )")
        setOperatorElements(getElementsFromString(operatorString))
    }, [props.data, representation, getElementsFromString])    

    // Update the representation
    // const updateRepresentation = (value) => {
    //     setAnswer(answer.map((element) => { return {...element, name: convertToRepresentation(element.name, value)} }))
    //     setRepresentation(value)
    // }

    // Handle the drag end
    const handleDragEnd = (result) => {
        const { source, destination } = result
        // Remove the item if dropped outside of the answer
        if (!destination) {
            return
        }

        // Remove error if the answer is changed
        if (source.droppableId === "answer" || destination.droppableId === "answer") setError(null)

        // If the element is dropped in the bin, remove    
        if (source.droppableId === "answer" && destination.droppableId === "bin") {
            setAnswer(remove(
                answer,
                source.index
            ))
        } 
        // If the element came from the storage, copy
        else if (source.droppableId.includes("variable-storage") && destination.droppableId === "answer") {
            setAnswer(copy(
                variableElements,
                answer,
                source,
                destination
            ))
        } 
        // Place element depending on where it came from
        else if (source.droppableId.includes("operator-storage") && destination.droppableId === "answer") {
            // If the element came from the items, copy
            setAnswer(copy(
                operatorElements,
                answer,
                source,
                destination
            ))
        } 
        // If the element came from the answer, reorder
        else if (source.droppableId === "answer") {
            setAnswer(reorder(
                answer,
                source.index,
                destination.index
            ))
        }
    }

    // Submit the answer
    const submit = async () => {
        let answerString = answer.map((element) => element.name).join(" ")
        answerString = convertToBitwise(answerString)
        let { levelId, startType, endType, total_time } = props.levelInfo
        const response = await submitAnswer([answerString], levelId, startType, endType, total_time, mistakes)
        if (response.status === 'incorrect') {
            if (response.incorrect_line != null && response.incorrect_line !== -1) {
                !(gamified && props.levelInfo.challenge) && setError(response.incorrect_index)
            }
            // Handle incorrect answer
            setTeacherDialogOpen(true)
            setMistakes(mistakes + 1)
        } else {
            // Level finished
            props.setCompleted(response)
        }
    }

    return <Box sx={{ display: 'flex', flexDirection: 'row' }}>
        <DragDropContext onDragEnd={handleDragEnd}>
            {/* Answer field */}
            <Box sx={{ display: 'flex', flexDirection: 'column', width: 'calc(100% - 200px)', marginRight: 2 }}>
                <DroppableBox 
                    droppableId="answer" 
                    items={answer} 
                    error={error} 
                    direction='horizontal' 
                    sx={{ 
                        width: '100%', 
                        height: 'fit-content', 
                        padding: 1,
                        background: (theme) => theme.palette.background.accent, borderRadius: 1 
                    }} 
                />
                {/* Submit button */}
                <Button variant='outlined' onClick={submit} sx={{ marginTop: 1, width: 'fit-content' }}>
                    {t('level.submit')}
                </Button>
            </Box>
            {/* Storage field */}
            <Box sx={{ display: 'flex', flexDirection: 'column', width: '200px' }}>
                {/* Select Boolean representation type */}
                {/* <TextField 
                    id="representation-selection" 
                    label="Boolean representation"
                    sx={{ width: '200px' }}
                    onChange={(event) => {updateRepresentation(event.target.value)}}
                    value={representation}
                    select
                >
                    <MenuItem value="Mathematical">Mathematical</MenuItem>
                    <MenuItem value="Boolean Algebra">Boolean Algebra</MenuItem>
                    <MenuItem value="Code">Code</MenuItem>
                    <MenuItem value="Bitwise">Bitwise</MenuItem>
                    <MenuItem value="Literal">Literal</MenuItem>
                </TextField> */}
                <Typography>{t('level.available_elements')}</Typography>
                {/* <Box sx={{ display: 'flex', flexDirection: 'column' }}> */}
                    {/* Show the input elements */}
                    <DroppableBox 
                        droppableId="variable-storage" 
                        items={variableElements} 
                        direction='horizontal' 
                        isDropDisabled={true} 
                    />
                    {/* Show the available operators */}
                    <DroppableBox 
                        droppableId="operator-storage" 
                        items={operatorElements} 
                        direction='horizontal' 
                        isDropDisabled={true} 
                        itemsPerRow={3}
                    />
                {/* </Box> */}
                <Box 
                    sx={{ 
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        margin: 0.5, 
                        padding: 1, 
                        border: 1, 
                        borderColor: 'primary.main', 
                        borderRadius: 1 
                    }}
                >
                    <Droppable droppableId='bin'>
                        {(provided) => (
                            <Box 
                                ref={provided.innerRef} 
                                {...provided.droppableProps} 
                            >
                                <IconButton color='inherit' onClick={() => setAnswer([])}>
                                    <Delete />
                                </IconButton>
                                <Box style={{ display: 'none' }}>{provided.placeholder}</Box>
                            </Box>
                        )}
                    </Droppable>
                </Box>
            </Box>
        </DragDropContext>
        <TeacherDialog 
            open={teacherDialogOpen} 
            setOpen={setTeacherDialogOpen} 
            // text={t(`level.mistake_dialog.${(gamified && props.levelInfo.challenge) ? 'without_feedback' : 'with_feedback'}`)} 
            text={t(`level.mistake_dialog.without_feedback`)} 
        />
    </Box>
}

// Convert to representation
function convertToRepresentation(booleanString, representation) {
    let bitWiseBooleanString = convertToBitwise(booleanString)
    let convertedBoolean
    switch (representation) {
        case "Mathematical":
            convertedBoolean = convertToMathematicalExpression(bitWiseBooleanString)
            break;
        case "Boolean Algebra":
            convertedBoolean = convertToBooleanAlgebra(bitWiseBooleanString)
            break;
        case "Code":
            convertedBoolean = convertToCode(bitWiseBooleanString)
            break;
        case "Literal":
            convertedBoolean = convertToLiteral(bitWiseBooleanString)
            break;
        case "Bitwise":
            convertedBoolean = bitWiseBooleanString
            break;
        default:
            convertedBoolean = convertToMathematicalExpression(bitWiseBooleanString)
    }

    return convertedBoolean
}

// Reorder the answer
function reorder(list, startIndex, endIndex) {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
}

// Copy element to the answer
function copy(storage, list, source, destination) {
    const result = Array.from(list);
    const item = storage[source.index];
    result.splice(destination.index, 0, { ...item, id: uuidv4() });

    return result;
}

// Remove item from the answer
function remove(list, index) {
    const result = Array.from(list);
    result.splice(index, 1);

    return result;
}

export default BooleanOutput