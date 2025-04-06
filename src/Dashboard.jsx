import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Card, Form, Table, Modal, Carousel } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import "bootstrap/dist/js/bootstrap.bundle.min";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import * as XLSX from 'xlsx';

const API_URL = process.env.REACT_APP_API_URL;


function Dashboard() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showCarouselModal, setShowCarouselModal] = useState(false);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [showEmployeeEditModal, setShowEmployeeEditModal] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]);
  const [currentFilter, setCurrentFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [dateRange, setDateRange] = useState([null, null]);
  const [formData, setFormData] = useState({
    mahallaNomi: '',
    ismFamilya: '',
    pasportSeriyasi: '',
    telefonRaqam: '',
    tugilganSanasi: '',
    malumotMutahassislik: '',
    qiziqishlari: '',
    biriktirilganXodim: '',
    amalgaOshirganIshi: '',
  });
  const [editData, setEditData] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [employeeForm, setEmployeeForm] = useState({
    name: '',
    login: '',
    password: ''
  });
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [employeeOptions, setEmployeeOptions] = useState([]);

  // Add new state for image upload
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [imageDescription, setImageDescription] = useState('');

  // Add new state for employee filter
  const [employeeFilter, setEmployeeFilter] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }

    fetch(`${API_URL}/api/admin/records`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(response => {
        if (response.status === 401 || response.status === 403) {
          // Token is invalid or user is not admin
          localStorage.removeItem('token'); // Clear invalid token
          navigate('/admin/login');
          throw new Error('Unauthorized access');
        }
        return response.json();
      })
      .then(data => setTableData(data))
      .catch(error => {
        console.error('Error fetching data:', error);
        if (error.message === 'Unauthorized access') {
          toast.error("Sizda ruxsat yo'q yoki sessiya muddati tugagan!", {
            position: "top-center",
            autoClose: 3000,
          });
        }
      });
  }, [navigate]);

  useEffect(() => {
    fetchEmployeeOptions();
  }, []);

  const fetchEmployeeOptions = async () => {
    const token = localStorage.getItem('adminToken');
    try {
      const response = await fetch(`${API_URL}/api/employees`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const employees = await response.json();
        // Transform employees data into react-select format
        const options = employees.map(emp => ({
          value: emp.name,
          label: emp.name
        }));
        setEmployeeOptions(options);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error("Xodimlar ro'yxatini yuklashda xatolik yuz berdi!");
    }
  };

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({
      mahallaNomi: '',
      ismFamilya: '',
      pasportSeriyasi: '',
      telefonRaqam: '',
      tugilganSanasi: '',
      malumotMutahassislik: '',
      qiziqishlari: '',
      biriktirilganXodim: '',
      amalgaOshirganIshi: '',
    });
  };

  const handleShowEditModal = (row) => {
    setEditData(row);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditData(null);
  };

  const handleShowDeleteModal = (record) => {
    setSelectedRecord(record);
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setSelectedRecord(null);
    setShowDeleteModal(false);
  };

  const handleInputChange = (e) => {
    if (e && e.target) {
      // Handle regular input changes
      const { name, value } = e.target;
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditData({ ...editData, [name]: value });
  };

  const handleSelectChange = (selectedOption) => {
    setFormData({ 
      ...formData, 
      biriktirilganXodim: selectedOption ? selectedOption.value : ''
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    
    fetch(`${API_URL}/api/records`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(formData),
    })
      .then(response => {
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('adminToken');
          navigate('/admin/login');
          throw new Error('Unauthorized access');
        }
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
      })
      .then(newRecord => {
        setTableData([...tableData, newRecord]);
        handleCloseModal();
        toast.success("Ma'lumot muvaffaqiyatli qo'shildi!", {
          position: "top-center",
          autoClose: 3000,
        });
      })
      .catch(error => {
        console.error('Error adding record:', error);
        if (error.message === 'Unauthorized access') {
          toast.error("Sizda ruxsat yo'q yoki sessiya muddati tugagan!", {
            position: "top-center",
            autoClose: 3000,
          });
        } else {
          toast.error("Ma'lumot qo'shishda xatolik yuz berdi!", {
            position: "top-center",
            autoClose: 3000,
          });
        }
      });
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }

    fetch(`${API_URL}/api/records/${editData.id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(editData),
    })
      .then(response => {
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('adminToken');
          navigate('/admin/login');
          throw new Error('Unauthorized access');
        }
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
      })
      .then(updatedRecord => {
        setTableData(tableData.map(row => (row.id === updatedRecord.id ? updatedRecord : row)));
        handleCloseEditModal();
        toast.success("Ma'lumot muvaffaqiyatli yangilandi!", {
          position: "top-center",
          autoClose: 3000,
        });
      })
      .catch(error => {
        console.error('Error updating record:', error);
        if (error.message === 'Unauthorized access') {
          toast.error("Sizda ruxsat yo'q yoki sessiya muddati tugagan!", {
            position: "top-center",
            autoClose: 3000,
          });
        } else {
          toast.error("Ma'lumot yangilashda xatolik yuz berdi!", {
            position: "top-center",
            autoClose: 3000,
          });
        }
      });
  };

  const handleDeleteRecord = () => {
    if (!selectedRecord) return;
    
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }

    fetch(`${API_URL}/api/records/${selectedRecord.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(response => {
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('adminToken');
          navigate('/admin/login');
          throw new Error('Unauthorized access');
        }
        if (!response.ok) throw new Error('Network response was not ok');
        
        setTableData(tableData.filter(row => row.id !== selectedRecord.id));
        handleCloseDeleteModal();
        toast.success("Ma'lumot muvaffaqiyatli o'chirildi!", {
          position: "top-center",
          autoClose: 3000,
        });
      })
      .catch(error => {
        console.error('Error deleting record:', error);
        if (error.message === 'Unauthorized access') {
          toast.error("Sizda ruxsat yo'q yoki sessiya muddati tugagan!", {
            position: "top-center",
            autoClose: 3000,
          });
        } else {
          toast.error("Ma'lumotni o'chirishda xatolik yuz berdi!", {
            position: "top-center",
            autoClose: 3000,
          });
        }
      });
  };

  const handleFilterClick = (filter) => {
    setCurrentFilter(filter);
  };

  const handleDateFilter = (filter) => {
    setDateFilter(filter);
  };

  const filteredTableData = tableData.filter(record => {
    // First apply status filter
    const statusMatch = currentFilter === 'all' || record.status === currentFilter;
    
    // Then apply search filter if there's a search query
    const searchMatch = !searchQuery || 
      record.ismFamilya.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Add employee filter
    const employeeMatch = !employeeFilter || 
      record.biriktirilganXodim === employeeFilter.value;
    
    // Then apply date filter
    let dateMatch = true;
    if (dateFilter !== 'all' && record.createdAt) {
      // Parse the German date format (DD.MM.YYYY)
      const [day, month, year] = record.createdAt.split('.');
      const recordDate = new Date(year, month - 1, day); // month is 0-based in JS
      const today = new Date();
      
      switch (dateFilter) {
        case 'day':
          dateMatch = recordDate.getDate() === today.getDate() &&
                     recordDate.getMonth() === today.getMonth() &&
                     recordDate.getFullYear() === today.getFullYear();
          break;
        case 'month':
          dateMatch = recordDate.getMonth() === today.getMonth() && 
                     recordDate.getFullYear() === today.getFullYear();
          break;
        case 'year':
          dateMatch = recordDate.getFullYear() === today.getFullYear();
          break;
        default:
          dateMatch = true;
      }
    }
    
    // Update date range filter logic
    if (dateRange[0] && dateRange[1] && record.createdAt) {
      const [day, month, year] = record.createdAt.split('.');
      const recordDate = dayjs(`${year}-${month}-${day}`);
      const startDate = dayjs(dateRange[0]);
      const endDate = dayjs(dateRange[1]);
      dateMatch = recordDate.isAfter(startDate.subtract(1, 'day')) && recordDate.isBefore(endDate.add(1, 'day'));
    }
    
    return statusMatch && searchMatch && dateMatch && employeeMatch;
  });

  const getTableTitle = () => {
    switch (currentFilter) {
      case 'jarayonda':
        return 'JARAYONDA';
      case 'bajarilgan':
        return 'BAJARILGAN';
      default:
        return 'MUROJATLAR';
    }
  };

  // Add new handlers for image functionality
  const handleShowImageModal = (record) => {
    setSelectedRecord(record);
    setShowImageModal(true);
    fetchImages(record.id);
  };

  const handleCloseImageModal = () => {
    setShowImageModal(false);
    setSelectedRecord(null);
    setSelectedImages([]);
    setSelectedFile(null);
    setImageDescription('');
  };

  const fetchImages = async (recordId) => {
    const token = localStorage.getItem('adminToken');
    try {
      const response = await fetch(`${API_URL}/api/records/${recordId}/images`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setSelectedImages(data);
      }
    } catch (error) {
      console.error('Error fetching images:', error);
      toast.error("Rasmlarni yuklashda xatolik yuz berdi!");
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleImageUpload = async () => {
    if (!selectedFile || !selectedRecord) return;

    const token = localStorage.getItem('adminToken');
    const reader = new FileReader();
    
    reader.onload = async () => {
      const base64Data = reader.result.split(',')[1];
      setUploading(true);
      
      try {
        const response = await fetch(`${API_URL}/api/records/${selectedRecord.id}/images`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ 
            imageData: base64Data,
            description: imageDescription
          })
        });

        if (response.ok) {
          toast.success("Rasm muvaffaqiyatli yuklandi!");
          fetchImages(selectedRecord.id);
          setSelectedFile(null);
          setImageDescription('');
        } else {
          throw new Error('Upload failed');
        }
      } catch (error) {
        console.error('Error uploading image:', error);
        toast.error("Rasmni yuklashda xatolik yuz berdi!");
      } finally {
        setUploading(false);
      }
    };

    reader.readAsDataURL(selectedFile);
  };

  const handleDeleteImage = async (imageId) => {
    const token = localStorage.getItem('adminToken');
    try {
      const response = await fetch(`${API_URL}/api/images/${imageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast.success("Rasm muvaffaqiyatli o'chirildi!");
        fetchImages(selectedRecord.id);
      } else {
        throw new Error('Delete failed');
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error("Rasmni o'chirishda xatolik yuz berdi!");
    }
  };

  // Add new handlers for carousel
  const handleShowCarousel = (index) => {
    setSelectedImageIndex(index);
    setShowCarouselModal(true);
  };

  const handleCloseCarousel = () => {
    setShowCarouselModal(false);
    setSelectedImageIndex(0);
  };

  // Add new handlers for employee management
  const handleShowEmployeeModal = () => {
    setShowEmployeeModal(true);
    fetchEmployees();
  };

  const handleCloseEmployeeModal = () => {
    setShowEmployeeModal(false);
    setEmployeeForm({
      name: '',
      login: '',
      password: ''
    });
  };

  const fetchEmployees = async () => {
    const token = localStorage.getItem('adminToken');
    try {
      const response = await fetch(`${API_URL}/api/employees`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setEmployees(data);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error("Xodimlar ro'yxatini yuklashda xatolik yuz berdi!");
    }
  };

  const handleEmployeeInputChange = (e) => {
    const { name, value } = e.target;
    setEmployeeForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');
    
    try {
      const response = await fetch(`${API_URL}/api/employees`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(employeeForm)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add employee');
      }

      toast.success("Xodim muvaffaqiyatli qo'shildi!");
      setEmployeeForm({
        name: '',
        login: '',
        password: ''
      });
      fetchEmployees();
    } catch (error) {
      console.error('Error adding employee:', error);
      toast.error(error.message || "Xodim qo'shishda xatolik yuz berdi!");
    }
  };

  const handleDeleteEmployee = async (employeeId) => {
    const token = localStorage.getItem('adminToken');
    try {
      const response = await fetch(`${API_URL}/api/employees/${employeeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast.success("Xodim muvaffaqiyatli o'chirildi!");
        fetchEmployees();
      } else {
        throw new Error('Delete failed');
      }
    } catch (error) {
      console.error('Error deleting employee:', error);
      toast.error("Xodimni o'chirishda xatolik yuz berdi!");
    }
  };

  const handleShowEmployeeEditModal = (employee) => {
    setEditingEmployee(employee);
    setShowEmployeeEditModal(true);
  };

  const handleCloseEmployeeEditModal = () => {
    setShowEmployeeEditModal(false);
    setEditingEmployee(null);
  };

  const handleEmployeeEditSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');
    
    try {
      const response = await fetch(`${API_URL}/api/employees/${editingEmployee.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editingEmployee)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update employee');
      }

      toast.success("Xodim muvaffaqiyatli yangilandi!");
      handleCloseEmployeeEditModal();
      fetchEmployees();
    } catch (error) {
      console.error('Error updating employee:', error);
      toast.error(error.message || "Xodimni yangilashda xatolik yuz berdi!");
    }
  };

  // Add handler for employee filter change
  const handleEmployeeFilterChange = (selectedOption) => {
    setEmployeeFilter(selectedOption);
  };

  const downloadExcel = () => {
    // Prepare the data for Excel
    const excelData = filteredTableData.map(row => ({
      'Yoshning manzili': row.mahallaNomi,
      'Yoshning F.I.O': row.ismFamilya,
      'Pasport seriyasi va raqami': row.pasportSeriyasi,
      'Telefon raqam': row.telefonRaqam,
      'Tug\'ilgan sanasi': row.tugilganSanasi,
      'Ma\'lumoti va mutahassislik': row.malumotMutahassislik,
      'Taklifi yoki qiziqishlari': row.qiziqishlari,
      'Amalga oshirgan ishi': row.amalgaOshirganIshi,
      'Biriktirilgan rahbar F.I.O': row.biriktirilganXodim,
      'Status': row.status
    }));

    // Create a new workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Murojatlar');

    // Generate Excel file and trigger download
    XLSX.writeFile(wb, 'murojatlar.xlsx');
  };

  return (
    <Container className="my-4">
      <ToastContainer />

      <Row className="mb-4 align-items-center">
        <Col md={8}>
          <Button 
            variant="warning" 
            className="me-2"
            onClick={() => handleDateFilter('day')}
          >
            Joriy kun: {new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}
          </Button>
          <Button 
            variant="success" 
            className="me-2"
            onClick={() => handleDateFilter('month')}
          >
            Joriy oy: {new Date().toLocaleDateString('de-DE', { month: '2-digit', year: 'numeric' })}
          </Button>
          <Button 
            variant="primary"
            onClick={() => handleDateFilter('year')}
          >
            Joriy yil: {new Date().toLocaleDateString('de-DE', { year: 'numeric' })}
          </Button>

        </Col>
        <Col md={4} className="d-flex gap-2">
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Boshlanish"
              value={dateRange[0]}
              onChange={(newValue) => setDateRange([newValue, dateRange[1]])}
              format="DD.MM.YYYY"
              slotProps={{
                textField: { size: "small", fullWidth: true }
              }}
            />
            <DatePicker
              label="Tugash"
              value={dateRange[1]}
              onChange={(newValue) => setDateRange([dateRange[0], newValue])}
              format="DD.MM.YYYY"
              slotProps={{
                textField: { size: "small", fullWidth: true }
              }}
            />
          </LocalizationProvider>
        </Col>
        
      </Row>

      <Row className="mb-4 justify-content-center">
        <Col md={3}>
          <Card style={{ cursor: 'pointer' }} onClick={() => handleFilterClick('all')}>
            <Card.Header style={{ backgroundColor: 'lightblue' }}>Murojatlar</Card.Header>
            <Card.Body className="text-center">
              <div style={{ fontSize: '2rem' }}>{tableData.length}</div>
              <div style={{ fontSize: '1rem' }}>ta chaqiruv</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card style={{ cursor: 'pointer' }} onClick={() => handleFilterClick('jarayonda')}>
            <Card.Header style={{ backgroundColor: 'orange' }}>Jarayonda</Card.Header>
            <Card.Body className="text-center">
              <div style={{ fontSize: '2rem' }}>{tableData.filter(record => record.status === 'jarayonda').length}</div>
              <div style={{ fontSize: '1rem' }}>ta chaqiruv</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card style={{ cursor: 'pointer' }} onClick={() => handleFilterClick('bajarilgan')}>
            <Card.Header style={{ backgroundColor: 'lightgreen' }}>Bajarilgan</Card.Header>
            <Card.Body className="text-center">
              <div style={{ fontSize: '2rem' }}>{tableData.filter(record => record.status === 'bajarilgan').length}</div>
              <div style={{ fontSize: '1rem' }}>ta chaqiruv</div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col md={12}>
          <h2 className="mb-3">{getTableTitle()}</h2>
        </Col>
      </Row>
      <Row className="mb-3 align-items-between justify-content-between">
        <Col md={4}>
          <Button onClick={handleShowModal}>QO`SHISH</Button>
          <Button className='ms-2 me-2' onClick={handleShowEmployeeModal}>HODIM Q`SHISH</Button>
          <Button id='download-excel' variant="success" onClick={downloadExcel}>
            <i className="bi bi-file-earmark-excel me-1"></i>
            Excel
          </Button>
        
        </Col>

        <Col md={4}>
          <Form className="d-flex">
            <Form.Control
              type="text"
              placeholder="F.I.SH Qidirish..."
              className="me-2"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </Form>
        </Col>

        <Col md={4}>
          <Select
            value={employeeFilter}
            onChange={handleEmployeeFilterChange}
            options={employeeOptions}
            isClearable
            isSearchable
            placeholder="Xodim bo'yicha filtrlash..."
            noOptionsMessage={() => "Xodim topilmadi"}
          />
        </Col>

      </Row>
      <Row>
        <Col md={12}>
          <Table striped bordered hover>
            <thead>
              <tr style={{ textAlign: 'center' }}>
                <th style={{ whiteSpace: 'nowrap', minWidth: '150px' }}>Yoshning manzili</th>
                <th style={{ whiteSpace: 'nowrap', minWidth: '150px' }}>Yoshning F.I.O</th>
                <th style={{ whiteSpace: 'nowrap', minWidth: '150px' }}>Pasport seriyasi va raqami</th>
                <th style={{ whiteSpace: 'nowrap', minWidth: '120px' }}>Telefon raqam</th>
                <th style={{ whiteSpace: 'nowrap', minWidth: '120px' }}>Tug'ilgan sanasi</th>
                <th style={{ whiteSpace: 'nowrap', minWidth: '180px' }}>Ma'lumoti va mutahassislik</th>
                <th style={{ whiteSpace: 'nowrap', minWidth: '180px' }}>Taklifi yoki qiziqishlari</th>
                <th style={{ whiteSpace: 'nowrap', minWidth: '150px' }}>Amalga oshirgan ishi</th>
                <th style={{ whiteSpace: 'nowrap', minWidth: '180px' }}>Biriktirilgan rahbar F.I.O</th>
                <th style={{ whiteSpace: 'nowrap', minWidth: '100px' }}>Amallar</th>
                <th style={{ whiteSpace: 'nowrap', minWidth: '100px' }}>status</th>
              </tr>
            </thead>
            <tbody>
              {filteredTableData.length === 0 ? (
                <tr>
                  <td colSpan={12} style={{ textAlign: 'center', color: 'red' }}>
                    Jadvalda ma'lumot mavjud emas
                  </td>
                </tr>
              ) : (
                filteredTableData.map((row, index) => (
                  <tr key={index} style={{ textAlign: 'center' }}>
                    <td style={{ whiteSpace: 'nowrap' }}>{row.mahallaNomi}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>{row.ismFamilya}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>{row.pasportSeriyasi}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>{row.telefonRaqam}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>{row.tugilganSanasi}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>{row.malumotMutahassislik}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>{row.qiziqishlari}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>{row.amalgaOshirganIshi}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>{row.biriktirilganXodim}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <Button variant="warning" onClick={() => handleShowEditModal(row)}><i className="bi bi-pencil-square"></i></Button>
                      <Button variant="danger" onClick={() => handleShowDeleteModal(row)}><i className="bi bi-trash"></i></Button>
                      <Button variant="info" onClick={() => handleShowImageModal(row)}><i className="bi bi-image"></i></Button>
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>{row.status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Col>
      </Row>

      {/* Add Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Yangi Ma'lumot Qo'shish</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Row className="mb-3">
              <Col md={4}>
                <Form.Group controlId="mahallaNomi">
                  <Form.Label>Mahalla nomi</Form.Label>
                  <Form.Control
                    type="text"
                    name="mahallaNomi"
                    value={formData.mahallaNomi}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="ismFamilya">
                  <Form.Label>Ism va Familya</Form.Label>
                  <Form.Control
                    type="text"
                    name="ismFamilya"
                    value={formData.ismFamilya}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="pasportSeriyasi">
                  <Form.Label>Pasport seriyasi</Form.Label>
                  <Form.Control
                    type="text"
                    name="pasportSeriyasi"
                    value={formData.pasportSeriyasi}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={4}>
                <Form.Group controlId="telefonRaqam">
                  <Form.Label>Telefon raqam</Form.Label>
                  <Form.Control
                    type="text"
                    name="telefonRaqam"
                    value={formData.telefonRaqam}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="tugilganSanasi">
                  <Form.Label>Tug'ilgan sanasi</Form.Label>
                  <Form.Control
                    type="date"
                    name="tugilganSanasi"
                    value={formData.tugilganSanasi}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="malumotMutahassislik">
                  <Form.Label>Ma'lumoti va mutahassislik</Form.Label>
                  <Form.Control
                    type="text"
                    name="malumotMutahassislik"
                    value={formData.malumotMutahassislik}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={4}>
                <Form.Group controlId="qiziqishlari">
                  <Form.Label>Qiziqishlari</Form.Label>
                  <Form.Control
                    type="text"
                    name="qiziqishlari"
                    value={formData.qiziqishlari}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="biriktirilganXodim">
                  <Form.Label>Biriktirilgan xodim</Form.Label>
                  <Select
                    value={employeeOptions.find(option => option.value === formData.biriktirilganXodim)}
                    onChange={handleSelectChange}
                    options={employeeOptions}
                    isClearable
                    isSearchable
                    placeholder="Xodimni tanlang..."
                    noOptionsMessage={() => "Xodim topilmadi"}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="amalgaOshirganIshi">
                  <Form.Label>Amalga oshirgan ishi</Form.Label>
                  <Form.Control
                    type="text"
                    name="amalgaOshirganIshi"
                    value={formData.amalgaOshirganIshi}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Yopish
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Saqlash
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Modal */}
      <Modal show={showEditModal} onHide={handleCloseEditModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Ma'lumotni Tahrirlash</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editData && (
            <Form onSubmit={handleEditSubmit}>
              <Row className="mb-3">
                <Col md={4}>
                  <Form.Group controlId="mahallaNomi">
                    <Form.Label>Mahalla nomi</Form.Label>
                    <Form.Control
                      type="text"
                      name="mahallaNomi"
                      value={editData.mahallaNomi}
                      onChange={handleEditInputChange}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group controlId="ismFamilya">
                    <Form.Label>Ism va Familya</Form.Label>
                    <Form.Control
                      type="text"
                      name="ismFamilya"
                      value={editData.ismFamilya}
                      onChange={handleEditInputChange}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group controlId="pasportSeriyasi">
                    <Form.Label>Pasport seriyasi</Form.Label>
                    <Form.Control
                      type="text"
                      name="pasportSeriyasi"
                      value={editData.pasportSeriyasi}
                      onChange={handleEditInputChange}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={4}>
                  <Form.Group controlId="telefonRaqam">
                    <Form.Label>Telefon raqam</Form.Label>
                    <Form.Control
                      type="text"
                      name="telefonRaqam"
                      value={editData.telefonRaqam}
                      onChange={handleEditInputChange}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group controlId="tugilganSanasi">
                    <Form.Label>Tug'ilgan sanasi</Form.Label>
                    <Form.Control
                      type="date"
                      name="tugilganSanasi"
                      value={editData.tugilganSanasi}
                      onChange={handleEditInputChange}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group controlId="malumotMutahassislik">
                    <Form.Label>Ma'lumoti va mutahassislik</Form.Label>
                    <Form.Control
                      type="text"
                      name="malumotMutahassislik"
                      value={editData.malumotMutahassislik}
                      onChange={handleEditInputChange}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={4}>
                  <Form.Group controlId="qiziqishlari">
                    <Form.Label>Qiziqishlari</Form.Label>
                    <Form.Control
                      type="text"
                      name="qiziqishlari"
                      value={editData.qiziqishlari}
                      onChange={handleEditInputChange}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group controlId="biriktirilganXodim">
                    <Form.Label>Biriktirilgan xodim</Form.Label>
                    <Select
                      value={employeeOptions.find(option => option.value === editData.biriktirilganXodim)}
                      onChange={(selectedOption) => handleEditInputChange({ target: { name: 'biriktirilganXodim', value: selectedOption ? selectedOption.value : '' } })}
                      options={employeeOptions}
                      isClearable
                      isSearchable
                      placeholder="Xodimni tanlang..."
                      noOptionsMessage={() => "Xodim topilmadi"}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group controlId="amalgaOshirganIshi">
                    <Form.Label>Amalga oshirgan ishi</Form.Label>
                    <Form.Control
                      type="text"
                      name="amalgaOshirganIshi"
                      value={editData.amalgaOshirganIshi}
                      onChange={handleEditInputChange}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
              {/* Status Selection */}
              <Row className="mb-3">
                <Col md={12}>
                  <Form.Group controlId="status">
                    <Form.Label>Status</Form.Label>
                    <div>
                      <Form.Check
                        inline
                        label="Jarayonda"
                        name="status"
                        type="radio"
                        id="status-jarayonda"
                        value="jarayonda"
                        checked={editData.status === 'jarayonda'}
                        onChange={handleEditInputChange}
                      />
                      <Form.Check
                        inline
                        label="Bajarilgan"
                        name="status"
                        type="radio"
                        id="status-bajarilgan"
                        value="bajarilgan"
                        checked={editData.status === 'bajarilgan'}
                        onChange={handleEditInputChange}
                      />
                    </div>
                  </Form.Group>
                </Col>
              </Row>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseEditModal}>
            Yopish
          </Button>
          <Button variant="primary" onClick={handleEditSubmit}>
            Saqlash
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={handleCloseDeleteModal}>
        <Modal.Header closeButton>
          <Modal.Title>Qaydni O'chirish</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedRecord && (
            <p>
              Siz "{selectedRecord.ismFamilya}" nomli qaydni o'chirmoqchimisiz? 
              Bu operatsiya qaytarib bo'lmaydigan bo'ladi.
            </p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDeleteModal}>
            Bekor qilish
          </Button>
          <Button variant="danger" onClick={handleDeleteRecord}>
            O'chirish
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Image Upload Modal */}
      <Modal show={showImageModal} onHide={handleCloseImageModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Rasmlar</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <Form.Group>
              <Form.Label>Yangi rasm qo'shish</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
              />
            </Form.Group>
            <Form.Group className="mt-2">
              <Form.Label>Rasm tavsifi</Form.Label>
              <Form.Control
                type="text"
                placeholder="Rasm haqida ma'lumot kiriting"
                value={imageDescription}
                onChange={(e) => setImageDescription(e.target.value)}
              />
            </Form.Group>
            <Button 
              variant="primary" 
              onClick={handleImageUpload}
              disabled={!selectedFile || uploading}
              className="mt-2"
            >
              {uploading ? 'Yuklanmoqda...' : 'Yuklash'}
            </Button>
          </div>

          <div className="row">
            {selectedImages.map((image, index) => (
              <div key={image.id} className="col-md-4 mb-3">
                <Card>
                  <Card.Img 
                    variant="top" 
                    src={`data:image/jpeg;base64,${image.image_data}`}
                    style={{ height: '200px', objectFit: 'cover', cursor: 'pointer' }}
                    onClick={() => handleShowCarousel(index)}
                  />
                  <Card.Body>
                    {image.description && (
                      <Card.Text className="mb-2">
                        <strong>Tavsif:</strong> {image.description}
                      </Card.Text>
                    )}
                    <Button 
                      variant="danger" 
                      size="sm"
                      onClick={() => handleDeleteImage(image.id)}
                    >
                      O'chirish
                    </Button>
                  </Card.Body>
                </Card>
              </div>
            ))}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseImageModal}>
            Yopish
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Carousel Modal */}
      <Modal 
        show={showCarouselModal} 
        onHide={handleCloseCarousel} 
        size="xl"
        centered
        className="carousel-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Rasm ko'rish</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0">
          <Carousel 
            activeIndex={selectedImageIndex} 
            onSelect={(index) => setSelectedImageIndex(index)}
            interval={null}
            indicators={true}
            controls={true}
            className="carousel-fullscreen"
          >
            {selectedImages.map((image, index) => (
              <Carousel.Item key={image.id}>
                <img
                  src={`data:image/jpeg;base64,${image.image_data}`}
                  alt={`Rasm ${index + 1}`}
                  style={{
                    width: '100%',
                    height: '80vh',
                    objectFit: 'contain',
                    backgroundColor: '#000'
                  }}
                />
              </Carousel.Item>
            ))}
          </Carousel>
          {selectedImages[selectedImageIndex]?.description && (
            <div className="p-3 bg-light">
              <h5>Tavsif:</h5>
              <p>{selectedImages[selectedImageIndex].description}</p>
            </div>
          )}
        </Modal.Body>
      </Modal>

      {/* Employee Management Modal */}
      <Modal show={showEmployeeModal} onHide={handleCloseEmployeeModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Xodimlar boshqaruvi</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleAddEmployee} className="mb-4">
            <Row>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Xodim ismi</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={employeeForm.name}
                    onChange={handleEmployeeInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Login</Form.Label>
                  <Form.Control
                    type="text"
                    name="login"
                    value={employeeForm.login}
                    onChange={handleEmployeeInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Parol</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={employeeForm.password}
                    onChange={handleEmployeeInputChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Button type="submit" variant="primary" className="mt-3">
              Qo'shish
            </Button>
          </Form>

          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Xodim ismi</th>
                <th>Login</th>
                <th>Parol</th>
                <th>Amallar</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => (
                <tr key={employee.id}>
                  <td>{employee.name}</td>
                  <td>{employee.login}</td>
                  <td>{employee.password}</td>
                  <td>
                    <Button 
                      variant="warning" 
                      size="sm"
                      className="me-2"
                      onClick={() => handleShowEmployeeEditModal(employee)}
                    >
                      <i className="bi bi-pencil-square"></i>
                    </Button>
                    <Button 
                      variant="danger" 
                      size="sm"
                      onClick={() => handleDeleteEmployee(employee.id)}
                    >
                      <i className="bi bi-trash"></i>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          {/* Employee Edit Modal */}
          <Modal show={showEmployeeEditModal} onHide={handleCloseEmployeeEditModal}>
            <Modal.Header closeButton>
              <Modal.Title>Xodimni tahrirlash</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {editingEmployee && (
                <Form onSubmit={handleEmployeeEditSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Xodim ismi</Form.Label>
                    <Form.Control
                      type="text"
                      value={editingEmployee.name}
                      onChange={(e) => setEditingEmployee({...editingEmployee, name: e.target.value})}
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Login</Form.Label>
                    <Form.Control
                      type="text"
                      value={editingEmployee.login}
                      onChange={(e) => setEditingEmployee({...editingEmployee, login: e.target.value})}
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Parol</Form.Label>
                    <Form.Control
                      type="password"
                      value={editingEmployee.password}
                      onChange={(e) => setEditingEmployee({...editingEmployee, password: e.target.value})}
                      required
                    />
                  </Form.Group>
                  <Button type="submit" variant="primary">
                    Saqlash
                  </Button>
                </Form>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseEmployeeEditModal}>
                Bekor qilish
              </Button>
            </Modal.Footer>
          </Modal>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseEmployeeModal}>
            Yopish
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default Dashboard;