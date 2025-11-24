"use client";

import { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

interface Message {
  sender: string;
  message: string;
  timestamp?: string;
}

export default function ChatPage() {
  // State management
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [isUsernameSet, setIsUsernameSet] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [connectionError, setConnectionError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isOnline, setIsOnline] = useState<boolean>(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when username is set
  useEffect(() => {
    if (isUsernameSet && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isUsernameSet]);

  // Socket.IO Connection - only connect when username is set
  useEffect(() => {
    if (!isUsernameSet) return;

    // Create socket connection
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5001", {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
    });

    socketRef.current = socket;

    // Connection event handlers
    socket.on("connect", () => {
      console.log("Connected to backend:", socket.id);
      setIsOnline(true);
      setConnectionError("");
      setIsLoading(false);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from backend");
      setIsOnline(false);
    });

    socket.on("connect_error", (error) => {
      console.error("Connection error:", error);
      setConnectionError("Unable to connect to server. Please check your connection.");
      setIsOnline(false);
      setIsLoading(false);
    });

    // Receive initial messages when connecting
    socket.on("initial_messages", (msgs: Message[]) => {
      console.log("Received initial messages:", msgs);
      setMessages(msgs);
      setLastUpdate(new Date());
      setIsLoading(false);
    });

    // Listen for new messages in real-time
    socket.on("new_message", (msg: Message) => {
      console.log("Received new message:", msg);
      setMessages((prevMessages) => [...prevMessages, msg]);
      setLastUpdate(new Date());
    });

    // Cleanup on unmount
    return () => {
      socket.disconnect();
    };
  }, [isUsernameSet]);

  // Send message via HTTP POST to backend API
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

      console.log("Sending message to backend API:", payload);
      
      // Call backend HTTP endpoint
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001"}/api/messages/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Message sent successfully:", data);

      // Clear input field
      setInputMessage("");
      setConnectionError("");
    } catch (error) {
      console.error("Error sending message:", error);
      setConnectionError("Failed to send message. Please try again.");
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

  // Handle username submission
  const handleUsernameSubmit = () => {
    if (username.trim()) {
      setIsUsernameSet(true);
    }
  };

  // Handle username key press
  const handleUsernameKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && username.trim()) {
      handleUsernameSubmit();
    }
  };

  // Format timestamp
  const formatTime = (timestamp?: string) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // If username is not set, show username setup screen
  if (!isUsernameSet) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center p-3 sm:p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 max-w-md w-full space-y-4 sm:space-y-6 transform transition-all">
          <div className="text-center space-y-2 sm:space-y-3">
            <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-blue-100 rounded-full mb-2">
              <svg className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Welcome to Chat</h1>
            <p className="text-sm sm:text-base text-gray-600">Choose a username to get started</p>
          </div>
          
          <div className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyPress={handleUsernameKeyPress}
                placeholder="Enter your username"
                maxLength={20}
                autoFocus
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-base sm:text-lg"
              />
              <p className="mt-1.5 sm:mt-2 text-xs text-gray-500">This will be displayed with your messages</p>
            </div>
            
            <button
              onClick={handleUsernameSubmit}
              disabled={!username.trim()}
              className="w-full px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm sm:text-base font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 focus:ring-4 focus:ring-blue-300 transition disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed shadow-lg transform hover:scale-105 active:scale-95"
            >
              Start Chatting
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-2 sm:p-4">
      <div className="max-w-5xl mx-auto h-[100dvh] sm:h-screen flex flex-col py-2 sm:py-6">
        {/* Header */}
        <div className="bg-white rounded-t-xl sm:rounded-t-2xl shadow-xl border-b border-gray-200">
          <div className="px-3 sm:px-6 py-3 sm:py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-base sm:text-xl font-bold text-gray-800">
                    Chat Room
                  </h1>
                  <div className="flex items-center space-x-1 sm:space-x-2 text-xs">
                    <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
                    <span className="text-gray-600">
                      {isOnline ? 'Connected' : 'Disconnected'}
                    </span>
                    {lastUpdate && isOnline && (
                      <span className="hidden sm:inline text-gray-400">
                        · Updated {formatTime(lastUpdate.toISOString())}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="text-right hidden sm:block">
                  <div className="text-sm font-medium text-gray-700">{username}</div>
                  <div className="text-xs text-gray-500">You</div>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm sm:text-base font-bold">
                  {username.charAt(0).toUpperCase()}
                </div>
              </div>
            </div>
          </div>
          
          {/* Connection Error Banner */}
          {connectionError && (
            <div className="bg-red-50 border-t border-red-200 px-3 sm:px-6 py-2 sm:py-3">
              <div className="flex items-center space-x-2 text-red-700 text-xs sm:text-sm">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{connectionError}</span>
              </div>
            </div>
          )}
        </div>

        {/* Chat Display Area */}
        <div className="flex-1 bg-white shadow-xl overflow-hidden flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-3 sm:space-y-4 bg-gradient-to-b from-gray-50 to-white">
            {isLoading && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center space-y-2 sm:space-y-3">
                  <div className="inline-block animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-4 border-gray-300 border-t-blue-600"></div>
                  <p className="text-sm sm:text-base text-gray-500">Loading messages...</p>
                </div>
              </div>
            )}

            {messages.length === 0 && !isLoading && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center space-y-2 sm:space-y-3">
                  <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full">
                    <svg className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-base sm:text-lg font-medium text-gray-700">No messages yet</p>
                    <p className="text-xs sm:text-sm text-gray-500">Be the first to start the conversation!</p>
                  </div>
                </div>
              </div>
            )}

            {!isLoading && messages.map((msg, index) => {
              const isOwnMessage = msg.sender === username;
              return (
                <div
                  key={index}
                  className={`flex items-end space-x-1.5 sm:space-x-2 ${
                    isOwnMessage ? "justify-end" : "justify-start"
                  } animate-fade-in`}
                >
                  {!isOwnMessage && (
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-bold flex-shrink-0">
                      {msg.sender.charAt(0).toUpperCase()}
                    </div>
                  )}
                  
                  <div
                    className={`max-w-[75%] sm:max-w-xs lg:max-w-md xl:max-w-lg px-3 sm:px-4 py-2 sm:py-3 rounded-2xl shadow-md transition-all hover:shadow-lg ${
                      isOwnMessage
                        ? "bg-gradient-to-br from-blue-600 to-purple-600 text-white"
                        : "bg-white border border-gray-200 text-gray-800"
                    }`}
                  >
                    <div className="flex items-baseline space-x-1.5 sm:space-x-2 mb-0.5 sm:mb-1">
                      <span className={`font-semibold text-xs sm:text-sm ${
                        isOwnMessage ? "text-white" : "text-gray-700"
                      }`}>
                        {isOwnMessage ? "You" : msg.sender}
                      </span>
                      {msg.timestamp && (
                        <span className={`text-[10px] sm:text-xs ${
                          isOwnMessage ? "text-white text-opacity-75" : "text-gray-500"
                        }`}>
                          {formatTime(msg.timestamp)}
                        </span>
                      )}
                    </div>
                    <p className="break-words leading-relaxed text-sm sm:text-base">{msg.message}</p>
                  </div>

                  {isOwnMessage && (
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-bold flex-shrink-0">
                      {msg.sender.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              );
            })}
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-white rounded-b-xl sm:rounded-b-2xl shadow-xl border-t border-gray-200 p-3 sm:p-6">
          <div className="flex items-end space-x-2 sm:space-x-3">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                disabled={isSending}
                maxLength={500}
                className="w-full px-3 sm:px-5 py-3 sm:py-4 pr-12 sm:pr-16 border-2 border-gray-300 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition disabled:bg-gray-100 disabled:cursor-not-allowed text-sm sm:text-base text-gray-800 placeholder-gray-400"
              />
              <div className="absolute right-3 sm:right-4 bottom-3 sm:bottom-4 text-[10px] sm:text-xs text-gray-400">
                {inputMessage.length}/500
              </div>
            </div>
            <button
              onClick={handleSendMessage}
              disabled={isSending || !inputMessage.trim()}
              className="px-3 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl sm:rounded-2xl hover:from-blue-700 hover:to-purple-700 focus:ring-4 focus:ring-blue-300 transition disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed shadow-lg transform hover:scale-105 active:scale-95 flex items-center space-x-1 sm:space-x-2"
            >
              {isSending ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 sm:h-5 sm:w-5"
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
                  <span className="text-xs sm:text-base">Sending</span>
                </>
              ) : (
                <>
                  <span className="text-xs sm:text-base">Send</span>
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </>
              )}
            </button>
          </div>
          {!isOnline && (
            <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-amber-600 flex items-center space-x-1">
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Real-time updates unavailable - messages will appear after sending</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
