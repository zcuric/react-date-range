import React from 'react';
import PropTypes from 'prop-types';
import { eachDayOfInterval, startOfWeek, endOfWeek, format } from 'date-fns';

const Weekdays = ({ showWeekDays, styles, dateOptions }) => {
  if (!showWeekDays) {
    return null;
  }
  const now = new Date();

  return (
    <div className={styles.weekDays}>
      {eachDayOfInterval({
        start: startOfWeek(now, dateOptions),
        end: endOfWeek(now, dateOptions),
      }).map((day, i) => (
        <span className={styles.weekDay} key={i}>
          {format(day, 'ddd', dateOptions)}
        </span>
      ))}
    </div>
  );
};

Weekdays.defaultProps = {};

Weekdays.propTypes = {
  styles: PropTypes.object,
  dateOptions: PropTypes.object,
  showWeekDays: PropTypes.bool,
};

export default Weekdays;
