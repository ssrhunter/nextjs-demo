import { ToolDefinition } from './types';

/**
 * Calculator tool that performs basic arithmetic operations
 */
const calculatorTool: ToolDefinition = {
  name: 'calculator',
  description: 'Performs basic arithmetic operations (addition and subtraction)',
  parameters: {
    type: 'object',
    properties: {
      operation: {
        type: 'string',
        description: 'The arithmetic operation to perform',
        enum: ['add', 'subtract'],
      },
      a: {
        type: 'number',
        description: 'The first number',
      },
      b: {
        type: 'number',
        description: 'The second number',
      },
    },
    required: ['operation', 'a', 'b'],
  },
  execute: async (params: Record<string, any>) => {
    const { operation, a, b } = params;
    
    if (typeof a !== 'number' || typeof b !== 'number') {
      throw new Error('Both a and b must be numbers');
    }
    
    switch (operation) {
      case 'add':
        return { result: a + b, operation: 'addition' };
      case 'subtract':
        return { result: a - b, operation: 'subtraction' };
      default:
        throw new Error(`Unsupported operation: ${operation}`);
    }
  },
};

/**
 * Weather lookup tool that returns mock weather data
 */
const weatherTool: ToolDefinition = {
  name: 'get_weather',
  description: 'Gets the current weather for a specified location',
  parameters: {
    type: 'object',
    properties: {
      location: {
        type: 'string',
        description: 'The city or location to get weather for',
      },
      unit: {
        type: 'string',
        description: 'Temperature unit (celsius or fahrenheit)',
        enum: ['celsius', 'fahrenheit'],
      },
    },
    required: ['location'],
  },
  execute: async (params: Record<string, any>) => {
    const { location, unit = 'celsius' } = params;
    
    if (typeof location !== 'string' || location.trim() === '') {
      throw new Error('Location must be a non-empty string');
    }
    
    // Mock weather data
    const mockWeatherData: Record<string, any> = {
      'new york': { temp: 22, condition: 'Partly Cloudy', humidity: 65 },
      'london': { temp: 15, condition: 'Rainy', humidity: 80 },
      'tokyo': { temp: 28, condition: 'Sunny', humidity: 55 },
      'paris': { temp: 18, condition: 'Cloudy', humidity: 70 },
      'sydney': { temp: 25, condition: 'Clear', humidity: 60 },
    };
    
    const normalizedLocation = location.toLowerCase().trim();
    const weatherData = mockWeatherData[normalizedLocation] || {
      temp: 20,
      condition: 'Clear',
      humidity: 50,
    };
    
    // Convert temperature if needed
    let temperature = weatherData.temp;
    if (unit === 'fahrenheit') {
      temperature = Math.round((temperature * 9/5) + 32);
    }
    
    return {
      location: location,
      temperature: temperature,
      unit: unit,
      condition: weatherData.condition,
      humidity: weatherData.humidity,
    };
  },
};

/**
 * Array of example tools for use in ChatbotConfig
 */
export const exampleTools: ToolDefinition[] = [
  calculatorTool,
  weatherTool,
];

export default exampleTools;
