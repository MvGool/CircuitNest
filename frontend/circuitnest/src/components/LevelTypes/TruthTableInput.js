import React from 'react';
import { Box } from '@mui/material';
import TruthTable from '../TruthTable';

function TruthTableInput(props) {

    // Put truth table in correct format
    let vars = props.data.inputs.concat(props.data.outputs)
    let truthTable = {}
    for (let i = 0; i < vars.length; i++) {
        let column = []
        for (let j = 0; j < props.data.truth_table.length; j++) {
            column.push(props.data.truth_table[j][i])
        }
        truthTable[vars[i]] = (column)
    }

    return <Box>
        {/* Show the truth table */}
        <TruthTable vars={vars} truthTable={truthTable} outputs={props.data.outputs} error={props.error?.line} fixed />
    </Box>
}

export default TruthTableInput