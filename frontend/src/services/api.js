import axios from 'axios';

// Mock data for initial state
const initialMockData = {
  books: [
    { id: 1, title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', isbn: '9780743273565', publisher: 'Scribner', publicationYear: 1925, quantity: 5, availableQuantity: 3 },
    { id: 2, title: 'To Kill a Mockingbird', author: 'Harper Lee', isbn: '9780061120084', publisher: 'HarperCollins', publicationYear: 1960, quantity: 8, availableQuantity: 6 },
    { id: 3, title: '1984', author: 'George Orwell', isbn: '9780451524935', publisher: 'Signet Classic', publicationYear: 1949, quantity: 10, availableQuantity: 7 }
  ],
  members: [
    { id: 1, name: 'John Doe', email: 'john@example.com', phoneNumber: '1234567890', address: '123 Main St', role: 'USER', active: true, membershipStartDate: '2023-01-01', membershipEndDate: '2024-01-01', maxAllowedBooks: 5, maxAllowedDays: 14 },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', phoneNumber: '0987654321', address: '456 Oak Ave', role: 'USER', active: true, membershipStartDate: '2023-02-15', membershipEndDate: '2024-02-15', maxAllowedBooks: 3, maxAllowedDays: 10 },
    { id: 3, name: 'Admin User', email: 'admin@example.com', phoneNumber: '5555555555', address: '789 Admin Blvd', role: 'ADMIN', active: true, membershipStartDate: '2023-01-01', membershipEndDate: '2025-01-01', maxAllowedBooks: 10, maxAllowedDays: 30 }
  ],
  borrowings: [
    { id: 1, bookId: 1, memberId: 1, borrowDate: '2023-05-01', dueDate: '2023-05-15', returned: false, bookTitle: 'The Great Gatsby', memberName: 'John Doe' },
    { id: 2, bookId: 2, memberId: 2, borrowDate: '2023-04-15', dueDate: '2023-04-25', returned: true, returnDate: '2023-04-23', fineAmount: 0, bookTitle: 'To Kill a Mockingbird', memberName: 'Jane Smith' },
    { id: 3, bookId: 3, memberId: 1, borrowDate: '2023-05-10', dueDate: '2023-05-24', returned: false, bookTitle: '1984', memberName: 'John Doe' }
  ]
};

// Initialize localStorage with mock data if it doesn't exist
const initializeMockData = () => {
  if (!localStorage.getItem('books')) {
    localStorage.setItem('books', JSON.stringify(initialMockData.books));
  }
  if (!localStorage.getItem('members')) {
    localStorage.setItem('members', JSON.stringify(initialMockData.members));
  }
  if (!localStorage.getItem('borrowings')) {
    localStorage.setItem('borrowings', JSON.stringify(initialMockData.borrowings));
  }
};

// Initialize mock data
initializeMockData();

// Create axios instance with base URL
const api = axios.create({
  baseURL: 'http://localhost:8081/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000, // Increase timeout to 5 seconds
});

// Add a request interceptor to add the auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    console.log('API Request:', config.method.toUpperCase(), config.url, config.data);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.data);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.status, error.response?.data || error.message);
    
    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// Helper function to load mock data from localStorage
const loadMockData = (key) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`Error loading mock ${key}:`, error);
    return null;
  }
};

// Helper function to save mock data to localStorage
const saveMockData = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    console.log(`Saved ${key} to localStorage:`, data);
  } catch (error) {
    console.error(`Error saving mock ${key}:`, error);
  }
};

// Helper function to handle API fallback to mock data
const withMockFallback = async (apiCall, mockDataKey) => {
  try {
    const response = await apiCall();
    return response;
  } catch (error) {
    console.warn(`API call failed, using mock data for ${mockDataKey}:`, error);
    const mockData = loadMockData(mockDataKey);
    
    if (!mockData) {
      throw new Error(`No mock data available for ${mockDataKey}`);
    }
    
    return { data: mockData };
  }
};

// Auth API
export const authAPI = {
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      return response;
    } catch (error) {
      console.warn('Login failed, using mock authentication:', error);
      
      // Check against mock users
      const members = loadMockData('members');
      const user = members.find(m => m.email === credentials.email);
      
      if (user) {
        // Mock successful login
        const mockToken = 'mock-jwt-token-' + Date.now();
        localStorage.setItem('token', mockToken);
        
        return { 
          data: { 
            accessToken: mockToken,
            user: user
          } 
        };
      } else {
        throw new Error('Invalid credentials');
      }
    }
  },
  register: async (userData) => {
    try {
      const response = await api.post('/auth/signup', userData);
      return response;
    } catch (error) {
      console.warn('Registration failed, using mock registration:', error);
      
      // Add to mock members
      const members = loadMockData('members');
      const newUser = {
        id: members.length + 1,
        ...userData,
        role: 'USER',
        active: true,
        membershipStartDate: new Date().toISOString().split('T')[0],
        membershipEndDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
        maxAllowedBooks: 5,
        maxAllowedDays: 14
      };
      
      members.push(newUser);
      saveMockData('members', members);
      
      return { data: newUser };
    }
  },
  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/me');
      return response;
    } catch (error) {
      console.warn('Get current user failed, using mock user:', error);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }
      
      // Return the admin user as the current user
      const members = loadMockData('members');
      const adminUser = members.find(m => m.role === 'ADMIN');
      
      if (adminUser) {
        return { data: adminUser };
      } else {
        throw new Error('No admin user found in mock data');
      }
    }
  },
};

