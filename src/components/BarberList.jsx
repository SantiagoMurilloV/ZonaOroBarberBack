import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight, faHome , faCut} from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import '../components/styles/AdminBarbers.css';
import { environment } from '../environments';

const BarberList = () => {
  const { id } = useParams();
  const [barbers, setBarbers] = useState([]);
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedBarber, setSelectedBarber] = useState(null);

  useEffect(() => {
    const fetchBarbers = async () => {
      try {
        const response = await axios.get(`${environment.apiURL}/api/barbers`);
        setBarbers(response.data);
      } catch (error) {
        console.error('Error al obtener la lista de barberos:', error);
      }
    };

    fetchBarbers();
  }, []);

  const handleViewCuts = () => {
    navigate('/admin/cuts');
  };

  const handleAddBarber = () => {
    navigate('/admin/add-barber');
  };

  const handleDeleteBarber = () => {
    if (selectedBarber) {
      axios
        .delete(`${environment.apiURL}/api/barbers/${selectedBarber}`)
        .then(() => {
          Swal.fire('Eliminado', 'El barbero fue eliminado exitosamente.', 'success');
          setBarbers(barbers.filter((barber) => barber._id !== selectedBarber));
          setShowDeleteModal(false);
        })
        .catch((error) => {
          console.error('Error al eliminar el barbero:', error);
          Swal.fire('Error', 'Hubo un problema al eliminar el barbero.', 'error');
        });
    }
  };

  return (
    <div className="admin-barbers-container">
      <Link to={`/admin/${id}`}>
        <button className="home-button">
          <FontAwesomeIcon icon={faHome} />
        </button>
      </Link>
      <h1 className='title-barberList'>Gestión de Barberos</h1>
      <div className="actions">
        <button onClick={handleViewCuts} className="action-button">
          Ver Número de Cortes
        </button>
        <button onClick={handleAddBarber} className="action-button">
          Registrar Barbero
        </button>
        <button onClick={() => setShowDeleteModal(true)} className="action-button">
          Eliminar Barbero
        </button>
      </div>

      <div className="barbers-list">
        {barbers.map((barber) => (
          <div key={barber._id} className="barber-card">
            <h3>{barber.first_name} {barber.last_name}</h3>
            <p>Teléfono: {barber.phone}</p>
            <p>Especialidad: {barber.specialty}</p>
          </div>
        ))}
      </div>

      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2 className='delete-barber'>Eliminar Barbero</h2>
            <label htmlFor="barber-select">Seleccionar Barbero:</label>
            <select
              id="barber-select"
              value={selectedBarber}
              onChange={(e) => setSelectedBarber(e.target.value)}
            >
              <option value="">Selecciona un barbero</option>
              {barbers.map((barber) => (
                <option key={barber._id} value={barber._id}>
                  {barber.first_name} {barber.last_name}
                </option>
              ))}
            </select>
            <button onClick={handleDeleteBarber} className="action-button">
              Eliminar
            </button>
            <button onClick={() => setShowDeleteModal(false)} className="cancel-button">
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BarberList;
