// EventTheme.js - Sistema de design centralizado para componentes de eventos

export const EventTheme = {
  // Paleta de cores
  colors: {
    // Cores primárias
    primary: {
      50: '#EFF6FF',
      100: '#DBEAFE',
      500: '#3B82F6',
      600: '#2563EB',
      700: '#1D4ED8',
      900: '#1E3A8A',
    },

    // Cores secundárias
    secondary: {
      50: '#F0FDF4',
      100: '#DCFCE7',
      500: '#22C55E',
      600: '#16A34A',
      700: '#15803D',
    },

    // Cores de status
    success: {
      50: '#F0FDF4',
      500: '#10B981',
      600: '#059669',
      700: '#047857',
    },

    error: {
      50: '#FEF2F2',
      500: '#EF4444',
      600: '#DC2626',
      700: '#B91C1C',
    },

    warning: {
      50: '#FFFBEB',
      500: '#F59E0B',
      600: '#D97706',
      700: '#B45309',
    },

    // Cores neutras
    gray: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827',
    },

    // Cores especiais
    white: '#FFFFFF',
    black: '#000000',
    transparent: 'transparent',
  },

  // Tipografia
  typography: {
    fontFamily: {
      regular: 'System',
      medium: 'System',
      bold: 'System',
    },

    fontSize: {
      xs: 12,
      sm: 14,
      base: 16,
      lg: 18,
      xl: 20,
      '2xl': 24,
      '3xl': 30,
      '4xl': 36,
    },

    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },

    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
  },

  // Espaçamento
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    '3xl': 32,
    '4xl': 40,
    '5xl': 48,
    '6xl': 64,
  },

  // Bordas e raios
  borderRadius: {
    none: 0,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    '2xl': 20,
    full: 9999,
  },

  // Sombras
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 5,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
      elevation: 8,
    },
    xl: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 12,
    },
  },

  // Componentes específicos
  components: {
    card: {
      backgroundColor: '#FFFFFF',
      borderRadius: 16,
      padding: 16,
      ...{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
        elevation: 8,
      },
    },

    badge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      fontSize: 12,
      fontWeight: '600',
    },

    button: {
      primary: {
        backgroundColor: '#3B82F6',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
      },
      secondary: {
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
      },
    },
  },
};

// Utilitários para facilitar o uso do tema
export const createStyles = styleFunction => {
  return styleFunction(EventTheme);
};

// Função para obter cores com opacidade
export const getColorWithOpacity = (color, opacity) => {
  // Converte hex para rgba
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

// Função para criar estilos responsivos
export const createResponsiveStyle = (baseStyle, screenWidth) => {
  const breakpoints = {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
  };

  if (screenWidth < breakpoints.sm) {
    return { ...baseStyle, ...baseStyle.sm };
  } else if (screenWidth < breakpoints.md) {
    return { ...baseStyle, ...baseStyle.md };
  } else if (screenWidth < breakpoints.lg) {
    return { ...baseStyle, ...baseStyle.lg };
  } else {
    return { ...baseStyle, ...baseStyle.xl };
  }
};

export default EventTheme;