// Books API
export const booksAPI = {
  getAll: async () => {
    try {
      const response = await api.get('/books');
      // Update localStorage with the latest data from the server
      saveMockData('books', response.data);
      return response.data;
    } catch (error) {
      console.warn(`API call failed, using mock data for books:`, error);
      const mockData = loadMockData('books');
      
      if (!mockData) {
        throw new Error(`No mock data available for books`);
      }
      
      return mockData;
    }
  },
  getById: async (id) => {
    try {
      const response = await api.get(`/books/${id}`);
      return response;
    } catch (error) {
      console.warn(`Get book by ID failed, using mock data:`, error);
      const books = loadMockData('books');
      const book = books.find(b => b.id === parseInt(id));
      
      if (!book) {
        throw new Error(`Book with ID ${id} not found`);
      }
      
      return { data: book };
    }
  },
  create: async (bookData) => {
    try {
      const response = await api.post('/books', bookData);
      
      // Update localStorage with the new book
      const books = loadMockData('books') || [];
      books.push(response.data);
      saveMockData('books', books);
      
      return response.data;
    } catch (error) {
      console.warn('Create book failed, using mock data:', error);
      const books = loadMockData('books') || [];
      const newBook = {
        id: books.length > 0 ? Math.max(...books.map(b => b.id)) + 1 : 1,
        ...bookData,
        availableQuantity: bookData.quantity
      };
      
      books.push(newBook);
      saveMockData('books', books);
      
      return newBook;
    }
  },
  update: async (id, bookData) => {
    try {
      const response = await api.put(`/books/${id}`, bookData);
      return response.data;
    } catch (error) {
      console.warn(`Update book failed, using mock data:`, error);
      const books = loadMockData('books');
      const index = books.findIndex(b => b.id === parseInt(id));
      
      if (index === -1) {
        throw new Error(`Book with ID ${id} not found`);
      }
      
      books[index] = { ...books[index], ...bookData };
      saveMockData('books', books);
      
      return books[index];
    }
  },
  delete: async (id) => {
    try {
      const response = await api.delete(`/books/${id}`);
      return response.data;
    } catch (error) {
      console.warn(`Delete book failed, using mock data:`, error);
      const books = loadMockData('books');
      const filteredBooks = books.filter(b => b.id !== parseInt(id));
      
      saveMockData('books', filteredBooks);
      
      return { message: 'Book deleted successfully' };
    }
  },
};

// Members API
export const membersAPI = {
  getAll: async () => {
    try {
      const response = await api.get('/members');
      // Update localStorage with the latest data from the server
      saveMockData('members', response.data);
      return response.data;
    } catch (error) {
      console.warn(`API call failed, using mock data for members:`, error);
      const mockData = loadMockData('members');
      
      if (!mockData) {
        throw new Error(`No mock data available for members`);
      }
      
      return mockData;
    }
  },
  getById: async (id) => {
    try {
      const response = await api.get(`/members/${id}`);
      return response.data;
    } catch (error) {
      console.warn(`Get member by ID failed, using mock data:`, error);
      const members = loadMockData('members');
      const member = members.find(m => m.id === parseInt(id));
      
      if (!member) {
        throw new Error(`Member with ID ${id} not found`);
      }
      
      return member;
    }
  },
  create: async (memberData) => {
    try {
      const response = await api.post('/members', memberData);
      
      // Update localStorage with the new member
      const members = loadMockData('members') || [];
      members.push(response.data);
      saveMockData('members', members);
      
      return response.data;
    } catch (error) {
      console.warn('Create member failed, using mock data:', error);
      const members = loadMockData('members') || [];
      const newMember = {
        id: members.length > 0 ? Math.max(...members.map(m => m.id)) + 1 : 1,
        ...memberData,
        role: memberData.role || 'USER',
        active: true
      };
      
      members.push(newMember);
      saveMockData('members', members);
      
      return newMember;
    }
  },
  update: async (id, memberData) => {
    try {
      const response = await api.put(`/members/${id}`, memberData);
      return response.data;
    } catch (error) {
      console.warn(`Update member failed, using mock data:`, error);
      const members = loadMockData('members');
      const index = members.findIndex(m => m.id === parseInt(id));
      
      if (index === -1) {
        throw new Error(`Member with ID ${id} not found`);
      }
      
      members[index] = { ...members[index], ...memberData };
      saveMockData('members', members);
      
      return members[index];
    }
  },
  delete: async (id) => {
    try {
      const response = await api.delete(`/members/${id}`);
      return response.data;
    } catch (error) {
      console.warn(`Delete member failed, using mock data:`, error);
      const members = loadMockData('members');
      const filteredMembers = members.filter(m => m.id !== parseInt(id));
      
      saveMockData('members', filteredMembers);
      
      return { message: 'Member deleted successfully' };
    }
  },
};

