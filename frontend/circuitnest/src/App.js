import './App.css';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from 'react-query';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import LevelPage from './pages/LevelPage';
import PageLayout from './pages/PageLayout';
import ErrorPage from './pages/ErrorPage';
import LoginPage from './pages/LoginPage';
import LevelSelectionPage from './pages/LevelSelectionPage';
import RegisterPage from './pages/RegisterPage';

function App() {

    const { palette } = createTheme();
    const { augmentColor } = palette;
    const createColor = (mainColor) => augmentColor({ color: { main: mainColor } });

    /**
     * Color palette used by all MUI components
     */
    const theme = createTheme({
        palette: {
            primary: createColor("#1C959B"),
            secondary: createColor("#1c9b62"),
            error: createColor("#ff515c"),

            informationLevel: createColor("#1C959B"),
            lockedLevel: createColor("#999999"),
            unlockedLevel: createColor("#ff515c"),
            completedLevel: createColor("#4caf50"),
            challengeLevel: createColor("#6600ff"),

            background: {
                default: "#e3f8cb",
                paper: "#f2f7ee",
                paper2: "#fafcf8",
                accent: "#d8ddd5",
                graphicalView: "#e5efdc",
            },
            text: {
                primary: "#000000",
                secondary: "#1C959B"
            },
        },
    })

    // Router containing all frontend routes
    const router = createBrowserRouter([
        {
            path: "/",
            element: <PageLayout />,
            errorElement: <ErrorPage />,
            children: [
                {
                    path: "",
                    element: <HomePage />
                },
                {
                    path: "login",
                    element: <LoginPage />
                },
                {
                    path: "register",
                    element: <RegisterPage />
                },
                {
                    path: "profile",
                    element: <ProfilePage />
                },
                {
                    path: "level",
                    element: <LevelSelectionPage />
                },
                {
                    path: "level/:scenarioId/:levelId",
                    element: <LevelPage />
                }
            ]
        }
    ])

    // Create a query client
    const queryClient = new QueryClient()

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <QueryClientProvider client={queryClient}>
                <RouterProvider router={router} />
            </QueryClientProvider>
        </ThemeProvider>
    );
}

export default App;
