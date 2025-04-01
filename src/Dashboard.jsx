import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Card, Form, Table, Modal } from 'react-bootstrap';
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

const API_URL = process.env.REACT_APP_API_URL;


function Dashboard() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
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

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/admin/login');
      return;
    }

    fetch(`${API_URL}/api/records`, {
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
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditData({ ...editData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
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
          localStorage.removeItem('token');
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
    const token = localStorage.getItem('token');
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
          localStorage.removeItem('token');
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
    
    const token = localStorage.getItem('token');
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
          localStorage.removeItem('token');
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
    
    return statusMatch && searchMatch && dateMatch;
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
                  <td colSpan={11} style={{ textAlign: 'center', color: 'red' }}>
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
                      <Button variant="warning" onClick={() => handleShowEditModal(row)}><i class="bi bi-pencil-square"></i></Button>
                      <Button 
                        variant="danger" 
                        onClick={() => handleShowDeleteModal(row)}
                      > 
                        <i className="bi bi-trash"></i>
                      </Button>
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
                  <Form.Control
                    type="text"
                    name="biriktirilganXodim"
                    value={formData.biriktirilganXodim}
                    onChange={handleInputChange}
                    required
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
                    <Form.Control
                      type="text"
                      name="biriktirilganXodim"
                      value={editData.biriktirilganXodim}
                      onChange={handleEditInputChange}
                      required
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
    </Container>
  );
}

export default Dashboard;