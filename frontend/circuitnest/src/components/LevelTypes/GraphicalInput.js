import React, { useMemo } from 'react';
import { Box } from '@mui/material';
import CircuitViewer from '../circuits/CircuitViewer';

function GraphicalInput(props) {

    // Example circuit
    // const circuit = {
    //     "inputs": [
    //         { "name": "p", "label": "p" },
    //         { "name": "q", "label": "q" }
    //     ],
    //     "gates": [
    //         [
    //             { "name": "a_and_b", "inputs": ["p", "q"], "type": "and" },
    //             { "name": "a_or_b", "inputs": ["p", "q"], "type": "or" }
    //         ],
    //         [
    //             { "name": "a_and_b_or_b", "inputs": ["a_and_b", "q"], "type": "or" },
    //             { "name": "not_a_or_b", "inputs": ["a_or_b"], "type": "not" }
    //         ],
    //         [
    //             { "name": "a_and_b_or_b_xor_not_a_or_b", "inputs": ["a_and_b_or_b", "not_a_or_b"], "type": "xor" }
    //         ]
    //     ],
    //     "outputs": [
    //         { "name": "output", "label": "output", "input": "a_and_b_or_b_xor_not_a_or_b" }
    //     ]
    // }

    const circuit = useMemo(() => {
        if (props.data?.graphical) {
            return props.data.graphical
        }
    }, [props.data.graphical])

    return <Box sx={{ width: '100%', height: '100%'}}>
        {/* Show the graphical circuit */}
        <CircuitViewer inputs={circuit["inputs"]} gates={circuit["gates"]} outputs={circuit["outputs"]} error={props.error?.inputs} fixed />
    </Box>
}

export default GraphicalInput
