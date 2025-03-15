import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Box,
  Button,
  TextField,
  Grid,
  Card,
  CardContent,
  CardActions,
  CardMedia,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Snackbar,
  InputAdornment,
  Container
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { booksAPI } from '../services/api';
import { AuthContext } from '../context/AuthContext';

// Book form component for add/edit
const BookForm = ({ book, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    publisher: '',
    publicationYear: '',
    quantity: 1,
    ...book
  });
  const [formErrors, setFormErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'publicationYear' || name === 'quantity' ? 
        (value === '' ? '' : parseInt(value, 10)) : value
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
    
    if (!formData.title) {
      errors.title = 'Title is required';
    }
    
    if (!formData.author) {
      errors.author = 'Author is required';
    }
    
    if (!formData.isbn) {
      errors.isbn = 'ISBN is required';
    }
    
    if (!formData.publisher) {
      errors.publisher = 'Publisher is required';
    }
    
    if (!formData.publicationYear) {
      errors.publicationYear = 'Publication year is required';
    } else if (formData.publicationYear < 1000 || formData.publicationYear > new Date().getFullYear()) {
      errors.publicationYear = 'Invalid publication year';
    }
    
    if (!formData.quantity) {
      errors.quantity = 'Quantity is required';
    } else if (formData.quantity < 1) {
      errors.quantity = 'Quantity must be at least 1';
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
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            required
            fullWidth
            id="title"
            label="Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            error={!!formErrors.title}
            helperText={formErrors.title}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            required
            fullWidth
            id="author"
            label="Author"
            name="author"
            value={formData.author}
            onChange={handleChange}
            error={!!formErrors.author}
            helperText={formErrors.author}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            id="isbn"
            label="ISBN"
            name="isbn"
            value={formData.isbn}
            onChange={handleChange}
            error={!!formErrors.isbn}
            helperText={formErrors.isbn}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            id="publisher"
            label="Publisher"
            name="publisher"
            value={formData.publisher}
            onChange={handleChange}
            error={!!formErrors.publisher}
            helperText={formErrors.publisher}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            id="publicationYear"
            label="Publication Year"
            name="publicationYear"
            type="number"
            value={formData.publicationYear}
            onChange={handleChange}
            error={!!formErrors.publicationYear}
            helperText={formErrors.publicationYear}
            inputProps={{ min: 1000, max: new Date().getFullYear() }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            id="quantity"
            label="Quantity"
            name="quantity"
            type="number"
            value={formData.quantity}
            onChange={handleChange}
            error={!!formErrors.quantity}
            helperText={formErrors.quantity}
            inputProps={{ min: 1 }}
          />
        </Grid>
      </Grid>
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button onClick={onCancel} sx={{ mr: 1 }}>
          Cancel
        </Button>
        <Button type="submit" variant="contained">
          {book ? 'Update' : 'Add'} Book
        </Button>
      </Box>
    </Box>
  );
};

// Book card component
const BookCard = ({ book, onEdit, onDelete }) => {
  const navigate = useNavigate();
  const { currentUser, isAdmin } = useContext(AuthContext);
  
  // Direct role check
  const hasAdminRole = currentUser && currentUser.role === 'ADMIN';
  console.log('BookCard component - direct role check:', hasAdminRole);

  const handleClick = () => {
    navigate(`/books/${book.id}`);
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardMedia
        component="div"
        sx={{
          height: 140,
          bgcolor: 'primary.light',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white'
        }}
      >
        <Typography variant="h5">{book.title.substring(0, 1)}</Typography>
      </CardMedia>
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h6" component="div" noWrap>
          {book.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          by {book.author}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          ISBN: {book.isbn}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Published: {book.publicationYear}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Available: {book.availableQuantity} / {book.quantity}
        </Typography>
      </CardContent>
      <CardActions sx={{ justifyContent: 'space-between' }}>
        <Button size="small" onClick={handleClick}>
          View Details
        </Button>
        <Box>
          {isAdmin() && (
            <>
              <IconButton size="small" color="primary" onClick={() => onEdit(book)}>
                <EditIcon />
              </IconButton>
              <IconButton size="small" color="error" onClick={() => onDelete(book)}>
                <DeleteIcon />
              </IconButton>
            </>
          )}
        </Box>
      </CardActions>
    </Card>
  );
};

const Books = () => {
  const { currentUser, isAdmin } = useContext(AuthContext);
  const navigate = useNavigate();
  
  console.log('Books component - currentUser:', currentUser);
  console.log('Books component - isAdmin check:', isAdmin());
  
  // Direct role check
  const hasAdminRole = currentUser && currentUser.role === 'ADMIN';
  console.log('Books component - direct role check:', hasAdminRole);
  
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Dialog states
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [currentBook, setCurrentBook] = useState(null);
  
  // Form state
  const initialFormState = {
    title: '',
    author: '',
    isbn: '',
    publisher: '',
    publicationYear: '',
    quantity: 1
  };
  const [formData, setFormData] = useState(initialFormState);
  const [formErrors, setFormErrors] = useState({});
  
  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  const fetchBooks = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching books...');
      
      // Check if we're offline
      if (!navigator.onLine) {
        console.log('Offline mode detected, using localStorage data');
        const localBooks = JSON.parse(localStorage.getItem('books') || '[]');
        setBooks(localBooks);
        setFilteredBooks(localBooks);
        setLoading(false);
        return;
      }
      
      const booksData = await booksAPI.getAll();
      console.log('Books fetched:', booksData);
      
      if (Array.isArray(booksData)) {
        console.log('Setting books state with:', booksData);
        setBooks(booksData);
        setFilteredBooks(booksData);
      } else {
        console.warn('Unexpected response format, falling back to localStorage');
        // Fall back to localStorage data
        const localBooks = JSON.parse(localStorage.getItem('books') || '[]');
        setBooks(localBooks);
        setFilteredBooks(localBooks);
        
        if (localBooks.length === 0) {
          setError('No books available. Add some books to get started.');
        }
      }
    } catch (err) {
      console.error('Error fetching books:', err);
      
      // Fall back to localStorage data
      const localBooks = JSON.parse(localStorage.getItem('books') || '[]');
      setBooks(localBooks);
      setFilteredBooks(localBooks);
      
      if (localBooks.length === 0) {
        setError('Unable to connect to server. Add books to use offline mode.');
      } else {
        setError('Using offline data. Some features may be limited.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (searchTerm) {
      const filtered = books.filter(book => 
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.isbn.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredBooks(filtered);
    } else {
      setFilteredBooks(books);
    }
  }, [searchTerm, books]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  // Add book
  const handleAddBook = async (bookData) => {
    setLoading(true);
    try {
      // Ensure availableQuantity is set
      if (!bookData.availableQuantity) {
        bookData.availableQuantity = bookData.quantity;
      }

      // Add the book
      const newBook = await booksAPI.create(bookData);
      console.log('Book added:', newBook);

      // Update books state with the new book
      setBooks([...books, newBook]);
      setFilteredBooks([...filteredBooks, newBook]);

      // Close dialog
      setOpenAddDialog(false);
      
      // Show success message but don't navigate
      setSnackbar({
        open: true,
        message: 'Book added successfully!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error adding book:', error);
      setSnackbar({
        open: true,
        message: `Error adding book: ${error.message || 'Unknown error'}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Edit book
  const handleEditBook = async (bookData) => {
    try {
      setLoading(true);
      console.log('Updating book:', bookData);
      
      const updatedBook = await booksAPI.update(currentBook.id, bookData);
      console.log('Book updated:', updatedBook);
      
      setSnackbar({
        open: true,
        message: 'Book updated successfully',
        severity: 'success'
      });
      
      setOpenEditDialog(false);
      fetchBooks();
    } catch (error) {
      console.error('Error updating book:', error);
      setSnackbar({
        open: true,
        message: `Error updating book: ${error.message || 'Unknown error'}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Delete book
  const handleDeleteBook = async () => {
    try {
      setLoading(true);
      console.log('Deleting book:', currentBook.id);
      
      const result = await booksAPI.delete(currentBook.id);
      console.log('Book deleted:', result);
      
      setSnackbar({
        open: true,
        message: 'Book deleted successfully',
        severity: 'success'
      });
      
      setOpenDeleteDialog(false);
      fetchBooks();
    } catch (error) {
      console.error('Error deleting book:', error);
      setSnackbar({
        open: true,
        message: `Error deleting book: ${error.message || 'Unknown error'}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  // Form validation
  const validateForm = () => {
    const errors = {};
    
    if (!formData.title) {
      errors.title = 'Title is required';
    }
    
    if (!formData.author) {
      errors.author = 'Author is required';
    }
    
    if (!formData.isbn) {
      errors.isbn = 'ISBN is required';
    }
    
    if (!formData.publisher) {
      errors.publisher = 'Publisher is required';
    }
    
    if (!formData.publicationYear) {
      errors.publicationYear = 'Publication year is required';
    } else if (formData.publicationYear < 1000 || formData.publicationYear > new Date().getFullYear()) {
      errors.publicationYear = 'Invalid publication year';
    }
    
    if (!formData.quantity) {
      errors.quantity = 'Quantity is required';
    } else if (formData.quantity < 1) {
      errors.quantity = 'Quantity must be at least 1';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  if (loading && books.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Books
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          {hasAdminRole ? (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenAddDialog(true)}
            >
              Add Book
            </Button>
          ) : (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                console.log('Non-admin tried to add book - currentUser:', currentUser);
                setSnackbar({
                  open: true,
                  message: 'Admin privileges required to add books. Use the "Login as Admin" option on the login page.',
                  severity: 'warning'
                });
              }}
            >
              Add Book
            </Button>
          )}
          
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => {
              console.log('Manually refreshing book list...');
              fetchBooks();
            }}
          >
            Refresh
          </Button>
        </Box>
        
        {!currentUser && (
          <Alert severity="info" sx={{ mb: 3 }}>
            Please log in to access all features. Use the "Login as Admin" option on the login page for full access.
          </Alert>
        )}
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search by title, author, or ISBN"
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
                <IconButton size="small" onClick={clearSearch}>
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            )
          }}
        />
      </Box>
      
      {filteredBooks.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
          <Typography variant="body1" color="text.secondary">
            {searchTerm ? 'No books match your search' : 'No books available'}
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredBooks.map(book => (
            <Grid item key={book.id} xs={12} sm={6} md={4} lg={3}>
              <BookCard 
                book={book} 
                onEdit={(book) => {
                  setCurrentBook(book);
                  setOpenEditDialog(true);
                }}
                onDelete={(book) => {
                  setCurrentBook(book);
                  setOpenDeleteDialog(true);
                }}
              />
            </Grid>
          ))}
        </Grid>
      )}
      
      {/* Add Book Dialog */}
      <Dialog 
        open={openAddDialog} 
        onClose={() => setOpenAddDialog(false)} 
        maxWidth="sm" 
        fullWidth
        aria-labelledby="add-book-dialog-title"
        keepMounted
      >
        <DialogTitle id="add-book-dialog-title">Add New Book</DialogTitle>
        <DialogContent>
          <BookForm 
            onSubmit={handleAddBook} 
            onCancel={() => setOpenAddDialog(false)} 
          />
        </DialogContent>
      </Dialog>
      
      {/* Edit Book Dialog */}
      <Dialog 
        open={openEditDialog} 
        onClose={() => setOpenEditDialog(false)} 
        maxWidth="sm" 
        fullWidth
        aria-labelledby="edit-book-dialog-title"
        keepMounted
      >
        <DialogTitle id="edit-book-dialog-title">Edit Book</DialogTitle>
        <DialogContent>
          {currentBook && (
            <BookForm 
              book={currentBook} 
              onSubmit={handleEditBook} 
              onCancel={() => setOpenEditDialog(false)} 
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Delete Book Dialog */}
      <Dialog 
        open={openDeleteDialog} 
        onClose={() => setOpenDeleteDialog(false)}
        aria-labelledby="delete-book-dialog-title"
        keepMounted
      >
        <DialogTitle id="delete-book-dialog-title">Delete Book</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{currentBook?.title}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDeleteBook} color="error">Delete</Button>
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

export default Books; 