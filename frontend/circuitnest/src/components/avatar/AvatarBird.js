import { useEffect, useState } from "react";
import { useQuery } from "react-query";
import { Box } from "@mui/material";
import { BirdStraight } from "./BirdStraight";
import { fetchFromApi } from "../../util/apiCalls";

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

function AvatarBird({avatar, ...props}) {

    // Fetch the unlocked cosmetics
    const cosmeticQuery = useQuery({ queryKey: [`/cosmetics/`], queryFn: fetchFromApi })

    // Cosmetic state
    const [cosmetics, setCosmetics] = useState({})

    useEffect(() => {
        if (avatar) {
            let equippedCosmetics = {}
            avatar.cosmetics.forEach((cosmetic) => {
                equippedCosmetics[cosmetic.slot] = cosmetic
            })
            setCosmetics(equippedCosmetics)
        }
    }, [avatar])

    return <BirdStraight {...{...PALETTE_DEFAULT, ...avatar?.color_palette, ...props.palette}} cosmetics={props.cosmetics || cosmetics} allCosmetics={cosmeticQuery.data || []} />
}

export default AvatarBird;

export const AvatarBirdPreLoaded = ({avatar, cosmeticData, cosmetics}) => {
    return <Box sx={{ width: 'fit-content', height: '100%' }}>
        <BirdStraight {...{...PALETTE_DEFAULT, ...avatar?.color_palette}} cosmetics={cosmetics} allCosmetics={cosmeticData} />
    </Box>
}
