import { createTheme } from '@mui/material/styles';

declare module '@mui/material/styles' {
    interface Theme {
      status: {
        danger: string;
      };
    }
    // allow configuration using `createTheme`
    interface ThemeOptions {
      status?: {
        danger?: string;
      };
    }
  }  

// Create a theme instance.
const theme = createTheme({
    
    palette: {
        primary: {
          main: '#b4f8c8',
          light: '#C3F9D3',
          dark: '#457954'
        },
        secondary: {
          main: '#72435c',
          light: '#8E687C',
          dark: '4F2E40'
        },
        background: {
          default: '#f2f2f2',
        },
        text: {
          primary: '#424651',
          secondary: '#D8CEE6',
        },
      },
      typography: {
        fontFamily: ["'Poppins', sans-serif",
        "'Righteous', cursive", "'Spline Sans Mono', cursive"].join(',')
      },
      
});

export default theme;

