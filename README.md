n# Container Migration Checker

A React application for checking container migration compatibility between different operating systems.

## Features

- Cross-OS container migration compatibility checking
- Support for AWS, Azure, and local environments
- Beautiful, responsive UI with Tailwind CSS
- Real-time migration analysis
- Detailed compatibility reports

## Setup Instructions

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm start
   ```

3. **Open your browser:**
   Navigate to `http://localhost:3000`

## Project Structure

```
src/
├── components/
│   └── MigrationChecker.js    # Main component
├── App.js                     # App component
├── App.css                    # App styles
├── index.js                   # Entry point
└── index.css                  # Global styles
```

## Usage

1. Select your cloud provider (AWS, Azure, or Local/Other)
2. Enter container identifiers (names, IDs, or IPs)
3. Select source and target operating systems
4. Click "Start Migration Check" to analyze compatibility
5. Review the detailed migration results

## Technologies Used

- React 18
- TypeScript interfaces
- Tailwind CSS
- React Hooks (useState, useEffect)

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm build` - Builds the app for production
- `npm test` - Launches the test runner
- `npm eject` - Ejects from Create React App (one-way operation)

## Development

The app uses Create React App with Tailwind CSS for styling. All components are written in JavaScript with TypeScript-style interfaces for better type safety.

## License

This project is open source and available under the MIT License.
