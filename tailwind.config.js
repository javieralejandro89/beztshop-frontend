/** @type {import('tailwindcss').Config} */

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
  	container: {
  		center: true,
  		padding: '2rem',
  		screens: {
  			'2xl': '1400px'
  		}
  	},
  	extend: {
  		colors: {
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			primary: {
  				'50': '#FFFEF0',
  				'100': '#FFFACD',
  				'200': '#FFF68F',
  				'300': '#FFEC8B',
  				'400': '#FFE55C',
  				'500': '#FFD700',
  				'600': '#E6C200',
  				'700': '#B39700',
  				'800': '#806D00',
  				'900': '#4D4200',
  				'950': '#1A1700',
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			accent: {
  				'50': '#E6F9FF',
  				'100': '#CCF2FF',
  				'200': '#99E5FF',
  				'300': '#66D9FF',
  				'400': '#33CCFF',
  				'500': '#00C8FF',
  				'600': '#00A0CC',
  				'700': '#007899',
  				'800': '#005066',
  				'900': '#002833',
  				DEFAULT: '#00C8FF'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			darkbg: {
  				DEFAULT: '#0D0D0D',
  				light: '#1F1F1F',
  				lighter: '#2A2A2A'
  			},
  			gold: {
  				DEFAULT: '#FFD700',
  				light: '#FFE55C',
  				dark: '#B39700'
  			},
  			cyan: {
  				DEFAULT: '#00C8FF',
  				light: '#33CCFF',
  				dark: '#007899'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			},
  			'fade-in': {
  				'0%': {
  					opacity: '0',
  					transform: 'translateY(10px)'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'translateY(0)'
  				}
  			},
  			'slide-in-right': {
  				'0%': {
  					transform: 'translateX(100%)'
  				},
  				'100%': {
  					transform: 'translateX(0)'
  				}
  			},
  			'pulse-gentle': {
  				'0%, 100%': {
  					opacity: '1'
  				},
  				'50%': {
  					opacity: '0.8'
  				}
  			},
  			'bounce-gentle': {
  				'0%, 100%': {
  					transform: 'translateY(0)'
  				},
  				'50%': {
  					transform: 'translateY(-5px)'
  				}
  			},
  			'neon-glow': {
  				'0%, 100%': {
  					textShadow: '0 0 10px rgba(0, 200, 255, 0.5)'
  				},
  				'50%': {
  					textShadow: '0 0 20px rgba(0, 200, 255, 0.8)'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  			'fade-in': 'fade-in 0.5s ease-out',
  			'slide-in-right': 'slide-in-right 0.3s ease-out',
  			'pulse-gentle': 'pulse-gentle 2s ease-in-out infinite',
  			'bounce-gentle': 'bounce-gentle 0.5s ease-in-out',
  			'neon-glow': 'neon-glow 2s ease-in-out infinite'
  		},
  		boxShadow: {
  			'glow-gold': '0 0 20px rgba(255, 215, 0, 0.3)',
  			'glow-cyan': '0 0 20px rgba(0, 200, 255, 0.3)',
  			'card-hover': '0 10px 40px rgba(255, 215, 0, 0.1)'
  		},
  		backdropBlur: {
  			xs: '2px'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;