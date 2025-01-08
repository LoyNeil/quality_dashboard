import React, { useState } from 'react';
import './DateRange.css';
import { DatePicker, Space, message } from 'antd';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

export function DateeRange({onDateRangeChange}) {
  dayjs.extend(customParseFormat);

  // Helper function for disabled dates
  const disabledDate = (current) => {
    // Disables future dates
    return current && current > dayjs().endOf('day');
  };

  // State to manage selected date range
  const [selectedDate, setSelectedDate] = useState(null);

  // Handle Calendar Change
  const handleCalenderClick = (dates) => {
    if (dates && dates.length === 2) {
      const [start, end] = dates;
      if (start && end) {
        // Calculate difference in months
        const monthsDifference = end.diff(start, 'months', true);
        if (monthsDifference > 3) {
          message.error('Date range cannot be greater than 3 months.');
          setSelectedDate(null);
        } else {
          setSelectedDate(dates);
          onDateRangeChange(dates);
        }
      } else {
        setSelectedDate(null);
        onDateRangeChange(null);
      }
    } else {
      setSelectedDate(null);
      onDateRangeChange(null);
    }
  };

  return (
    <Space direction="vertical">
      <DatePicker.RangePicker
        disabledDate={disabledDate}
        className="custom-range-picker"
        onCalendarChange={handleCalenderClick}
      />
    </Space>
  );
}