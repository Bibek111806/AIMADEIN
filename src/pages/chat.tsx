import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Send, 
  Phone, 
  Video, 
  MoreVertical,
  Users,
  Smile
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

const Chat = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      user: 'Alice Johnson',
      text: 'Hey everyone! Just saw the latest AI research paper on transformer models.',
      time: '10:30 AM',
      avatar: null,
      isMe: false
    },
    {
      id: 2,
      user: 'You',
      text: 'Which one? There have been so many lately!',
      time: '10:32 AM',
      avatar: null,
      isMe: true
    },
    {
      id: 3,
      user: 'Bob Chen',
      text: 'Probably the one about attention mechanisms. Really interesting stuff.',
      time: '10:35 AM',
      avatar: null,
      isMe: false
    }
  ]);

  const sendMessage = () => {
    if (!message.trim()) return;
    
    const newMessage = {
      id: messages.length + 1,
      user: 'You',
      text: message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      avatar: null,
      isMe: true
    };
    
    setMessages([...messages, newMessage]);
    setMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-8rem)] flex flex-col max-w-4xl mx-auto">
        {/* Chat Header */}
        <Card className="mb-4 flex-shrink-0">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex -space-x-2">
                  <Avatar className="h-8 w-8 border-2 border-white">
                    <AvatarFallback>AJ</AvatarFallback>
                  </Avatar>
                  <Avatar className="h-8 w-8 border-2 border-white">
                    <AvatarFallback>BC</AvatarFallback>
                  </Avatar>
                  <Avatar className="h-8 w-8 border-2 border-white">
                    <AvatarFallback>+5</AvatarFallback>
                  </Avatar>
                </div>
                <div>
                  <CardTitle className="text-lg">AI Ethics Discussion</CardTitle>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Users className="h-4 w-4" />
                    <span>8 members</span>
                    <Badge variant="secondary">Public</Badge>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
          
                <Button size="sm" variant="outline">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Messages Area */}
        <Card className="flex-1 flex flex-col min-h-0">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex space-x-2 max-w-xs sm:max-w-md lg:max-w-lg ${msg.isMe ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    {!msg.isMe && (
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={msg.avatar} />
                        <AvatarFallback>{msg.user.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                    )}
                    <div className={`rounded-lg p-3 ${msg.isMe ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}>
                      {!msg.isMe && <p className="text-xs font-medium text-gray-600 mb-1">{msg.user}</p>}
                      <p className="text-sm">{msg.text}</p>
                      <p className={`text-xs mt-1 ${msg.isMe ? 'text-blue-100' : 'text-gray-500'}`}>{msg.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Message Input */}
          <div className="p-4 border-t flex-shrink-0">
            <div className="flex items-center space-x-2">
              <Button size="sm" variant="outline" className="hidden sm:flex">
                <Smile className="h-4 w-4" />
              </Button>
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

export default Chat;
