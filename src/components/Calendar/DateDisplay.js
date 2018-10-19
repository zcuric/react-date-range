import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { format } from 'date-fns';

const formatDateDisplay = (date, defaultText, dateDisplayFormat, dateOptions) => {
  if (!date) return defaultText;
  return format(date, dateDisplayFormat, dateOptions);
};

const DateDisplay = ({
  showDateDisplay,
  styles,
  focusedRange,
  color,
  ranges,
  rangeColors,
  dateDisplayFormat,
  dateOptions,
  handleRangeFocusChange,
}) => {
  const defaultColor = rangeColors[focusedRange[0]] || color;

  if (!showDateDisplay) {
    return null;
  }

  return (
    <div className={styles.dateDisplayWrapper}>
      {ranges.map((range, i) => {
        if (range.showDateDisplay === false || (range.disabled && !range.showDateDisplay)) return null;
        return (
          <div className={styles.dateDisplay} key={i} style={{ color: range.color || defaultColor }}>
            <span
              className={classnames(styles.dateDisplayItem, {
                [styles.dateDisplayItemActive]: focusedRange[0] === i && focusedRange[1] === 0,
              })}
              onFocus={() => handleRangeFocusChange(i, 0)}>
              <input
                disabled={range.disabled}
                readOnly
                value={formatDateDisplay(range.startDate, 'Early', dateDisplayFormat, dateOptions)}
              />
            </span>
            <span
              className={classnames(styles.dateDisplayItem, {
                [styles.dateDisplayItemActive]: focusedRange[0] === i && focusedRange[1] === 1,
              })}
              onFocus={() => handleRangeFocusChange(i, 1)}>
              <input
                disabled={range.disabled}
                readOnly
                value={formatDateDisplay(range.endDate, 'Continuous', dateDisplayFormat, dateOptions)}
              />
            </span>
          </div>
        );
      })}
    </div>
  );
};

DateDisplay.propTypes = {
  styles: PropTypes.object,
  ranges: PropTypes.array,
  focusedRange: PropTypes.arrayOf(PropTypes.number),
  showDateDisplay: PropTypes.bool,
  rangeColors: PropTypes.arrayOf(PropTypes.string),
  color: PropTypes.string,
  dateDisplayFormat: PropTypes.string,
  dateOptions: PropTypes.object,
  handleRangeFocusChange: PropTypes.func,
};

export default DateDisplay;
