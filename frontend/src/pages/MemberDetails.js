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
  ListItemText,
  Avatar
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Home as HomeIcon,
  Edit as EditIcon,
  CalendarToday as CalendarIcon,
  Book as BookIcon
} from '@mui/icons-material';
import { membersAPI, borrowingsAPI } from '../services/api';
import { format } from 'date-fns';

const MemberDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [borrowings, setBorrowings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMemberDetails = async () => {
      try {
        setLoading(true);
        const response = await membersAPI.getById(id);
        setMember(response.data);
        
        // For a real implementation, you would fetch borrowings related to this member
        // const borrowingsResponse = await borrowingsAPI.getByMemberId(id);
        // setBorrowings(borrowingsResponse.data);
        
        // Placeholder borrowings data
        setBorrowings([]);
      } catch (err) {
        console.error('Error fetching member details:', err);
        setError('Failed to load member details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchMemberDetails();
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
          onClick={() => navigate('/members')}
          sx={{ mt: 2 }}
        >
          Back to Members
        </Button>
      </Container>
    );
  }

  // If member is not loaded yet, show placeholder
  if (!member) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4">Member not found</Typography>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/members')}
          sx={{ mt: 2 }}
        >
          Back to Members
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Button
        variant="outlined"
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/members')}
        sx={{ mb: 3 }}
      >
        Back to Members
      </Button>

      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Box display="flex" alignItems="center" mb={2}>
              <Avatar 
                sx={{ 
                  width: 64, 
                  height: 64, 
                  bgcolor: member.role === 'ADMIN' ? 'secondary.main' : 'primary.main',
                  mr: 2
                }}
              >
                {member.name.charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="h4" gutterBottom>
                  {member.name}
                </Typography>
                <Chip 
                  label={member.role} 
                  color={member.role === 'ADMIN' ? 'secondary' : 'primary'} 
                  size="small" 
                />
              </Box>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box display="flex" alignItems="center" mb={2}>
                  <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body1">{member.email}</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box display="flex" alignItems="center" mb={2}>
                  <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body1">{member.phoneNumber}</Typography>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Box display="flex" alignItems="center" mb={2}>
                  <HomeIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body1">{member.address}</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Membership Start Date
                </Typography>
                <Typography variant="body1">
                  {member.membershipStartDate ? format(new Date(member.membershipStartDate), 'PPP') : 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Membership End Date
                </Typography>
                <Typography variant="body1">
                  {member.membershipEndDate ? format(new Date(member.membershipEndDate), 'PPP') : 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Max Allowed Books
                </Typography>
                <Typography variant="body1">{member.maxAllowedBooks || 'N/A'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Max Allowed Days
                </Typography>
                <Typography variant="body1">{member.maxAllowedDays || 'N/A'}</Typography>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={() => navigate(`/members/${id}/edit`)}
              startIcon={<EditIcon />}
              sx={{ mb: 2 }}
            >
              Edit Member
            </Button>
            <Button
              variant="outlined"
              color="primary"
              fullWidth
              onClick={() => navigate(`/borrowings/new?memberId=${id}`)}
              startIcon={<BookIcon />}
            >
              New Borrowing
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
                      Book
                    </Typography>
                    <Typography variant="body1">{borrowing.bookTitle}</Typography>
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
                    <Typography variant="body2">
                      {format(new Date(borrowing.borrowDate), 'PPP')}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Due Date
                    </Typography>
                    <Typography variant="body2">
                      {format(new Date(borrowing.dueDate), 'PPP')}
                    </Typography>
                  </Grid>
                  {borrowing.returned && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Return Date
                      </Typography>
                      <Typography variant="body2">
                        {format(new Date(borrowing.returnDate), 'PPP')}
                      </Typography>
                    </Grid>
                  )}
                  {borrowing.fineAmount > 0 && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Fine Amount
                      </Typography>
                      <Typography variant="body2" color="error.main">
                        ${borrowing.fineAmount.toFixed(2)}
                      </Typography>
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
            No borrowing history for this member.
          </Typography>
        </Paper>
      )}
    </Container>
  );
};

export default MemberDetails; 