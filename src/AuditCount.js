import React, { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import './AuditCount.css';
import dayjs from 'dayjs';
import {useLoader} from './LoaderContext.js';

export function AuditCount({selectedCategory, selectedDateRange}) {
  console.log("auditCount",selectedCategory, selectedDateRange);
  const [auditCount, setAuditCount] = useState(0);

  const { toggleLoading } = useLoader();

  useEffect(() => {
    const fetchAuditCount = async () => {
      try {
        if (!selectedDateRange || selectedDateRange[0] === selectedDateRange[1]) return;
        toggleLoading(true);
        const response = await fetch('https://quality-dashboard.onrender.com/getAuditCount', {
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
        if (!data_res || data_res.auditcount === null || data_res.auditcount === undefined) {
          alert("There is no data");
          setAuditCount(0); // Ensure auditCount is reset
        } else {
          setAuditCount(data_res.auditcount);
        }        
      } catch (error) {
        console.error('Error fetching data:', error);
        setAuditCount(0);
      } finally {
        toggleLoading(false);
      }
    };
  
    if (selectedDateRange[0] && selectedDateRange[1] && selectedDateRange[0] !== selectedDateRange[1]) {
    fetchAuditCount();
    }
  }, [selectedCategory,selectedDateRange,toggleLoading]);

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
