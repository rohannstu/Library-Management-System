import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  Alert,
  Box,
  Chip,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { membersAPI } from '../services/api';

const MemberForm = ({ member, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phoneNumber: '',
    address: '',
    role: 'USER',
    ...member
  });
  const [formErrors, setFormErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when user types
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name) {
      errors.name = 'Name is required';
    }
    
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!member && !formData.password) {
      errors.password = 'Password is required';
    } else if (!member && formData.password && formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    if (!formData.phoneNumber) {
      errors.phoneNumber = 'Phone number is required';
    }
    
    if (!formData.address) {
      errors.address = 'Address is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={!!formErrors.name}
            helperText={formErrors.name}
            required
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            error={!!formErrors.email}
            helperText={formErrors.email}
            required
          />
        </Grid>
        {!member && (
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              error={!!formErrors.password}
              helperText={formErrors.password}
              required
            />
          </Grid>
        )}
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Phone Number"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            error={!!formErrors.phoneNumber}
            helperText={formErrors.phoneNumber}
            required
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            error={!!formErrors.address}
            helperText={formErrors.address}
            required
          />
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel id="role-label">Role</InputLabel>
            <Select
              labelId="role-label"
              name="role"
              value={formData.role}
              onChange={handleChange}
              label="Role"
            >
              <MenuItem value="USER">User</MenuItem>
              <MenuItem value="ADMIN">Admin</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
          <Button variant="outlined" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="primary">
            {member ? 'Update' : 'Add'} Member
          </Button>
        </Grid>
      </Grid>
    </form>
  );
};

const MemberCard = ({ member, onEdit, onDelete }) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate(`/members/${member.id}`);
  };
  
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1, cursor: 'pointer' }} onClick={handleClick}>
        <Typography variant="h6" component="div" gutterBottom>
          {member.name}
        </Typography>
        <Chip 
          label={member.role} 
          color={member.role === 'ADMIN' ? 'secondary' : 'primary'} 
          size="small" 
          sx={{ mb: 2 }}
        />
        <Box display="flex" alignItems="center" mb={1}>
          <EmailIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary">
            {member.email}
          </Typography>
        </Box>
        <Box display="flex" alignItems="center" mb={1}>
          <PhoneIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary">
            {member.phoneNumber}
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" noWrap>
          {member.address}
        </Typography>
      </CardContent>
      <Divider />
      <CardActions>
        <Button 
          size="small" 
          startIcon={<EditIcon />} 
          onClick={(e) => {
            e.stopPropagation();
            onEdit(member);
          }}
        >
          Edit
        </Button>
        <Button 
          size="small" 
          color="error" 
          startIcon={<DeleteIcon />} 
          onClick={(e) => {
            e.stopPropagation();
            onDelete(member);
          }}
        >
          Delete
        </Button>
      </CardActions>
    </Card>
  );
};

