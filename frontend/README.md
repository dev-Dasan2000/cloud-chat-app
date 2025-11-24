# Chat Application - Next.js with AJAX Polling

A simple chat system built with Next.js (App Router) that communicates with a backend server using HTTP and AJAX polling (no WebSockets).

## Features

- ✅ **AJAX Polling**: Automatically fetches new messages every 2 seconds using `setInterval`
- ✅ **Send Messages**: POST messages to backend server asynchronously
- ✅ **Configurable Backend URL**: Easy-to-change input field for backend server IP/URL
- ✅ **Clean UI**: Built with Tailwind CSS for a modern, responsive interface
- ✅ **Error Handling**: Graceful handling of connection errors and loading states
- ✅ **TypeScript**: Fully typed for better development experience

## Technical Implementation

### AJAX Endpoints

- **GET** `/messages` - Fetches message history (polled every 2 seconds)
- **POST** `/send` - Sends new messages with JSON payload: `{ "message": "text", "user": "username" }`

### Key Features

1. **Polling Mechanism**: Uses `useEffect` with `setInterval` for automatic message fetching
2. **State Management**: React hooks for managing messages, loading, and error states
3. **Auto-scroll**: Messages automatically scroll to bottom when new ones arrive
4. **Enter Key Support**: Press Enter to send messages
5. **Loading Indicators**: Visual feedback during message sending

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Navigate to the project directory:
```bash
cd chat-app
```

2. Install dependencies:
```bash
npm install
```

### Running the Application

1. **Development Mode**:
```bash
npm run dev
```
The application will start at `http://localhost:3000`

2. **Production Build**:
```bash
npm run build
npm start
```

### Configuration for Cross-VM Testing

1. Open the application in your browser
2. At the top of the UI, you'll see the "Backend Server URL/IP" field
3. Enter your backend server's address:
   - Local: `http://localhost:3001`
   - Same network: `http://192.168.1.100:3001`
   - Different VM: `http://<backend-vm-ip>:3001`
4. The application will automatically restart polling with the new URL

## Project Structure

```
chat-app/
├── app/
│   ├── globals.css          # Tailwind CSS imports
│   ├── layout.tsx           # Root layout component
│   └── page.tsx             # Main chat page (all logic here)
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.mjs
└── next.config.js
```

## Backend Server Requirements

Your backend server should implement these endpoints:

### GET /messages
Returns an array of messages:
```json
[
  {
    "user": "User1",
    "message": "Hello!",
    "timestamp": "2025-11-23T10:30:00Z"
  }
]
```

Or wrapped in an object:
```json
{
  "messages": [
    {
      "user": "User1",
      "message": "Hello!"
    }
  ]
}
```

### POST /send
Accepts JSON payload:
```json
{
  "message": "Hello, World!",
  "user": "User1"
}
```

Returns status 200 on success.

## UI Features

- **Header Section**: Backend URL configuration, username input, connection status
- **Chat Display Area**: Scrollable message history with user-based styling
- **Input Area**: Text input with Send button and Enter key support
- **Status Indicators**: 
  - Green: Connected and polling
  - Red: Connection error with details
  - Blue: Connecting...

## Error Handling

- Network errors are caught and displayed to the user
- Failed requests don't crash the app
- Polling continues even if individual requests fail
- User-friendly error messages with backend URL shown

## Development Notes

- Built with Next.js 14 App Router
- Uses React Server Components where appropriate
- Client components marked with "use client" directive
- TypeScript for type safety
- Tailwind CSS for styling
- No external state management libraries needed

## Testing Between VMs

1. **VM 1 (Backend)**:
   - Run your backend server on a specific port (e.g., 3001)
   - Note the IP address: `ipconfig` (Windows) or `ifconfig` (Linux)

2. **VM 2 (Frontend)**:
   - Run this Next.js application: `npm run dev`
   - Open browser and go to `http://localhost:3000`
   - Enter VM1's IP in the Backend URL field: `http://<VM1-IP>:3001`
   - Start chatting!

## Assignment Requirements Checklist

- ✅ Next.js with App Router
- ✅ Tailwind CSS for styling
- ✅ AJAX polling with setInterval (every 2 seconds)
- ✅ GET /messages endpoint
- ✅ POST /send endpoint
- ✅ Configurable backend URL in UI
- ✅ Scrollable chat display
- ✅ Text input and Send button
- ✅ Loading states handling
- ✅ Connection error handling
- ✅ No WebSockets (pure HTTP/AJAX)

## License

MIT
