import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import Select from 'react-select';
import Modal from 'react-modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faStore, faCalendarAlt, faClock, faTrash, faBook, faHistory, faChartColumn, faPlus, faFloppyDisk } from '@fortawesome/free-solid-svg-icons';
import '../components/styles/Finance.css';
import { environment } from '../environments';
import { format, parseISO, addDays } from 'date-fns';
import axios from 'axios';
import moment from 'moment-timezone';
import { IconWhaterMarkHistory } from './svg/iconos';

Modal.setAppElement('#root');

const Finance = () => {
  
  const [userList, setUsersList] = useState([]);
  const [users, setUsers] = useState([]);
  const [count, setCount] = useState([]);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedReservationPaymentStatus, setSelectedReservationPaymentStatus] = useState('');
  const [showPositivePayments, setShowPositivePayments] = useState(false);
  const [editableValues, setEditableValues] = useState({});
  const [activeTable, setActiveTable] = useState('both');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [monthlyFinanceCount, setMonthlyFinanceCount] = useState(0);
  const [dailyFinanceCount, setDailyFinanceCount] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);




  const goToNextMonth = () => {
    setCurrentMonth(prevMonth => new Date(prevMonth.getFullYear(), prevMonth.getMonth() + 1, 1));
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(prevMonth => new Date(prevMonth.getFullYear(), prevMonth.getMonth() - 1, 1));
  };

  const handleReload = () => {
    window.location.reload();
  }
  useEffect(() => {
    fetchData();
    fetchUserList()
    if (isModalOpen) {
      document.body.style.backgroundColor = 'rgb(56 54 54 / 75%)';
      document.body.style.overflow = 'hidden';


      const financeDiaryTables = document.querySelectorAll('.user-table-finance-diary thead th');
      financeDiaryTables.forEach(el => {
        el.style.zIndex = 0;
      });

      const financeTables = document.querySelectorAll('.user-table-finance');
      financeTables.forEach(el => {
        el.style.zIndex = 0;
      });

    } else {
      document.body.style.overflow = '';


      const financeDiaryTables = document.querySelectorAll('.user-table-finance-diary');
      financeDiaryTables.forEach(el => {
        el.style.zIndex = '';
      });

      const financeTables = document.querySelectorAll('.user-table-finance');
      financeTables.forEach(el => {
        el.style.zIndex = '';
      });
    }

  }, [id, searchTerm, currentMonth, isModalOpen]);




  const safeFormatDate = (dateString) => {
    try {
      const date = parseISO(dateString);
      if (!isNaN(date)) {
        return format(date, 'yyyy-MM-dd');
      }
      return '';
    } catch (error) {
      console.error('Error formateando la fecha:', error);
      return '';
    }
  };

  const togglePaymentStatusFilter = () => {
    setShowPositivePayments(!showPositivePayments);
  };
  const calculatePendingReservationAmount = (user, reservationCountForMonth) => {
    return user.Plan === 'Mensual' ? 125000 : reservationCountForMonth * 10000;
  };


  const updateFinanceData = async (userId, newFinanceData) => {
    try {
      const response = await fetch(`${environment.apiURL}/api/finance/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newFinanceData),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar los datos financieros del usuario');
      }
    } catch (error) {
      console.error('Error al realizar la solicitud PUT:', error);
      Swal.fire('Error', 'Ha ocurrido un error al actualizar los datos financieros.', 'error');
    }
  };

  const fetchUserList = async () => {
    try {
      const response = await fetch(`${environment.apiURL}/api/users`);
      if (!response.ok) {
        throw new Error('Error en la solicitud');
      }
      let data = await response.json();

      setUsersList(data)
    } catch (error) {
      console.error(error);
      Swal.fire('Error al cargar los datos', 'Ha ocurrido un error al cargar los datos.', 'error');
    }
  };

  const fetchData = async () => {
    const month = currentMonth.getMonth() + 1;
    const year = currentMonth.getFullYear();
    try {
      const response = await fetch(`${environment.apiURL}/api/finances?month=${month}&year=${year}`);
      if (!response.ok) throw new Error('Error al obtener datos financieros');

      const financeData = await response.json();

      if (Array.isArray(financeData) && financeData.length > 0 && financeData[0].hasOwnProperty('FirstName')) {
        financeData.sort((a, b) => a.FirstName.localeCompare(b.FirstName));
      }
      const countersResponse = await fetch(`${environment.apiURL}/api/counter`);
      if (!countersResponse.ok) throw new Error('Error al obtener datos del contador');

      const countersData = await countersResponse.json();



      setUsers(financeData);
      setCount(countersData);
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const renewDailyPlanFinances = async () => {
    const today = new Date();
    if (today.getDate() !== 15) return;

    const year = today.getFullYear();
    const currentMonth = today.getMonth();
    const nextMonth = currentMonth + 1;
    const executionDateKey = `lastExecution-${year}-${nextMonth + 1}`;
    const lastExecution = localStorage.getItem(executionDateKey);

    if (lastExecution) {
      console.log("La renovación de la membresía ya se realizó este mes.");
      return;
    }
    try {
      const financesResponse = await fetch(`${environment.apiURL}/api/finances`);
      if (!financesResponse.ok) throw new Error('Error al obtener finanzas');
      const finances = await financesResponse.json();
      const financesToRenew = finances.filter(finance => finance.Plan === 'Diario' && new Date(finance.endDate).getMonth() === currentMonth);
      const renewalData = financesToRenew.map(finance => ({
        ...finance,
        startDate: new Date(year, nextMonth, 1).toISOString().split('T')[0],
        endDate: new Date(year, nextMonth + 1, 0).toISOString().split('T')[0],
      }));
      renewalData.forEach(async (data) => {
        const postResponse = await fetch(`${environment.apiURL}/api/finances`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        if (!postResponse.ok) {
          console.error(`Error al renovar las finanzas para ${data.userId}`);
        }
      });
      localStorage.setItem(executionDateKey, today.toISOString());
    } catch (error) {
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    const checkTimeAndRenewFinances = () => {
      const now = moment().tz('America/Bogota');
      const dayOfMonth = now.date();
      const hour = now.hour();
      const minute = now.minute();
      if (dayOfMonth === 15 && hour === 8 && minute === 0) {
        renewDailyPlanFinances();
      }
    };
    const intervalId = setInterval(checkTimeAndRenewFinances, 60000);  // Cada 60 segundos
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const usersInSelectedMonth = users.filter(user => {
      const [year, month] = user.startDate.split('-');
      return parseInt(month) - 1 === currentMonth.getMonth() && parseInt(year) === currentMonth.getFullYear();
    });

    const monthlyCount = usersInSelectedMonth.filter(user => user.Plan === 'Mensual').length;
    const dailyCount = usersInSelectedMonth.filter(user => user.Plan === 'Diario').length;

    setMonthlyFinanceCount(monthlyCount);
    setDailyFinanceCount(dailyCount);

    const filterUsersByMonthAndOtherCriteria = () => {
      return users.filter(user => {

        const matchesReservationPaymentStatus = selectedReservationPaymentStatus
          ? user.reservationPaymentStatus === selectedReservationPaymentStatus.value
          : true;
        const matchesName = (user.FirstName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || (user.LastName?.toLowerCase() || '').includes(searchTerm.toLowerCase());

        const matchesPlan = selectedPlan ? user.Plan === selectedPlan.value : true;

        const matchesStatus = selectedStatus ? user.Active === selectedStatus.value : true;
        const [year, month] = user.startDate.split('-');
        const matchesMonth = parseInt(month) - 1 === currentMonth.getMonth() && parseInt(year) === currentMonth.getFullYear();


        return matchesName && matchesPlan && matchesStatus && matchesReservationPaymentStatus && matchesMonth;
      });
    };

    setSearchResults(filterUsersByMonthAndOtherCriteria());
  }, [users, currentMonth, searchTerm, selectedPlan, selectedStatus, selectedReservationPaymentStatus]);



  const handleFinanceChange = async (finacesId, financeField, newValue) => {
    try {

      const valueToSend = financeField === 'startDate' || financeField === 'endDate'
        ? safeFormatDate(newValue)
        : newValue;

      let updatedFinanceData = { [financeField]: valueToSend };
      const updateResponse = await fetch(`${environment.apiURL}/api/finance/${finacesId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFinanceData),
      });

      if (!updateResponse.ok) {
        throw new Error('No se pudo actualizar los datos financieros del usuario');
      }
      fetchData();
    } catch (error) {
      Swal.fire('Error', 'Ha ocurrido un error al actualizar los datos financieros.', 'error');
    }
  };
  const handleSaveNews = async (userId) => {
    const newValue = editableValues[userId]?.news;
    if (newValue !== undefined) {
      try {
        await updateFinanceData(userId, { news: newValue });
        const newEditableValues = { ...editableValues };
        setEditableValues(newEditableValues);
      } catch (error) {
        console.error('Error al guardar las novedades:', error);
      }
    }
  };

  const handleDeleteFinance = (userId) => {
    Swal.fire({
      title: '¿Está seguro de eliminar esta finanza?',
      text: 'Esta acción no se puede revertir',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'No',
    }).then((result) => {
      if (result.isConfirmed) {
        fetch(`${environment.apiURL}/api/deleteFinances/${userId}`, {
          method: 'DELETE',
        })
          .then((response) => {
            if (response.ok) {
              Swal.fire('Eliminado', 'la finanza del usuario ha sido eliminada.', 'success');
              fetchData();
            } else {
              Swal.fire('Error', 'No se pudo eliminar la finaza del usuario.', 'error');
            }
          });
      }
    });
  };

  const handleStatusChange = async (userId, Active) => {
    try {
      const updatedUserData = { Active };
      const userResponse = await fetch(`${environment.apiURL}/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedUserData),
      });

      if (!userResponse.ok) throw new Error('Error al actualizar el usuario');
      await fetch(`${environment.apiURL}/api/userFinance/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedUserData),
      });

      fetchData();

    } catch (error) {
      console.error('Error al actualizar el estado del usuario:', error);
      Swal.fire('Error al actualizar el estado', 'Ha ocurrido un error al actualizar el estado del usuario.', 'error');
    }
  };

  const handlePlanChange = async (userId, newPlan) => {
    try {
      const updatedUserData = { Plan: newPlan };
      const response = await fetch(`${environment.apiURL}/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedUserData),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar el plan del usuario');
      }
      await fetch(`${environment.apiURL}/api/userFinance/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedUserData),
      });

      const user = users.find(u => u.userId === userId);
      const reservationCountForMonth = user ? user.reservationCount || 0 : 0;
      const pendingBalance = calculatePendingReservationAmount({ ...user, Plan: newPlan }, reservationCountForMonth);
      await updateFinanceData(user._id, { pendingBalance });

      fetchData();
    } catch (error) {
      console.error('Error al actualizar el plan del usuario:', error);
      Swal.fire('Error al actualizar el plan', 'Ha ocurrido un error al actualizar el plan del usuario.', 'error');
    }
  };

  const handlePaidReservationsChange = async (userId, numberPaidReservations) => {
    try {
      const user = users.find(u => u._id === userId);
      if (!user) {
        throw new Error('Usuario no encontrado');
      }
      const newPendingPayment = user.pendingBalance - (numberPaidReservations * 10000);
      const updatedUserData = {
        numberPaidReservations: numberPaidReservations,
        pendingPayment: newPendingPayment,
      };
      const payDiaryResponse = await fetch(`${environment.apiURL}/api/finance/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedUserData),
      });

      if (!payDiaryResponse.ok) throw new Error('Error al actualizar el usuario');

      fetchData();

    } catch (error) {
      console.error('Error al actualizar el estado del usuario:', error);
      Swal.fire('Error al actualizar el estado', 'Ha ocurrido un error al actualizar el estado del usuario.', 'error');
    }
  };

  const formattedCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
    }).format(amount);
  };
  function adjustDateForTimezone(dateString) {
    const date = new Date(dateString);
    date.setUTCHours(12);
    return date;
  }


  const handlePlanSelect = (selectedOption) => {
    setSelectedPlan(selectedOption);
    setShowMonthDropdown(true);
  };
  const handleUserSelect = (selectedOption) => {
    setSelectedUser(selectedOption);
  };



  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const [year, month] = selectedMonth.split('-');
    let startDate, endDate;

    if (selectedPlan.value === 'Mensual') {
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;

      if (parseInt(year) === currentYear && parseInt(month) === currentMonth) {
        startDate = new Date();
        endDate = addDays(new Date(), 30);
      } else {

        startDate = new Date(year, month - 1, 1);
        endDate = new Date(year, month, 0);
      }
    } else {

      startDate = new Date(year, month - 1, 1);
      endDate = new Date(year, month, 0);
    }

    startDate = format(startDate, 'yyyy-MM-dd');
    endDate = format(endDate, 'yyyy-MM-dd');


    const fullNameParts = selectedUser.label.split(' ');
    const firstName = fullNameParts.slice(0, -1).join(' ');
    const lastName = fullNameParts.slice(-1).join(' ');
    const dataToSend = {
      userId: selectedUser.value,
      Active: 'Sí',
      FirstName: firstName,
      LastName: lastName,
      IdentificationNumber: '',
      Phone: '',
      Plan: selectedPlan.value,
      startDate,
      endDate,
    };

    try {
      const response = await fetch(`${environment.apiURL}/api/finances`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      });
      if (!response.ok) throw new Error('Error al enviar datos');
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error al enviar formulario:', error);

    }
  };
  const uniqueUsers = Array.from(new Map(userList.map(user => [user._id, user])).values());

  return (
    <div>
      <h2 className='finance-title'>Finanzas $  ({currentMonth.toLocaleString('default', { month: 'long' })} {currentMonth.getFullYear()})</h2>
      <h1 style={{ color: 'white', fontSize: '18px' }}>Plan Mensual: {monthlyFinanceCount}</h1>
      <h1 style={{ color: 'white', fontSize: '18px' }}>Plan Diario: {dailyFinanceCount}</h1>

      <div className="filters-container">
        <input
          className='input-search'
          type="text"
          placeholder="Buscar por nombre o apellido"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Select
          className="filter-select"
          classNamePrefix="filter-select"
          value={selectedPlan}
          onChange={(selected) => setSelectedPlan(selected)}
          options={[
            { value: 'Diario', label: 'Diario' },
            { value: 'Mensual', label: 'Mensual' },
          ]}
          placeholder="Plan"
          isClearable
        />
        <Select
          className="filter-select"
          classNamePrefix="filter-select"
          value={selectedStatus}
          onChange={(selected) => setSelectedStatus(selected)}
          options={[
            { value: 'Sí', label: 'Sí' },
            { value: 'No', label: 'No' },
          ]}
          placeholder="Activo"
          isClearable
        />
        <button
          className='butom-day-finance-hist'
          onClick={togglePaymentStatusFilter}>
          {showPositivePayments ? 'Reservas Pagadas' : 'Reservas Pendientes'}
        </button>
        <button className='butom-day-finance-hist' onClick={goToPreviousMonth}>Mes Anterior</button>
        <button className='butom-day-finance-hist' onClick={goToNextMonth}>Mes Siguiente</button>

        <button className='butom-day-finance' onClick={() => setIsModalOpen(true)}>
          <FontAwesomeIcon icon={faPlus} />
        </button>

        <Link to={`/reservationHistory/${id}`}>
          <button className='butom-day-finance-hist' >
            <FontAwesomeIcon icon={faHistory} /> Historial
          </button>
        </Link>
        <Link to={`/summary/${id}`}>
          <button className='butom-day-finance-hist' >
            <FontAwesomeIcon icon={faChartColumn} /> Resumen
          </button>
        </Link>
        <button className='butom-day-finance-hist' onClick={handleReload}>Actualizar</button>
        <Link to={`/store/${id}`}>
          <button className='butom-day-finance' >
            <FontAwesomeIcon icon={faStore} />
          </button>
        </Link>

        <Link to={`/diary/${id}`}>
          <button className='butom-day-finance' >
            <FontAwesomeIcon icon={faBook} />
          </button>
        </Link>

        <Link to={`/admin/${id}`}>
          <button className='butom-day-finance' >
            <FontAwesomeIcon icon={faHome} />
          </button>
        </Link>
        <IconWhaterMarkHistory/>
      </div>
      {loading ? (
        <p>Cargando usuarios...</p>
      ) : (
        <>
          <>
            {(activeTable === 'monthly' || activeTable === 'both') && (
              <div>
                <h3 style={{ color: 'white', fontSize: '40px' }}>Mensualidades</h3>


                <table className="user-table-finance">
                  <thead>
                    <tr>
                      <th className='column-plan'>Plan</th>
                      <th className='column-name'>Nombre</th>
                      <th className='column-startDate'>Inicio Mes</th>
                      <th className='column-endDate'>Fin Mes</th>
                      <th className='column-pendingBalance'>$Pendiente Reservas</th>
                      <th className='column-paymentrStatus'>pago Reservas$</th>
                      <th className='column-new'>Novedades</th>
                      <th className='column-Active'>Usuario Activo</th>
                      <th className='column-delete'>Eliminar Finanza</th>
                    </tr>
                  </thead>
                  <tbody>
                    {searchResults.filter(user => user.Plan === 'Mensual').map(user => {


                      if (showPositivePayments && user.reservationPaymentStatus !== 'Si') {
                        return null;
                      } else if (!showPositivePayments && user.reservationPaymentStatus !== 'No') {
                        return null;
                      }
                      return (
                        <tr key={user._id}>
                          <td>
                            <Select
                              className="filter-select"
                              value={{ value: user.Plan, label: user.Plan }}
                              onChange={(selectedOption) => handlePlanChange(user.userId, selectedOption.value)}
                              options={[
                                { value: ' ', label: ' ' },
                                { value: 'Diario', label: 'Diario' },
                                { value: 'Mensual', label: 'Mensual' },
                              ]}
                            />
                          </td>
                          <td>{user.FirstName + ' ' + user.LastName}</td>
                          <td>
                            <input
                              type="date"
                              className='date'
                              value={safeFormatDate(user.startDate)}
                              onChange={(e) => {
                                handleFinanceChange(user._id, 'startDate', e.target.value);
                              }}
                            />


                          </td>
                          <td>
                            <input
                              type="date"
                              className="date"
                              value={safeFormatDate(user.endDate)}
                              onChange={(e) => {
                                handleFinanceChange(user._id, 'endDate', e.target.value);
                              }}
                            />
                          </td>
                          <td style={{ color: user.reservationPaymentStatus === 'No' ? '#a62525' : 'green' }}>
                            {user.pendingBalance > 0 ? ` ${formattedCurrency(user.pendingBalance)}` : '$ 0'}
                          </td>
                          <td>
                            <select
                              style={{ color: user.reservationPaymentStatus === 'Si' ? '#0dab0d' : 'red' }}
                              value={user.reservationPaymentStatus}
                              onChange={(event) => handleFinanceChange(user._id, 'reservationPaymentStatus', event.target.value)}
                            >
                              <option value="No">✖</option>
                              <option value="Si">✔</option>
                            </select>
                          </td>
                          <td>
                            <input
                              type="text"
                              className='news'
                              value={editableValues[user._id]?.news || user.news || ''}
                              onChange={(event) => {
                                const newEditableValues = { ...editableValues, [user._id]: { ...editableValues[user._id], news: event.target.value } };
                                setEditableValues(newEditableValues);
                              }}
                            />
                            <FontAwesomeIcon className='saveIcon'
                              icon={faFloppyDisk} onClick={() => handleSaveNews(user._id)} />

                          </td>
                          <td>
                            <Select
                              className='select'
                              value={{ value: user.Active, label: user.Active }}
                              onChange={(selectedOption) => handleStatusChange(user.userId, selectedOption.value)}
                              options={[
                                { value: ' ', label: ' ' },
                                { value: 'Sí', label: 'Sí' },
                                { value: 'No', label: 'No' },
                              ]}
                            />
                          </td>
                          <td>
                            <button className='button-actions' onClick={() => handleDeleteFinance(user._id)}><FontAwesomeIcon icon={faTrash} /></button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            {(activeTable === 'daily' || activeTable === 'both') && (

              <div>
                <h3 style={{ color: 'white', fontSize: '40px' }}>
                  Plan Diario
                </h3>
                <table className="user-table-finance-diary">
                  <thead>
                    <tr>
                      <th className='column-plan'>Plan</th>
                      <th className='column-name'>Nombre</th>
                      <th className='column-numberRes'># Reservas</th>
                      <th className='column-numberPay'>Reservas Pagadas</th>
                      <th className='column-numberPay'>Saldo pendiente</th>
                      <th className='column-pendingBalance'>Consumo Total</th>
                      <th className='column-paymentrStatus'>pago Reservas$</th>
                      <th className='column-new'>Novedades</th>
                      <th className='column-Active'>Usuario Activo</th>
                      <th className='column-delete'>Eliminar Finanza</th>
                    </tr>
                  </thead>
                  <tbody>
                    {searchResults.filter(user => user.Plan === 'Diario').map(user => {
                      if (showPositivePayments && user.reservationPaymentStatus !== 'Si') {
                        return null;
                      } else if (!showPositivePayments && user.reservationPaymentStatus !== 'No') {
                        return null;
                      }
                      return (
                        <tr key={user._id}>
                          <td>
                            <Select
                              className='select'
                              value={{ value: user.Plan, label: user.Plan }}
                              onChange={(selectedOption) => handlePlanChange(user.userId, selectedOption.value)}
                              options={[
                                { value: ' ', label: ' ' },
                                { value: 'Diario', label: 'Diario' },
                                { value: 'Mensual', label: 'Mensual' },
                              ]}
                            />
                          </td>
                          <td>{user.FirstName + ' ' + user.LastName}</td>
                          <td>{user.reservationCount}</td>
                          <td>
                            <input
                              value={user.numberPaidReservations || " "}
                              onChange={(e) => handlePaidReservationsChange(user._id, e.target.value)}
                              className="num"
                            />
                          </td>
                          <td style={{ color: user.reservationPaymentStatus ? 'rgb(166, 37, 37)' : '' }}>
                            {user.pendingPayment ? `${formattedCurrency(user.pendingPayment)}` : 0}
                          </td>
                          <td style={{ color: user.reservationPaymentStatus ? 'green' : '' }}>
                            {user.pendingBalance > 0 ? `${formattedCurrency(user.pendingBalance)}` : '$ 0'}
                          </td>
                          <td>
                            <select
                              style={{ color: user.reservationPaymentStatus === 'Si' ? '#0dab0d' : 'red' }}
                              value={user.reservationPaymentStatus}
                              onChange={(event) => handleFinanceChange(user._id, 'reservationPaymentStatus', event.target.value)}
                            >
                              <option value="No">✖</option>
                              <option value="Si">✔</option>
                            </select>

                          </td>
                          <td>
                            <input
                              type="text"
                              className='news'
                              value={editableValues[user._id]?.news || user.news || ''}
                              onChange={(event) => {
                                const newEditableValues = { ...editableValues, [user._id]: { ...editableValues[user._id], news: event.target.value } };
                                setEditableValues(newEditableValues);
                              }}
                            />
                            <FontAwesomeIcon className='saveIcon'
                              icon={faFloppyDisk} onClick={() => handleSaveNews(user._id)} />

                          </td>
                          <td>
                            <Select
                              className='select'
                              value={{ value: user.Active, label: user.Active }}
                              onChange={(selectedOption) => handleStatusChange(user.userId, selectedOption.value)}
                              options={[
                                { value: ' ', label: ' ' },
                                { value: 'Sí', label: 'Sí' },
                                { value: 'No', label: 'No' },
                              ]}
                            />
                          </td>
                          <td>
                            <button className='button-actions' onClick={() => handleDeleteFinance(user._id)}><FontAwesomeIcon icon={faTrash} /></button>
                          </td>

                        </tr>
                      );
                    })}

                  </tbody>
                </table>
              </div>
            )}
          </>

        </>
      )}
      {isModalOpen && (
        <div className="modal-backdrop">
          <Modal isOpen={isModalOpen} onRequestClose={() => setIsModalOpen(false)}
            className='Modal-finances'>
            <form onSubmit={handleFormSubmit}>
              <label>
                Usuario:
                <Select

                  value={selectedUser}
                  onChange={handleUserSelect}
                  options={uniqueUsers.map(user => ({ value: user._id, label: `${user.FirstName} ${user.LastName}` }))}
                />
              </label>
              <label>
                Tipo de Plan:
                <Select
                  value={selectedPlan}
                  onChange={handlePlanSelect}
                  options={[
                    { value: 'Diario', label: 'Diario' },
                    { value: 'Mensual', label: 'Mensual' }
                  ]}
                />
              </label>
              <label>
                Mes:
                <input
                  className='DateNewFinance'
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                />
              </label>
              <button type="submit">Enviar</button>
            </form>
          </Modal>
        </div>
      )}

    </div>
  );
};

export default Finance;