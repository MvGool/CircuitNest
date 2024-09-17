import { Accordion, AccordionDetails, AccordionSummary, Box, Divider, Drawer, Toolbar, Typography } from "@mui/material"
import { useQuery } from "react-query"
import { fetchFromApi } from "../util/apiCalls"
import React, { useEffect, useState } from "react"
import DOMPurify from "dompurify"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"

// Guide component
function Guide({info}) {
    // Open state
    const [open, setOpen] = useState(false)

    return <Accordion disableGutters elevation={0} square sx={{ width: 500, border: (theme) => `1px solid ${theme.palette.divider}`, '&:not(:last-child)': { borderBottom: 0 } }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ backgroundColor: 'rgba(0, 0, 0, .03)' }} >{info.title}</AccordionSummary>
        <AccordionDetails sx={{ borderTop: '1px solid rgba(0, 0, 0, .125)' }} dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(info.content)}} />
    </Accordion>
}

function HelpDrawer(props) {

    // Information query
    const informationQuery = useQuery({ queryKey: [`/information-guide/`], queryFn: fetchFromApi })

    // Information state
    const [information, setInformation] = useState([])

    // Get the information from the levels
    useEffect(() => {
        if (informationQuery.data) {
            let info = informationQuery.data?.map((level) => {
                const parsedGuides = level.guides?.map(guide => {
                        guide.content = guide.content.replaceAll("src='", 
                            !process.env.NODE_ENV || process.env.NODE_ENV === 'development' ? 
                                "src='http://localhost:8000/mediafiles/visuals/"
                            :
                                "src='http://circuitnest.mazyar.co.nl/mediafiles/visuals/"
                            )
                        return guide
                    })    
                return parsedGuides
            }).flat().filter(a => a)
            setInformation(info)
        }
    }, [informationQuery.data])

    return <Drawer
        anchor="right"
        open={props.open}
        onClose={() => props.setOpen(false)}
    >
        {/* Toolbar for the header offset */}
        <Toolbar />
        
        {/* Drawer content */}
        <Box sx={{ display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
            {information.map((info, index) => 
                <React.Fragment key={index}>
                    <Guide info={info} />
                </React.Fragment>
            )}
        </Box>
    </Drawer>
}

export default HelpDrawer