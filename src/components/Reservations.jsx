import React, { useState, useEffect } from 'react';
import moment from 'moment';
import 'moment/locale/es';
import { Link, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight, faHome , faCut} from '@fortawesome/free-solid-svg-icons';
import '../components/styles/Reservations.css';
import axios from 'axios';
import Swal from 'sweetalert2';
import { environment } from '../environments';

const generateHalfHourIntervals = (start, end) => {
  const intervals = [];
  let current = moment(start, 'HH:mm');
  const endTime = moment(end, 'HH:mm');
  while (current < endTime) {
    const nextInterval = current.clone().add(30, 'minutes');
    intervals.push(`${current.format('hh:mm A')} - ${nextInterval.format('hh:mm A')}`);
    current.add(30, 'minutes');
  }
  return intervals;
};


const halfHourIntervals = generateHalfHourIntervals('08:00', '20:00');
const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

const Reservations = () => {
  const { id } = useParams();
  const [selectedDate, setSelectedDate] = useState(moment().startOf('week'));
  const [reservations, setReservations] = useState([]);
  const [barber, setBarber] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [reservationData, setReservationData] = useState({
    cel_cliente: '',
    name_cliente: '',
    day: '',
    hours: ''
  });


  useEffect(() => {
    const fetchBarber = async () => {
      try {
        const response = await axios.get(`${environment.apiURL}/api/barbers/${id}`);
        setBarber(response.data);
      } catch (error) {
        console.error('Error al obtener los datos del barbero:', error);
      }
    };
    const fetchReservations = async () => {
      try {
        const response = await axios.get(`${environment.apiURL}/api/reservations/barber/${id}`);
        setReservations(response.data);
      } catch (error) {
        console.error('Error al obtener las reservas:', error);
      }
    };
  
    fetchReservations();
    fetchBarber();
  }, [id]);

  const isReserved = (day, interval) => {
    return reservations.some(
      (reservation) =>
        reservation.day === day && reservation.hours === interval
    );
  };
  
  const handleDateChange = (daysToAdd) => {
    const newSelectedDate = moment(selectedDate).add(daysToAdd, 'days').startOf('week');
    setSelectedDate(newSelectedDate);
  };

  const handleReserveClick = (dayIndex, interval) => {
    const day = moment(selectedDate).add(dayIndex, 'days').format('YYYY-MM-DD');
    setReservationData({ ...reservationData, day, hours: interval });
    setShowModal(true);
  };
  const resetForm = () => {
    setReservationData({
      cel_cliente: '',
      name_cliente: '',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const data = {
      ...reservationData,
      id_barbero: id,
    };
  
    try {
      await axios.post(`${environment.apiURL}/api/reservations`, data);
      
      Swal.fire({
        title: 'Reserva Exitosa',
        text: 'La reserva se creó correctamente.',
        icon: 'success',
        confirmButtonText: 'OK',
      });
  
      resetForm(); 
      setShowModal(false); 
      const response = await axios.get(`${environment.apiURL}/api/reservations/barber/${id}`);
      setReservations(response.data);
    } catch (error) {
      console.error('Error al crear la reserva:', error);
      Swal.fire({
        title: 'Error',
        text: 'Hubo un problema al crear la reserva. Por favor, inténtelo de nuevo.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
    }
  };
  const handleCloseModal = () => {
    resetForm();
    setShowModal(false);
  };
  const renderTableHeaders = () => (
    <tr>
      <th>Hora</th>
      {daysOfWeek.map((day, i) => (
        <th key={i}>
          {day} <br />
          {moment(selectedDate).add(i, 'days').format('D MMM')}
        </th>
      ))}
    </tr>
  );

  const renderTableRows = () => {
    const currentMoment = moment(); 
  
    return halfHourIntervals.map((interval) => {
      const [startTime] = interval.split(' - '); 
      return (
        <tr key={interval}>
          <td>{interval}</td>
          {daysOfWeek.map((_, dayIndex) => {

            const intervalMoment = moment(selectedDate)
              .add(dayIndex, 'days')
              .set({
                hour: moment(startTime, 'hh:mm A').hour(),
                minute: moment(startTime, 'hh:mm A').minute(),
              });
  
            const day = intervalMoment.format('YYYY-MM-DD');
  
            if (isReserved(day, interval)) {
              return (
                <td key={`${dayIndex}-${interval}`} className="reserved">
                  <FontAwesomeIcon icon={faCut} className="reserved-icon" />
                </td>
              );
            }
  
            if (intervalMoment.isBefore(currentMoment)) {
              return <td key={`${dayIndex}-${interval}`} className="past-interval"></td>;
            }
  
            return (
              <td key={`${dayIndex}-${interval}`}>
                <button
                  className="reserve-button"
                  onClick={() => handleReserveClick(dayIndex, interval)}
                >
                  Reservar
                </button>
              </td>
            );
          })}
        </tr>
      );
    });
  };
  


  return (
    <div className="reservations-container">
      <Link to={`/customers`}>
        <button className="home-button">
          <FontAwesomeIcon icon={faHome} />
        </button>
      </Link>
      {barber ? (
        <h2>
          Reservas de {moment(selectedDate).format('MMMM')} para {barber.first_name} {barber.last_name}
        </h2>
      ) : (
        <h2>Cargando datos del barbero...</h2>
      )}

      <div className="date-navigation">
        <button onClick={() => handleDateChange(-7)}>
          <FontAwesomeIcon icon={faArrowLeft} /> Semana Anterior
        </button>
        <span>{`Semana del ${moment(selectedDate).format('DD MMM')} al ${moment(selectedDate)
          .add(6, 'days')
          .format('DD MMM')}`}</span>
        <button onClick={() => handleDateChange(7)}>
          Semana Siguiente <FontAwesomeIcon icon={faArrowRight} />
        </button>
      </div>
      <table className="reservations-table">
        <thead>{renderTableHeaders()}</thead>
        <tbody>{renderTableRows()}</tbody>
      </table>
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Confirmar Reserva</h3>
            <form onSubmit={handleSubmit}>
              <label>
                Nombre del Cliente:
                <input
                  type="text"
                  value={reservationData.name_cliente}
                  onChange={(e) =>
                    setReservationData({ ...reservationData, name_cliente: e.target.value })
                  }
                  required
                />
              </label>
              <label>
                Celular del Cliente:
                <input
                  type="text"
                  value={reservationData.cel_cliente}
                  onChange={(e) =>
                    setReservationData({ ...reservationData, cel_cliente: e.target.value })
                  }
                  required
                />
              </label>

          <button type="submit" className="submit-button">Confirmar</button>
          <button
            type="button"
            className="cancel-button"
            onClick={handleCloseModal}
          >
            Cancelar
          </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reservations;
