import React from 'react';
import Calendar from './Calendar/Calendar';
import CalendarTitle from './Calendar/CalendarTitle';
import Pricing from './Pricing/Pricing';
import Guests from './Guests/Guests';
import SuccessMsg from './SuccessMsg/SuccessMsg';
import downArrow from '../styles/icons/down_arrow.svg';
import upArrow from '../styles/icons/up_arrow.svg';
import '../styles/style.css';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      year: new Date().getFullYear(),
      month: new Date().getMonth(),
      availableDates: [],
      requestedDates: [],
      id: 0,
      guestCount: {
        adults: 1,
        children: 0,
        infants: 0,
      },
      checkOutStage: 0,
      price: 0,
      cleaningFee: 0,
      maxGuests: 0,
      minStay: 0,
      serviceFee: 0,
      isSelectingGuests: false,
      showPopUpInfo: 0,
    };
    this.setNextStage = this.setNextStage.bind(this);
    this.setSelectedDate = this.setSelectedDate.bind(this);
    this.getCalendarTitle = this.getCalendarTitle.bind(this);
    this.updateGuestCount = this.updateGuestCount.bind(this);
    this.submitRequest = this.submitRequest.bind(this);
    this.clearDates = this.clearDates.bind(this);
    this.changeMonth = this.changeMonth.bind(this);
    this.updateGuestCount = this.updateGuestCount.bind(this);
    this.toggleGuestSelectView = this.toggleGuestSelectView.bind(this);
    this.toggleInfoPopUp = this.toggleInfoPopUp.bind(this);
    this.submitRequest = this.submitRequest.bind(this);
    this.renderGuestTitle = this.renderGuestTitle.bind(this);
  }

  componentDidMount() {
    if (this.props.id) {
      this.setState({ ...this.props });
    } else {
      fetch('/api/listing_info')
        .then(res => res.json())
        .then((body) => { this.setState({ ...body }); })
        .catch((err) => { throw err; });
    }
  }


  setNextStage(newStage) {
    const { checkOutStage } = this.state;
    this.setState({
      checkOutStage: checkOutStage === newStage ? 0 : newStage,
      isSelectingGuests: false,
      showPopUpInfo: 0,
    });
  }

  // handle date selection
  setSelectedDate(selectedDate) {
    const {
      requestedDates,
      checkOutStage,
      month,
      year,
    } = this.state;

    if (requestedDates.length < 2) {
      requestedDates.push(new Date(year, month, selectedDate));
    }
    this.setState({
      requestedDates,
      checkOutStage: checkOutStage + 1,
    });
  }

  getCalendarTitle(titleStage) {
    const { requestedDates, checkOutStage } = this.state;
    const titles = ['Check-in', 'Check-out'];
    let classNames = '';
    let text = '';
    // check if title respective date has been selected
    if (requestedDates.length < titleStage + 1) {
      text = titles[titleStage];
    } else if (requestedDates.length >= titleStage + 1) {
      text = `${requestedDates[titleStage].getMonth() + 1}/${requestedDates[titleStage].getDate()}/${requestedDates[titleStage].getFullYear()}`;
    }
    if (checkOutStage === titleStage + 1) {
      classNames = 'current-stage';
    }
    return (
      <h3 
        className={classNames} 
        id={`${titles[titleStage].toLowerCase()}`} 
        onClick={() => this.setNextStage(titleStage + 1)}>
        {text}
      </h3>);
  }

  clearDates() {
    this.setState({
      checkOutStage: 1,
      requestedDates: [],
      year: new Date().getFullYear(),
      month: new Date().getMonth(),
    });
  }

  // handles moving the calendar to the next or previous month
  changeMonth(i) {
    const { month, year } = this.state;
    let newMonth = month + i;
    let newYear = year;
    if (newMonth === 12) {
      newMonth = 0;
      newYear += 1;
    } else if (newMonth === -1) {
      newMonth = 11;
      newYear -= 1;
    }
    this.setState({
      year: newYear,
      month: newMonth,
    });
  }

  updateGuestCount(type, num) {
    const { guestCount } = this.state;
    guestCount[type] += num;
    this.setState({
      guestCount,
    });
  }

  toggleGuestSelectView() {
    const { isSelectingGuests } = this.state;
    const newStatus = !isSelectingGuests;
    this.setState({
      isSelectingGuests: newStatus,
      showPopUpInfo: 0,
    });
  }

  toggleInfoPopUp(popUpId) {
    const { showPopUpInfo } = this.state;
    if (showPopUpInfo === popUpId) {
      this.setState({
        showPopUpInfo: 0,
      });
    } else {
      this.setState({
        showPopUpInfo: popUpId,
      });
    }
  }

  submitRequest() {
    const { requestedDates, id, checkOutStage } = this.state;
    if (checkOutStage !== 3) {
      this.setState({ checkOutStage: checkOutStage === 0 ? 1 : 2 });
      return;
    }
    const currentMonth = new Date().getMonth();
    const getBookingData = (date) => {
      const month = date.getMonth();
      if (month < currentMonth) {
        return { index: currentMonth + month, date: date.getDate() };
      }
      return { index: month - currentMonth, date: date.getDate() };
    };
    const checkIn = getBookingData(requestedDates[0]);
    const checkOut = getBookingData(requestedDates[1]);

    // get array indeces from requested dates
    const reqBody = {
      id,
      checkIn,
      checkOut,
    };

    fetch('/api/submit', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify(reqBody),
    })
      .then(res => res.json())
      .then(data => this.setState({ ...data, checkOutStage: 4, requestedDates: [] }));
  }

  renderGuestTitle() {
    const { guestCount, isSelectingGuests } = this.state;
    const totalGuestCount = guestCount.adults + guestCount.children;
    let output = `${totalGuestCount} guest`;
    let icon = downArrow;
    if (totalGuestCount > 1) {
      output += 's';
    }
    if (guestCount.infants > 0) {
      output += `, ${guestCount.infants} infant`;
      if (guestCount.infants > 1) {
        output += 's';
      }
    }
    if (isSelectingGuests) {
      icon = upArrow;
    }
    return (
      <div className="sub-component" id="toggle-guest-view" onClick={this.toggleGuestSelectView}>
        <h3>
          {output}
        </h3>
        <img className="icon" src={icon} alt="" />
      </div>
    );
  }

  render() {
    const {
      checkOutStage,
      isSelectingGuests,
      price,
    } = this.state;

    return (
      <div id="container">
        {checkOutStage === 4 && <SuccessMsg setNextStage={this.setNextStage} />}
        <div id="bookings">
          <h3>
            <span id="price">
              {`$${price} `}
            </span>
            per night
          </h3>
          <hr />
          <CalendarTitle renderTitle={this.getCalendarTitle} />
          {(checkOutStage === 1 || checkOutStage === 2)
            && (
              <Calendar
                {...this.state}
                changeMonth={this.changeMonth}
                selectDate={this.setSelectedDate}
                clearDates={this.clearDates}
              />
            )
          }
          {this.renderGuestTitle.call(this)}
          {isSelectingGuests
            && (
              <Guests
                {...this.state}
                updateGuestCount={this.updateGuestCount}
                toggleView={this.toggleGuestSelectView}
              />
            )
          }
          {checkOutStage === 3
            && (
              <Pricing
                {...this.state}
                toggleInfo={this.toggleInfoPopUp}
              />
            )
          }
          <div className="sub-component" id="book-btn" onClick={() => this.submitRequest()}>
            <h2>
              Request to Book
            </h2>
          </div>
          <p>
            {'You won\'t be charged'}
          </p>
        </div>
      </div>
    );
  }
}
