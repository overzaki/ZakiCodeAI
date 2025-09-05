import React, {ReactNode} from 'react';
import {Box} from "@mui/material";

interface IBackgroundGradientSectionProps {

    children?: ReactNode
}

const RoundedBlurSection = ({
                                children
                            }: IBackgroundGradientSectionProps) => {
    return (
        <Box sx={{}}>
            {/*<Box*/}
            {/*    sx={{*/}
            {/*        width: '100%',*/}
            {/*        height: '100%',*/}
            {/*        backgroundColor: 'transparent',*/}
            {/*        borderRadius: '50% 50% 0 0',*/}
            {/*        position: 'relative',*/}
            {/*        border: 'none', // Add border here*/}
            {/*    }}*/}
            {/*>*/}
            {/*    <Box*/}
            {/*        sx={{*/}
            {/*            position: 'absolute',*/}
            {/*            bottom: 0,*/}
            {/*            left: 0,*/}
            {/*            width: '100%',*/}
            {/*            height: '50%',*/}
            {/*            backgroundColor: 'secondary.main',*/}
            {/*            borderRadius: '0 0 50% 50%',*/}
            {/*            border: '2px solid #000', // Add border here*/}
            {/*        }}*/}
            {/*   >*/}
            {/*</Box>*/}
            {/*<Box*/}
            {/*    sx={{*/}
            {/*        width: '100%',*/}
            {/*        height: '100%',*/}
            {/*        borderRadius: '0 0 50% 50%',*/}
            {/*        background: 'linear-gradient(to bottom, #007bff, #0062cc)',*/}
            {/*    }}*/}
            {/*>*/}

            {/*    {children}*/}
            {/*</Box>*/}
        </Box>
    );
};

export default RoundedBlurSection;