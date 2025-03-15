import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Grid,
  Button,
  Chip,
  Box,
  CircularProgress,
  Alert,
  Divider,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Book as BookIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { booksAPI, borrowingsAPI } from '../services/api';

const BookDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [borrowings, setBorrowings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBookDetails = async () => {
      try {
        setLoading(true);
        const response = await booksAPI.getById(id);
        setBook(response.data);
        
        // For a real implementation, you would fetch borrowings related to this book
        // const borrowingsResponse = await borrowingsAPI.getByBookId(id);
        // setBorrowings(borrowingsResponse.data);
        
        // Placeholder borrowings data
        setBorrowings([]);
      } catch (err) {
        console.error('Error fetching book details:', err);
        setError('Failed to load book details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchBookDetails();
  }, [id]);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/books')}
          sx={{ mt: 2 }}
        >
          Back to Books
        </Button>
      </Container>
    );
  }

  // If book is not loaded yet, show placeholder
  if (!book) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4">Book not found</Typography>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/books')}
          sx={{ mt: 2 }}
        >
          Back to Books
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Button
        variant="outlined"
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/books')}
        sx={{ mb: 3 }}
      >
        Back to Books
      </Button>

      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Typography variant="h4" gutterBottom>
              {book.title}
            </Typography>
            <Box display="flex" alignItems="center" mb={1}>
              <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="subtitle1">{book.author}</Typography>
            </Box>
            <Box display="flex" alignItems="center" mb={2}>
              <CalendarIcon sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="subtitle1">{book.publicationYear}</Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  ISBN
                </Typography>
                <Typography variant="body1">{book.isbn}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Publisher
                </Typography>
                <Typography variant="body1">{book.publisher}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Total Quantity
                </Typography>
                <Typography variant="body1">{book.quantity}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Available Quantity
                </Typography>
                <Chip 
                  label={book.availableQuantity} 
                  color={book.availableQuantity > 0 ? "success" : "error"}
                  variant="outlined"
                />
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={() => navigate(`/books/${id}/edit`)}
              startIcon={<EditIcon />}
              sx={{ mb: 2 }}
            >
              Edit Book
            </Button>
            <Button
              variant="outlined"
              color="primary"
              fullWidth
              disabled={book.availableQuantity <= 0}
              onClick={() => navigate(`/borrowings/new?bookId=${id}`)}
            >
              Borrow This Book
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Typography variant="h5" gutterBottom>
        Borrowing History
      </Typography>
      {borrowings.length > 0 ? (
        <List>
          {borrowings.map((borrowing) => (
            <Card key={borrowing.id} sx={{ mb: 2 }}>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Member
                    </Typography>
                    <Typography variant="body1">{borrowing.memberName}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Status
                    </Typography>
                    <Chip 
                      label={borrowing.returned ? "Returned" : "Borrowed"} 
                      color={borrowing.returned ? "success" : "primary"}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Borrow Date
                    </Typography>
                    <Typography variant="body2">{new Date(borrowing.borrowDate).toLocaleDateString()}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Due Date
                    </Typography>
                    <Typography variant="body2">{new Date(borrowing.dueDate).toLocaleDateString()}</Typography>
                  </Grid>
                  {borrowing.returned && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Return Date
                      </Typography>
                      <Typography variant="body2">{new Date(borrowing.returnDate).toLocaleDateString()}</Typography>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          ))}
        </List>
      ) : (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            No borrowing history for this book.
          </Typography>
        </Paper>
      )}
    </Container>
  );
};

export default BookDetails; 