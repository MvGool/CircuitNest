import { Box, Typography } from "@mui/material";

function LeaderboardEntry({user, type, ...props}) {
    return <Box key={`leaderboard-${user.username}`} sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body">{user.username}</Typography>
        <Typography variant="body" width={32} textAlign={'center'}>{type === 'stars' ? user.total_stars : user.total_levels}</Typography>
    </Box>
}

export default LeaderboardEntry;