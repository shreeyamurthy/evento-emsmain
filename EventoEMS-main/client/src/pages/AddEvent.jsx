import { useContext, useState, useRef } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { UserContext } from '../UserContext';

import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI({ apiKey: 'AIzaSyCdEv-KZJ4tJktzbmlpdrMQLLHZ3MW6rls' });

export default function AddEvent() {
  const { user } = useContext(UserContext);
  const fileInputRef = useRef(null);
  const [isChatOpen, setIsChatOpen] = useState(false); // Toggle chat
  const [messages, setMessages] = useState([]); // Chat messages
  const [input, setInput] = useState(''); // Chat input
  const [response, setResponse] = useState('');
  const [formData, setFormData] = useState({
    owner: user ? user.name : '',
    title: '',
    description: '',
    organizedBy: '',
    eventDate: '',
    eventTime: '',
    location: '',
    ticketPrice: 0,
    image: null,
    likes: 0,
  });

  // Retool Workflow function
  const handleButtonClick = async () => {
    if (!input.trim()) {
        toast.error('Input cannot be empty!');
        return;
    }

    try {
        toast.loading('Fetching response...');
        const res = await axios.post('http://localhost:4000/api/chatgpt', {
            prompt: input,
        });
        const { eventName, description, ticketPriceInRupees, location} = res.data; // Adapt this based on the actual structure of your response
    
        // Set the form data with the new values from Retool response
        setFormData((prevState) => ({
          ...prevState,
          title: eventName || '', // Set default to empty string if title is not available
          description: description || '',
          ticketPrice: ticketPriceInRupees,
          location: location
           // Set default to empty string if description is not available
        }));
        toast.success('Successfully received response!');
    } catch (error) {
        console.error('Error communicating with the backend:', error.response?.data || error.message);
        toast.error('Failed to fetch response.');
    } finally {
        toast.dismiss();
    }
};

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    setFormData((prevState) => ({ ...prevState, image: file }));
  };

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData((prevState) => ({ ...prevState, [name]: files[0] }));
    } else {
      setFormData((prevState) => ({ ...prevState, [name]: value }));
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    const currentDate = new Date();
    const eventDate = new Date(formData.eventDate);

    if (eventDate < currentDate) {
      toast.error('The event date is invalid.');
      return;
    }

    const multipartFormData = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key === 'image' && value) {
        multipartFormData.append('image', value);
      } else {
        multipartFormData.append(key, value);
      }
    });

    axios
      .post('/createEvent', multipartFormData)
      .then((response) => {
        toast.success('Event submitted successfully!');
        setFormData({
          owner: user ? user.name : '',
          title: '',
          description: '',
          organizedBy: '',
          eventDate: '',
          eventTime: '',
          location: '',
          ticketPrice: 0,
          image: null,
          likes: 0,
        });

        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      })
      .catch((error) => {
        console.error('Error posting event:', error);
        toast.error('Failed to submit the event.');
      });
  };

  return (
    <div className="flex flex-row items-center w-full">
      <div className="flex flex-col ml-20 mt-10 w-full">
        <div className="flex flex-row justify-around w-full">
          <h1 className="font-bold text-3xl mb-5">Post an Event</h1>
          <button
            onClick={() => setIsChatOpen((prev) => !prev)}
            className="primary h-[30%] w-[20%]"
            type="button"
          >
            Chat with AI
          </button>
        </div>

        {isChatOpen && (
          <div className="chat-box">
            {response}
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
            />
            <button onClick={handleButtonClick}>Trigger Workflow</button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col w-[43%]">
          <div className="flex flex-col gap-5">
            {/* Form fields */}
            <label className="flex flex-col">
              Title:
              <input
                type="text"
                name="title"
                className="rounded mt-2 pl-5 px-4 ring-sky-700 ring-2 h-8 border-none"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </label>
            <label className="flex flex-col">
              Description:
              <textarea
                name="description"
                className="rounded mt-2 pl-5 px-6 py-2 ring-sky-700 ring-2 h-9 text-base w-full"
                value={formData.description}
                onChange={handleChange}
                required
              />
            </label>
            <label className="flex flex-col">
              Organized By:
              <input
                type="text"
                name="organizedBy"
                className="rounded mt-2 pl-5 px-4 ring-sky-700 ring-2 h-8 border-none"
                value={formData.organizedBy}
                onChange={handleChange}
                required
              />
            </label>
            <label className="flex flex-col">
              Event Date:
              <input
                type="date"
                name="eventDate"
                className="rounded mt-2 pl-5 px-4 ring-sky-700 ring-2 h-8 border-none"
                value={formData.eventDate}
                onChange={handleChange}
                required
              />
            </label>
            <label className="flex flex-col">
              Event Time:
              <input
                type="time"
                name="eventTime"
                className="rounded mt-2 pl-5 px-4 ring-sky-700 ring-2 h-8 border-none"
                value={formData.eventTime}
                onChange={handleChange}
                required
              />
            </label>
            <label className="flex flex-col">
              Location:
              <input
                type="text"
                name="location"
                className="rounded mt-2 pl-5 px-4 ring-sky-700 ring-2 h-8 border-none"
                value={formData.location}
                onChange={handleChange}
                required
              />
            </label>
            <label className="flex flex-col">
              Ticket Price:
              <input
                type="number"
                name="ticketPrice"
                className="rounded mt-2 pl-5 px-4 ring-sky-700 ring-2 h-8 border-none"
                value={formData.ticketPrice}
                onChange={handleChange}
                required
              />
            </label>
            <label className="flex flex-col">
              Image:
              <input
                type="file"
                name="image"
                ref={fileInputRef}

                className=' rounded mt-2 pl-5 px-4 py-10 ring-sky-700 ring-2 h-8 border-none'
                onChange={handleImageUpload}
                required
              />
            </label >
            <button className='primary' type="submit">Submit</button>
            </div>
            
          </form>
        </div>
        <div className="right-0 absolute "> <img src="../src/assets/ticketpageimage.png" alt="ticketpageimage" /></div>
        </div>
      );
    }