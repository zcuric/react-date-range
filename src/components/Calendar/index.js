import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import ReactList from 'react-list';
import {
  addMonths,
  isSameDay,
  addYears,
  setYear,
  setMonth,
  differenceInCalendarMonths,
  startOfMonth,
  endOfMonth,
  addDays,
  isSameMonth,
  differenceInDays,
  min,
  max,
} from 'date-fns';
import defaultLocale from 'date-fns/locale/en-US';
import { rangeShape } from '../DayCell';
import Month from '../Month';
import { calcFocusDate, generateStyles, getMonthDisplayRange } from '../../utils';
import coreStyles from '../../styles';
import DateDisplay from './DateDisplay';
import Weekdays from '../Month/Weekdays';

class Calendar extends PureComponent {
  constructor(props, context) {
    super(props, context);
    this.dateOptions = { locale: props.locale };
    this.styles = generateStyles([coreStyles, props.classNames]);
    this.listSizeCache = {};
    this.state = {
      focusedDate: calcFocusDate(null, props),
      drag: {
        status: false,
        range: { startDate: null, endDate: null },
        disablePreview: false,
      },
      scrollArea: this.calculateScrollArea(props),
    };
  }

  calculateScrollArea = props => {
    const { direction, months, scroll } = props;
    if (!scroll.enabled) return { enabled: false };

    const longMonthHeight = scroll.longMonthHeight || scroll.monthHeight;
    if (direction === 'vertical') {
      return {
        enabled: true,
        monthHeight: scroll.monthHeight || 220,
        longMonthHeight: longMonthHeight || 260,
        calendarWidth: 'auto',
        calendarHeight: (scroll.calendarHeight || longMonthHeight || 240) * months,
      };
    }
    return {
      enabled: true,
      monthWidth: scroll.monthWidth || 332,
      calendarWidth: (scroll.calendarWidth || scroll.monthWidth || 332) * months,
      monthHeight: longMonthHeight || 300,
      calendarHeight: longMonthHeight || 300,
    };
  };

  focusToDate = (date, props = this.props, preventUnnecessary = true) => {
    if (!props.scroll.enabled) {
      this.setState({ focusedDate: date });
      return;
    }
    const targetMonthIndex = differenceInCalendarMonths(date, props.minDate, this.dateOptions);
    const visibleMonths = this.list.getVisibleRange();
    if (preventUnnecessary && visibleMonths.includes(targetMonthIndex)) return;
    this.list.scrollTo(targetMonthIndex);
    this.setState({ focusedDate: date });
  };

  updateShownDate = (props = this.props) => {
    const newProps = props.scroll.enabled
      ? {
          ...props,
          months: this.list.getVisibleRange().length,
        }
      : props;
    const newFocus = calcFocusDate(this.state.focusedDate, newProps);
    this.focusToDate(newFocus, newProps);
  };

  updatePreview = value => {
    if (!value) {
      this.setState({ preview: null });
      return;
    }
    const preview = {
      startDate: value,
      endDate: value,
      color: this.props.color,
    };
    this.setState({ preview });
  };

