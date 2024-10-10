import {createRoot} from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import '@mantine/core/styles.css';
import {createTheme, MantineColorsTuple, MantineProvider} from "@mantine/core";

const myColor: MantineColorsTuple = [
    '#f7ecff',
    '#e7d6fb',
    '#caaaf1',
    '#ac7ce8',
    '#9354e0',
    '#833bdb',
    '#7b2eda',
    '#6921c2',
    '#5d1cae',
    '#501599'
];

const theme = createTheme({
    colors: {
        myColor,
    },
    primaryColor: 'myColor'
});



createRoot(document.getElementById('root')!).render(
    <MantineProvider theme={theme}>
        <App/>
    </MantineProvider>
)
