import React, { useContext, useState } from 'react';
import { Box, Button } from '@mui/material';
import TruthTable from '../TruthTable';
import { submitAnswer } from '../../util/apiCalls';
import { useTranslation } from 'react-i18next';
import TeacherDialog from '../TeacherDialog';
import { GamificationContext } from '../../contexts';

function TruthTableOutput(props) {

    // Get gamification context
    const gamified = useContext(GamificationContext)

    // Add translation
    const { t } = useTranslation();

    // Fill truth table with default values
    let vars = props.data.inputs.concat(props.data.outputs)
    
    // State for the truth table
    const [table, setTable] = useState(createTruthTable(vars, props.data.outputs))

    // State for mistakes
    const [mistakes, setMistakes] = useState(0)

    // State for the teacher dialog
    const [teacherDialogOpen, setTeacherDialogOpen] = useState(false)

    // Update the value of a cell in the truth table
    function updateValue(row, col) {
        // Reset the error if the value is changed
        if (row === props.error?.line) props.setError(null)
        // Update the value in the truth table
        let newTable = {...table}
        newTable[col][row] = !table[col][row]
        setTable(newTable)
    }

    // Function to set error
    const setError = (incorrect_line) => {
        let inputs = []
        for (let i = 0; i < vars.length; i++) {
            inputs.push({ name: vars[i], signal: table[vars[i]][incorrect_line] })
        }
        props.setError({line: incorrect_line, inputs: inputs})
    }

    // Submit the answer
    const submit = async () => {
        let answer = []
        for (let i = 0; i < 2**(props.data.inputs.length); i++) {
            let row = []
            for (let j = 0; j < vars.length; j++) {
                row.push(table[vars[j]][i])
            }
            answer.push(row)
        }

        let { levelId, startType, endType, total_time } = props.levelInfo
        const response = await submitAnswer(answer, levelId, startType, endType, total_time, mistakes)
        if (response.status === 'incorrect') {
            if (response.incorrect_line != null && response.incorrect_line !== -1) {
                !(gamified && props.levelInfo.challenge) && setError(response.incorrect_line)
            }
            // TODO: handle incorrect answer
            setTeacherDialogOpen(true)
            setMistakes(mistakes + 1)
        } else {
            // Level finished
            // TODO: handle level finished
            props.setCompleted(response)
        }
    }

    return <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: 'fit-content' }}>
        {/* Show the truth table */}
        <TruthTable 
            vars={vars} 
            outputs={props.data.outputs} 
            truthTable={table} 
            updateValue={updateValue} 
            error={props.error?.line} 
        />
        {/* Submit button */}
        <Button variant='outlined' onClick={submit}>{t('level.submit')}</Button>
        <TeacherDialog
            open={teacherDialogOpen} 
            setOpen={setTeacherDialogOpen} 
            text={t(`level.mistake_dialog.${(gamified && props.levelInfo.challenge) ? 'without_feedback' : 'with_feedback'}`)} 
        />
    </Box>
}

function createTruthTable(vars, outputs) {
    let numInputs = vars.length - outputs.length
    let truthTable = {}
    // Add column for each input
    for (let i = 0; i < numInputs; i++) {
        let column = []
        for (let j = 0; j < 2**((numInputs)); j++) {
            // Use bitwise AND to alternate the inputs
            column.push((j & (1 << (numInputs-1-i))) > 0)
        }
        truthTable[vars[i]] = (column)
    }
    // Add empty output column
    for (let i = numInputs; i < vars.length; i++) {
        truthTable[vars[i]] = Array(2**(numInputs)).fill(false)
    }

    return truthTable
}

export default TruthTableOutput