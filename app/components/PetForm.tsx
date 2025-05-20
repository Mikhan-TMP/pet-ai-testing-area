'use client';
import { ToastContainer, toast } from 'react-toastify';
import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Button,
  Typography,
  Paper,
  Container,
  Collapse,
} from '@mui/material';
import { FaAngleDown, FaAngleUp } from "react-icons/fa";

// MBTI types array
const MBTI_TYPES = [
  'ISTJ', 'ISFJ', 'INFJ', 'INTJ',
  'ISTP', 'ISFP', 'INFP', 'INTP',
  'ESTP', 'ESFP', 'ENFP', 'ENTP',
  'ESTJ', 'ESFJ', 'ENFJ', 'ENTJ'
];

// Species and their corresponding breeds
const SPECIES_BREEDS = {
  dog: ['Labrador', 'German Shepherd', 'Golden Retriever', 'Bulldog', 'Poodle'],
  cat: ['Persian', 'Siamese', 'Maine Coon', 'Ragdoll', 'Bengal'],
  bird: ['Parrot', 'Canary', 'Cockatiel', 'Budgie', 'Finch'],
  other: ['Other']
};

// Mood options
const MOODS = ['Happy', 'Calm', 'Energetic', 'Anxious', 'Playful', 'Aggressive'];

// Educational levels
const EDUCATIONAL_LEVELS = ['Basic', 'Intermediate', 'Advanced', 'Expert'];

// Default known commands
const DEFAULT_COMMANDS = ['Sit', 'Stay', 'Come', 'Down', 'Heel'];

// Age groups
const AGE_GROUPS = ['1 week old', '15 days old', '1 month old', '3 months old', 'Adult'];

interface FormData {
  pet_name: string;
  species: string;
  breed: string;
  mood: string;
  energy_level: number;
  hygiene_level: number;
  hunger_level: number;
  // educational_level: string;
  known_commands: string[];
  owner_mbti: string;
  owner_name: string;
  other_species: string;
  other_breed: string;
  message?: string;
  selected_pet_id?: string;
  age_group: string;
  health_level: number;
  happinness_level: number;
}

interface LoginData {
  username: string;
  password: string;
}

interface Pet {
  pet_id: string;
  user_id: string;
  name: string;
  species: string;
  breed: string;
  appearance: string;
  birthdate: string;
  status: string;
  level: string;
  experience: string;
  created_at: string;
  updated_at: string;
}