  componentDidMount() {
    if (this.props.scroll.enabled) {
      // prevent react-list's initial render focus problem
      setTimeout(() => this.focusToDate(this.state.focusedDate), 1);
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const propMapper = {
      dateRange: 'ranges',
      date: 'date',
    };
    const targetProp = propMapper[nextProps.displayMode];
    if (this.props.locale !== nextProps.locale) {
      this.dateOptions = { locale: nextProps.locale };
    }
    if (JSON.stringify(this.props.scroll) !== JSON.stringify(nextProps.scroll)) {
      this.setState({ scrollArea: this.calculateScrollArea(nextProps) });
    }
    if (nextProps[targetProp] !== this.props[targetProp]) {
      this.updateShownDate(nextProps);
    }
  }

  changeShownDate = (value, mode = 'set') => {
    const { focusedDate } = this.state;
    const { onShownDateChange, minDate, maxDate } = this.props;
    const modeMapper = {
      monthOffset: () => addMonths(focusedDate, value),
      setMonth: () => setMonth(focusedDate, value),
      setYear: () => setYear(focusedDate, value),
      set: () => value,
    };
    const newDate = min([max([modeMapper[mode](), minDate]), maxDate]);
    this.focusToDate(newDate, this.props, false);
    onShownDateChange && onShownDateChange(newDate);
  };

  handleRangeFocusChange = (rangesIndex, rangeItemIndex) =>
    this.props.onRangeFocusChange && this.props.onRangeFocusChange([rangesIndex, rangeItemIndex]);

  handleScroll = () => {
    const { onShownDateChange, minDate } = this.props;
    const visibleMonths = this.list.getVisibleRange();
    // prevent scroll jump with wrong visible value
    if (visibleMonths[0] === undefined) return;
    const visibleMonth = addMonths(minDate, visibleMonths[0] || 0);
    const isFocusedToDifferent = !isSameMonth(visibleMonth, this.state.focusedDate);
    if (isFocusedToDifferent) {
      this.setState({ focusedDate: visibleMonth });
      onShownDateChange && onShownDateChange(visibleMonth);
    }
  };

  renderMonthAndYear = (focusedDate, changeShownDate, props) => {
    const { showMonthArrow, locale, minDate, maxDate, showMonthAndYearPickers } = props;
    const upperYearLimit = (maxDate || Calendar.defaultProps.maxDate).getFullYear();
    const lowerYearLimit = (minDate || Calendar.defaultProps.minDate).getFullYear();
    const styles = this.styles;
    return (
      <div onMouseUp={e => e.stopPropagation()} className={styles.monthAndYearWrapper}>
        {showMonthArrow ? (
          <button
            type="button"
            className={classnames(styles.nextPrevButton, styles.prevButton)}
            onClick={() => changeShownDate(-1, 'monthOffset')}>
            <i />
          </button>
        ) : null}
        {showMonthAndYearPickers ? (
          <span className={styles.monthAndYearPickers}>
            <span className={styles.monthPicker}>
              <select value={focusedDate.getMonth()} onChange={e => changeShownDate(e.target.value, 'setMonth')}>
                {locale.localize.months().map((month, i) => (
                  <option key={i} value={i}>
                    {month}
                  </option>
                ))}
              </select>
            </span>
            <span className={styles.monthAndYearDivider} />
            <span className={styles.yearPicker}>
              <select value={focusedDate.getFullYear()} onChange={e => changeShownDate(e.target.value, 'setYear')}>
                {new Array(upperYearLimit - lowerYearLimit + 1).fill(upperYearLimit).map((val, i) => {
                  const year = val - i;
                  return (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  );
                })}
              </select>
            </span>
          </span>
        ) : (
          <span className={styles.monthAndYearPickers}>
            {locale.localize.months()[focusedDate.getMonth()]} {focusedDate.getFullYear()}
          </span>
        )}
        {showMonthArrow ? (
          <button
            type="button"
            className={classnames(styles.nextPrevButton, styles.nextButton)}
            onClick={() => changeShownDate(+1, 'monthOffset')}>
            <i />
          </button>
        ) : null}
      </div>
    );
  };

  onDragSelectionStart = date => {
    const { onChange, dragSelectionEnabled } = this.props;

    if (dragSelectionEnabled) {
      this.setState({
        drag: {
          status: true,
          range: { startDate: date, endDate: date },
          disablePreview: true,
        },
      });
    } else {
      onChange && onChange(date);
    }
  };

  onDragSelectionEnd = date => {
    const { updateRange, displayMode, onChange, dragSelectionEnabled } = this.props;

    if (!dragSelectionEnabled) return;

    if (displayMode === 'date' || !this.state.drag.status) {
      onChange && onChange(date);
      return;
    }
    const newRange = {
      startDate: this.state.drag.range.startDate,
      endDate: date,
    };
    if (displayMode !== 'dateRange' || isSameDay(newRange.startDate, date)) {
      this.setState({ drag: { status: false, range: {} } }, () => onChange && onChange(date));
    } else {
      this.setState({ drag: { status: false, range: {} } }, () => {
        updateRange && updateRange(newRange);
      });
    }
  };

  onDragSelectionMove = date => {
    const { drag } = this.state;
    if (!drag.status || !this.props.dragSelectionEnabled) return;
    this.setState({
      drag: {
        status: drag.status,
        range: { startDate: drag.range.startDate, endDate: date },
        disablePreview: true,
      },
    });
  };

  estimateMonthSize = (index, cache) => {
    const { direction, minDate } = this.props;
    const { scrollArea } = this.state;
    if (cache) {
      this.listSizeCache = cache;
      if (cache[index]) return cache[index];
    }
    if (direction === 'horizontal') return scrollArea.monthWidth;
    const monthStep = addMonths(minDate, index);
    const { start, end } = getMonthDisplayRange(monthStep, this.dateOptions);
    const isLongMonth = differenceInDays(end, start, this.dateOptions) + 1 > 7 * 5;
    return isLongMonth ? scrollArea.longMonthHeight : scrollArea.monthHeight;
  };

  onMouseUp = () => this.setState({ drag: { status: false, range: {} } });
  onMouseLeave = () => this.setState({ drag: { status: false, range: {} } });

  render() {
    const {
      showDateDisplay,
      onPreviewChange,
      scroll,
      direction,
      disabledDates,
      maxDate,
      minDate,
      rangeColors,
      color,
      className,
      focusedRange,
      dateDisplayFormat,
    } = this.props;
    const { scrollArea, focusedDate } = this.state;
    const isVertical = direction === 'vertical';
    const navigatorRenderer = this.props.navigatorRenderer || this.renderMonthAndYear;
    const axis = isVertical ? 'y' : 'x';
    const styles = this.styles;

    const ranges = this.props.ranges.map((range, i) => ({
      ...range,
      color: range.color || rangeColors[i] || color,
    }));

    return (
      <div
        className={classnames(styles.calendarWrapper, className)}
        onMouseUp={this.onMouseUp}
        onMouseLeave={this.onMouseLeave}>
        <DateDisplay
          showDateDisplay={showDateDisplay}
          styles={{
            dateDisplayWrapper: styles.dateDisplayWrapper,
            dateDisplay: styles.dateDisplay,
            dateDisplayItem: styles.dateDisplayItem,
            dateDisplayItemActive: styles.dateDisplayItemActive,
          }}
          focusedRange={focusedRange}
          color={color}
          ranges={ranges}
          rangeColors={rangeColors}
          dateDisplayFormat={dateDisplayFormat}
          dateOptions={this.dateOptions}
          handleRangeFocusChange={this.handleRangeFocusChange}
        />
        {navigatorRenderer(focusedDate, this.changeShownDate, this.props)}
        {scroll.enabled ? (
          <React.Fragment>
            <Weekdays
              styles={{ weekDays: styles.weekDays, weekDay: styles.weekDay }}
              showWeekDays={isVertical}
              dateOptions={this.dateOptions}
            />
            <div
              className={classnames(
                styles.infiniteMonths,
                isVertical ? styles.monthsVertical : styles.monthsHorizontal
              )}
              onMouseLeave={() => onPreviewChange && onPreviewChange()}
              style={{
                width: scrollArea.calendarWidth + 11,
                height: scrollArea.calendarHeight + 11,
              }}
              onScroll={this.handleScroll}>
              <ReactList
                length={differenceInCalendarMonths(
                  endOfMonth(maxDate),
                  addDays(startOfMonth(minDate), -1),
                  this.dateOptions
                )}
                treshold={500}
                type="variable"
                ref={target => (this.list = target)}
                itemSizeEstimator={this.estimateMonthSize}
                axis={axis}
                itemRenderer={(index, key) => {
                  const monthStep = addMonths(minDate, index);
                  return (
                    <Month
                      {...this.props}
                      onPreviewChange={this.props.onPreviewChange || this.updatePreview}
                      preview={this.props.preview || this.state.preview}
                      ranges={ranges}
                      key={key}
                      drag={this.state.drag}
                      dateOptions={this.dateOptions}
                      disabledDates={disabledDates}
                      month={monthStep}
                      onDragSelectionStart={this.onDragSelectionStart}
                      onDragSelectionEnd={this.onDragSelectionEnd}
                      onDragSelectionMove={this.onDragSelectionMove}
                      onMouseLeave={() => onPreviewChange && onPreviewChange()}
                      styles={styles}
                      style={
                        isVertical
                          ? { height: this.estimateMonthSize(index) }
                          : { height: scrollArea.monthHeight, width: this.estimateMonthSize(index) }
                      }
                      showMonthName
                      showWeekDays={!isVertical}
                    />
                  );
                }}
              />
            </div>
          </React.Fragment>
        ) : (
          <div
            className={classnames(
              this.styles.months,
              isVertical ? this.styles.monthsVertical : this.styles.monthsHorizontal
            )}>
            {new Array(this.props.months).fill(null).map((_, i) => {
              const monthStep = addMonths(this.state.focusedDate, i);
              return (
                <Month
                  {...this.props}
                  onPreviewChange={this.props.onPreviewChange || this.updatePreview}
                  preview={this.props.preview || this.state.preview}
                  ranges={ranges}
                  key={i}
                  drag={this.state.drag}
                  dateOptions={this.dateOptions}
                  disabledDates={disabledDates}
                  month={monthStep}
                  onDragSelectionStart={this.onDragSelectionStart}
                  onDragSelectionEnd={this.onDragSelectionEnd}
                  onDragSelectionMove={this.onDragSelectionMove}
                  onMouseLeave={() => onPreviewChange && onPreviewChange()}
                  styles={this.styles}
                  showWeekDays={!isVertical || i === 0}
                  showMonthName={!isVertical || i > 0}
                />
              );
            })}
          </div>
        )}
      </div>
    );
  }
}

Calendar.defaultProps = {
  showMonthArrow: true,
  showMonthAndYearPickers: true,
  disabledDates: [],
  classNames: {},
  locale: defaultLocale,
  ranges: [],
  focusedRange: [0, 0],
  dateDisplayFormat: 'MMM D, YYYY',
  monthDisplayFormat: 'MMM YYYY',
  showDateDisplay: true,
  showPreview: true,
  displayMode: 'date',
  months: 1,
  color: '#3d91ff',
  scroll: {
    enabled: false,
  },
  direction: 'vertical',
  maxDate: addYears(new Date(), 20),
  minDate: addYears(new Date(), -100),
  rangeColors: ['#3d91ff', '#3ecf8e', '#fed14c'],
  dragSelectionEnabled: true,
};

Calendar.propTypes = {
  showMonthArrow: PropTypes.bool,
  showMonthAndYearPickers: PropTypes.bool,
  disabledDates: PropTypes.array,
  minDate: PropTypes.object,
  maxDate: PropTypes.object,
  date: PropTypes.object,
  onChange: PropTypes.func,
  onPreviewChange: PropTypes.func,
  onRangeFocusChange: PropTypes.func,
  classNames: PropTypes.object,
  locale: PropTypes.object,
  shownDate: PropTypes.object,
  onShownDateChange: PropTypes.func,
  ranges: PropTypes.arrayOf(rangeShape),
  preview: PropTypes.shape({
    startDate: PropTypes.object,
    endDate: PropTypes.object,
    color: PropTypes.string,
  }),
  dateDisplayFormat: PropTypes.string,
  monthDisplayFormat: PropTypes.string,
  focusedRange: PropTypes.arrayOf(PropTypes.number),
  initialFocusedRange: PropTypes.arrayOf(PropTypes.number),
  months: PropTypes.number,
  className: PropTypes.string,
  showDateDisplay: PropTypes.bool,
  showPreview: PropTypes.bool,
  displayMode: PropTypes.oneOf(['dateRange', 'date']),
  color: PropTypes.string,
  updateRange: PropTypes.func,
  scroll: PropTypes.shape({
    enabled: PropTypes.bool,
    monthHeight: PropTypes.number,
    longMonthHeight: PropTypes.number,
    monthWidth: PropTypes.number,
    calendarWidth: PropTypes.number,
    calendarHeight: PropTypes.number,
  }),
  direction: PropTypes.oneOf(['vertical', 'horizontal']),
  navigatorRenderer: PropTypes.func,
  rangeColors: PropTypes.arrayOf(PropTypes.string),
  dragSelectionEnabled: PropTypes.bool,
};

export default Calendar;