const Members = () => {
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [currentMember, setCurrentMember] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchMembers();
  }, []);

  useEffect(() => {
    if (members.length > 0) {
      let result = [...members];
      
      if (searchTerm) {
        const lowerCaseSearch = searchTerm.toLowerCase();
        result = result.filter(
          member => 
            member.name.toLowerCase().includes(lowerCaseSearch) ||
            member.email.toLowerCase().includes(lowerCaseSearch) ||
            member.phoneNumber.toLowerCase().includes(lowerCaseSearch)
        );
      }
      
      if (roleFilter) {
        result = result.filter(member => member.role === roleFilter);
      }
      
      setFilteredMembers(result);
    } else {
      setFilteredMembers([]);
    }
  }, [members, searchTerm, roleFilter]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      
      // Check if we're offline
      if (!navigator.onLine) {
        console.log('Offline mode detected, using localStorage data');
        const localMembers = JSON.parse(localStorage.getItem('members') || '[]');
        setMembers(localMembers);
        setFilteredMembers(localMembers);
        setLoading(false);
        return;
      }
      
      const data = await membersAPI.getAll();
      setMembers(data);
      setFilteredMembers(data);
    } catch (err) {
      console.error('Error fetching members:', err);
      
      // Fall back to localStorage data
      const localMembers = JSON.parse(localStorage.getItem('members') || '[]');
      setMembers(localMembers);
      setFilteredMembers(localMembers);
      
      if (localMembers.length === 0) {
        setError('Unable to connect to server. Add members to use offline mode.');
      } else {
        setError('Using offline data. Some features may be limited.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };
  
  const handleRoleFilterChange = (e) => {
    setRoleFilter(e.target.value);
  };

  const handleAddMember = async (memberData) => {
    try {
      const newMember = await membersAPI.create(memberData);
      console.log('Member added:', newMember);
      
      // Update the members state with the new member
      setMembers([...members, newMember]);
      setFilteredMembers([...filteredMembers, newMember]);
      
      setOpenAddDialog(false);
      
      setSnackbar({
        open: true,
        message: 'Member added successfully!',
        severity: 'success'
      });
    } catch (err) {
      console.error('Error adding member:', err);
      setSnackbar({
        open: true,
        message: `Failed to add member: ${err.message || 'Unknown error'}`,
        severity: 'error'
      });
    }
  };

  const handleEditMember = async (memberData) => {
    try {
      const updatedMember = await membersAPI.update(currentMember.id, memberData);
      console.log('Member updated:', updatedMember);
      
      setOpenEditDialog(false);
      fetchMembers();
      
      setSnackbar({
        open: true,
        message: 'Member updated successfully!',
        severity: 'success'
      });
    } catch (err) {
      console.error('Error updating member:', err);
      setSnackbar({
        open: true,
        message: `Failed to update member: ${err.message || 'Unknown error'}`,
        severity: 'error'
      });
    }
  };

  const handleDeleteMember = async () => {
    try {
      const result = await membersAPI.delete(currentMember.id);
      console.log('Member deleted:', result);
      
      setOpenDeleteDialog(false);
      fetchMembers();
      
      setSnackbar({
        open: true,
        message: 'Member deleted successfully!',
        severity: 'success'
      });
    } catch (err) {
      console.error('Error deleting member:', err);
      setSnackbar({
        open: true,
        message: `Failed to delete member: ${err.message || 'Unknown error'}`,
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Members
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setOpenAddDialog(true)}
        >
          Add Member
        </Button>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search by name, email, or phone"
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton onClick={clearSearch} edge="end">
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel id="role-filter-label">Filter by Role</InputLabel>
              <Select
                labelId="role-filter-label"
                value={roleFilter}
                onChange={handleRoleFilterChange}
                label="Filter by Role"
              >
                <MenuItem value="">All Roles</MenuItem>
                <MenuItem value="USER">User</MenuItem>
                <MenuItem value="ADMIN">Admin</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      ) : filteredMembers.length > 0 ? (
        <Grid container spacing={3}>
          {filteredMembers.map((member) => (
            <Grid item key={member.id} xs={12} sm={6} md={4}>
              <MemberCard
                member={member}
                onEdit={() => {
                  setCurrentMember(member);
                  setOpenEditDialog(true);
                }}
                onDelete={() => {
                  setCurrentMember(member);
                  setOpenDeleteDialog(true);
                }}
              />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box textAlign="center" my={4}>
          <Typography variant="h6" color="text.secondary">
            No members found
          </Typography>
          {searchTerm && (
            <Button
              variant="outlined"
              onClick={clearSearch}
              sx={{ mt: 2 }}
            >
              Clear Search
            </Button>
          )}
        </Box>
      )}

      {/* Add Member Dialog */}
      <Dialog 
        open={openAddDialog} 
        onClose={() => setOpenAddDialog(false)} 
        maxWidth="sm" 
        fullWidth
        aria-labelledby="add-member-dialog-title"
        keepMounted
      >
        <DialogTitle id="add-member-dialog-title">Add New Member</DialogTitle>
        <DialogContent>
          <MemberForm
            onSubmit={handleAddMember}
            onCancel={() => setOpenAddDialog(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Member Dialog */}
      <Dialog 
        open={openEditDialog} 
        onClose={() => setOpenEditDialog(false)} 
        maxWidth="sm" 
        fullWidth
        aria-labelledby="edit-member-dialog-title"
        keepMounted
      >
        <DialogTitle id="edit-member-dialog-title">Edit Member</DialogTitle>
        <DialogContent>
          {currentMember && (
            <MemberForm
              member={currentMember}
              onSubmit={handleEditMember}
              onCancel={() => setOpenEditDialog(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={openDeleteDialog} 
        onClose={() => setOpenDeleteDialog(false)}
        aria-labelledby="delete-member-dialog-title"
        keepMounted
      >
        <DialogTitle id="delete-member-dialog-title">Delete Member</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete {currentMember?.name}? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDeleteMember} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Members; 