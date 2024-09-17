import React, { useEffect, useState } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, Typography } from '@mui/material';
import { fetchFromApi, patchToApi } from '../../util/apiCalls';
import { useTranslation } from 'react-i18next';
import { useQuery } from 'react-query';
import AvatarBird from './AvatarBird';
import forestBackground from '../../assets/forest_background.jpg';
import CosmeticSlot from './CosmeticSlot';
import Achievement from '../Achievement';

const PALETTE_DEFAULT = { 
    legs: '#512F07', 
    wings: '#B78029', 
    body: '#FFD57F', 
    tail: '#A87129',
    head: '#FF993F', 
    hair: '#B78029', 
    beard: '#512F07', 
    blushes: '#FFB69F', 
    eyes: '#2B1806', 
    beakTop: '#512F07', 
    beakBottom: '#3A2107' 
}

const COSMETIC_SLOTS = [
    'hat', 'glasses', 'neck', 'item'
]

function AvatarCustomization(props) {

    // Add translation
    const { t } = useTranslation()

    // Get customization options from api
    const cosmeticQuery = useQuery({ queryKey: [`/cosmetics/personal/`], queryFn: fetchFromApi })

    // Palette state
    const [palette, setPalette] = useState({...PALETTE_DEFAULT, ...props.avatar.color_palette})

    // Cosmetic options state
    const [cosmetics, setCosmetics] = useState({})
    const [changedCosmetics, setChangedCosmetics] = useState({})

    // Achievements state
    const [achievements, setAchievements] = useState([])

    // Equip cosmetic function
    const equipCosmetic = (cosmetic) => {
        const equip = cosmetics[cosmetic.slot]?.id !== cosmetic.id
        // Document changes
        let newChanges = changedCosmetics
        newChanges[cosmetic.id] = equip
        if (cosmetics[cosmetic.slot]) newChanges[cosmetics[cosmetic.slot].id] = false
        
        // Update state
        setCosmetics({...cosmetics, [cosmetic.slot]: equip ? cosmetic : null})
        setChangedCosmetics(newChanges)
    }

    // Save avatar function
    const saveAvatar = async () => {
        // Save avatar to API
        patchToApi({ queryKey: `/avatars/${props.avatar.id}/`, data: { color_palette: palette } })
        // Save cosmetics to API
        let achs = []
        achs = await Promise.all(Object.entries(changedCosmetics).map(async ([id, equipped]) => {
            return patchToApi({ queryKey: `/avatar-cosmetics/${id}/`, data: { equipped } })
                .then((response) => {
                    return response.achievements
                })
        }))

        // Flatten en filter achievements to have an array of unique achievements
        setAchievements(achs.flat().filter((ach, index, self) => self.findIndex(a => a.id === ach.id) === index))
    }

    // Set cosmetic options on load
    useEffect(() => {
        if (cosmeticQuery.data) {
            const equippedCosmetics = {}
            cosmeticQuery.data.forEach((cosmetic) => {
                if (cosmetic.equipped) equippedCosmetics[cosmetic.slot] = cosmetic
            })
            setCosmetics(equippedCosmetics)
        }
    }, [cosmeticQuery.data])

    return <Box sx={{ display: 'flex', flexDirection: 'row', width: '100%', height: '100%', gap: 2 }}>
        {/* Customization options */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, overflowY: 'auto' }}>
            {COSMETIC_SLOTS.map((slot) => 
                <CosmeticSlot slot={slot} equippedCosmetic={cosmetics[slot]} allCosmetics={cosmeticQuery.data?.filter(c => c.slot === slot)} setCosmetic={equipCosmetic} />
            )}
        </Box>
        {/* Viewer */}
        <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, alignItems: 'center' }}>
            <Box sx={{ 
                backgroundImage: `url(${forestBackground})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                width: '100%', 
                height: '100%',
                maxHeight: '60vh',
                display: 'flex',
                flexDirection: 'column-reverse',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 1,
                paddingBottom: 2
            }}>
                <AvatarBird palette={palette} cosmetics={cosmetics} />
                <Button variant='contained' sx={{ width: 'fit-content', margin: 2 }} onClick={() => saveAvatar()}>{t('avatar.save')}</Button>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', height: '16%', width: '700px', padding: 1, gap: 1 }}>
                {/* Color selection */}
                {Object.entries(palette).map(([key, value]) => {
                    return <Box key={`palette-${key}`} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100px' }}>
                        <input type='color' value={value} onChange={(e) => setPalette({...palette, [key]: e.target.value})} />
                        <Typography variant='body' sx={{ textAlign: 'center' }}>{t(`avatar.${key}`)}</Typography>
                    </Box>
                })}
            </Box>
        </Box>
        {/* Show achievements if they have been achieved */}
        <Dialog
            open={achievements.length > 0}
            onClose={() => setAchievements([])}
            PaperProps={{ sx: { borderRadius: 2, overflow: 'visible' } }}
        >
            <DialogContent sx={{ overflow: 'visible', paddingBottom: 0 }}>
                <Typography textAlign={'center'}>{t('avatar.new_achievements')}</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 1, gap: 1, maxHeight: '40vh', overflow: 'visible' }}>
                {achievements.map((achievement, index) => 
                    <Achievement 
                        key={`achievement-${index}`} 
                        {...achievement} achieved={true} 
                        sx={{ 
                            opacity: 0,
                            animation: 'achievement-appear 0.5s forwards',
                            animationDelay: `${index * 0.5}s`,
                        }}
                    />
                )}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setAchievements([])} color="primary">
                    {t('avatar.continue')}
                </Button>
            </DialogActions>
        </Dialog>
    </Box>
}

export default AvatarCustomization