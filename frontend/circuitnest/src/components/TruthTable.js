import { useTheme } from "@emotion/react"
import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, ToggleButton } from "@mui/material"

function TruthTable(props) {

    // Use MUI theme
    const theme = useTheme()

    return <Box>
        <TableContainer component={Paper} sx={{ width: 'fit-content', '& th, & td': {textAlign: 'center'} }}>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        {Object.keys(props.truthTable)?.map((key) => 
                            <TableCell key={`header-${key}`} sx={{ fontWeight: 'bold', borderLeft: props.outputs[0] === key ? `1px solid ${theme.palette.divider}` : null }}>{key}</TableCell>
                        )}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {props.truthTable[props.vars[0]]?.map((_, index) => 
                        <TableRow key={`row-${index}`}>
                            {Object.keys(props.truthTable)?.map((key) => 
                                <TableCell key={`${key}-${index}`} sx={{ borderLeft: props.outputs[0] === key ? `1px solid ${theme.palette.divider}` : null, borderBottom: `0` }}>
                                    <ToggleButton
                                        value={props.truthTable[key][index]}
                                        selected={props.truthTable[key][index]}
                                        onChange={() => props.updateValue ? props.updateValue(index, key) : null}
                                        disabled={props.fixed || !props.outputs?.includes(key)}
                                        sx={{ 
                                            heigth: theme.spacing(6), 
                                            width: theme.spacing(6), 
                                            '&, &:hover, &.Mui-selected, &.Mui-selected:hover': { 
                                                backgroundColor: props.outputs?.includes(key) && props.error === index ? theme.palette.error.main : null 
                                            },
                                            opacity: 'initial', 
                                            color: 'initial', 
                                            '&:disabled': { 
                                                opacity: 'initial', 
                                                color: 'initial' 
                                            } 
                                        }}
                                    >
                                        {props.truthTable[key][index] ? 1 : 0}
                                    </ToggleButton>
                                </TableCell>
                            )}
                        </TableRow> 
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    </Box>
}

export default TruthTable