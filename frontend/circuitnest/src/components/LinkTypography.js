import styled from "@emotion/styled";
import { Typography } from "@mui/material";
import { Link } from "react-router-dom";

const StyledTypography = styled(Typography, {
    name: 'link', // The component name
    })(({ theme }) => ({
        color: theme.palette.text.primary,
        textDecoration: 'none',
        '&:hover, &.Mui-focusVisible': {
            color: theme.palette.text.secondary,
        },
    }));

const LinkTypography = (props) => <StyledTypography component={Link} {...props} />;

export default LinkTypography