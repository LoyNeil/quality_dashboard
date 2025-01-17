import React from 'react';
import ReactECharts from 'echarts-for-react';
import './TrendData.css';
import { useState,useEffect } from 'react';
import dayjs from 'dayjs';

export function TrendData({selectedCategory,selectedDateRange}) {

  const [trendData, setTrendData] = useState([]);

  useEffect(()=>{
    const fetchedData = async()=>{
      try {
        const data = await fetch('http://localhost:5000/getTrendData',{
          method:'POST',
          headers:{'Content-Type':'application/json'},
          body: JSON.stringify({
            selectedCategory,
            startDate: selectedDateRange && selectedDateRange[0] ? dayjs(selectedDateRange[0]).format('YYYY-MM-DD') : null,
            endDate: selectedDateRange && selectedDateRange[1] ? dayjs(selectedDateRange[1]).format('YYYY-MM-DD') : null,
          }),
        });
        const response_T = await data.json()
        setTrendData(response_T.trendData || []);
      } catch (error) {
        console.log(error);
      }
    }
    fetchedData();
  },[selectedCategory,selectedDateRange])


  // Prepare data for the chart
  const weekLabels = trendData.map(item => item.week);
  const weekCounts = trendData.map(item => item.count);

  const options = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },
    toolbox:{
      feature:{
        dataView:{readOnly:true},
      },
    },
    grid: {
      left: '10%',
      right: '0%',
      bottom: '10%',
      containLabel: true,
    },
    xAxis: [
      {
        type: 'category',
        data: weekLabels,
        axisTick: {
          alignWithLabel: true,
        },
      },
    ],
    yAxis: [
      {
        type: 'value',
      },
    ],
    series: [
      {
        name: 'Direct',
        type: 'bar',
        barWidth: '60%',
        data: weekCounts,
        itemStyle: {
          color: '#3bffca',
        },
      },
    ],
  };

  return (
    <div className="speedgauage">
      <ReactECharts
        option={options}
        className="trenddata"
      />
    </div>
  );
}
