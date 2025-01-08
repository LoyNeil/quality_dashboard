import React from 'react';
import { AgGridReact } from 'ag-grid-react';
import { useState, useEffect } from 'react';
import { useMemo } from 'react';
import './AuditTable.css';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community'; 

// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule]);

export function AuditTable({selectedCategory, selectedDateRange}) {
  const [rowData, setRowData] = useState([]);

  // Fetch data from the backend when the component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:5000/getAuditData',{
          method:'POST',
          headers:{'Content-Type':'application/json'},
          body:JSON.stringify({selectedCategory,
            startDate: selectedDateRange && selectedDateRange[0] ? selectedDateRange[0].toISOString() : null,
            endDate: selectedDateRange && selectedDateRange[1] ? selectedDateRange[1].toISOString() : null,
          })
        });
        const data = await response.json();
        setRowData(data.rowData); // Update state with the fetched data
      } catch (error) {
        console.error('Error fetching audit data:', error);
      }
    };

    fetchData();
  }, [selectedCategory,selectedDateRange]);

  const colDefs = useMemo(() => [
    { field: 'AgentName', headerName: 'Agent Name' },
    { field: 'TeamLeader', headerName: 'Team Leader' },
    { field: 'TotalAudit', filter: 'agNumberColumnFilter', headerName: 'Total Audits' },
    { field: 'FatalCount', filter: 'agNumberColumnFilter', headerName: 'Fatal Count' },
    { field: 'QualityScore', headerName: 'Quality Score' },
  ], []);

  const defaultColDef = useMemo(() => ({
    filter: 'agTextColumnFilter',
    floatingFilter: true,
  }), []);

  return (
    <div
      style={{ height: 600}} // the Data Grid will fill the size of the parent container
    >
      <AgGridReact
        rowData={rowData}
        columnDefs={colDefs}
        defaultColDef={defaultColDef}
        pagination={true}
        paginationPageSize={20}
        className="ag-theme-alpine"
      />
    </div>
  );
}