import { Box, Popper, Typography } from "@mui/material"
import CosmeticOption from "./CosmeticOption"
import { useTranslation } from "react-i18next"
import { useState } from "react"

function CosmeticSlot(props) {
    const { t } = useTranslation()

    const { slot, equippedCosmetic, allCosmetics, setCosmetic } = props

    const [anchorEl, setAnchorEl] = useState(null)

    const toggleMenu = (event) => {
        setAnchorEl(anchorEl ? null : event.currentTarget)
    }

    return <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <CosmeticOption
            name={t(equippedCosmetic?.name)}
            visual={equippedCosmetic?.visual}
            unlocked={true}
            onClick={toggleMenu}
        />
        <Typography variant="body">{t(`avatar.${slot}`)}</Typography>
        <Popper id={`popper-${slot}`} open={Boolean(anchorEl)} anchorEl={anchorEl} placement="right">
            <Box sx={{ 
                display: 'flex', 
                flexDirection: 'row', 
                flexWrap: 'wrap', 
                alignItems: 'center',
                margin: 1,
                padding: 1,
                gap: 0.5,
                maxWidth: 302, // Fit 4 items
                backgroundColor: (theme) => theme.palette.background.paper,
                border: (theme) => `1px solid ${theme.palette.grey[200]}`,
                borderRadius: 1,
                boxShadow: '0px 4px 8px rgb(0 0 0 / 0.1)'
            }}>
                {allCosmetics?.map((cosmetic) => {
                    return <CosmeticOption 
                        key={`cosmetic-${cosmetic.id}`} 
                        name={cosmetic.name} 
                        visual={cosmetic.visual} 
                        unlocked={cosmetic.unlocked} 
                        onClick={() => setCosmetic(cosmetic)} 
                    />
                })}
            </Box>
        </Popper>
    </Box>
}

export default CosmeticSlot