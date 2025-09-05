import React, {ReactNode} from 'react';
import Header from "@/sections/Layout/Header/header";
import {Box} from "@mui/material";
import Footer from "@/sections/Layout/Footer/footer";

const AppLayout = ({children}: { children: ReactNode }) => {
    return (
        <Box sx={{
            flexGrow: 1,
            backgroundColor: 'primary.contrastText'
        }}>
            <Header/>
            <Box sx={{
                minHeight: '100vh',
            }}>
                {children}
            </Box>
            <Footer/>
        </Box>
    );
};

export default AppLayout;