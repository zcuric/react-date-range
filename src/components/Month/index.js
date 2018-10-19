/* eslint-disable no-fallthrough */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import DayCell, { rangeShape } from '../DayCell';
import Weekdays from './Weekdays';
import MonthName from './MonthName';
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  isBefore,
  isSameDay,
  isAfter,
  isWeekend,
  isWithinInterval,
  eachDayOfInterval,
} from 'date-fns';
import { getMonthDisplayRange } from '../../utils';

class Month extends PureComponent {
  render() {
    const now = new Date();
    const {
      displayMode,
      focusedRange,
      drag,
      styles,
      disabledDates,
      showMonthName,
      showWeekDays,
      month,
      monthDisplayFormat,
      dateOptions,
      style,
      preview,
      onMouseLeave,
      onDragSelectionStart,
      onDragSelectionEnd,
      onDragSelectionMove,
    } = this.props;
    const minDate = this.props.minDate && startOfDay(this.props.minDate);
    const maxDate = this.props.maxDate && endOfDay(this.props.maxDate);
    const monthDisplay = getMonthDisplayRange(this.props.month, this.props.dateOptions);
    const showPreview = this.props.showPreview && !drag.disablePreview;

    let ranges = this.props.ranges;

    if (displayMode === 'dateRange' && drag.status) {
      let { startDate, endDate } = drag.range;
      ranges = ranges.map((range, i) => {
        if (i !== focusedRange[0]) return range;
        return {
          ...range,
          startDate,
          endDate,
        };
      });
    }
    return (
      <div className={styles.month} style={style}>
        <MonthName
          month={month}
          showMonthName={showMonthName}
          monthDisplayFormat={monthDisplayFormat}
          styles={{ month: styles.monthname }}
        />
        <Weekdays
          styles={{ weekDays: styles.weekDays, weekDay: styles.weekDay }}
          showWeekDays={showWeekDays}
          dateOptions={dateOptions}
        />
        <div className={styles.days} onMouseLeave={onMouseLeave}>
          {eachDayOfInterval({ start: monthDisplay.start, end: monthDisplay.end }).map((day, index) => {
            const isStartOfMonth = isSameDay(day, monthDisplay.startDateOfMonth);
            const isEndOfMonth = isSameDay(day, monthDisplay.endDateOfMonth);
            const isOutsideMinMax = (minDate && isBefore(day, minDate)) || (maxDate && isAfter(day, maxDate));
            const isDisabledSpecifically = disabledDates.some(disabledDate => isSameDay(disabledDate, day));
            return (
              <DayCell
                {...this.props}
                key={index}
                ranges={ranges}
                day={day}
                preview={showPreview ? preview : null}
                isWeekend={isWeekend(day, dateOptions)}
                isToday={isSameDay(day, now)}
                isStartOfWeek={isSameDay(day, startOfWeek(day, dateOptions))}
                isEndOfWeek={isSameDay(day, endOfWeek(day, dateOptions))}
                isStartOfMonth={isStartOfMonth}
                isEndOfMonth={isEndOfMonth}
                disabled={isOutsideMinMax || isDisabledSpecifically}
                isPassive={
                  !isWithinInterval(day, {
                    start: monthDisplay.startDateOfMonth,
                    end: monthDisplay.endDateOfMonth,
                  })
                }
                styles={styles}
                onMouseDown={onDragSelectionStart}
                onMouseUp={onDragSelectionEnd}
                onMouseEnter={onDragSelectionMove}
                dragRange={drag.range}
                drag={drag.status}
              />
            );
          })}
        </div>
      </div>
    );
  }
}

Month.defaultProps = {};

Month.propTypes = {
  style: PropTypes.object,
  styles: PropTypes.object,
  month: PropTypes.object,
  drag: PropTypes.object,
  dateOptions: PropTypes.object,
  disabledDates: PropTypes.array,
  preview: PropTypes.shape({
    startDate: PropTypes.object,
    endDate: PropTypes.object,
  }),
  showPreview: PropTypes.bool,
  displayMode: PropTypes.oneOf(['dateRange', 'date']),
  minDate: PropTypes.object,
  maxDate: PropTypes.object,
  ranges: PropTypes.arrayOf(rangeShape),
  focusedRange: PropTypes.arrayOf(PropTypes.number),
  onDragSelectionStart: PropTypes.func,
  onDragSelectionEnd: PropTypes.func,
  onDragSelectionMove: PropTypes.func,
  onMouseLeave: PropTypes.func,
  monthDisplayFormat: PropTypes.string,
  showWeekDays: PropTypes.bool,
  showMonthName: PropTypes.bool,
};

export default Month;
