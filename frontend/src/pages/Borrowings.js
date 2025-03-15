import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  Tabs,
  Tab,
  Paper,
  Snackbar
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Add as AddIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  AssignmentReturn as ReturnIcon
} from '@mui/icons-material';
import { borrowingsAPI, booksAPI, membersAPI } from '../services/api';
import { format, isAfter } from 'date-fns';

const BorrowingForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    memberId: '',
    bookId: '',
    borrowDate: format(new Date(), 'yyyy-MM-dd'),
    dueDate: format(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd') // 14 days from now
  });
  const [formErrors, setFormErrors] = useState({});
  const [members, setMembers] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const memberIdParam = queryParams.get('memberId');
  const bookIdParam = queryParams.get('bookId');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch members data
        let membersData = [];
        try {
          membersData = await membersAPI.getAll();
          if (!Array.isArray(membersData)) {
            console.warn('Members data is not an array, using empty array');
            membersData = [];
          }
        } catch (err) {
          console.error('Error fetching members:', err);
          membersData = [];
        }
        setMembers(membersData);
        
        // Fetch books data
        let booksData = [];
        try {
          booksData = await booksAPI.getAll();
          if (!Array.isArray(booksData)) {
            console.warn('Books data is not an array, using empty array');
            booksData = [];
          }
        } catch (err) {
          console.error('Error fetching books:', err);
          booksData = [];
        }
        
        // Filter books with available quantity
        const availableBooks = booksData.filter(book => book && typeof book === 'object' && book.availableQuantity > 0);
        setBooks(availableBooks);
        
        // Set initial values from query params if available
        if (memberIdParam) {
          setFormData(prev => ({ ...prev, memberId: parseInt(memberIdParam) || '' }));
        }
        
        if (bookIdParam) {
          setFormData(prev => ({ ...prev, bookId: parseInt(bookIdParam) || '' }));
        }
      } catch (err) {
        console.error('Error in fetchData:', err);
        setError('Failed to load data. Please try again later.');
        setMembers([]);
        setBooks([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [memberIdParam, bookIdParam]);

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
    
    if (!formData.memberId) {
      errors.memberId = 'Member is required';
    }
    
    if (!formData.bookId) {
      errors.bookId = 'Book is required';
    }
    
    if (!formData.borrowDate) {
      errors.borrowDate = 'Borrow date is required';
    }
    
    if (!formData.dueDate) {
      errors.dueDate = 'Due date is required';
    } else if (isAfter(new Date(formData.borrowDate), new Date(formData.dueDate))) {
      errors.dueDate = 'Due date must be after borrow date';
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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" my={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <FormControl fullWidth error={!!formErrors.memberId}>
            <InputLabel id="member-label">Member</InputLabel>
            <Select
              labelId="member-label"
              name="memberId"
              value={formData.memberId}
              onChange={handleChange}
              label="Member"
              required
            >
              {members.map((member) => (
                <MenuItem key={member.id} value={member.id}>
                  {member.name} ({member.email})
                </MenuItem>
              ))}
            </Select>
            {formErrors.memberId && (
              <Typography variant="caption" color="error">
                {formErrors.memberId}
              </Typography>
            )}
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth error={!!formErrors.bookId}>
            <InputLabel id="book-label">Book</InputLabel>
            <Select
              labelId="book-label"
              name="bookId"
              value={formData.bookId}
              onChange={handleChange}
              label="Book"
              required
            >
              {books.map((book) => (
                <MenuItem key={book.id} value={book.id}>
                  {book.title} by {book.author} (Available: {book.availableQuantity})
                </MenuItem>
              ))}
            </Select>
            {formErrors.bookId && (
              <Typography variant="caption" color="error">
                {formErrors.bookId}
              </Typography>
            )}
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Borrow Date"
            name="borrowDate"
            type="date"
            value={formData.borrowDate}
            onChange={handleChange}
            InputLabelProps={{
              shrink: true,
            }}
            error={!!formErrors.borrowDate}
            helperText={formErrors.borrowDate}
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Due Date"
            name="dueDate"
            type="date"
            value={formData.dueDate}
            onChange={handleChange}
            InputLabelProps={{
              shrink: true,
            }}
            error={!!formErrors.dueDate}
            helperText={formErrors.dueDate}
            required
          />
        </Grid>
        <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
          <Button variant="outlined" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="primary">
            Create Borrowing
          </Button>
        </Grid>
      </Grid>
    </form>
  );
};

const BorrowingCard = ({ borrowing, onReturn }) => {
  const navigate = useNavigate();
  const isOverdue = borrowing.dueDate && !borrowing.returned && isAfter(new Date(), new Date(borrowing.dueDate));
  
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" component="div" gutterBottom>
          {borrowing.bookTitle}
        </Typography>
        <Chip 
          label={borrowing.returned ? "Returned" : isOverdue ? "Overdue" : "Borrowed"} 
          color={borrowing.returned ? "success" : isOverdue ? "error" : "primary"} 
          size="small" 
          sx={{ mb: 2 }}
        />
        <Box display="flex" alignItems="center" mb={1}>
          <PersonIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary">
            {borrowing.memberName}
          </Typography>
        </Box>
        <Box display="flex" alignItems="center" mb={1}>
          <CalendarIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary">
            Borrowed: {format(new Date(borrowing.borrowDate), 'PP')}
          </Typography>
        </Box>
        <Box display="flex" alignItems="center" mb={1}>
          <CalendarIcon fontSize="small" sx={{ mr: 1, color: isOverdue ? 'error.main' : 'text.secondary' }} />
          <Typography variant="body2" color={isOverdue ? 'error.main' : 'text.secondary'}>
            Due: {format(new Date(borrowing.dueDate), 'PP')}
          </Typography>
        </Box>
        {borrowing.returned && (
          <Box display="flex" alignItems="center">
            <CalendarIcon fontSize="small" sx={{ mr: 1, color: 'success.main' }} />
            <Typography variant="body2" color="success.main">
              Returned: {format(new Date(borrowing.returnDate), 'PP')}
            </Typography>
          </Box>
        )}
        {borrowing.fineAmount > 0 && (
          <Box mt={1}>
            <Typography variant="body2" color="error.main" fontWeight="bold">
              Fine: ${borrowing.fineAmount.toFixed(2)}
            </Typography>
          </Box>
        )}
      </CardContent>
      {!borrowing.returned && (
        <>
          <Divider />
          <CardActions>
            <Button 
              fullWidth
              variant="contained" 
              color="primary" 
              startIcon={<ReturnIcon />} 
              onClick={() => onReturn(borrowing)}
            >
              Return Book
            </Button>
          </CardActions>
        </>
      )}
    </Card>
  );
};

