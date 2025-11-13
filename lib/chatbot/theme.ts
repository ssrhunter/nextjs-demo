/**
 * Centralized theme configuration for chatbot components
 * Customize colors here to match your brand
 */

// Animated CSS Borders Documentation:
// https://www.letsbuildui.dev/articles/how-to-animate-borders-in-css/

export interface ChatbotTheme {
  // Primary brand colors
  primary: string;
  primaryHover: string;
  primaryDark: string;
  
  // Header
  headerBg: string;
  headerText: string;
  headerButtonHover: string;
  
  // Messages
  userMessageBg: string;
  userMessageText: string;
  assistantMessageBg: string;
  assistantMessageText: string;
  
  // Tool messages
  toolMessageBg: string;
  toolMessageText: string;
  toolMessageBorder: string;
  
  // Error messages
  errorMessageBg: string;
  errorMessageText: string;
  errorMessageBorder: string;
  
  // Input
  inputBorder: string;
  inputFocusRing: string;
  inputBg: string;
  inputDisabledBg: string;
  
  // Buttons
  sendButtonBg: string;
  sendButtonHover: string;
  sendButtonText: string;
  sendButtonDisabledBg: string;
  sendButtonDisabledText: string;
  
  // FAB (Floating Action Button)
  fabBg: string;
  fabHover: string;
  fabText: string;
  fabRing: string;
  
  // Close button
  closeBg: string;
  closeHover: string;
  closeText: string;
  
  // Container
  containerBorder: string;
  containerBg: string;
  
  // Loading indicator
  loadingDotBg: string;
  loadingText: string;
  
  // Timestamps
  timestampText: string;
}



/**
 * Default blue theme
 */
export const defaultTheme: ChatbotTheme = {
  // Primary brand colors
  primary: 'bg-blue-500',
  primaryHover: 'hover:bg-blue-600',
  primaryDark: 'bg-blue-600',
  
  // Header
  headerBg: 'bg-gradient-to-r from-blue-500 to-blue-600',
  headerText: 'text-white',
  headerButtonHover: 'hover:bg-white/20',
  
  // Messages
  userMessageBg: 'bg-blue-600',
  userMessageText: 'text-white',
  assistantMessageBg: 'bg-gray-100',
  assistantMessageText: 'text-gray-950',
  
  // Tool messages
  toolMessageBg: 'bg-purple-100',
  toolMessageText: 'text-purple-950',
  toolMessageBorder: 'border-purple-300',
  
  // Error messages
  errorMessageBg: 'bg-red-100',
  errorMessageText: 'text-red-950',
  errorMessageBorder: 'border-red-300',
  
  // Input
  inputBorder: 'border-gray-300',
  inputFocusRing: 'focus:ring-blue-500',
  inputBg: 'bg-gradient-to-br from-slate-900/80 to-indigo-950/80',
  inputDisabledBg: 'bg-gray-100',
  
  // Buttons
  sendButtonBg: 'bg-blue-500',
  sendButtonHover: 'hover:bg-blue-600',
  sendButtonText: 'text-white',
  sendButtonDisabledBg: 'bg-gray-300',
  sendButtonDisabledText: 'text-gray-500',
  
  // FAB
  fabBg: 'bg-gradient-to-r from-blue-500 to-blue-600',
  fabHover: 'hover:from-blue-600 hover:to-blue-700',
  fabText: 'text-white',
  fabRing: 'focus:ring-blue-300',
  
  // Close button
  closeBg: 'bg-gray-800',
  closeHover: 'hover:bg-gray-900',
  closeText: 'text-white',
  
  // Container
  containerBorder: 'border-gray-200',
  containerBg: 'bg-gradient-to-br from-slate-900/80 to-indigo-950/80',
  
  // Loading indicator
  loadingDotBg: 'bg-gray-400',
  loadingText: 'text-gray-600',
  
  // Timestamps
  timestampText: 'text-gray-500',
};

