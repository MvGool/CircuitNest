import { Box } from "@mui/material";
import AvatarBird from "./avatar/AvatarBird";
import { useQuery } from "react-query";
import { fetchFromApi } from "../util/apiCalls";

function Podium({firstPlace, secondPlace, thirdPlace}) {
    // Fetch the avatars
    const firstPlaceQuery = useQuery({ queryKey: [`/avatars/${firstPlace?.avatar}/`], queryFn: fetchFromApi, enabled: typeof firstPlace?.avatar === 'number'})
    const secondPlaceQuery = useQuery({ queryKey: [`/avatars/${secondPlace?.avatar}/`], queryFn: fetchFromApi, enabled: typeof secondPlace?.avatar === 'number'})
    const thirdPlaceQuery = useQuery({ queryKey: [`/avatars/${thirdPlace?.avatar}/`], queryFn: fetchFromApi, enabled: typeof thirdPlace?.avatar === 'number'})

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
            <svg 
                version="1.1"
                viewBox="0 -200 452.8 320.5" 
            >
                {/* Third place */}
                <g>
                    <path style={{fill: '#CD7F31'}} d="M302.4,86.1c0-16.1,3.2-34.7,6.7-38c0,4.1,31.5,7.4,49.3,7.3c19.4,0,47.9-2.4,47.9-6.6
                        c4,4.4,6.4,24.6,6.7,37.3c-8.9,3.7-22.4,5.8-54.3,5.9C329.3,92,309.6,89.5,302.4,86.1z"/>
                    <path style={{fill: '#A3A2A2'}} d="M359.6,55.3c20,0,46.6-2.7,46.8-6.6c0.1-3.7-24.5-8.5-46.9-8.9c-24.2-0.4-50.4,4.3-50.3,8.1
                        C309.2,52.1,337.5,55.3,359.6,55.3z"/>
                    <g>
                        <path style={{fill: '#FFF9D6'}} d="M352.8,78.8c0.6,0.4,2.1,1.1,3.7,1.1c2.9,0,3.8-1.9,3.8-3.2c0-2.3-2.1-3.3-4.3-3.3h-1.3v-1.7h1.3
                            c1.6,0,3.7-0.8,3.7-2.8c0-1.3-0.9-2.5-2.9-2.5c-1.3,0-2.6,0.6-3.3,1.1l-0.6-1.6c0.9-0.6,2.6-1.3,4.4-1.3c3.3,0,4.8,2,4.8,4
                            c0,1.7-1,3.2-3.1,3.9v0.1c2.1,0.4,3.7,2,3.7,4.3c0,2.7-2.1,5-6.1,5c-1.9,0-3.5-0.6-4.4-1.1L352.8,78.8z"/>
                    </g>
                    {!thirdPlaceQuery.isLoading && thirdPlaceQuery.data && 
                        <foreignObject x="245" y="-155" width="220px" height="220px">
                            <AvatarBird avatar={thirdPlaceQuery.data} />
                        </foreignObject>
                    }
                </g>
                {/* Second place */}
                <g>
                    <path style={{fill: '#C0C0BF'}} d="M17.6,87.5c0-20.1,4-43.4,8.4-47.5c0,5.2,39.3,9.3,61.7,9.1c24.2,0,59.9-2.9,59.9-8.2
                        c5,5.5,8,30.7,8.4,46.6c-11.1,4.6-28.1,7.3-67.9,7.3C51.2,94.9,26.5,91.8,17.6,87.5z"/>
                    <path style={{fill: '#A3A2A2'}} d="M89,49.1c25,0,58.3-3.4,58.4-8.2c0.1-4.7-30.6-10.6-58.6-11.1C58.7,29.3,25.9,35.1,26,40
                        C26,45.1,61.3,49.1,89,49.1z"/>
                    <g>
                        <path style={{fill: '#FFFAD8'}} d="M79.9,81.7V80l2.2-2.2c5.3-5.1,7.8-7.8,7.8-10.9c0-2.1-1-4.1-4.2-4.1c-1.9,0-3.5,1-4.4,1.8l-0.9-2
                            c1.4-1.2,3.5-2.1,5.9-2.1c4.5,0,6.4,3.1,6.4,6.1c0,3.9-2.8,7-7.2,11.2l-1.7,1.5v0.1h9.4v2.4H79.9z"/>
                    </g>
                    {!secondPlaceQuery.isLoading && secondPlaceQuery.data && 
                        <foreignObject x="-45" y="-200" width="260px" height="260px">
                            <AvatarBird avatar={secondPlaceQuery.data} />
                        </foreignObject>
                    }
                </g>
                {/* First place */}
                <g>
                    <path style={{fill: '#FFD700'}} d="M126.6,100.6c0-28.7,5.7-62,12-67.9c0,7.4,56.2,13.3,88.1,13c34.6,0,85.5-4.2,85.5-11.7
                        c7.1,7.9,11.5,43.9,12,66.6c-15.8,6.6-40.1,10.4-97,10.5C174.6,111.1,139.4,106.7,126.6,100.6z"/>
                    <path style={{fill: '#A3A2A2'}} d="M228.8,45.7c35.7,0,83.3-4.8,83.5-11.7c0.2-6.7-43.7-15.2-83.7-15.8c-43.2-0.7-90,7.6-89.9,14.6
                        C138.7,39.9,189.2,45.7,228.8,45.7z"/>
                    <g>
                        <path style={{fill: '#FFFAD8'}} d="M224.5,66.1L224.5,66.1l-5.3,2.8l-0.8-3.1l6.5-3.5h3.5v29.9h-3.9V66.1z"/>
                    </g>
                    {!firstPlaceQuery.isLoading && firstPlaceQuery.data && 
                        <foreignObject x="65" y="-265" width="320px" height="320px">
                            <AvatarBird avatar={firstPlaceQuery.data} />
                        </foreignObject>
                    }
                </g>
            </svg>

        </Box>
    )
}

export default Podium;