import { styled } from "@mui/material"

const BodyText = styled('div')(({ theme }) => ({
    ...theme.typography.body1,
}))

export default BodyText