export default function PetForm() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isChatExpanded, setIsChatExpanded] = useState(false);
  const [isLoginExpanded, setIsLoginExpanded] = useState(false);
  const [pets, setPets] = useState<Pet[]>([]);
  const [isLoadingPets, setIsLoadingPets] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    pet_name: '',
    species: 'dog',
    breed: 'Labrador',
    mood: 'Happy',
    energy_level: 50,
    hygiene_level: 50,
    hunger_level: 50,
    // educational_level: 'Basic',
    known_commands: DEFAULT_COMMANDS,
    owner_mbti: 'ISTJ',
    owner_name: '',
    other_species: '',
    other_breed: '',
    message: 'Hi! How are you doing?',
    selected_pet_id: '',
    age_group: 'Adult',
    health_level: 50,
    happinness_level: 50,
  });
  const [loginData, setLoginData] = useState<LoginData>({
    username: 'admin',
    password: 'admin@123',
  });
  const [authToken, setAuthToken] = useState<string>('');
  const [userId, setUserId] = useState<string>('');
  const [loginResponse, setLoginResponse] = useState<string>('');
  const [petStateResponse, setPetStateResponse] = useState<string>('');
  const [chatResponse, setChatResponse] = useState<string>('');
  const [activeTab, setActiveTab] = useState('about');
  // Add useEffect to fetch pets when authToken changes
  useEffect(() => {
    if (authToken) {
      console.log('Auth token changed, fetching pets...');
      fetchPets();
    }
  }, [authToken]);

  const handleChange = (field: keyof FormData) => (event: any) => {
    if (field === 'species') {
      setFormData({
        ...formData,
        [field]: event.target.value,
        other_species: '',
        other_breed: '',
        breed: SPECIES_BREEDS[event.target.value as keyof typeof SPECIES_BREEDS][0]
      });
    } else {
      setFormData({
        ...formData,
        [field]: event.target.value,
      });
    }
  };

  const handleLoginChange = (field: keyof LoginData) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setLoginData({
      ...loginData,
      [field]: event.target.value,
    });
  };

  const fetchPets = async () => {
    setIsLoadingPets(true);
    try {
      console.log('Fetching pets with token:', authToken ? 'Present' : 'Missing'); // Debug log
      const response = await fetch('/api/pets', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      
      // console.log('Response status:', response.status); // Debug log
      // console.log('Response headers:', Object.fromEntries(response.headers.entries())); // Debug log
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData?.message || response.statusText}`);
      }
      
      const data = await response.json();
      // console.log('Pets data:', JSON.stringify(data, null, 2)); // Debug log
      
      if (!data.pets) {
        throw new Error('Invalid response format: missing pets array');
      }
      
      // Log all pets before filtering
      console.log('All pets:', data.pets);
      
      // Show all pets regardless of status
      setPets(data.pets);
      
      // If there are pets, select the first one by default
      if (data.pets.length > 0) {
        setFormData(prev => ({
          ...prev,
          selected_pet_id: data.pets[0].pet_id
        }));
      }
    } catch (error) {
      console.error('Error fetching pets:', error);
      // Show error message to user
      setChatResponse(JSON.stringify({
        status: 'error',
        message: 'Error fetching pets',
        details: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString()
      }));
    } finally {
      setIsLoadingPets(false);
    }
  };

const handleLogin = async (event: React.FormEvent) => {
  event.preventDefault();

  await toast.promise(
    (async () => {
      console.log('Attempting login with:', {
        url: '/api/auth/login',
        username: loginData.username,
        password: '***' // masked for security
      });

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: loginData.username,
          password: loginData.password
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData?.message || response.statusText}`);
      }

      const data = await response.json();
      console.log('Response data:', data);

      if (data.token && data.user_id) {
        setAuthToken(data.token);
        setUserId(data.user_id);
        setLoginResponse(JSON.stringify({
          data: {
            token: data.token,
            userId: data.user_id,
          }
        }, null, 2));
      } else {
        setLoginResponse(JSON.stringify({
          data: data,
          details: 'Response missing required token or user_id'
        }, null, 2));
      }
    })(),
    {
      pending: 'Logging in...',
      success: 'Login successful!',
      error: {
        render({ data }) {
          let errorMessage = 'Unknown error occurred';
          let errorDetails = 'Please check your network connection and try again';

          if (data instanceof Error) {
            errorMessage = data.message;
            if (errorMessage.includes('Failed to fetch')) {
              errorDetails = 'Unable to connect to the server. This could be due to:\n' +
                '1. Network connectivity issues\n' +
                '2. Server is not running or not accessible\n\n' +
                'Troubleshooting steps:\n' +
                '1. Open browser developer tools (F12)\n' +
                '2. Check the Network tab\n' +
                '3. Look for the failed request\n' +
                '4. Check if the server is responding\n' +
                '5. Verify the server URL is correct\n\n' +
                'Please check the server configuration and try again.';
            }
          }

          setLoginResponse(JSON.stringify({
            status: 'error',
            message: 'Error during login',
            error: errorMessage,
            details: errorDetails,
            timestamp: new Date().toISOString()
          }, null, 2));

          return `Login failed: ${errorMessage}`;
        }
      }
    }
  );
};

  const handleSliderChange = (field: keyof FormData) => (_event: Event, newValue: number | number[]) => {
    setFormData({
      ...formData,
      [field]: newValue,
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      setPetStateResponse(JSON.stringify(data, null, 2));
    } catch (error) {
      setPetStateResponse('Error submitting form: ' + error);
    }
  };

  const handleChatSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!authToken || !userId) {
      setChatResponse('Please login first to use the chat feature');
      return;
    }
    if (!formData.selected_pet_id) {
      setChatResponse('Please select a pet to chat with');
      return;
    }
    if (!formData.message) {
      setChatResponse('Please enter a message');
      return;
    }

    const chatFormData = new URLSearchParams();
    chatFormData.append('message', formData.message || '');
    chatFormData.append('user_id', userId);
    chatFormData.append('pet_id', formData.selected_pet_id);

    console.log('Chat request payload:', Object.fromEntries(chatFormData.entries()));
    console.log('Auth token:', authToken ? 'Present' : 'Missing');
    console.log('Selected pet:', pets.find(p => p.pet_id === formData.selected_pet_id));

    await toast.promise(
      (async () => {
        const response = await fetch('/api/v1/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Bearer ${authToken}`,
            'Accept': 'application/json'
          },
          body: chatFormData.toString(),
        });

        console.log('Chat response status:', response.status);
        console.log('Chat response headers:', Object.fromEntries(response.headers.entries()));

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          console.error('Chat error response:', errorData);
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorData?.message || response.statusText}`);
        }

        const data = await response.json();
        console.log('Chat response data:', data);
        setChatResponse(JSON.stringify(data, null, 2));
      })(),
      {
        pending: 'Sending message...',
        success: 'Message sent!',
        error: {
          render({ data }) {
            let errorMessage = 'Unknown error occurred';
            let errorDetails = 'Please check your network connection and try again';

            if (data instanceof Error) {
              errorMessage = data.message;
              if (errorMessage.includes('Failed to fetch')) {
                errorDetails = 'Unable to connect to the server. This could be due to:\n' +
                  '1. Network connectivity issues\n' +
                  '2. Server is not running or not accessible\n\n' +
                  'Troubleshooting steps:\n' +
                  '1. Open browser developer tools (F12)\n' +
                  '2. Check the Network tab\n' +
                  '3. Look for the failed request\n' +
                  '4. Check if the server is responding\n' +
                  '5. Verify the server URL is correct\n\n' +
                  'Please check the server configuration and try again.';
              }
            }

            setChatResponse(JSON.stringify({
              status: 'error',
              message: 'Error submitting chat',
              error: errorMessage,
              details: errorDetails,
              timestamp: new Date().toISOString()
            }, null, 2));

            return `Chat failed: ${errorMessage}`;
          }
        }
      }
    );
  };

  return (
    <div className="rounded-3xl flex gap-5 h-screen border-1  border-dashed border-amber-100 p-5">
      

      <div className='flex flex-col gap-10 overflow-hidden'>
      {/* LOGIN */}
        <div className=" max-w-sm bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
            <a href="#">
                <img className="rounded-t-lg" src="/docs/images/blog/image-1.jpg" alt="" />
            </a>
            <div className="p-5">
                <div className='flex align-center justify-between'> 
                    <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Login</h5>
                    <Box className='flex justify-end items-center'>
                      {isLoginExpanded ? (
                        <FaAngleUp 
                          className='text-center w-5 h-5 cursor-pointer' 
                          onClick={() => setIsLoginExpanded(false)}
                        />
                      ) : (
                        <FaAngleDown 
                          className='text-center w-5 h-5 cursor-pointer' 
                          onClick={() => setIsLoginExpanded(true)}
                        />
                      )}
                    </Box>
                </div>
                <p className=" font-normal text-gray-700 dark:text-gray-400">Simulate the user login to the system</p>
                {authToken && (
                  <Typography variant="subtitle2" className="text-green-600 mb-3">
                    <strong>{loginData.username.charAt(0).toUpperCase() + loginData.username.slice(1)}</strong> Logged in Successfully!
                  </Typography>
                )}
                <Collapse in={isLoginExpanded} timeout={500}>
                  <Box component="form" onSubmit={handleLogin} sx={{}} className="p-5">
                    <TextField
                      fullWidth
                      label="Username"
                      value={loginData.username}
                      onChange={handleLoginChange('username')}
                      margin="normal"
                      required
                      sx={{
                        marginTop: 2,
                        '& .MuiInputLabel-root': {
                          color: '#fff',
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: '#fff',
                        },
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                          color: '#fff', // text color inside the input
                          '& fieldset': {
                            borderColor: '#fff',
                          },
                          '&:hover fieldset': {
                            borderColor: '#fff',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#fff',
                          },
                        },
                      }}
                    />
                  <TextField
                    fullWidth
                    label="Password"
                    type="password"
                    value={loginData.password}
                    onChange={handleLoginChange('password')}
                    margin="normal"
                    required
                    sx={{
                      marginTop: 2,
                      '& .MuiInputLabel-root': {
                        color: '#fff',
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#fff',
                      },
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        color: '#fff', // text color inside the input
                        '& fieldset': {
                          borderColor: '#fff',
                        },
                        '&:hover fieldset': {
                          borderColor: '#fff',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#fff',
                        },
                      },
                    }}
                  />

                  </Box>
                </Collapse>
                <div className='flex items-center justify-between cursor-pointer'>
                  <button type="submit" onClick={handleLogin} disabled={!!authToken} className="mt-5 text-center w-[70px] inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                      LOGIN
                  </button>
                </div>
            </div>
        </div>
      {/* END LOGIN */}

      {/* CHAT */}
      <div className=" max-w-sm bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
          <a href="#">
              <img className="rounded-t-lg" src="/docs/images/blog/image-1.jpg" alt="" />
          </a>
          <div className="p-5">
              <div className='flex align-center justify-between'> 
                  <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Pet Chat</h5>
                    <Box className='flex justify-end items-center'>
                      {isChatExpanded ? (
                        <FaAngleUp 
                          className='text-center w-5 h-5 cursor-pointer' 
                          onClick={() => setIsChatExpanded(false)}
                        />
                      ) : (
                        <FaAngleDown 
                          className='text-center w-5 h-5 cursor-pointer'
                          onClick={() => setIsChatExpanded(true)}
                        />
                      )}
                    </Box>
              </div>
              <p className=" font-normal text-gray-700 dark:text-gray-400">Simulate the user chatting with a pet of their choice in the system and getting a response</p>
              {!authToken ? (
                <Typography variant="subtitle2" className="text-center text-red-600">
                  Please login first to use the chat feature
                </Typography>
              ) : isLoadingPets ? (
                <Typography variant="subtitle2" className="text-center text-blue-600">
                  Loading your pets...
                </Typography>
              ) : pets.length === 0 ? (
                <Typography variant="subtitle2" className="text-center text-orange-600">
                  No pets found. Please add a pet first before using the chat feature.
                </Typography>
              ) : (
                <Typography variant="subtitle2" className="text-center text-green-600">
                  {pets.length} pet{pets.length !== 1 ? 's' : ''} found. Please select one to chat with.
                </Typography>
              )}
              <Collapse in={isChatExpanded} timeout={500}>
                <Box component="form" onSubmit={handleChatSubmit} sx={{}} className="p-5">
                {authToken && !isLoadingPets && pets.length > 0 && (
                  <FormControl 
                    fullWidth 
                    margin="normal"
                    sx={{
                      marginTop: 2,
                      '& .MuiInputLabel-root': {
                        color: '#fff',
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#fff',
                      },
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        color: '#fff',
                        '& fieldset': {
                          borderColor: '#fff',
                        },
                        '&:hover fieldset': {
                          borderColor: '#fff',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#fff',
                        },
                      },
                    }}
                  >
                    <InputLabel>Select Pet to Chat With</InputLabel>
                    <Select
                      value={formData.selected_pet_id}
                      onChange={(e) => {
                        const selectedPet = pets.find(p => p.pet_id === e.target.value);
                        setFormData(prev => ({ 
                          ...prev, 
                          selected_pet_id: e.target.value,
                          species: selectedPet?.species.toLowerCase() || prev.species,
                          breed: selectedPet?.breed || prev.breed
                        }));
                      }}
                      label="Select Pet to Chat With"
                      required
                    >
                      {pets.map((pet) => (
                        <MenuItem 
                          key={pet.pet_id} 
                          value={pet.pet_id}
                          disabled={pet.status === 'inactive'}
                          sx={{
                            opacity: pet.status === 'inactive' ? 0.5 : 1,
                            '&.Mui-disabled': {
                              color: 'text.secondary'
                            }
                          }}
                        >
                          {pet.name} ({pet.breed}) - Level {pet.level} {pet.status === 'inactive' ? '(Inactive)' : ''}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}

                <TextField
                  fullWidth
                  label="Message"
                  value={formData.message}
                  onChange={handleChange('message')}
                  margin="normal"
                  required
                  disabled={!authToken || !formData.selected_pet_id}
                  sx={{
                    marginTop: 2,
                    '& .MuiInputLabel-root': {
                      color: '#fff',
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#fff',
                    },
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      color: '#fff',
                      '& fieldset': {
                        borderColor: '#fff',
                      },
                      '&:hover fieldset': {
                        borderColor: '#fff',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#fff',
                      },
                    },
                  }}
                />

                </Box>
              </Collapse>
              <div className='flex items-center justify-between cursor-pointer'>
                <button type="submit" onClick={handleChatSubmit} disabled={!authToken || !formData.selected_pet_id} className="mt-5 text-center w-[200px] inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 text-justify">
                  Send Message to {pets.find(p => p.pet_id === formData.selected_pet_id)?.name || 'Pet'}
                </button>
              </div>
          </div>
      </div>
      {/* END CHAT */}

      {/* STATUS */}
        <div className=" max-w-sm bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
            <a href="#">
                <img className="rounded-t-lg" src="/docs/images/blog/image-1.jpg" alt="" />
            </a>
            <div className="p-5">
                <div className='flex align-center justify-between'> 
                    <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Change Pet Status</h5>
                    <Box className='flex justify-end items-center'>
                      {isExpanded ? (
                        <FaAngleUp 
                          className='text-center w-5 h-5 cursor-pointer' 
                          onClick={() => setIsExpanded(false)}
                        />
                      ) : (
                        <FaAngleDown 
                          className='text-center w-5 h-5 cursor-pointer' 
                          onClick={() => setIsExpanded(true)}
                        />
                      )}
                    </Box>
                </div>
                <p className=" font-normal text-gray-700 dark:text-gray-400">Simulate the changing status of a pet based on the current status of the pet</p>
                <Collapse in={isExpanded} timeout={500}>
                  <Typography variant="h6" className=" text-blue-600">
                    <strong>{loginData.username.charAt(0).toUpperCase() + loginData.username.slice(1)}</strong>. This tab is under development. Please stay tuned!
                  </Typography>
                </Collapse>
                <div className='flex items-center justify-between cursor-pointer'>
                  <button type="submit" disabled onClick={handleLogin} className=" cursor-pointer mt-5 text-center w-[150px] inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                      CHANGE STATUS
                  </button>
                </div>
            </div>
        </div>
      {/* END STATUS */}
      </div>
      
      <div className=" overflow-hidden w-full bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
        <ul className="flex flex-wrap text-sm font-medium text-center text-gray-500 border-b border-gray-200 rounded-t-lg bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:bg-gray-800">
          <li className="me-2">
            <button
              onClick={() => setActiveTab('about')}
              className={`inline-block p-4 rounded-ss-lg ${
                activeTab === 'about'
                  ? 'text-blue-600 dark:text-blue-500 dark:bg-gray-800'
                  : 'hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Chat
            </button>
          </li>
          <li className="me-2">
            <button
              onClick={() => setActiveTab('services')}
              className={`inline-block p-4 ${
                activeTab === 'services'
                  ? 'text-blue-600 dark:text-blue-500 dark:bg-gray-800'
                  : 'hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Status
            </button>
          </li>
          <li className="me-2">
            <button
              onClick={() => setActiveTab('statistics')}
              className={`inline-block p-4 ${
                activeTab === 'statistics'
                  ? 'text-blue-600 dark:text-blue-500 dark:bg-gray-800'
                  : 'hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Login Details
            </button>
          </li>
        </ul>

        <div className="p-4 bg-white rounded-lg md:p-8 dark:bg-gray-800">
          {activeTab === 'about' && (
            <div>
                {authToken ? (
                  <p className=" text-green-500">Logged in as: {loginData.username}</p>
                ) : (
                  <p className="italic text-red-500">Please log in to start a conversation</p>
                )}
              <h2 className="mb-3 text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                Prompt: {formData.message}
              </h2>
              <p className="mb-3 text-gray-500 dark:text-gray-400">
                {chatResponse ? (
                  <pre className="whitespace-pre-wrap break-words">{chatResponse}</pre>
                ) : (
                  <p className="italic">Here is where the response based on prompt should show</p>
                )}

              </p>
            </div>
          )}

          {activeTab === 'services' && (
            <div className="flex flex-col items-center justify-center text-center  p-5">
                {authToken ? (
                  <p className=" text-green-500">Logged in as: {loginData.username}</p>
                ) : (
                  <p className="italic text-red-500">Please log in to start changing pet status</p>
                )}
              <h1 className="text-4xl font-extrabold mb-4">🚧 PET STATUS 🚧</h1>
              <p className="text-lg text-gray-600">
                We're working hard to bring you this feature. Please check back soon!
              </p>
              <div className="w-1/2 flex flex-col mt-5">
                <label className="h6">Pet Name</label>
                <input 
                  type="text" 
                  value={formData.selected_pet_id ? pets.find(p => p.pet_id === formData.selected_pet_id)?.name || '' : formData.pet_name}
                  onChange={e => setFormData({ ...formData, pet_name: e.target.value })} 
                  className="mb-3 p-2 border border-gray-300 rounded"
                  disabled={!!formData.selected_pet_id}
                />
                <label className="h6">Species</label>
                <select 
                  value={formData.species} 
                  onChange={handleChange('species')} 
                  className="mb-3 p-2 border border-gray-300 rounded"
                  disabled={!!formData.selected_pet_id}
                >
                  {Object.keys(SPECIES_BREEDS).map((species) => (
                    <option key={species} value={species}>
                      {species.charAt(0).toUpperCase() + species.slice(1)}
                    </option>
                  ))}
                </select>

                <div className="relative mb-6">
                    <label className="h6">Hunger Level</label>
                    <input id="labels-range-input" type="range" value={formData.hunger_level}  onChange={e => setFormData({ ...formData, hunger_level: Number(e.target.value) })}  min="0" max="100" className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"/>
                    <span className="text-sm text-gray-500 dark:text-gray-400 absolute start-0 -bottom-6">0</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 absolute start-1/4 -translate-x-1/2 rtl:translate-x-1/2 -bottom-6">25</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 absolute start-1/2 -translate-x-1/2 rtl:translate-x-1/2 -bottom-6">50</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 absolute start-3/4 -translate-x-1/2 rtl:translate-x-1/2 -bottom-6">75</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 absolute end-0 -bottom-6">100</span>
                </div>

              </div>
            </div>
          )}

          {activeTab === 'statistics' && (
            <div className="">
              <h2 className="mb-3 text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                Login Response
              </h2>
              <p className="mb-3 text-gray-500 dark:text-gray-400">
                After you successfully log in, the system will display the complete login response here. This includes user authentication status, session token (if applicable), and any relevant user data retrieved from the server. Use this information for debugging, verification, or to better understand the login process flow.
              </p>

              {loginResponse && (
                <div>
                  <pre style={{ 
                    whiteSpace: 'pre-wrap',
                    wordWrap: 'break-word',
                    overflow: 'auto'
                  }} className="mb-3 text-gray-500 dark:text-gray-400">{loginResponse}</pre>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick={false}
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
    </div>
  );
} 