const Borrowings = () => {
  const [borrowings, setBorrowings] = useState([]);
  const [filteredBorrowings, setFilteredBorrowings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [tabValue, setTabValue] = useState(0);
  
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openReturnDialog, setOpenReturnDialog] = useState(false);
  const [currentBorrowing, setCurrentBorrowing] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchBorrowings();
  }, []);

  useEffect(() => {
    // Only filter if borrowings array exists
    if (borrowings && Array.isArray(borrowings) && borrowings.length > 0) {
      let result = [...borrowings];
      
      // Filter by tab
      if (tabValue === 1) { // Active
        result = result.filter(borrowing => !borrowing.returned);
      } else if (tabValue === 2) { // Returned
        result = result.filter(borrowing => borrowing.returned);
      } else if (tabValue === 3) { // Overdue
        result = result.filter(borrowing => 
          !borrowing.returned && isAfter(new Date(), new Date(borrowing.dueDate))
        );
      }
      
      // Filter by search term
      if (searchTerm) {
        const lowerCaseSearch = searchTerm.toLowerCase();
        result = result.filter(
          borrowing => 
            (borrowing.bookTitle?.toLowerCase() || '').includes(lowerCaseSearch) ||
            (borrowing.memberName?.toLowerCase() || '').includes(lowerCaseSearch)
        );
      }
      
      setFilteredBorrowings(result);
    } else {
      setFilteredBorrowings([]);
    }
  }, [borrowings, searchTerm, tabValue]);

  const fetchBorrowings = async () => {
    try {
      setLoading(true);
      
      // Check if we're offline
      if (!navigator.onLine) {
        console.log('Offline mode detected, using localStorage data');
        const localBorrowings = JSON.parse(localStorage.getItem('borrowings') || '[]');
        
        // Ensure all borrowings have the required fields
        const enhancedBorrowings = localBorrowings.map(borrowing => ({
          ...borrowing,
          bookTitle: borrowing.bookTitle || `Book ID: ${borrowing.bookId}`,
          memberName: borrowing.memberName || `Member ID: ${borrowing.memberId}`
        }));
        
        setBorrowings(enhancedBorrowings);
        setFilteredBorrowings(enhancedBorrowings);
        setLoading(false);
        return;
      }
      
      const borrowingsData = await borrowingsAPI.getAll();
      
      // Check if borrowingsData is defined
      if (!borrowingsData) {
        console.warn('No borrowings data received, falling back to localStorage');
        const localBorrowings = JSON.parse(localStorage.getItem('borrowings') || '[]');
        
        // Ensure all borrowings have the required fields
        const enhancedBorrowings = localBorrowings.map(borrowing => ({
          ...borrowing,
          bookTitle: borrowing.bookTitle || `Book ID: ${borrowing.bookId}`,
          memberName: borrowing.memberName || `Member ID: ${borrowing.memberId}`
        }));
        
        setBorrowings(enhancedBorrowings);
        setFilteredBorrowings(enhancedBorrowings);
        return;
      }
      
      // Ensure all borrowings have the required fields
      const enhancedBorrowings = borrowingsData.map(borrowing => ({
        ...borrowing,
        bookTitle: borrowing.bookTitle || `Book ID: ${borrowing.bookId}`,
        memberName: borrowing.memberName || `Member ID: ${borrowing.memberId}`
      }));
      
      setBorrowings(enhancedBorrowings);
      setFilteredBorrowings(enhancedBorrowings);
    } catch (err) {
      console.error('Error fetching borrowings:', err);
      
      // Fall back to localStorage data
      const localBorrowings = JSON.parse(localStorage.getItem('borrowings') || '[]');
      
      // Ensure all borrowings have the required fields
      const enhancedBorrowings = localBorrowings.map(borrowing => ({
        ...borrowing,
        bookTitle: borrowing.bookTitle || `Book ID: ${borrowing.bookId}`,
        memberName: borrowing.memberName || `Member ID: ${borrowing.memberId}`
      }));
      
      setBorrowings(enhancedBorrowings);
      setFilteredBorrowings(enhancedBorrowings);
      
      if (localBorrowings.length === 0) {
        setError('Unable to connect to server. Add borrowings to use offline mode.');
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
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleAddBorrowing = async (borrowingData) => {
    try {
      const newBorrowing = await borrowingsAPI.create(borrowingData);
      console.log('Borrowing added:', newBorrowing);
      
      // Update the borrowings state with the new borrowing
      setBorrowings(prevBorrowings => {
        const updatedBorrowings = [...(Array.isArray(prevBorrowings) ? prevBorrowings : []), newBorrowing];
        console.log('Updated borrowings state:', updatedBorrowings);
        return updatedBorrowings;
      });
      
      setOpenAddDialog(false);
      
      setSnackbar({
        open: true,
        message: 'Borrowing added successfully!',
        severity: 'success'
      });
    } catch (err) {
      console.error('Error adding borrowing:', err);
      setSnackbar({
        open: true,
        message: `Failed to add borrowing: ${err.message || 'Unknown error'}`,
        severity: 'error'
      });
    }
  };

  const handleReturnBook = async () => {
    try {
      const result = await borrowingsAPI.returnBook(currentBorrowing.id);
      console.log('Book returned:', result);
      
      setOpenReturnDialog(false);
      fetchBorrowings();
      
      setSnackbar({
        open: true,
        message: 'Book returned successfully!',
        severity: 'success'
      });
    } catch (err) {
      console.error('Error returning book:', err);
      setSnackbar({
        open: true,
        message: `Failed to return book: ${err.message || 'Unknown error'}`,
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
          Borrowings
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setOpenAddDialog(true)}
        >
          New Borrowing
        </Button>
      </Box>

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search by book title or member name"
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
          sx={{ mb: 2 }}
        />
        
        <Paper sx={{ mb: 2 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
          >
            <Tab label="All" />
            <Tab label="Active" />
            <Tab label="Returned" />
            <Tab label="Overdue" />
          </Tabs>
        </Paper>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      ) : filteredBorrowings.length > 0 ? (
        <Grid container spacing={3}>
          {filteredBorrowings.map((borrowing) => (
            <Grid item key={borrowing.id} xs={12} sm={6} md={4}>
              <BorrowingCard
                borrowing={borrowing}
                onReturn={() => {
                  setCurrentBorrowing(borrowing);
                  setOpenReturnDialog(true);
                }}
              />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box textAlign="center" my={4}>
          <Typography variant="h6" color="text.secondary">
            No borrowings found
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

      {/* Add Borrowing Dialog */}
      <Dialog 
        open={openAddDialog} 
        onClose={() => setOpenAddDialog(false)} 
        maxWidth="sm" 
        fullWidth
        aria-labelledby="add-borrowing-dialog-title"
        keepMounted
      >
        <DialogTitle id="add-borrowing-dialog-title">New Borrowing</DialogTitle>
        <DialogContent>
          <BorrowingForm
            onSubmit={handleAddBorrowing}
            onCancel={() => setOpenAddDialog(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Return Book Dialog */}
      <Dialog 
        open={openReturnDialog} 
        onClose={() => setOpenReturnDialog(false)}
        aria-labelledby="return-book-dialog-title"
        keepMounted
      >
        <DialogTitle id="return-book-dialog-title">Return Book</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to mark "{currentBorrowing?.bookTitle}" as returned by {currentBorrowing?.memberName}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenReturnDialog(false)}>Cancel</Button>
          <Button onClick={handleReturnBook} color="primary" variant="contained">
            Return Book
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

export default Borrowings; 