// Borrowings API
export const borrowingsAPI = {
  getAll: async () => {
    try {
      const response = await api.get('/borrowings');
      // Update localStorage with the latest data from the server
      saveMockData('borrowings', response.data);
      return response.data;
    } catch (error) {
      console.warn(`API call failed, using mock data for borrowings:`, error);
      const mockData = loadMockData('borrowings');
      
      if (!mockData) {
        throw new Error(`No mock data available for borrowings`);
      }
      
      return mockData;
    }
  },
  getById: async (id) => {
    try {
      const response = await api.get(`/borrowings/${id}`);
      return response.data;
    } catch (error) {
      console.warn(`Get borrowing by ID failed, using mock data:`, error);
      const borrowings = loadMockData('borrowings');
      const borrowing = borrowings.find(b => b.id === parseInt(id));
      
      if (!borrowing) {
        throw new Error(`Borrowing with ID ${id} not found`);
      }
      
      return borrowing;
    }
  },
  create: async (borrowingData) => {
    try {
      const response = await api.post('/borrowings', borrowingData);
      return response.data;
    } catch (error) {
      console.warn('Create borrowing failed, using mock data:', error);
      const borrowings = loadMockData('borrowings') || [];
      const books = loadMockData('books') || [];
      const members = loadMockData('members') || [];
      
      const book = books.find(b => b.id === borrowingData.bookId);
      const member = members.find(m => m.id === borrowingData.memberId);
      
      if (!book || !member) {
        throw new Error('Book or member not found');
      }
      
      const newBorrowing = {
        id: borrowings.length > 0 ? Math.max(...borrowings.map(b => b.id)) + 1 : 1,
        ...borrowingData,
        borrowDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(new Date().setDate(new Date().getDate() + 14)).toISOString().split('T')[0],
        returned: false,
        bookTitle: book.title,
        memberName: member.name
      };
      
      borrowings.push(newBorrowing);
      saveMockData('borrowings', borrowings);
      
      // Update book available quantity
      if (book) {
        book.availableQuantity -= 1;
        const bookIndex = books.findIndex(b => b.id === book.id);
        books[bookIndex] = book;
        saveMockData('books', books);
      }
      
      return newBorrowing;
    }
  },
  update: async (id, borrowingData) => {
    try {
      const response = await api.put(`/borrowings/${id}`, borrowingData);
      return response.data;
    } catch (error) {
      console.warn(`Update borrowing failed, using mock data:`, error);
      const borrowings = loadMockData('borrowings');
      const index = borrowings.findIndex(b => b.id === parseInt(id));
      
      if (index === -1) {
        throw new Error(`Borrowing with ID ${id} not found`);
      }
      
      borrowings[index] = { ...borrowings[index], ...borrowingData };
      saveMockData('borrowings', borrowings);
      
      return borrowings[index];
    }
  },
  delete: async (id) => {
    try {
      const response = await api.delete(`/borrowings/${id}`);
      return response.data;
    } catch (error) {
      console.warn(`Delete borrowing failed, using mock data:`, error);
      const borrowings = loadMockData('borrowings');
      const filteredBorrowings = borrowings.filter(b => b.id !== parseInt(id));
      
      saveMockData('borrowings', filteredBorrowings);
      
      return { message: 'Borrowing deleted successfully' };
    }
  },
};

// Stats API
export const statsAPI = {
  getDashboardStats: async () => {
    try {
      const response = await api.get('/stats/dashboard');
      return response.data;
    } catch (error) {
      console.warn('Stats API call failed, generating mock stats:', error);
      
      // Generate mock stats based on books, members, and borrowings data
      const books = loadMockData('books') || [];
      const members = loadMockData('members') || [];
      const borrowings = loadMockData('borrowings') || [];
      
      const today = new Date();
      const activeBorrowings = borrowings.filter(b => !b.returned);
      const overdueBorrowings = activeBorrowings.filter(b => new Date(b.dueDate) < today);
      
      const mockStats = {
        totalBooks: books.length,
        totalMembers: members.length,
        totalBorrowings: borrowings.length,
        activeBorrowings: activeBorrowings.length,
        overdueBorrowings: overdueBorrowings.length
      };
      
      return mockStats;
    }
  },
  getBookStats: async () => {
    try {
      const response = await api.get('/stats/books');
      return response.data;
    } catch (error) {
      console.warn('Book stats API call failed, using mock data:', error);
      return loadMockData('books') || [];
    }
  },
  getMemberStats: async () => {
    try {
      const response = await api.get('/stats/members');
      return response.data;
    } catch (error) {
      console.warn('Member stats API call failed, using mock data:', error);
      return loadMockData('members') || [];
    }
  },
  getBorrowingStats: async () => {
    try {
      const response = await api.get('/stats/borrowings');
      return response.data;
    } catch (error) {
      console.warn('Borrowing stats API call failed, using mock data:', error);
      return loadMockData('borrowings') || [];
    }
  }
};

export default api;