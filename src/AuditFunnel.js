import React, { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import './AuditFunnel.css';

export function AuditFunnel({selectedCategory, selectedDateRange}) {
  console.log(selectedCategory, selectedDateRange);

  const [funnelData,setFunnelData] = useState([]);
  useEffect(()=>{
    const fetchData_1 = async () =>{
      const data = await fetch('https://quality-dashboard.onrender.com/getFunnelData',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({selectedCategory,            
          startDate: selectedDateRange && selectedDateRange[0] ? selectedDateRange[0].toISOString() : null,
          endDate: selectedDateRange && selectedDateRange[1] ? selectedDateRange[1].toISOString() : null,})
      });
      const response = await data.json()
      setFunnelData(response.funnelData);
      console.log(response.funnelData);
    }
    fetchData_1();
  },[selectedCategory,selectedDateRange])

  const data = Array.isArray(funnelData) ? funnelData.map(item => ({
    name: item.category,
    value: item.count,
  })) : [];
  
  const options = {
    /*title: {
      text: 'Funnel',
    },*/
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b} : {c}',
    },
    toolbox:{
      feature:{
        dataView:{readOnly:true},
      },
    },
    legend: {
      data: data.map(item => item.name),
      top: 10,
      textStyle: {
        fontSize: 10,
        color: '#fff',
      },
    },
    series: [
      {
        name: 'Funnel',
        type: 'funnel',
        left: '10%',
        top: 70,
        bottom: 0,
        width: '80%',
        min: 0,
        max: 100,
        minSize: '0%',
        maxSize: '100%',
        sort: 'descending',
        gap: 2,
        label: {
          show: true,
          position: 'inside',
        },
        labelLine: {
          length: 10,
          lineStyle: {
            width: 1,
            type: 'solid',
          },
        },
        itemStyle: {
          borderColor: '#fff',
          borderWidth: 1,
        },
        emphasis: {
          label: {
            fontSize: 20,
          },
        },
        data,
      },
    ],
  };

  return (
    <div className="funnel">
      <ReactECharts option={options} className="funnelchart" />
    </div>
  );
}
