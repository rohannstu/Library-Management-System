import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Paper,
  Box,
  Button,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Book as BookIcon,
  People as PeopleIcon,
  ImportContacts as BorrowingIcon,
  Warning as WarningIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { booksAPI, membersAPI, borrowingsAPI, statsAPI } from '../services/api';

const StatCard = ({ title, value, icon, color, onClick }) => {
  // Add a safety check for undefined values
  const displayValue = value !== undefined ? value : 0;
  
  return (
    <Paper
      elevation={2}
      sx={{
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        borderRadius: 2,
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': onClick ? { boxShadow: 6 } : {},
        transition: 'box-shadow 0.3s ease-in-out'
      }}
      onClick={onClick}
    >
      <Box display="flex" alignItems="center" mb={2}>
        <Box
          sx={{
            backgroundColor: `${color}.light`,
            borderRadius: '50%',
            p: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mr: 2
          }}
        >
          {icon}
        </Box>
        <Typography variant="h6" color="text.secondary">
          {title}
        </Typography>
      </Box>
      <Typography variant="h3" component="div" fontWeight="bold">
        {displayValue}
      </Typography>
    </Paper>
  );
};

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalMembers: 0,
    totalBorrowings: 0,
    activeBorrowings: 0,
    overdueBorrowings: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0); // Add a refresh key to force re-render
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const navigate = useNavigate();
  const location = useLocation();

  // Add event listeners for online/offline status
  useEffect(() => {
    const handleOnline = () => {
      console.log('Dashboard is online');
      setIsOffline(false);
      // Refresh data when coming back online
      fetchStats();
    };

    const handleOffline = () => {
      console.log('Dashboard is offline');
      setIsOffline(true);
      // Update stats from localStorage when offline
      updateStatsFromLocalStorage();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const updateStatsFromLocalStorage = () => {
    try {
      // Get data from localStorage
      const books = JSON.parse(localStorage.getItem('books')) || [];
      const members = JSON.parse(localStorage.getItem('members')) || [];
      const borrowings = JSON.parse(localStorage.getItem('borrowings')) || [];
      
      console.log('Updating stats from localStorage:', { books, members, borrowings });
      
      const activeBorrowings = borrowings.filter(b => !b.returned);
      const today = new Date();
      const overdueBorrowings = activeBorrowings.filter(b => 
        new Date(b.dueDate) < today
      );
      
      const newStats = {
        totalBooks: books.length,
        totalMembers: members.length,
        totalBorrowings: borrowings.length,
        activeBorrowings: activeBorrowings.length,
        overdueBorrowings: overdueBorrowings.length
      };
      
      console.log('Setting dashboard stats from localStorage:', newStats);
      setStats(newStats);
      setLoading(false);
    } catch (err) {
      console.error('Error updating stats from localStorage:', err);
      setError('Failed to load statistics from localStorage.');
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching dashboard statistics...');
      
      if (!navigator.onLine) {
        console.log('Offline mode detected, using localStorage data');
        updateStatsFromLocalStorage();
        return;
      }
      
      // Try to use the stats API endpoint first
      try {
        const statsData = await statsAPI.getDashboardStats();
        console.log('Dashboard stats from API:', statsData);
        setStats(statsData);
        return;
      } catch (statsError) {
        console.warn('Stats API not available, falling back to individual endpoints:', statsError);
      }
      
      // Fallback to individual API calls if stats endpoint is not available
      const [books, members, borrowings] = await Promise.all([
        booksAPI.getAll(),
        membersAPI.getAll(),
        borrowingsAPI.getAll()
      ]);
      
      console.log('Dashboard stats - Books:', books);
      console.log('Dashboard stats - Members:', members);
      console.log('Dashboard stats - Borrowings:', borrowings);
      
      const activeBorrowings = borrowings.filter(b => !b.returned);
      const today = new Date();
      const overdueBorrowings = activeBorrowings.filter(b => 
        new Date(b.dueDate) < today
      );
      
      const newStats = {
        totalBooks: books.length,
        totalMembers: members.length,
        totalBorrowings: borrowings.length,
        activeBorrowings: activeBorrowings.length,
        overdueBorrowings: overdueBorrowings.length
      };
      
      console.log('Setting dashboard stats:', newStats);
      setStats(newStats);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError('Failed to load dashboard statistics. Please try again later.');
      // Try to use localStorage data as a last resort
      updateStatsFromLocalStorage();
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats when the component mounts or when navigating to the dashboard
  useEffect(() => {
    console.log('Dashboard mounted or location changed, fetching stats...');
    fetchStats();
    
    // Set up an interval to refresh stats every 30 seconds
    const intervalId = setInterval(fetchStats, 30000);
    
    // Clean up the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, [location.key, refreshKey]); // Add location.key and refreshKey as dependencies

  // Add a useEffect to ensure stats is never undefined
  useEffect(() => {
    if (!stats) {
      setStats({
        totalBooks: 0,
        totalMembers: 0,
        totalBorrowings: 0,
        activeBorrowings: 0,
        overdueBorrowings: 0
      });
    }
  }, [stats]);

  const handleRefresh = () => {
    console.log('Manual refresh triggered');
    setRefreshKey(prevKey => prevKey + 1); // Increment refresh key to trigger re-render
    fetchStats(); // Directly call fetchStats for immediate refresh
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {isOffline && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          You are currently offline. Displaying data from local storage.
        </Alert>
      )}
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" gutterBottom>
          Dashboard
        </Typography>
        <Tooltip title="Refresh statistics">
          <IconButton onClick={handleRefresh} color="primary">
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Total Books"
            value={stats.totalBooks}
            icon={<BookIcon sx={{ color: 'primary.main' }} />}
            color="primary"
            onClick={() => navigate('/books')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Total Members"
            value={stats.totalMembers}
            icon={<PeopleIcon sx={{ color: 'secondary.main' }} />}
            color="secondary"
            onClick={() => navigate('/members')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Total Borrowings"
            value={stats.totalBorrowings}
            icon={<BorrowingIcon sx={{ color: 'info.main' }} />}
            color="info"
            onClick={() => navigate('/borrowings')}
          />
        </Grid>
      </Grid>
      
      <Typography variant="h5" gutterBottom>
        Borrowing Status
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <StatCard
            title="Active Borrowings"
            value={stats.activeBorrowings}
            icon={<BorrowingIcon sx={{ color: 'success.main' }} />}
            color="success"
            onClick={() => navigate('/borrowings')}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <StatCard
            title="Overdue Borrowings"
            value={stats.overdueBorrowings}
            icon={<WarningIcon sx={{ color: 'error.main' }} />}
            color="error"
            onClick={() => navigate('/borrowings')}
          />
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard; 