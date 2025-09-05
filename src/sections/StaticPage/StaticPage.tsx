import Container from "@mui/material/Container";
import {Typography} from "@mui/material";
import IStaticPageType from "@/api/static-page/interface";

export default async function StaticPage({page}: IStaticPageType) {
    const {title, content} = page;

    return (
        <Container>
            <Typography variant="h1" color="textSecondary" textAlign="center">
                {title}
            </Typography>
            {
                content &&
                <Typography variant="body1" color="textSecondary" my={5}
                            sx={{
                                whiteSpace: "pre-wrap",
                                "& > img": {
                                    width: '100%',
                                    position: 'relative'
                                }
                            }}
                            dangerouslySetInnerHTML={{__html: content}}
                />
            }
        </Container>
    )
}