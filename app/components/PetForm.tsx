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
const MOODS = ['Happy', 'Calm', 'Energetic', 'Anxious', 'Playful', 'Aggressive', 'Sad'];

// Educational levels
const EDUCATIONAL_LEVELS = ['Basic', 'Intermediate', 'Advanced', 'Expert'];

// Default known commands
const DEFAULT_COMMANDS = ['Sit', 'Stay', 'Come', 'Down', 'Heel'];

// Age groups
// const AGE_GROUPS = ['1 week old', '15 days old', '1 month old', '3 months old', 'Adult'];

// Sickness
const SICKNESS = ['flu', 'cold', 'broken bones', 'hyperthermia']

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
  happiness_level: number;
  sickness_severity: number;
  sick: number;
  stress_level?: number;
  sickness: string;
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
    happiness_level: 50,
    sickness_severity: 0.00,
    sick: 0,
    stress_level: 50,
    sickness: '',
  });
  const [loginData, setLoginData] = useState<LoginData>({
    username: 'sample',
    password: 'admin123',
  });
  const [authToken, setAuthToken] = useState<string>('');
  const [userId, setUserId] = useState<string>('');
  const [loginResponse, setLoginResponse] = useState<string>('');
  const [petStateResponse, setPetStateResponse] = useState<string>('');
  const [chatResponse, setChatResponse] = useState<string>('');
  const [activeTab, setActiveTab] = useState('about');
  const [petStatus, setPetStatus] = useState<any>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);
  const [interactions, setInteractions] = useState<any[]>([]);
  const [selectedInteractionId, setSelectedInteractionId] = useState<string>('');
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [items, setItems] = useState<any[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const selectedItem = items.find(item => (item.id || item.item_id) === selectedItemId);
  const LIFE_STAGE_LABELS: Record<number, string> = {
    1: 'Baby',
    2: 'Child',
    3: 'Adult',
  };
useEffect(() => {
  if (!authToken) return; // Only fetch if logged in
  fetch('/api/pet-interactions', {
    headers: {
      'Authorization': `Bearer ${authToken}`,
    },
  })
    .then(res => res.json())
    .then(data => {
      // If API returns { data: [...] }
      const list = Array.isArray(data) ? data : data.data || [];
      setInteractions(list);
      if (list.length > 0) setSelectedInteractionId(list[0].interaction_type_id);
    });
}, [authToken]);
const selectedInteraction = interactions.find(
  (interaction) => interaction.interaction_type_id === selectedInteractionId
);
  // Fetch categories on mount
  useEffect(() => {
    if (!authToken) return; // Only fetch if logged in
    fetch('/api/items/categories', {
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        console.log('Categories:', data);
        setCategories(data.data || []);
      });
  }, [authToken]);

  // Update fetching items to use category_id
  useEffect(() => {
    if (!selectedCategoryId || !authToken) {
      setItems([]);
      setSelectedItemId('');
      return;
    }
    fetch(`/api/items/${selectedCategoryId}/items`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        console.log('Items:', data);
        setItems(data.data || []);
        setSelectedItemId('');
      });
  }, [selectedCategoryId, authToken]);
  

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
    } 
    else if (field === 'sick') {
      const sickValue = Number(event.target.value);
      setFormData({
        ...formData,
        sick: sickValue,
        sickness: sickValue === 0 ? '' : formData.sickness,
        sickness_severity: sickValue === 0 ? 0 : formData.sickness_severity,
      });
    } 
    else {
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
          selected_pet_id: data.pets[0].pet_id,
          age_group: LIFE_STAGE_LABELS[data.pets[0].life_stage_id] || 'Adult',
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

    const fetchPetStatus = async () => {
    if (!authToken || !formData.selected_pet_id) return;
    setIsLoadingStatus(true);
    setPetStatus(null);
    try {
      const response = await fetch(`/api/pet-status?pet_id=${formData.selected_pet_id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      const statusdata = await response.json();
      console.log('Pet status:', statusdata);

      // Set full data to petStatus (if needed elsewhere)
      setPetStatus(statusdata);

      // Set specific values into formData
      setFormData(prev => ({
        ...prev,
        hunger_level: Number(statusdata.hunger_level),
        happiness_level: Number(statusdata.happiness_level),
        health_level: Number(statusdata.health_level),
        hygiene_level: Number(statusdata.cleanliness_level),
        energy_level: Number(statusdata.energy_level),
        stress_level: Number(statusdata.stress_level),
        mood: statusdata.current_mood.charAt(0).toUpperCase() + statusdata.current_mood.slice(1),
        sickness_severity: Number(statusdata.sickness_severity),
        sick: statusdata.is_sick === '1' ? 1 : 0,
        sickness: statusdata.sickness_type,
      }));

    } catch (error) {
      console.error(error);
      setPetStatus({ status: 'error', message: 'Failed to fetch pet status', error });
    } finally {
      setIsLoadingStatus(false);
    }
  };
  useEffect(() => {
    if (activeTab === 'services' && formData.selected_pet_id && authToken) {
      fetchPetStatus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, formData.selected_pet_id, authToken]);


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




  const handleChangeStatus = async () => {
    if (!authToken || !formData.selected_pet_id) {
      toast.error('Please login and select a pet first.');
      return;
    }

    const payload = {
      hunger_level: formData.hunger_level,
      happiness_level: formData.happiness_level,
      health_level: formData.health_level,
      energy_level: formData.energy_level,
      cleanliness_level: formData.hygiene_level,
      current_mood: formData.mood.toLowerCase(),
      stress_level: formData.stress_level,
      is_sick: formData.sick === 1 ? 1 : 0,
      sickness_severity: formData.sickness_severity,
      sickness_type: formData.sick === 0 ? '' : formData.sickness,
    };

    console.log('Payload:', payload);
    console.log('Auth token:', authToken ? 'Present' : 'Missing');
    console.log('Pet ID:', formData.selected_pet_id);

    await toast.promise(
      (async () => {
        const response = await fetch('/api/pet-status', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            pet_id: formData.selected_pet_id,
            ...payload,
          }),
        });

        const data = await response.json();
        if (!response.ok) {
          console.error('Failed to update pet status:', data);
          throw new Error(data?.message || 'Failed to update pet status');
        }
        console.log('Pet status updated successfully:', data);
        setPetStateResponse(JSON.stringify(data, null, 2));
        return data;
      })(),
      {
        pending: 'Updating pet status...',
        success: 'Pet status updated successfully!',
        error: {
          render({ data }) {
            let errorMessage = 'Unknown error occurred';
            if (data instanceof Error) {
              errorMessage = data.message;
            }
            setPetStateResponse('Error: ' + errorMessage);
            return `Error updating pet status: ${errorMessage}`;
          }
        }
      }
    );
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
    <div className="rounded-3xl flex gap-5 h-screen  border-dashed border-amber-100 p-5">
      

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
                    Hello <strong>{loginData.username.charAt(0).toUpperCase() + loginData.username.slice(1)}</strong>
                  </Typography>
                </Collapse>
                <div className='flex items-center justify-between cursor-pointer'>
                  <button
                    type="button"
                    onClick={() => setActiveTab('services')}
                    disabled={!authToken || !formData.selected_pet_id}
                    className="cursor-pointer mt-5 text-center w-[150px] inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                  >
                    Proceed to Status
                  </button>
                </div>
            </div>
        </div>
      {/* END STATUS */}
      </div>
      
      <div className="overflow-y-scroll w-full bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
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
                onClick={() => setActiveTab('interactions')}
                className={`inline-block p-4 ${
                  activeTab === 'interactions'
                    ? 'text-blue-600 dark:text-blue-500 dark:bg-gray-800'
                    : 'hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Interactions
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
            <div className="flex flex-col p-5 justify-center items-center text-center">
              <div>
                  {authToken ? (
                    <p className=" text-green-500">Logged in as: {loginData.username}</p>
                  ) : (
                    <p className="italic text-red-500">Please log in to start changing pet status</p>
                  )}
                <h1 className="text-4xl font-extrabold mb-4">🐾 PET STATUS 🐶</h1>
                <p className="text-lg text-gray-600">
                  Here you can change the status of your pet.
                </p>
              </div>
              <div className="w-full flex flex-row mt-5 gap-10 ">
                {/* basic deets */}

                <div className="w-full flex flex-col mb-5">
                  <h2 className='text-2xl'>Pet Details</h2>
                  <hr className="my-4 border-gray-300 dark:border-gray-700"/>

                  <label className="h6 text-left">Pet Name</label>
                  <input 
                    type="text" 
                    value={formData.selected_pet_id ? pets.find(p => p.pet_id === formData.selected_pet_id)?.name || '' : formData.pet_name}
                    onChange={e => setFormData({ ...formData, pet_name: e.target.value })} 
                    className="mb-3 p-2 border border-gray-300 rounded"
                    disabled={!!formData.selected_pet_id}
                  />
                  <label className="h6 text-left">Species</label>
                  <select 
                    value={formData.species} 
                    onChange={handleChange('species')} 
                    className={`
                      mb-3 p-2 
                      border border-gray-300 
                      rounded
                      ${formData.selected_pet_id ? 'bg-[#330606]' : ''}
                    `}
                    disabled={!!formData.selected_pet_id}
                  >
                    {Object.keys(SPECIES_BREEDS).map((species) => (
                      <option key={species} value={species}>
                        {species.charAt(0).toUpperCase() + species.slice(1)}
                      </option>
                    ))}
                  </select>

                  <label className="h6 text-left">Breed</label>
                  <select 
                    value={formData.breed}
                    onChange={handleChange('breed')}
                    className={`
                      mb-3 p-2 
                      border border-gray-300 
                      rounded
                      ${formData.selected_pet_id ? 'bg-[#330606]' : ''}
                    `}
                    disabled={!!formData.selected_pet_id}
                  >
                    {formData.species &&
                      SPECIES_BREEDS[formData.species as keyof typeof SPECIES_BREEDS].map((breed) => (
                        <option key={breed} value={breed}>
                          {breed}
                        </option>
                      ))}
                  </select>

                  <label className="h6 text-left">Mood</label>
                  <select 
                    value={formData.mood} 
                    onChange={handleChange('mood')} 
                    className="mb-3 p-2 border border-gray-300 rounded"
                    // disabled={!!formData.selected_pet_id}
                  >
                    {MOODS.map((mood) => (
                      <option key={mood} value={mood}>
                        {mood}
                      </option>
                    ))}
                  </select>
                  
                  <label className="h6 text-left">Age Group</label>
                  <select
                    value={formData.age_group}
                    onChange={handleChange('age_group')}
                    className={`
                      mb-3 p-2 
                      border border-gray-300 
                      rounded
                      ${formData.selected_pet_id ? 'bg-[#330606]' : ''}
                    `}
                    disabled={!!formData.selected_pet_id}
                  >
                    {[1, 2, 3].map((stageId) => (
                      <option key={stageId} value={LIFE_STAGE_LABELS[stageId]}>
                        {LIFE_STAGE_LABELS[stageId]}
                      </option>
                    ))}
                  </select>
                  

                  <label className="h6 text-left">Should the pet be sick?</label>
                    <select 
                      value={formData.sick} 
                      onChange={handleChange('sick')} 
                      className="mb-3 p-2 border border-gray-300 rounded"
                    >
                      <option value="0">No</option>
                      <option value="1">Yes</option>
                    </select>

                    {formData.sick === 1 && (
                      <>
                        <label className="h6 text-left">What sickness?</label>
                        <select
                          value={formData.sickness}
                          onChange={handleChange('sickness')}
                          className="mb-3 p-2 border border-gray-300 rounded"
                        >
                          {SICKNESS.map((sickness) => (
                            <option key={sickness} value={sickness}>
                              {sickness}
                            </option>
                          ))}
                        </select>
                      </>
                    )}
                </div>

                {/* parameters */}
                <div className="w-full flex flex-col mb-5">
                  <h2 className='text-2xl'>Pet Parameters</h2>
                  <hr className="my-4 border-gray-300 dark:border-gray-700"/>

                  {/* hunger level */}
                  <div className="relative mb-6">
                      <label className="h6">Hunger Level</label>
                      <input id="labels-range-input" type="range" value={formData.hunger_level}  onChange={e => setFormData({ ...formData, hunger_level: Number(e.target.value) })}  min="0" max="100" className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"/>
                      <span className="text-sm text-gray-500 dark:text-gray-400 absolute start-0 -bottom-6">0</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400 absolute start-1/4 -translate-x-1/2 rtl:translate-x-1/2 -bottom-6">25</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400 absolute start-1/2 -translate-x-1/2 rtl:translate-x-1/2 -bottom-6">50</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400 absolute start-3/4 -translate-x-1/2 rtl:translate-x-1/2 -bottom-6">75</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400 absolute end-0 -bottom-6">100</span>
                  </div>
                  {/* Energy Level */}
                  <div className="relative mb-6">
                      <label className="h6">Energy Level</label>
                      <input id="labels-range-input" type="range" value={formData.energy_level}  onChange={e => setFormData({ ...formData, energy_level: Number(e.target.value) })}  min="0" max="100" className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"/>
                      <span className="text-sm text-gray-500 dark:text-gray-400 absolute start-0 -bottom-6">0</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400 absolute start-1/4 -translate-x-1/2 rtl:translate-x-1/2 -bottom-6">25</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400 absolute start-1/2 -translate-x-1/2 rtl:translate-x-1/2 -bottom-6">50</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400 absolute start-3/4 -translate-x-1/2 rtl:translate-x-1/2 -bottom-6">75</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400 absolute end-0 -bottom-6">100</span>
                  </div>
                  {/* Hygiene Level */}
                  <div className="relative mb-6">
                      <label className="h6">Hygiene Level</label>
                      <input id="labels-range-input" type="range" value={formData.hygiene_level}  onChange={e => setFormData({ ...formData, hygiene_level: Number(e.target.value) })}  min="0" max="100" className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"/>
                      <span className="text-sm text-gray-500 dark:text-gray-400 absolute start-0 -bottom-6">0</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400 absolute start-1/4 -translate-x-1/2 rtl:translate-x-1/2 -bottom-6">25</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400 absolute start-1/2 -translate-x-1/2 rtl:translate-x-1/2 -bottom-6">50</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400 absolute start-3/4 -translate-x-1/2 rtl:translate-x-1/2 -bottom-6">75</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400 absolute end-0 -bottom-6">100</span>
                  </div>
                  {/* Health Level */}
                  <div className="relative mb-6">
                      <label className="h6">Health Level</label>
                      <input id="labels-range-input" type="range" value={formData.health_level}  onChange={e => setFormData({ ...formData, health_level: Number(e.target.value) })}  min="0" max="100" className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"/>
                      <span className="text-sm text-gray-500 dark:text-gray-400 absolute start-0 -bottom-6">0</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400 absolute start-1/4 -translate-x-1/2 rtl:translate-x-1/2 -bottom-6">25</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400 absolute start-1/2 -translate-x-1/2 rtl:translate-x-1/2 -bottom-6">50</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400 absolute start-3/4 -translate-x-1/2 rtl:translate-x-1/2 -bottom-6">75</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400 absolute end-0 -bottom-6">100</span>
                  </div>
                  {/* Happy Level */}
                  <div className="relative mb-6">
                      <label className="h6">Happiness Level</label>
                      <input id="labels-range-input" type="range" value={formData.happiness_level}  onChange={e => setFormData({ ...formData, happiness_level: Number(e.target.value) })}  min="0" max="100" className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"/>
                      <span className="text-sm text-gray-500 dark:text-gray-400 absolute start-0 -bottom-6">0</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400 absolute start-1/4 -translate-x-1/2 rtl:translate-x-1/2 -bottom-6">25</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400 absolute start-1/2 -translate-x-1/2 rtl:translate-x-1/2 -bottom-6">50</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400 absolute start-3/4 -translate-x-1/2 rtl:translate-x-1/2 -bottom-6">75</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400 absolute end-0 -bottom-6">100</span>
                  </div>
                  {/* Sickness_Severity */}
                  <div className="relative mb-6">
                      <label className="h6">Sickness Severity</label>
                          <input
                            id="labels-range-input"
                            type="range"
                            value={formData.sickness_severity}
                            onChange={e => setFormData({ ...formData, sickness_severity: Number(e.target.value) })}
                            min="0"
                            max="100"
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                            disabled={formData.sick === 0.00}
                          />
                      <span className="text-sm text-gray-500 dark:text-gray-400 absolute start-0 -bottom-6">0</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400 absolute start-1/4 -translate-x-1/2 rtl:translate-x-1/2 -bottom-6">25</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400 absolute start-1/2 -translate-x-1/2 rtl:translate-x-1/2 -bottom-6">50</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400 absolute start-3/4 -translate-x-1/2 rtl:translate-x-1/2 -bottom-6">75</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400 absolute end-0 -bottom-6">100</span>
                  </div>
                  {/* Stress Level */}
                  <div className='relative mb-6'>
                    <label className="h6">Stress Level</label>
                    <input id="labels-range-input" type="range" value={formData.stress_level}  onChange={e => setFormData({ ...formData, stress_level: Number(e.target.value) })}  min="0" max="100" className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"/>
                    <span className="text-sm text-gray-500 dark:text-gray-400 absolute start-0 -bottom-6">0</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 absolute start-1/4 -translate-x-1/2 rtl:translate-x-1/2 -bottom-6">25</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 absolute start-1/2 -translate-x-1/2 rtl:translate-x-1/2 -bottom-6">50</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 absolute start-3/4 -translate-x-1/2 rtl:translate-x-1/2 -bottom-6">75</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 absolute end-0 -bottom-6">100</span>
                  </div>
                </div>
              </div>
                <button
                  type="button"
                  onClick={handleChangeStatus}
                  disabled={!authToken || !formData.selected_pet_id}
                  className="cursor-pointer mt-5 text-center w-[150px] inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                >
                  CHANGE STATUS
                </button>
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

          {activeTab === 'interactions' && (
            <div>
                {authToken ? (
                  <p className=" text-green-500">Logged in as: {loginData.username}</p>
                ) : (
                  <p className="italic text-red-500">Please log in to view and start interactions</p>
                )}
              <h2 className="mb-3 text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                Interactions
              </h2>
              <p className="mb-3 text-gray-500 dark:text-gray-400">
                Here you can view and manage the interactions available for your pets.
              </p>
              {interactions.length > 0 ? (
                <div>
                  <label className="block mb-2 font-bold">Select Interaction:</label>
                  <select
                    className="mb-4 p-2 border rounded focus:text-gray-800"
                    value={selectedInteractionId}
                    onChange={e => {
                      setSelectedInteractionId(e.target.value);
                      e.target.blur();
                    }}
                  >
                    <option value="">-- Pick Interaction --</option>
                    {interactions.map((interaction) => (
                      
                      <option key={interaction.interaction_type_id} value={interaction.interaction_type_id}>
                        {interaction.interaction_name}
                      </option>
                    ))}
                  </select>
                  {selectedInteraction && (
                    <div className='flex gap-4 justify-center items-center mb-4'>
                      <div className="p-4 border rounded bg-gray-50  dark:bg-gray-700 w-full">
                        <div><strong>ID:</strong> {selectedInteraction.interaction_type_id}</div>
                        <div><strong>Category:</strong> {selectedInteraction.category}</div>
                        <div><strong>Base Points:</strong> {selectedInteraction.base_points}</div>
                        <div><strong>Max Daily Count:</strong> {selectedInteraction.max_daily_count}</div>
                        <div><strong>Required Subscription:</strong> {selectedInteraction.required_subscription}</div>
                        <div><strong>Description:</strong> {selectedInteraction.description}</div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">No interactions available.</p>
              )}
              {categories.length > 0 ? (
                <>
                  {/* Category Dropdown */}
                  <div className="mb-4">
                    <label className="block mb-2 font-bold">Select Category:</label>
                    <select
                      className="mb-2 p-2 border rounded focus:text-gray-800"
                      value={selectedCategoryId}
                      onChange={e => {
                        setSelectedCategoryId(e.target.value);
                        e.target.blur();
                      }}
                    >
                      <option value="">-- Select Category --</option>
                      {categories.map(cat => (
                        <option key={cat.category_id} value={cat.category_id}>
                          {cat.category_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Item Dropdown */}
                  <div className="mb-4">
                    <label className="block mb-2 font-bold">Select Item:</label>
                    <select
                      className="mb-2 p-2 border rounded focus:text-gray-800"
                      value={selectedItemId}
                      onChange={e => {
                        setSelectedItemId(e.target.value);
                        e.target.blur();
                      }}
                      disabled={!selectedCategoryId || items.length === 0}
                    >
                      <option value="">-- Select Item --</option>
                      {items.map(item => (
                        <option key={item.id || item.item_id} value={item.id || item.item_id}>
                          {item.name || item.item_name}
                        </option>
                      ))}
                    </select>
                  </div>
                    {selectedItem && (
                      <div className="p-4 border rounded bg-gray-50 dark:bg-gray-700 w-full mb-4">
                        <div><strong>Name:</strong> {selectedItem.item_name}</div>
                        <div><strong>Description:</strong> {selectedItem.description}</div>
                        <div><strong>Category:</strong> {selectedItem.category_name}</div>
                        <div><strong>Price:</strong> {selectedItem.final_price}</div>
                        <div><strong>Rarity:</strong> {selectedItem.rarity}</div>
                        <div><strong>Tradable:</strong> {selectedItem.is_tradable === "1" ? "Yes" : "No"}</div>
                        <div><strong>Buyable:</strong> {selectedItem.is_buyable === "1" ? "Yes" : "No"}</div>
                        <div><strong>Effects:</strong>
                          {selectedItem.effects && selectedItem.effects.length > 0 ? (
                            <ul className="ml-4">
                              {selectedItem.effects.map((effect: any) => (
                                <li key={effect.effect_id}>
                                  <strong>{effect.effect_name}</strong> ({effect.effect_type})<br />
                                  {effect.effect_values && (
                                    <span>
                                      {JSON.parse(effect.effect_values).map((val: any, idx: number) =>
                                        Object.entries(val).map(([k, v]) => (
                                          <span key={k + idx}>{k}: {v}&nbsp;</span>
                                        ))
                                      )}
                                    </span>
                                  )}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <span>None</span>
                          )}
                        </div>
                      </div>
                    )}
                  {/* Show if selected category but no items */}
                  {selectedCategoryId && items.length === 0 && (
                    <p className="text-gray-500 dark:text-gray-400">No items available for this category.</p>
                  )}
                </>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">No categories available.</p>
              )}


              <button
                type="button"
                // onClick={handleInteractionSubmit}
                disabled={!authToken || !formData.selected_pet_id}
                className="mt-5 text-center w-[150px] inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              >
                Interact with:  {pets.find(p => p.pet_id === formData.selected_pet_id)?.name || 'Pet'}
              </button>
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