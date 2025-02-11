import React from "react";
import "./NavBar.css";
import { AuditCount } from "./AuditCount";
import { TrendData } from "./TrendData";
import { AuditFunnel } from "./AuditFunnel";
import { AuditSplit } from "./AuditSplit";
import { AuditTable } from "./AuditTable";
import { DateeRange } from "./DateRange";
import { Footer } from "./Footer";
import { useState, useEffect } from "react";
import dayjs from "dayjs";
import Loader from "./Loader";

export function NavBar() {
  // const [postSalesDropDown,setPostSalesDropDown] = useState(false);
  // const [preSalesDropDown, setPreSalesDropDown] = useState(false);
  const [fopsDropDown, setFopsDropDown] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("BEPC");
  const [selectedDateRange, setSelectedDateRange] = useState([
    dayjs().subtract(1, "days"),
    dayjs().subtract(1, "days"),
  ]);

  // const [loading, setLoading] = useState(false);

  const handleSelection = (category) => {
    setSelectedCategory(category);
  };

  const handleDateRangeChange = (dates) => {
    setSelectedDateRange(dates);
  };

  // const toggle = () => {
  //   setPostSalesDropDown(!postSalesDropDown);
  // }

  // const preToggle = () =>{
  //   setPreSalesDropDown(!preSalesDropDown);
  // }

  const fopsToggle = () => {
    setFopsDropDown(!fopsDropDown);
  };

  useEffect(() => {
    const outsideclick = (event) => {
      if (!event.target.closest(".postsales,.presales,.Fops")) {
        // setPostSalesDropDown(false);
        // setPreSalesDropDown(false);
        setFopsDropDown(false);
      }
    };

    if (fopsDropDown) {
      // Add the event listener
      document.addEventListener("click", outsideclick);
    }
    // Cleanup the event listener on unmount
    return () => {
      document.removeEventListener("click", outsideclick);
    };
  }, [fopsDropDown]);

  // useEffect(() => {
  //   setLoading(true);

  //   const timer = setTimeout(() => {
  //     setLoading(false);
  //   },5000);
  //   return () => clearTimeout(timer);
  // },[]);

  return (
    <div className="mainbar">
      <ul className="mainmenu">
        <li className="Fops" onClick={fopsToggle}>
          Sales Report
          {fopsDropDown ? (
            <ul className="submenu3">
              <li
                onClick={() => handleSelection("BEPC")}
                className = {selectedCategory === 'BEPC' ? 'selected' :''}
              >
                Car {selectedCategory === 'BEPC' && '✔'}
              </li>
              <li onClick={() => handleSelection("Grooming")}
                className={selectedCategory==='Grooming' ? 'selected':''}>
                  Bike {selectedCategory==='Grooming' && '✔'}
              </li>
            </ul>
          ) : null}
        </li>
      </ul>
      <div className="loader">
        <Loader />
      </div>
      <>
      <div className="range">
        <DateeRange onDateRangeChange={handleDateRangeChange} />
      </div>
      <div className="speedgauage">
        <div className="chart1">
          <AuditCount
            selectedCategory={selectedCategory}
            selectedDateRange={selectedDateRange}
          />
          <p className="text">Audit Count</p>
        </div>
        <div className="trend">
          <TrendData
            selectedCategory={selectedCategory}
            selectedDateRange={selectedDateRange}
          />
        </div>
        <div className="funnel">
          <AuditFunnel
            selectedCategory={selectedCategory}
            selectedDateRange={selectedDateRange}
          />
        </div>
        <div className="split">
          <AuditSplit
            selectedCategory={selectedCategory}
            selectedDateRange={selectedDateRange}
          />
        </div>
        <div className="table">
          <AuditTable
            selectedCategory={selectedCategory}
            selectedDateRange={selectedDateRange}
          />
        </div>
        </div>
        </>
    <div className="footer">
      <Footer />
    </div>
    </div>
  );
}
