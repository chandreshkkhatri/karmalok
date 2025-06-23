"use client";

import { useState, useEffect } from "react";
import ChatInterface from "@/components/ChatInterface";
import { IUser } from "@/models";

export default function Home() {
  const [currentUser, setCurrentUser] = useState<IUser | null>(null);
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if user exists in localStorage
    const savedUser = localStorage.getItem("chatUser");
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    try {
      setIsLoading(true);

      // Try to create or get existing user
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim() }),
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentUser(data.user);
        localStorage.setItem("chatUser", JSON.stringify(data.user));
      } else if (response.status === 409) {
        // User exists, fetch user data
        const usersResponse = await fetch("/api/users");
        const usersData = await usersResponse.json();
        const existingUser = usersData.users.find(
          (u: IUser) => u.username === username.trim()
        );

        if (existingUser) {
          setCurrentUser(existingUser);
          localStorage.setItem("chatUser", JSON.stringify(existingUser));
        }
      }
    } catch (error) {
      console.error("Error logging in:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("chatUser");
    setUsername("");
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              AI Chat Interface
            </h1>
            <p className="text-gray-600">
              Enter your username to start chatting
            </p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your username"
                disabled={isLoading}
                required
              />
            </div>

            <button
              type="submit"
              disabled={!username.trim() || isLoading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Connecting..." : "Start Chatting"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen">
      <ChatInterface currentUser={currentUser} />

      {/* User info bar */}
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-md p-3 flex items-center gap-3">
        <div className="text-sm">
          <span className="text-gray-600">Logged in as:</span>
          <span className="font-medium text-gray-900 ml-1">
            {currentUser.username}
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="text-xs text-gray-500 hover:text-gray-700 underline"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
