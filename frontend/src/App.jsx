import { useState, useEffect } from 'react'
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Layout, LogOut, CheckCircle2, Circle, Clock, Plus, Trash2, Edit3, User, Search, Filter } from 'lucide-react'
import axios from 'axios'

// --- Auth Components ---
const Login = ({ setAuth }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify({ username: res.data.username }));
      setAuth(true);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="auth-container">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }} 
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="glass-card auth-card"
      >
        <h2>Welcome Back</h2>
        <p className="subtitle">Track your project flow effortlessly</p>
        {error && <div className="error-msg">{error}</div>}
        <form onSubmit={handleLogin}>
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
          <button type="submit">Log In</button>
        </form>
        <p className="switch-auth">New here? <span onClick={() => navigate('/register')}>Sign Up</span></p>
      </motion.div>
    </div>
  );
};

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/auth/register', { username, email, password });
      setSuccess('Account created! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="auth-container">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }} 
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="glass-card auth-card"
      >
        <h2>Create Account</h2>
        <p className="subtitle">Start your cloud-native journey</p>
        {error && <div className="error-msg">{error}</div>}
        {success && <div className="success-msg">{success}</div>}
        <form onSubmit={handleRegister}>
          <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required />
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
          <button type="submit">Sign Up</button>
        </form>
        <p className="switch-auth">Already have an account? <span onClick={() => navigate('/login')}>Log In</span></p>
      </motion.div>
    </div>
  );
};

// --- Dashboard Sub-Components ---
const Dashboard = ({ handleLogout }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium' });
  const [user, setUser] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    setUser(userData);
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/tasks', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(res.data.tasks);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const createTask = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/tasks', newTask, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowModal(false);
      setNewTask({ title: '', description: '', priority: 'medium' });
      fetchTasks();
    } catch (err) {
      alert('Failed to create task');
    }
  };

  const updateStatus = async (taskId, currentStatus) => {
    const nextStatus = currentStatus === 'pending' ? 'in-progress' : currentStatus === 'in-progress' ? 'completed' : 'pending';
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/tasks/${taskId}`, { status: nextStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTasks();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const deleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTasks();
    } catch (err) {
      alert('Failed to delete task');
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    return matchesSearch && matchesPriority;
  });

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="brand">
          <div className="logo-icon"><Layout size={24} /></div>
          <span>TaskFlow</span>
        </div>
        <nav>
          <div className="nav-item active"><motion.div whileHover={{ scale: 1.05 }}><Layout size={20} /> Dashboard</motion.div></div>
          <div className="nav-item"><User size={20} /> Profile</div>
          <div className="nav-item logout" onClick={handleLogout}><LogOut size={20} /> Logout</div>
        </nav>
      </aside>

      <main className="dashboard-content">
        <header>
          <div className="welcome">
            <h1>Hello, {user.username || 'User'}</h1>
            <p>You have {tasks.filter(t => t.status !== 'completed').length} tasks remaining</p>
          </div>
          <div className="header-actions">
            <div className="search-bar">
              <Search size={18} /> 
              <input 
                type="text" 
                placeholder="Search tasks..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="filter-group">
              <Filter size={18} />
              <select 
                value={filterPriority} 
                onChange={(e) => setFilterPriority(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Priorities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <button className="add-btn" onClick={() => setShowModal(true)}><Plus size={20} /> New Task</button>
          </div>
        </header>

        <section className="stats">
            <div className="glass-card stat-card">
              <span className="stat-label">Total</span>
              <span className="stat-value">{tasks.length}</span>
            </div>
            <div className="glass-card stat-card">
              <span className="stat-label">Ongoing</span>
              <span className="stat-value">{tasks.filter(t => t.status === 'in-progress').length}</span>
            </div>
            <div className="glass-card stat-card">
              <span className="stat-label">Completed</span>
              <span className="stat-value success">{tasks.filter(t => t.status === 'completed').length}</span>
            </div>
        </section>

        <section className="task-grid">
          <AnimatePresence>
            {filteredTasks.map(task => (
              <motion.div 
                key={task._id} 
                layout 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-card task-card"
              >
                <div className="task-header">
                  <span className={`priority-tag ${task.priority}`}>{task.priority}</span>
                  <div className="actions">
                    <button className="icon-btn delete" onClick={() => deleteTask(task._id)}><Trash2 size={16} /></button>
                  </div>
                </div>
                <h3>{task.title}</h3>
                <p>{task.description}</p>
                <div className="task-footer">
                  <div className={`status-badge ${task.status}`} onClick={() => updateStatus(task._id, task.status)}>
                    {task.status === 'completed' ? <CheckCircle2 size={16} /> : task.status === 'in-progress' ? <Clock size={16} /> : <Circle size={16} /> }
                    {task.status}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {!loading && filteredTasks.length === 0 && (
            <div className="empty-state">No tasks found matching your criteria.</div>
          )}
        </section>
      </main>

      {/* modal - simplified inline for brevity in this example code block */}
      {showModal && (
        <div className="modal-overlay">
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} className="glass-card modal">
            <h2>Add New Task</h2>
            <form onSubmit={createTask}>
              <input type="text" placeholder="Task title" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} required/>
              <textarea placeholder="Description" value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})}></textarea>
              <select value={newTask.priority} onChange={e => setNewTask({...newTask, priority: e.target.value})}>
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
              <div className="modal-actions">
                <button type="button" className="secondary-btn" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit">Create Task</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

// --- App Root ---
function App() {
  const [isAuth, setIsAuth] = useState(!!localStorage.getItem('token'));
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuth(false);
    navigate('/login');
  };

  return (
    <div className="App">
       <Routes>
          <Route path="/login" element={!isAuth ? <Login setAuth={setIsAuth} /> : <Navigate to="/dashboard" />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={isAuth ? <Dashboard handleLogout={handleLogout} /> : <Navigate to="/login" />} />
          <Route path="/" element={<Navigate to={isAuth ? "/dashboard" : "/login"} />} />
       </Routes>
    </div>
  )
}

export default App
