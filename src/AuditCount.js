import React, { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import './AuditCount.css';
import dayjs from 'dayjs';

export function AuditCount({selectedCategory, selectedDateRange,setGlobalLoading }) {
  const [auditCount, setAuditCount] = useState(0);

  useEffect(() => {
    const fetchAuditCount = async () => {
      try {
        const response = await fetch('http://localhost:5000/getAuditCount', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            selectedCategory,
            startDate: selectedDateRange && selectedDateRange[0]
            ? dayjs(selectedDateRange[0]).format("YYYY-MM-DD")  // Send date in 'YYYY-MM-DD' format
            : null,
          endDate: selectedDateRange && selectedDateRange[1]
            ? dayjs(selectedDateRange[1]).format("YYYY-MM-DD")  // Send date in 'YYYY-MM-DD' format
            : null,
          }),
        });
        const data_res = await response.json();
        setAuditCount(data_res.auditcount);
      } catch (error) {
        console.error('Error fetching data:', error);
        setAuditCount(0);
      }
    };
  
    fetchAuditCount();
  }, [selectedCategory,selectedDateRange]);

  const options = {
    tooltip: {
      formatter: '{a} <br/>{b} : {c}',
    },
    toolbox: {
      feature: {
        dataView: { readOnly: true },
      },
    },
    series: [
      {
        name: 'Total Audits',
        type: 'gauge',
        min: 0,
        max: 100,
        itemStyle: {
          color: '#3e82bd',
        },
        progress: {
          show: true,
        },
        detail: {
          valueAnimation: true,
          formatter: '{value}',
          fontSize: 20,
          color: '#fff',
        },
        axisLabel: {
          fontSize: 10,
          color: '#fff',
        },
        title: {
          color: '#fff',
          fontSize: 10,
        },
        data: [
          {
            value: auditCount,
            name: 'Quality Score',
            color: '#fff',
          },
        ],
      },
    ],
  };

  return (
    <div className="speedgauage">
      <ReactECharts option={options} className="chart" />
    </div>
  );
}