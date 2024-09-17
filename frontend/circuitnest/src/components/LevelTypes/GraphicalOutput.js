import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Box } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { submitAnswer } from '../../util/apiCalls';
import CircuitViewer from '../circuits/CircuitViewer';
import { AssignmentTurnedIn } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import TeacherDialog from '../TeacherDialog';
import { GamificationContext } from '../../contexts';

function GraphicalOutput(props) {

    // Get gamification context
    const gamified = useContext(GamificationContext)

    // Destruct props
    const { levelInfo, setError } = props

    // Add translation
    const { t } = useTranslation();

    // States for the submission
    const [checkCircuit, setCheckCircuit] = useState(false)
    const [submission, setSubmission] = useState(null)
    const [mistakes, setMistakes] = useState(0)

    // State for the teacher dialog
    const [teacherDialogOpen, setTeacherDialogOpen] = useState(false)

    // Submit the answer
    const submit = useCallback(async (submission) => {
        // Get truth table from submission
        let answer = []
        submission.forEach((row) => {
            answer.push(row.map((value) => value.signal))
        });
        // Send the answer to the API
        let { levelId, startType, total_time } = levelInfo
        const response = await submitAnswer(answer, levelId, startType, 'truth_table', total_time, mistakes)
        if (response.status === 'incorrect') {
            if (response.incorrect_line != null && response.incorrect_line !== -1) {
                !(gamified && props.levelInfo.challenge) && setError({line: response.incorrect_line, inputs: submission[response.incorrect_line]})
            }
            // TODO: handle incorrect answer
            setCheckCircuit(false)
            setTeacherDialogOpen(true)
            setMistakes(mistakes + 1)
        } else {
            // Level finished
            // TODO: handle level finished
            setCheckCircuit(false)
            setError(null)
            props.setCompleted(response)
        }
    }, [props, levelInfo, setError, mistakes])
    
    // When finished checking the circuit, submit the result
    useEffect(() => {
        if (checkCircuit && submission) {
            submit(submission)
            // Reset submission after submitting
            setSubmission(null)
        }
    }, [submission, checkCircuit, submit])

    let inputs = useMemo(() => props.data.inputs.map(input => {
    // Convert incoming data to the correct format
        return {
            name: input,
            label: input
        }
    }), [props.data.inputs])

    let outputs = useMemo(() => props.data.outputs.map(output => {
        return {
            name: output,
            label: output
        }
    }), [props.data.outputs])

    let availableGates = useMemo(() => props.data.gates.map(str => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()), [props.data.gates])

    const circuit = useMemo(() => {
        return <CircuitViewer 
            inputs={inputs} 
            outputs={outputs} 
            availableGates={availableGates} 
            checkCircuit={checkCircuit} 
            error={props.error?.inputs}
            setSubmission={setSubmission} 
        />
    }, [availableGates, checkCircuit, inputs, outputs, props.error?.inputs])

    return <>
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', position: 'relative' }}>
            {/* Show the graphical interface */}
            {circuit}
            {/* Submit button */}
            <LoadingButton 
                sx={{
                    position: 'absolute', 
                    top: (theme) => theme.spacing(1), 
                    right: (theme) => theme.spacing(1), 
                }}
                variant='contained' 
                onClick={() => setCheckCircuit(true)} 
                startIcon={<AssignmentTurnedIn />} 
                loading={checkCircuit} 
                loadingPosition='start' 
            >
                {checkCircuit ? t('level.checking') : t('level.submit')}
            </LoadingButton>
        </Box>
        <TeacherDialog 
            open={teacherDialogOpen} 
            setOpen={setTeacherDialogOpen} 
            text={t(`level.mistake_dialog.${(gamified && props.levelInfo.challenge) ? 'without_feedback' : 'with_feedback'}`)} 
        />
    </>
}


export default GraphicalOutput