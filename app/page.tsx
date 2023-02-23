"use client";
import Image from "next/image";
import useState from "react-usestateref";
import userPic from "../public/Me.jpg";
import botPic from "../public/openAI-logo.png";

enum Creator {
  Me = 0,
  Bot = 1,
}

interface MessageProps {
  text: string;
  from: Creator;
  key: number;
}

interface InputProps {
  onSend: (input: string) => void;
  disabled: boolean;
}

// One message in the chat
const ChatMessage = ({ text, from }: MessageProps) => {
  return (
    <>
      {from == Creator.Me && (
        <div className="bg-white p-4 rounded-lg flex gap-4 items-center whitespace-pre-wrap">
          <Image src={userPic} alt="User" width={40} />
          <p className="text-gray-700">{text}</p>
        </div>
      )}
      {from == Creator.Bot && (
        <div className="bg-gray-100 p-4 rounded-lg flex gap-4 items-center whitespace-pre-wrap">
          <Image src={botPic} alt="User" width={40} />
          <p className="text-gray-700">{text}</p>
        </div>
      )}
    </>
  );
};


const ChatInput = ({ onSend, disabled }: InputProps) => {
  const [input, setInput] = useState('');

  const sendInput = () => {
    onSend(input);
    setInput('');
  };

  const handleKeyDown = (event: any) => {
    if (event.keyCode === 13) {
      sendInput();
    }
  };

  return (
    <div className="bg-white border-2 p-2 rounded-lg flex justify-center">
      <input
        value={input}
        onChange={(ev: any) => setInput(ev.target.value)}
        className="w-full py-2 px-3 text-gray-800 rounded-lg focus:outline-none"
        type="text"
        placeholder="En que te puedo ayudar?"
        disabled={disabled}
        onKeyDown={(ev) => handleKeyDown(ev)}
        />
        {disabled && (
          <svg
            aria-hidden="true"
            className="mt-1 w-8 h-8 mr-2 text-gray-200 animate-spin fill-blue-600"
            viewBox="0 0 100 101"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908"
              fill="currentColor"
            />
            <path
              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C96.2932 28.8227 92"
              fill="currentFill"
            />
          </svg>
        )}
        {!disabled && (
          <button
            onClick={() => sendInput()}
            className="p-2 rounded-md text-gray-500 bottom-1.5 right-1"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0"
              />
            </svg>
          </button>
        )}
    </div>
  );
};

export default function Home() {
  const [messages, setMessages, messagesRef] = useState<MessageProps[]>([])
  const [loading, setLoading] = useState(false);

  const callApi = async (input: string) => {
    setLoading(true);

    const myMessage: MessageProps = {
      text: input,
      from: Creator.Me,
      key: new Date().getTime()
    };

    setMessages([...messagesRef.current, myMessage]);
    const response = await fetch('/api/generate-answer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: input
      })
    }).then((response) => response.json());
    setLoading(false);

    if (response.text) {
      const botMessage: MessageProps = {
        text: response.text,
        from: Creator.Bot,
        key: new Date().getTime()
      };
      setMessages([...messagesRef.current, botMessage]);
    } else {
      // show error
    }
  };

  return (
    <main className="relative max-w-2xl mx-auto">
      <div className="sticky top-0 w-full pt-10 px-4">
        <ChatInput onSend={(input) => callApi(input)} disabled={loading} />
      </div>

      <div className="mt-10 px-4">
        {messages.map((msg: MessageProps) => (
          <ChatMessage key={msg.key} text={msg.text} from={msg.from} />
        ))}
        {messages.length == 0 && <p className="text-center text-gray-400">Estoy a tu servicio</p>}
      </div>
    </main>
  );
}