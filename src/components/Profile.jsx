import React, { useEffect, useState } from 'react';
import moment from 'moment';
import Swal from 'sweetalert2';
import { Link, useParams } from 'react-router-dom';
import Select from 'react-select';
import 'moment/locale/es';
import '../components/styles/Profile.css';
import { environment } from '../environments';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOut, faUserAlt } from '@fortawesome/free-solid-svg-icons';
import { IconWhaterMarkProfile } from './svg/iconos';



const Profile = () => {
  const [user, setUser] = useState(null);
  const [icon, setIcon] = useState('')

  const [financeInfo, setFinanceInfo] = useState(null);
  const [financeCurrentInfo, setFinanceCurrentInfo] = useState(null);
  const { id } = useParams();
  const [reservationsCount, setReservationsCount] = useState(0);
  const [attendanceCount, setAttendanceCount] = useState(0);
  const [failsCount, setFailsCount] = useState(0);
  const [counterData, setCounterData] = useState({});
  const [showMonthlyReservationForm, setShowMonthlyReservationForm] = useState(false);
  const [storeConsumptions, setStoreConsumptions] = useState([]);
  const [financeRecords, setFinanceRecords] = useState([]);
  const [monthlyReservationData, setMonthlyReservationData] = useState({
    hour: '',
    startDate: '',
    endDate: '',
  });
  useEffect(() => {

    fetch(`${environment.apiURL}/api/users/${id}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Error en la solicitud');
        }
        return response.json();
      })
      .then((data) => {
        setUser(data);
      })
      .catch((error) => {
        console.error(error);
        Swal.fire('Error al obtener los datos del usuario', 'Ha ocurrido un error al cargar los datos del usuario.', 'error');
      });

    const fetchFinanceData = async () => {
      try {
        const response = await fetch(`${environment.apiURL}/api/finances/${id}`);
        if (!response.ok) {
          throw new Error('Error al obtener datos financieros');
        }
        const financeData = await response.json();
        setFinanceRecords(financeData);

        setFinanceInfo(financeData);

      } catch (error) {
        console.error('Error al obtener datos financieros:', error);
      }
    };

    const fetchFinanceDatacurrent = async () => {
      try {
        const response = await fetch(`${environment.apiURL}/api/finances/${id}`);
        if (!response.ok) {
          throw new Error('Error al obtener datos financieros');
        }
        const financeData = await response.json();

        const sortedFinanceData = financeData.sort((a, b) =>
          moment(b.startDate).diff(moment(a.startDate))
        );

        setFinanceCurrentInfo(sortedFinanceData[0]);
      } catch (error) {
        console.error('Error al obtener datos financieros:', error);
      }
    };

    const fetchStoreData = async () => {
      try {
        const response = await fetch(`${environment.apiURL}/api/storeUser/${id}`);

        if (!response.ok) {
          throw new Error('Error en la solicitud');
        }
        const data = await response.json();
        setStoreConsumptions(data)
      } catch (error) {

      }
    };
    const fetchCounterData = async () => {
      try {
        const response = await fetch(`${environment.apiURL}/api/counter`);
        if (!response.ok) {
          throw new Error('Error al obtener los datos de contador');
        }
        const counters = await response.json();
        const userCounter = counters.find(counter => counter.userId === id);
        if (userCounter) {
          setCounterData(userCounter.counts);
        }
      } catch (error) {
        console.error('Error al obtener los datos de contador:', error);
      }
    };



    fetchCounterData();
    fetchAttendanceData();
    fetchStoreData()
    fetchFinanceData();
    fetchFinanceDatacurrent()
  }, [id]);

  const fetchAttendanceData = async () => {
    try {
      const response = await fetch(`${environment.apiURL}/api/reservations/${id}`);
      if (!response.ok) {
        throw new Error('Error al obtener reservas del usuario');
      }
      const reservations = await response.json();


      const startOfMonth = moment().startOf('month').format('YYYY-MM-DD');
      const endOfMonth = moment().endOf('month').format('YYYY-MM-DD');


      const filteredReservations = reservations.filter(reservation => {
        const reservationDate = moment(reservation.day, 'YYYY-MM-DD');
        return reservationDate.isBetween(startOfMonth, endOfMonth, null, '[]');
      });


      const totalReservations = filteredReservations.length;
      const count = filteredReservations.filter(reservation => reservation.Attendance === 'Si').length;
      const fails = filteredReservations.filter(reservation => reservation.Attendance === 'No').length;

      setReservationsCount(totalReservations);
      if (financeRecords && user && user.Plan === 'Mensual') {
        updateFinanceRecord();
      }
      setAttendanceCount(count);
      setFailsCount(fails);
    } catch (error) {
      console.error('Error al obtener reservas del usuario:', error);
    }
  };
  const updateFinanceRecord = async () => {

    const currentMonth = moment().format('MM');
    const currentYear = moment().format('YYYY');

    financeRecords.forEach(async (record) => {
      const recordMonth = moment(record.startDate).format('MM');
      const recordYear = moment(record.startDate).format('YYYY');

      if (record.Plan === 'Mensual' && recordMonth === currentMonth && recordYear === currentYear) {
        try {

          const response = await fetch(`${environment.apiURL}/api/finance/${record._id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              reservationCount: reservationsCount,
            }),
          });

          if (!response.ok) {
            throw new Error('Error al actualizar finanza');
          }

        } catch (error) {
          console.error('Error al actualizar la finanza:', error);
        }
      }
    });
  };


  const formattedCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
    }).format(amount);
  };


  return (
    <div className="Profile-container">
      <div className="profile-header">

        <FontAwesomeIcon className="profile-image" icon={faUserAlt} />
        <h1>{user ? user.FirstName + ' ' + user.LastName : 'N/A'}</h1>
        <div className="reservations-info">
          <p><strong>Número de Reservas del Mes:</strong> {reservationsCount}</p>
          <p className='attendance'><strong>Asistencias:</strong> {attendanceCount}</p>
          <p className='fails'><strong>Faltas:</strong> {failsCount}</p>
          <div className="profile-buttons">

            <Link to={`/customers/${id}`} className="button-link">
              <FontAwesomeIcon className="profile-button-image" icon={faSignOut} />
            </Link>
          </div>
        </div>
      </div>
      <div className="profile-info">
        <div className="profile-details">
          <p>
            <strong>Cedula:</strong> {user ? user.IdentificationNumber : ''}
          </p>
          <p>
            <strong>Teléfono:</strong> {user ? user.Phone : ''}
          </p>
          <p style={{ color: user?.Active === 'Sí' ? '#0ab40a' : user?.Active === 'No' ? '#fa3636' : 'transparent' }}>
            <strong> Usuarios Activo    :     </strong>{user ? user.Active : ' '}
          </p>
          <p style={{ color: financeCurrentInfo?.Plan === 'Diario' ? 'rgb(0 144 255)' : financeCurrentInfo?.Plan === 'Mensual' ? '#6ba06b' : 'transparent' }}>
            <strong> Plan     :     </strong>{financeCurrentInfo ? financeCurrentInfo.Plan : 'Sin Plan'}
          </p>
          <p>
            <strong>Fecha de Ingreso:</strong> {user ? user.registrationDate : ''}
          </p>
        </div>

      </div>
      {
        <div id="consumo" className="profile-info">
          <hr></hr>
          <h3 style={{ color: 'black' }}><strong>Consumo</strong></h3>
          {
            financeInfo && financeInfo.reservationPaymentStatus === 'Si' ? (
              <p style={{ color: 'green' }}>
                <strong>Sin saldo pendiente...</strong>
              </p>
            ) : (
              financeRecords && financeRecords.filter(record => record.reservationPaymentStatus === 'No').map((record, index) => {
                if (record.Plan === 'Mensual') {
                  return (
                    <React.Fragment key={index}>
                      <p style={{ color: 'red' }}><strong>Saldos Pendientes (Plan Mensual)</strong></p>
                      <div>
                        <p><strong>Fecha de inicio:</strong> {moment(record.startDate).format('DD/MM/YYYY')}</p>
                        <p><strong>Fecha de finalización:</strong> {moment(record.endDate).format('DD/MM/YYYY')}</p>
                        <p style={{ color: 'red' }}><strong>Saldo pendiente:</strong> {formattedCurrency(record.pendingBalance)}</p>
                        <hr />
                      </div>
                    </React.Fragment>
                  );
                } else if (record.Plan === 'Diario') {
                  return (
                    <div key={index}>
                      <p style={{ color: 'red' }}><strong>Saldo pendiente (Plan Diario):</strong></p>
                      <p><strong>Reservas pagas:</strong>  {record.numberPaidReservations}</p>
                      <p style={{ color: 'red' }}><strong>Saldo pendiente:</strong> {formattedCurrency(record.pendingPayment ? record.pendingPayment : 0)}</p>
                      <hr />
                    </div>
                  );
                }
                return null;
              })
            )
          }
        </div>

      }
      {
        storeConsumptions.some(consumption => consumption.paymentStatus === 'No') && (
          <div className="profile-info">
            {storeConsumptions
              .filter(consumption => consumption.paymentStatus === 'No')
              .map(consumption => (
                <div key={consumption._id}>
                  <hr></hr>
                  <p><strong>Fecha y hora de consumo:</strong> {consumption.dateOfPurchase} - {consumption.purchaseTime} </p>
                  <p><strong>Producto: </strong>{consumption.item}</p>
                  <p><strong>Cantidad:</strong> {consumption.quantity}</p>
                  <p style={{ color: 'rgb(255 0 0 / 89%)' }}><strong>Valor pendiente: </strong>$ {consumption.value} COP</p>
                </div>
              ))
            }
          </div>
        )
      }
      <IconWhaterMarkProfile />
    </div>
  );
};

export default Profile;