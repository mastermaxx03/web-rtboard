import React, { useState } from 'react';
import { Card, CardContent, Typography, MenuItem, Select, FormControl, InputLabel, Box, Grid } from '@mui/material';

const usersData = [
  {
    name: 'Elixir products',
    email: 'elixir.iotproducts@gmail.com',
    role: ''
  },
  {
    name: 'Ramesh',
    email: 'elixir.supervisor1@gmail.com',
    role: ''
  },
  {
    name: 'Suresh',
    email: 'elixir.supervisor2@gmail.com',
    role: ''
  },
  {
    name: 'Gopal',
    email: 'elixir.supervisor3@gmail.com',
    role: ''
  }
];

const RoleAssigner = () => {
  const [users, setUsers] = useState(usersData);

  const handleRoleChange = (index, newRole) => {
    const updatedUsers = [...users];
    updatedUsers[index].role = newRole;
    setUsers(updatedUsers);
  };

  return (
    <Box p={3}>
      <Grid container spacing={2}>
        {users.map((user, index) => (
          <Grid item xs={12} key={index}>
            <Card variant="outlined" sx={{ borderRadius: 3 }}>
              <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h3" fontWeight="bold">
                    {user.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user.email}
                  </Typography>
                </Box>
                <FormControl variant="filled" sx={{ minWidth: 150, backgroundColor: '#132f4c', borderRadius: 1 }}>
                  <InputLabel sx={{ color: 'white' }}>Role</InputLabel>
                  <Select
                    value={user.role}
                    onChange={(e) => handleRoleChange(index, e.target.value)}
                    label="Role"
                    sx={{ color: 'white', '& .MuiSelect-select': { color: 'white' } }}
                  >
                    <MenuItem value="Admin">Admin</MenuItem>
                    <MenuItem value="Supervisor">Supervisor</MenuItem>
                  </Select>
                </FormControl>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default RoleAssigner;
