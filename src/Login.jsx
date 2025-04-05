import React, { useState } from 'react';
import { Container, Form, Button, Card, Nav } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const API_URL = process.env.REACT_APP_API_URL;

function Login() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('employee');
  
  // Employee credentials
  const [employeeCredentials, setEmployeeCredentials] = useState({
    login: '',
    password: ''
  });

  // Admin credentials
  const [adminCredentials, setAdminCredentials] = useState({
    username: '',
    password: ''
  });

  const handleEmployeeInputChange = (e) => {
    const { name, value } = e.target;
    setEmployeeCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAdminInputChange = (e) => {
    const { name, value } = e.target;
    setAdminCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEmployeeSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`${API_URL}/api/employee/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(employeeCredentials)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Login failed');
      }

      const data = await response.json();
      
      localStorage.setItem('employeeToken', data.token);
      localStorage.setItem('userData', JSON.stringify(data.user));
      
      toast.success('Login successful!');
      navigate('/user/dashboard');
      
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.message || 'Login failed. Please try again.');
    }
  };

  const handleAdminSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_URL}/api/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(adminCredentials)
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error);

      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('adminData', JSON.stringify(data.user));
      
      toast.success('Admin login successful!');
      navigate('/admin/dashboard');
    } catch (error) {
      console.error(error.message);
      toast.error(error.message || 'Admin login failed. Please try again.');
    }
  };

  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
      <ToastContainer position="top-right" autoClose={3000} />
      <Card style={{ width: '400px' }}>
        <Card.Body>
          <Nav variant="tabs" className="mb-3 justify-content-center">
            <Nav.Item>
              <Nav.Link 
                active={activeTab === 'employee'}
                onClick={() => setActiveTab('employee')}
              >
                HODIM
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link 
                active={activeTab === 'admin'}
                onClick={() => setActiveTab('admin')}
              >
                RAHBAR
              </Nav.Link>
            </Nav.Item>
          </Nav>

          {activeTab === 'employee' ? (
            <Form onSubmit={handleEmployeeSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Login</Form.Label>
                <Form.Control
                  type="text"
                  name="login"
                  value={employeeCredentials.login}
                  onChange={handleEmployeeInputChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Parol</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  value={employeeCredentials.password}
                  onChange={handleEmployeeInputChange}
                  required
                />
              </Form.Group>

              <Button variant="primary" type="submit" className="w-100">
                KIRISH
              </Button>
            </Form>
          ) : (
            <Form onSubmit={handleAdminSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Login</Form.Label>
                <Form.Control
                  type="text"
                  name="username"
                  value={adminCredentials.username}
                  onChange={handleAdminInputChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Parol</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  value={adminCredentials.password}
                  onChange={handleAdminInputChange}
                  required
                />
              </Form.Group>

              <Button variant="info" type="submit" className="w-100">
                KIRISH
              </Button>
            </Form>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}

export default Login;
