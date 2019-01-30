import React, { Component } from 'react';
import PropTypes from 'prop-types';
import DateRange from '../DateRange';
import DefinedRange from '../DefinedRange';
import { findNextRangeIndex, generateStyles } from '../../utils.js';
import classnames from 'classnames';
import coreStyles from '../../styles';

class DateRangePicker extends Component {
  constructor(props) {
    super(props);
    this.state = {
      focusedRange: [findNextRangeIndex(props.ranges), 0],
    };
    this.styles = generateStyles([coreStyles, props.classNames]);
  }

  onRangeFocusChange = focusedRange => this.setState({ focusedRange });
  onPreviewChange = value => this.dateRange.updatePreview(value);

  render() {
    const { focusedRange } = this.state;
    const { className } = this.props;

    return (
      <div className={classnames(this.styles.dateRangePickerWrapper, className)}>
        <DefinedRange
          focusedRange={focusedRange}
          onPreviewChange={this.onPreviewChange}
          {...this.props}
          range={this.props.ranges[focusedRange[0]]}
        />
        <DateRange
          onRangeFocusChange={this.onRangeFocusChange}
          focusedRange={focusedRange}
          {...this.props}
          ref={t => (this.dateRange = t)}
        />
      </div>
    );
  }
}

DateRangePicker.defaultProps = {};

DateRangePicker.propTypes = {
  ...DateRange.propTypes,
  ...DefinedRange.propTypes,
  className: PropTypes.string,
};

export default DateRangePicker;
