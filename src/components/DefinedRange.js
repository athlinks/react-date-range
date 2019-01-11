import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styles from '../styles';
import CheckMark from 'react-icons/lib/md/check';
import { isIOS } from 'react-device-detect';
import { defaultInputRanges, defaultStaticRanges } from '../defaultRanges';
import { rangeShape } from './DayCell';
import cx from 'classnames';

class DefinedRanges extends Component {
  constructor(props) {
    super(props);
    this.state = {
      rangeOffset: 0,
      focusedInput: -1,
    };
    this.handleRangeChange = this.handleRangeChange.bind(this);
  }
  handleRangeChange(range) {
    const { onChange, ranges, focusedRange } = this.props;
    const selectedRange = ranges[focusedRange[0]];
    if (!onChange || !selectedRange) return;
    onChange({
      [selectedRange.key || `range${focusedRange[0] + 1}`]: { ...selectedRange, ...range },
    });
  }
  getSelectedRange(ranges, staticRange) {
    const focusedRangeIndex = ranges.findIndex(range => {
      if (!range.startDate || !range.endDate || range.disabled) return false;
      return staticRange.isSelected(range);
    });
    const selectedRange = ranges[focusedRangeIndex];
    return { selectedRange, focusedRangeIndex };
  }
  render() {
    const { onPreviewChange, ranges, rangeColors, className, athlinksCustom } = this.props;
    return (
      <div className={cx(styles.definedRangesWrapper, className)}>
        {this.props.headerContent}
        <div className={styles.staticRanges}>
          {!athlinksCustom &&
            this.props.staticRanges.map((staticRange, i) => {
              const { selectedRange, focusedRangeIndex } = this.getSelectedRange(
                ranges,
                staticRange
              );
              return (
                <button
                  type="button"
                  className={cx(styles.staticRange, {
                    [styles.staticRangeSelected]: Boolean(selectedRange),
                  })}
                  style={{
                    color: selectedRange
                      ? selectedRange.color || rangeColors[focusedRangeIndex]
                      : null,
                  }}
                  key={i}
                  onClick={() => this.handleRangeChange(staticRange.range(this.props))}
                  onFocus={() => onPreviewChange && onPreviewChange(staticRange.range(this.props))}
                  onMouseOver={() =>
                    onPreviewChange && onPreviewChange(staticRange.range(this.props))
                  }
                  onMouseLeave={() => {
                    this.props.onPreviewChange && this.props.onPreviewChange();
                  }}>
                  <span tabIndex={-1} className={styles.staticRangeLabel}>
                    {staticRange.label}
                  </span>
                </button>
              );
            })}
          {athlinksCustom &&
            this.props.staticRanges
              .filter(_ => !!_.ranges)
              .map((staticRange, i) => {
                return (
                  <div key={i}>
                    <div className={cx(styles.rangeLabel)}>{staticRange.label}</div>
                    {staticRange.ranges.map((sectionRange, i) => {
                      const { selectedRange, focusedRangeIndex } = this.getSelectedRange(
                        ranges,
                        sectionRange
                      );
                      return (
                        <button
                          type="button"
                          className={cx(styles.staticRange, {
                            [styles.staticRangeSelected]: Boolean(selectedRange),
                          })}
                          style={{
                            color: selectedRange
                              ? selectedRange.color || rangeColors[focusedRangeIndex]
                              : '#4a4a4a',
                            width: '100%',
                            border: 'none',
                          }}
                          key={i}
                          onClick={() => this.handleRangeChange(sectionRange.range(this.props))}
                          onFocus={() =>
                            onPreviewChange && onPreviewChange(sectionRange.range(this.props))
                          }
                          onMouseOver={() => {
                            if (isIOS) {
                              this.handleRangeChange(sectionRange.range(this.props));
                            } else {
                              onPreviewChange && onPreviewChange(sectionRange.range(this.props));
                            }
                          }}
                          onMouseLeave={() =>
                            this.props.onPreviewChange && this.props.onPreviewChange()
                          }>
                          <span tabIndex={-1} className={styles.staticRangeLabel}>
                            {sectionRange.label}
                            <div
                              style={{
                                float: 'right',
                                border: '1px solid',
                                borderRadius: 10,
                                display: selectedRange ? 'block' : 'none',
                                height: 20,
                                width: 20,
                              }}>
                              <CheckMark
                                style={{
                                  height: 20,
                                  width: 20,
                                  paddingBottom: 2,
                                  paddingRight: 2,
                                }}
                              />
                            </div>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                );
              })}
        </div>
        <div className={styles.inputRanges}>
          {!athlinksCustom &&
            this.props.inputRanges.map((rangeOption, i) => (
              <div className={styles.inputRange} key={i}>
                <input
                  className={styles.inputRangeInput}
                  onFocus={() => this.setState({ focusedInput: i, rangeOffset: 0 })}
                  onBlur={() => this.setState({ rangeOffset: 0 })}
                  onChange={e => {
                    let value = parseInt(e.target.value, 10);
                    value = isNaN(value) ? 0 : Math.max(Math.min(99999, value), 0);
                    this.handleRangeChange(rangeOption.range(value, this.props));
                  }}
                  min={0}
                  max={99999}
                  value={
                    rangeOption.getCurrentValue
                      ? rangeOption.getCurrentValue(ranges[this.props.focusedRange[0]] || {})
                      : '-'
                  }
                />
                <span className={styles.inputRangeLabel}>{rangeOption.label}</span>
              </div>
            ))}
        </div>
        {this.props.footerContent}
      </div>
    );
  }
}

DefinedRanges.propTypes = {
  inputRanges: PropTypes.array,
  staticRanges: PropTypes.array,
  ranges: PropTypes.arrayOf(rangeShape),
  focusedRange: PropTypes.arrayOf(PropTypes.number),
  onPreviewChange: PropTypes.func,
  onChange: PropTypes.func,
  footerContent: PropTypes.any,
  headerContent: PropTypes.any,
  rangeColors: PropTypes.arrayOf(PropTypes.string),
  className: PropTypes.string,
  athlinksCustom: PropTypes.bool,
};

DefinedRanges.defaultProps = {
  inputRanges: defaultInputRanges,
  staticRanges: defaultStaticRanges,
  ranges: [],
  rangeColors: ['#16a9e1', '#3ecf8e', '#fed14c'],
  focusedRange: [0, 0],
  athlinksCustom: false,
};

export default DefinedRanges;
