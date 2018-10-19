import React from 'react';
import PropTypes from 'prop-types';
import { format } from 'date-fns';

const MonthName = ({ showMonthName, styles, month, monthDisplayFormat, dateOptions }) => {
  if (!showMonthName) {
    return null;
  }

  return <div className={styles.monthName}>{format(month, monthDisplayFormat, dateOptions)}</div>;
};

MonthName.defaultProps = {};

MonthName.propTypes = {
  styles: PropTypes.object,
  dateOptions: PropTypes.object,
  showMonthName: PropTypes.bool,
  monthDisplayFormat: PropTypes.string,
  month: PropTypes.object,
};

export default MonthName;
