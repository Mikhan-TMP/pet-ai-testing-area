'use client';

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
    try {
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
        // Set the token and user ID
        setAuthToken(data.token);
        setUserId(data.user_id);
        setLoginResponse(JSON.stringify({
          data: {
            token: data.token,
            userId: data.user_id,
            ...data
          }
        }, null, 2));
      } else {
        setLoginResponse(JSON.stringify({
          data: data,
          details: 'Response missing required token or user_id'
        }, null, 2));
      }
    } catch (error) {
      console.error('Login error:', error);
      let errorMessage = 'Unknown error occurred';
      let errorDetails = 'Please check your network connection and try again';

      if (error instanceof Error) {
        errorMessage = error.message;
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
    }
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

    try {
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
    } catch (error) {
      console.error('Chat error:', error);
      setChatResponse(JSON.stringify({
        status: 'error',
        message: 'Error submitting chat',
        details: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString()
      }, null, 2));
    }
  };

  return (
    <Container maxWidth="xl" className="rounded-3xl flex gap-5 flex h-screen ">
      {/* LOGIN */}
      <Paper elevation={3} sx={{ 
        p: 4, 
        mt: 4, 
        borderRadius: 5, 
        bgcolor: '#f0f0f0',  
        width: '50%', 
        height: isLoginExpanded ? '45%' : '20%',
        transition: 'height 0.3s ease-in-out',
        overflow: 'auto'
      }}>
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
        <Typography variant="h5" className="text-center font-bold" gutterBottom>
          LOGIN USERS
        </Typography>
        <Typography className='text-center italic underline' variant='subtitle2'>
          POST: /api/auth/login
        </Typography>
        <hr className='mt-2 mb-2'/>

        <Collapse in={isLoginExpanded} timeout={500}>
          <Box component="form" onSubmit={handleLogin} sx={{}} className="p-5">
            <TextField
              fullWidth
              label="Username"
              value={loginData.username}
              onChange={handleLoginChange('username')}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={loginData.password}
              onChange={handleLoginChange('password')}
              margin="normal"
              required
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 3 }}
            >
              Login
            </Button>
          </Box>
          {loginResponse && (
            <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="h6" gutterBottom>
                Login Response:
              </Typography>
              <pre style={{ 
                whiteSpace: 'pre-wrap',
                wordWrap: 'break-word',
                maxWidth: '100%',
                overflow: 'auto'
              }}>{loginResponse}</pre>
            </Box>
          )}
        </Collapse>

        {authToken && (
          <Typography variant="subtitle2" className="text-center text-green-600">
            Logged in successfully!
          </Typography>
        )}
      </Paper>


      {/* PET CHAT */}
      <Paper elevation={3} sx={{ 
        p: 4, 
        mt: 4, 
        borderRadius: 5, 
        bgcolor: '#f0f0f0',
        width: '50%',
        height: isChatExpanded ? '45%' : '20%',
        transition: 'height 0.3s ease-in-out',
        overflow: 'auto'
      }}>
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
        <Typography variant="h5" className="text-center font-bold" gutterBottom>
          PET CHAT
        </Typography>
        <Typography className='text-center italic underline' variant='subtitle2'>
          POST: /api/v1/chat
        </Typography>
        <hr className='mt-2 mb-2'/>

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
              <FormControl fullWidth margin="normal">
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
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 3 }}
              disabled={!authToken || !formData.selected_pet_id}
            >
              Send Message to {pets.find(p => p.pet_id === formData.selected_pet_id)?.name || 'Pet'}
            </Button>
          </Box>
        </Collapse>

        {chatResponse && (
          <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
            <Typography variant="h6" gutterBottom>
              Chat Response:
            </Typography>
            <pre style={{ 
              whiteSpace: 'pre-wrap',
              wordWrap: 'break-word',
              maxWidth: '100%',
              overflow: 'auto'
            }}>{chatResponse}</pre>
          </Box>
        )}
      </Paper>


      {/* PET STATE */}
      <Paper elevation={3} sx={{ 
        p: 4, 
        mt: 4, 
        borderRadius: 5, 
        bgcolor: '#f0f0f0',
        width: '50%',
        height: isExpanded ? '90%' : '20%',
        transition: 'height 0.3s ease-in-out',
        overflow: 'auto'
      }}>
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
        
        <Typography variant="h5" className="text-center font-bold" gutterBottom>
          PET STATE
        </Typography>
        <Typography className='text-center italic underline' variant='subtitle2'>
          POST: /api/pet_status
        </Typography>
        <hr className='mt-2 mb-2'/>

        <Collapse in={isExpanded} timeout={500}>
          <Box component="form" onSubmit={handleSubmit} sx={{  }} className="p-5" >
            <Box className="mt-5">
              <Typography variant="h6" gutterBottom>
                Pet Information
              </Typography>
              <TextField
                  fullWidth
                  label="Pet Name"
                  value={formData.selected_pet_id ? pets.find(p => p.pet_id === formData.selected_pet_id)?.name || '' : formData.pet_name}
                  onChange={handleChange('pet_name')}
                  margin="normal"
                  required
                  disabled={!!formData.selected_pet_id}
                  helperText={formData.selected_pet_id ? "Pet name is based on selected pet" : "Enter pet name"}
                />
              <FormControl fullWidth margin="normal">
                <InputLabel>Species</InputLabel>
                <Select
                  value={formData.species}
                  onChange={handleChange('species')}
                  label="Species"
                  required
                  disabled={!!formData.selected_pet_id}
                >
                  {Object.keys(SPECIES_BREEDS).map((species) => (
                    <MenuItem key={species} value={species}>
                      {species.charAt(0).toUpperCase() + species.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {formData.species === 'other' && (
                <TextField
                  fullWidth
                  label="Specify Other Species"
                  value={formData.other_species}
                  onChange={handleChange('other_species')}
                  margin="normal"
                  required
                  disabled={!!formData.selected_pet_id}
                />
              )}

              <FormControl fullWidth margin="normal">
                <InputLabel>Breed</InputLabel>
                <Select
                  value={formData.breed}
                  onChange={handleChange('breed')}
                  label="Breed"
                  required
                  disabled={!!formData.selected_pet_id}
                >
                  {formData.species &&
                    SPECIES_BREEDS[formData.species as keyof typeof SPECIES_BREEDS].map((breed) => (
                      <MenuItem key={breed} value={breed}>
                        {breed}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>

              {formData.species === 'other' && (
                <TextField
                  fullWidth
                  label="Specify Other Breed"
                  value={formData.other_breed}
                  onChange={handleChange('other_breed')}
                  margin="normal"
                  required
                  disabled={!!formData.selected_pet_id}
                />
              )}

              <FormControl fullWidth margin="normal">
                <InputLabel>Mood</InputLabel>
                <Select
                  value={formData.mood}
                  onChange={handleChange('mood')}
                  label="Mood"
                  required
                >
                  {MOODS.map((mood) => (
                    <MenuItem key={mood} value={mood}>
                      {mood}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Box sx={{ mt: 2 }}>
                <Typography gutterBottom>Energy Level</Typography>
                <Slider
                  value={formData.energy_level}
                  onChange={handleSliderChange('energy_level')}
                  min={1}
                  max={100}
                  marks
                  valueLabelDisplay="auto"
                />
              </Box>

              <Box sx={{ mt: 2 }}>
                <Typography gutterBottom>Hygiene Level</Typography>
                <Slider
                  value={formData.hygiene_level}
                  onChange={handleSliderChange('hygiene_level')}
                  min={1}
                  max={100}
                  marks
                  valueLabelDisplay="auto"
                />
              </Box>

              <Box sx={{ mt: 2 }}>
                <Typography gutterBottom>Hunger Level</Typography>
                <Slider
                  value={formData.hunger_level}
                  onChange={handleSliderChange('hunger_level')}
                  min={1}
                  max={100}
                  marks
                  valueLabelDisplay="auto"
                />
              </Box>

              <Box sx={{ mt: 2 }}>
                <Typography gutterBottom>Health Level</Typography>
                <Slider
                  value={formData.health_level}
                  onChange={handleSliderChange('health_level')}
                  min={1}
                  max={100}
                  marks
                  valueLabelDisplay="auto"
                />
              </Box>
              <Box sx={{ mt: 2 }}>
                <Typography gutterBottom>Happiness Level</Typography>
                <Slider
                  value={formData.happinness_level}
                  onChange={handleSliderChange('happinness_level')}
                  min={1}
                  max={100}
                  marks
                  valueLabelDisplay="auto"
                />
              </Box>



              <FormControl fullWidth margin="normal">
                <InputLabel>Age Group</InputLabel>
                <Select
                  value={formData.age_group}
                  onChange={handleChange('age_group')}
                  label="Age Group"
                  required
                >
                  {AGE_GROUPS.map((age) => (
                    <MenuItem key={age} value={age}>
                      {age}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

            </Box>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 3 }}
            >
              Submit
            </Button>
          </Box>
        </Collapse>

        {petStateResponse && (
          <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
            <Typography variant="h6" gutterBottom>
              Pet State Response:
            </Typography>
            <pre>{petStateResponse}</pre>
          </Box>
        )}
      </Paper>


    </Container>
  );
} 