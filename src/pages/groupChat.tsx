import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Users } from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import api from '@/lib/api';

interface Message {
  id: number;
  user: string;
  text: string;
  time: string;
  avatar: string | null;
  isMe: boolean;
}

const GroupChat = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { id } = useParams();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isWsOpen, setIsWsOpen] = useState(false);
  const [groupInfo, setGroupInfo] = useState<any>(null);
  const ws = useRef<WebSocket | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!id) return;

    audioRef.current = new Audio('/sounds/notification.mp3');
    const token = localStorage.getItem("access_token");

    const fetchMessages = async () => {
      try {
        const res = await api.get(`/chat/group/${id}/`);
        const transformed = res.data.map((msg: any) => ({
          id: msg.id,
          user: msg.sender.full_name,
          text: msg.content,
          time: new Date(msg.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
          avatar: msg.sender.profile_picture,
          isMe: msg.isMe,
        }));

        setMessages(transformed);
      } catch (error) {
        console.error("Error fetching group messages:", error);
      }
    };

    const fetchGroupInfo = async () => {
      try {
        const res = await api.get(`/groups/${id}/`);
        setGroupInfo(res.data);
      } catch (e) {
        console.error("Error fetching group info", e);
      }
    };

    fetchMessages();
    fetchGroupInfo();

    const wsUrl = `ws://localhost:8000/ws/chat/group/${id}/?token=${token}`;
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      console.log("WebSocket connected!");
      setIsWsOpen(true);
    };

    ws.current.onmessage = (e) => {
      const data = JSON.parse(e.data);


      setMessages((prev) => [
        ...prev,
        {
          id: data.id || Date.now(),
          user: data.sender?.full_name,
          text: data.content,
          time: new Date(data.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
          avatar: data.sender?.profile_picture,
          isMe: data.isMe,
        },
      ]);

      if (!data.isMe && audioRef.current) {
        audioRef.current.play().catch((error) => {
          console.error("Audio playback failed:", error);
        });
      }
    };

    ws.current.onclose = () => {
      console.log("WebSocket disconnected.");
      setIsWsOpen(false);
    };

    return () => {
      ws.current?.close();
    };
  }, [id]);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const sendMessage = () => {
    if (!message.trim()) return;

    if (!isWsOpen || ws.current?.readyState !== WebSocket.OPEN) {
      console.error("WebSocket is not open yet.");
      return;
    }

    ws.current?.send(JSON.stringify({ message }));
    setMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-8rem)] flex flex-col max-w-3xl mx-auto">
        {/* Group Header */}
        <Card className="mb-4 flex-shrink-0">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={groupInfo?.image || undefined} />
                  <AvatarFallback>
                    {(groupInfo?.name || `G${id}`)
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">
                    {groupInfo?.name || `Group #${id}`}
                  </CardTitle>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Users className="h-4 w-4" />
                    <span>{groupInfo?.members_count ?? 0} members</span>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Messages */}
        <Card className="flex-1 flex flex-col min-h-0">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`flex space-x-2 max-w-xs sm:max-w-md lg:max-w-lg ${
                      msg.isMe
                        ? 'flex-row-reverse space-x-reverse'
                        : ''
                    }`}
                  >
                    {!msg.isMe && (
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={msg.avatar || undefined} />
                        <AvatarFallback>
                          {msg.user
                            ?.split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`rounded-lg p-3 ${
                        msg.isMe
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100'
                      }`}
                    >
                      {!msg.isMe && (
                        <p className="text-xs font-medium text-gray-600 mb-1">
                          {msg.user}
                        </p>
                      )}
                      <p className="text-sm">{msg.text}</p>
                      <p
                        className={`text-xs mt-1 ${
                          msg.isMe
                            ? 'text-blue-100'
                            : 'text-gray-500'
                        }`}
                      >
                        {msg.time}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
          </ScrollArea>

          {/* Message Input */}
          <div className="p-4 border-t flex-shrink-0">
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <Button size="sm" onClick={sendMessage}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default GroupChat;