/**
 * Example: Green theme
 */
export const greenTheme: ChatbotTheme = {
  primary: 'bg-green-500',
  primaryHover: 'hover:bg-green-600',
  primaryDark: 'bg-green-600',
  
  headerBg: 'bg-gradient-to-r from-green-500 to-green-600',
  headerText: 'text-white',
  headerButtonHover: 'hover:bg-white/20',
  
  userMessageBg: 'bg-green-600',
  userMessageText: 'text-white',
  assistantMessageBg: 'bg-gray-100',
  assistantMessageText: 'text-gray-950',
  
  toolMessageBg: 'bg-purple-100',
  toolMessageText: 'text-purple-950',
  toolMessageBorder: 'border-purple-300',
  
  errorMessageBg: 'bg-red-100',
  errorMessageText: 'text-red-950',
  errorMessageBorder: 'border-red-300',
  
  inputBorder: 'border-gray-300',
  inputFocusRing: 'focus:ring-green-500',
  inputBg: 'bg-white',
  inputDisabledBg: 'bg-gray-100',
  
  sendButtonBg: 'bg-green-500',
  sendButtonHover: 'hover:bg-green-600',
  sendButtonText: 'text-white',
  sendButtonDisabledBg: 'bg-gray-300',
  sendButtonDisabledText: 'text-gray-500',
  
  fabBg: 'bg-gradient-to-r from-green-500 to-green-600',
  fabHover: 'hover:from-green-600 hover:to-green-700',
  fabText: 'text-white',
  fabRing: 'focus:ring-green-300',
  
  closeBg: 'bg-gray-800',
  closeHover: 'hover:bg-gray-900',
  closeText: 'text-white',
  
  containerBorder: 'border-gray-200',
  containerBg: 'bg-transparent',
  
  loadingDotBg: 'bg-gray-400',
  loadingText: 'text-gray-600',
  
  timestampText: 'text-gray-500',
};

/**
 * Example: Purple theme
 */
export const purpleTheme: ChatbotTheme = {
  primary: 'bg-purple-500',
  primaryHover: 'hover:bg-purple-600',
  primaryDark: 'bg-purple-600',
  
  headerBg: 'bg-gradient-to-r from-purple-500 to-purple-600',
  headerText: 'text-white',
  headerButtonHover: 'hover:bg-white/20',
  
  userMessageBg: 'bg-purple-600',
  userMessageText: 'text-white',
  assistantMessageBg: 'bg-gray-100',
  assistantMessageText: 'text-gray-950',
  
  toolMessageBg: 'bg-indigo-100',
  toolMessageText: 'text-indigo-950',
  toolMessageBorder: 'border-indigo-300',
  
  errorMessageBg: 'bg-red-100',
  errorMessageText: 'text-red-950',
  errorMessageBorder: 'border-red-300',
  
  inputBorder: 'border-gray-300',
  inputFocusRing: 'focus:ring-purple-500',
  inputBg: 'bg-white',
  inputDisabledBg: 'bg-gray-100',
  
  sendButtonBg: 'bg-purple-500',
  sendButtonHover: 'hover:bg-purple-600',
  sendButtonText: 'text-white',
  sendButtonDisabledBg: 'bg-gray-300',
  sendButtonDisabledText: 'text-gray-500',
  
  fabBg: 'bg-gradient-to-r from-purple-500 to-purple-600',
  fabHover: 'hover:from-purple-600 hover:to-purple-700',
  fabText: 'text-white',
  fabRing: 'focus:ring-purple-300',
  
  closeBg: 'bg-gray-800',
  closeHover: 'hover:bg-gray-900',
  closeText: 'text-white',
  
  containerBorder: 'border-gray-200',
  containerBg: 'bg-transparent',
  
  loadingDotBg: 'bg-gray-400',
  loadingText: 'text-gray-600',
  
  timestampText: 'text-gray-500',
};
