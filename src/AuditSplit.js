import React from 'react';
import ReactECharts from 'echarts-for-react';
import './AuditSplit.css';
import { useState,useEffect } from 'react';
import dayjs from 'dayjs';

export function AuditSplit({selectedCategory, selectedDateRange}) {

  const [options, setOptions] = useState({});
  useEffect(() => {
    async function fetchAuditSplit() {
      try {
        const response = await fetch ('https://quality-dashboard.onrender.com/getAuditSplit',{
          method:'POST',
          headers:{'Content-Type':'application/json'},
          body:JSON.stringify({selectedCategory,
            startDate: selectedDateRange && selectedDateRange[0] ? dayjs(selectedDateRange[0]).format('YYYY-MM-DD') : null,
            endDate: selectedDateRange && selectedDateRange[1] ? dayjs(selectedDateRange[1]).format('YYYY-MM-DD') : null,
          })
        });
        const data_point = await response.json()
        const splitData = data_point.splitData;

        // Transform data for ECharts
        const yAxisData = splitData.map((item) => item.week);
        const categories = [...new Set(splitData.flatMap((item) => item.categories.map((c) => c.category)))];

        const series = categories.map((category) => ({
          name: category,
          type: 'bar',
          stack: 'total',
          label: { show: true },
          emphasis: { focus: 'series' },
          data: splitData.map((item) => {
            const categoryData = item.categories.find((c) => c.category === category);
            return categoryData ? categoryData.count : 0;
          }),
        }));

        setOptions({
          tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' },
          },
          toolbox: {
            feature: {
              dataView: { readOnly: true },
            },
          },
          legend: {
            top: '10',
            textStyle: { color: '#fff' },
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true,
          },
          xAxis: { type: 'value' },
          yAxis: {
            type: 'category',
            data: yAxisData,
          },
          series,
        });
      } catch (error) {
        console.error('Error fetching audit split data:', error);
      }
    }

    fetchAuditSplit();
  }, [selectedCategory,selectedDateRange]);
  return (
    <div className="funnel">
      <ReactECharts option={options} className="split" />
    </div>
  );
}
