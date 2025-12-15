import { MD3LightTheme, configureFonts } from 'react-native-paper';

const COLORS = {
  primary: '#378DD2',
  primaryDark: '#2B7BC1',
  primaryLight: '#E3F2FD', 
  
  secondary: '#50d2c2',
  secondaryDark: '#3DBFAF',
  
  background: '#F5F7FA', 
  surface: '#FFFFFF',
  
  patientBox: '#F8FCFF', 
  bgLight: '#E8EEF4',    
  bgPrice: '#F0F2F5',
  bgInput: '#FFFFFF',
  
  textMain: '#102A43',   
  textDark: '#333333',   
  textLight: '#627D98',  
  textSecondary: '#8F9BB3', 
  label: '#999999',      
  
  success: '#00B894',
  error: '#FF4D4F',
  warning: '#FFC107',
  
  border: '#EEF2F6',
};

const fontConfig = {
  displayLarge: { fontFamily: 'Articulat-Bold', fontSize: 38, lineHeight: 44, letterSpacing: -0.5 },
  headlineLarge: { fontFamily: 'Articulat-Bold', fontSize: 28, lineHeight: 34 },
  titleLarge: { fontFamily: 'Articulat-Bold', fontSize: 20, lineHeight: 26 },
  titleMedium: { fontFamily: 'Articulat-Bold', fontSize: 18, lineHeight: 24 },
  labelSmall: { fontFamily: 'Articulat-Bold', fontSize: 11, lineHeight: 16, letterSpacing: 1.0, textTransform: 'uppercase' as const },
  bodyLarge: { fontFamily: 'Articulat-Regular', fontSize: 16, lineHeight: 24 },
  bodyMedium: { fontFamily: 'Articulat-Medium', fontSize: 15, lineHeight: 22 },
} as const;

export const AppTheme = {
  ...MD3LightTheme,
  roundness: 16,
  fonts: configureFonts({config: fontConfig}),
  colors: {
    ...MD3LightTheme.colors,
    primary: COLORS.primary,
    secondary: COLORS.secondary,
    background: COLORS.background,
    surface: COLORS.surface,
    error: COLORS.error,
    onPrimary: '#FFFFFF',
  },
  custom: {
    ...COLORS,
    // STILE FLAT E PULITO (Usato per TUTTE le card)
    cardStyle: {
      backgroundColor: 'white',
      borderRadius: 20, // Radius coerente
      borderWidth: 1,
      borderColor: '#E0E6ED', // Bordo sottile grigio
      // Ombra inesistente/minimale per effetto "Clean"
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.02, 
      shadowRadius: 8,
      elevation: 0, 
    },
    // Ombra specifica solo per quando la card è BLOCCATA (per farla risaltare)
    shadowCardLocked: {
      shadowColor: "#50d2c2",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 3,
    },
    shadowButton: {
      shadowColor: "#378DD2",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 3,
    }
  }
};