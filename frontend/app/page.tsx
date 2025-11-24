"use client";

import { useState, useEffect, useRef } from "react";

interface Message {
  sender: string;
  message: string;
  timestamp?: string;
}

export default function ChatPage() {
  // State management
  const [backendUrl, setBackendUrl] = useState<string>("http://localhost:81");
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState<string>("");
  const [username, setUsername] = useState<string>("User1");
  const [isSending, setIsSending] = useState<boolean>(false);
  const [connectionError, setConnectionError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch messages from backend (AJAX Polling)
  const fetchMessages = async () => {
    try {
      const response = await fetch(`${backendUrl}/messages`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Assuming backend returns an array of messages
      if (Array.isArray(data)) {
        setMessages(data);
      } else if (data.messages && Array.isArray(data.messages)) {
        setMessages(data.messages);
      }
      
      setConnectionError("");
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching messages:", error);
      setConnectionError(`Failed to connect to backend at ${backendUrl}`);
      setIsLoading(false);
    }
  };

  // Set up polling mechanism with setInterval
  useEffect(() => {
    // Initial fetch
    fetchMessages();

    // Set up polling every 2 seconds
    pollingIntervalRef.current = setInterval(() => {
      fetchMessages();
    }, 2000);

    // Cleanup on unmount
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [backendUrl]); // Re-initialize when backend URL changes

  // Send message to backend
  const handleSendMessage = async () => {
    if (!inputMessage.trim()) {
      return;
    }

    setIsSending(true);
    
    try {
      const payload = {
        message: inputMessage,
        sender: username,
      };

      const response = await fetch(`${backendUrl}/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Clear input field on successful send
      setInputMessage("");
      setConnectionError("");
      
      // Immediately fetch messages after sending
      await fetchMessages();
    } catch (error) {
      console.error("Error sending message:", error);
      setConnectionError(`Failed to send message to ${backendUrl}`);
    } finally {
      setIsSending(false);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isSending) {
      handleSendMessage();
    }
  };

  // Handle backend URL change
  const handleUrlChange = (newUrl: string) => {
    setBackendUrl(newUrl);
    setConnectionError("");
    setIsLoading(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto h-screen flex flex-col py-8">
        {/* Header */}
        <div className="bg-white rounded-t-lg shadow-lg p-6 space-y-4">
          <h1 className="text-3xl font-bold text-gray-800 text-center">
            Chat Application
          </h1>
          
          {/* Backend URL Configuration 
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Backend Server URL/IP:
            </label>
            <input
              type="text"
              value={backendUrl}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="http://192.168.1.100"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            />
          </div>*/}

          {/* Username Configuration */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Your Username:
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            />
          </div>

          {/* Connection Status 
          {connectionError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              <span className="font-semibold">Connection Error:</span> {connectionError}
            </div>
          )}
          
          {!connectionError && !isLoading && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
              <span className="font-semibold">Connected</span> - Polling every 2 seconds
            </div>
          )}

          {isLoading && !connectionError && (
            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg text-sm">
              <span className="font-semibold">Connecting...</span>
            </div>
          )}*/}
        </div>

        {/* Chat Display Area */}
        <div className="flex-1 bg-white shadow-lg overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 && !isLoading && (
              <div className="text-center text-gray-400 mt-8">
                <p className="text-lg">No messages yet</p>
                <p className="text-sm">Start the conversation!</p>
              </div>
            )}

            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.sender === username ? "justify-start" : "justify-end"
                }`}
              >
                <div
                  className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-3 rounded-lg shadow ${
                    msg.sender === username
                      ? "bg-blue-500 text-white rounded-br-none"
                      : "bg-gray-200 text-gray-800 rounded-bl-none"
                  }`}
                >
                  <div className="flex items-baseline space-x-2">
                    <span className="font-semibold text-sm">
                      {msg.sender}
                    </span>
                    {msg.timestamp && (
                      <span className="text-xs opacity-75">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 break-words">{msg.message}</p>
                </div>
              </div>
            ))}
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-white rounded-b-lg shadow-lg p-6">
          <div className="flex space-x-4">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={isSending}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <button
              onClick={handleSendMessage}
              disabled={isSending || !inputMessage.trim()}
              className="px-8 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition disabled:bg-gray-300 disabled:cursor-not-allowed shadow-md"
            >
              {isSending ? (
                <span className="flex items-center space-x-2">
                  <svg
                    className="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Sending...</span>
                </span>
              ) : (
                "Send"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
