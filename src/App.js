import React, { useEffect, useState } from "react";


import myData from './dept_grouped_author_info.json';

import './App.css';
import { Select } from 'antd';
import Map from "./map";
import Bar from "./bar";



function App() {
  const plainOptions = ['Computer architecture', 'Computer networks', 'Computer security', 'Databases', 'Design automation', 'Embedded & real-time systems', 'High-performance computing', 'Mobile computing', 'Measurement & perf. analysis', 'Operating systems', 'Programming languages', 'Software engineering'];
  const defaultCheckedList = ['Computer architecture', 'Computer networks', 'Computer security', 'Databases', 'Design automation', 'Embedded & real-time systems', 'High-performance computing', 'Mobile computing', 'Measurement & perf. analysis', 'Operating systems', 'Programming languages', 'Software engineering'];
  const PlainCountries = ['Canada', 'US'];
  const defaultCheckedCountries = ['Canada', 'US'];
  const [topSummary, setTopSummary ] = useState([]);
  const [summary, setSummary ] = useState([]);

  const [checkedList, setCheckedList] = useState(defaultCheckedList);
  const [checkedCountries, setCheckedCountries] = useState(defaultCheckedCountries);


  useEffect(() => {
    const summary = calculateFacultyAndCount(defaultCheckedList, myData)
    setSummary(summary);
    const topSummary = sortAndFilterSummary(calculateFacultyAndCount(checkedList, myData));
    setTopSummary(topSummary);
   }
  , [checkedCountries]);

  function calculateFacultyAndCount(checkedList, myData) {
    const summary = {};

    // Iterate through all institutions and their respective data.
    for (let institution in myData) {
        let facultySet = new Set(); // to store unique faculty names
        let productOfAdjustedCounts = 1; // initializing product value for adjusted counts
        
        // Iterate through all the areas in checkedList
        checkedList.forEach(area => {
            let areaAdjustedCountSum = 0;

            // Iterate through all data entries for the current institution.
            myData[institution].forEach(dataEntry => {
                // If the area matches, process the data
                if (dataEntry["area"] === area && checkedCountries.some(item => item.toLowerCase() === dataEntry["country"].toLowerCase())) {
                    facultySet.add(dataEntry["name"]); // add faculty name to the Set
                    
                    // Add the adjustedcount of the current entry to areaAdjustedCountSum.
                    areaAdjustedCountSum += parseFloat(dataEntry["adjustedcount"]);
                }
            });

            // Multiply the productOfAdjustedCounts with the sum of adjustedcount for the area (+1).
            productOfAdjustedCounts *= (areaAdjustedCountSum + 1);
        });

        // If we have any relevant data for the current institution, store it in the summary.
        if (facultySet.size > 0) {
            // If more than one area is checked, take the nth root of productOfAdjustedCounts.
            if (checkedList.length > 1) {
                productOfAdjustedCounts = Math.pow(productOfAdjustedCounts, 1/checkedList.length);
            }
            summary[institution] = {
                faculty: facultySet.size, // number of unique faculty
                count: productOfAdjustedCounts // final count after all calculations
            };
        }
    }
    return Object.entries(summary).sort(([,a], [,b]) => b.count - a.count);
}

function sortAndFilterSummary(summary) {
  // Convert the summary object to an array of entries, sort it by 'count', and get the top 10.
  const sortedFilteredSummary = summary.slice(0, 10);

  // Convert the sorted and filtered array back into an object.
  const topSummary = {};
  for (const [key, value] of sortedFilteredSummary) {
      topSummary[key] = value;
  }
  
  return topSummary;
}



  // const [results, setResults] = useState([]);

  const checkAll = plainOptions.length === checkedList.length;

  const onChange = (list) => {
    if(list.length === 0) 
    return
    setCheckedList(list);
    const summary = calculateFacultyAndCount(list, myData)
    setSummary(summary);
    const topSummary = sortAndFilterSummary(summary);
    setTopSummary(topSummary);
  };

  const onChangeCountries = (list) => {
    if(list.length === 0) 
      return
    setCheckedCountries(list);
  };

 


  return (
    <div className="window">
      <h1>What are the top universities for Systems research in North America?</h1>
      <div className="label">
        <label>
        Countries:
        </label>
      <Select
      showSearch
      mode="multiple"
      style={{ width: '100%' }}
      placeholder="Please select countries:"
      onChange={onChangeCountries}
      defaultValue={PlainCountries.map((item) => ({ label:item, value: item }))}
      size="large"
      value={checkedCountries}
      options={PlainCountries.map((item) => ({ label:item, value: item }))}
    />
      </div>

      <div className="label">
      <label>
      Systems Areas:
      </label>
      <Select
      showSearch
      mode="multiple"
      style={{ width: '100%' }}
      placeholder="Please select"
      onChange={onChange}
      value={checkedList.map((item) => ({ label:item, value: item }))}
      defaultValue={plainOptions.map((item) => ({ label:item, value: item }))}
      size="large"
      options={plainOptions.map((item) => ({ label:item, value: item }))}
    />
      </div>
  
      <Bar data={topSummary}/>
      <Map data={summary}/>
      <h4>* Data was obtained from <a href="https://dblp.org/" target="_blank" >DBLP</a> using <a href="https://github.com/emeryberger/CSrankings" target="_blank">CSRankings</a> on October 2023.</h4>
      <h4>** For more information about the used metrics, please Check <a href="https://csrankings.org/faq.html" target="_black">FAQ @ CSRanking</a>.</h4>
      <h4>*** Made by <a href="ababa.me" target="_blank">Abdelrahman Baba</a>, a PhD student in <a href="https://wasl.uwaterloo.ca/" target="_black">WASL</a> Lab, University of Waterloo.</h4>

    </div>
  );
}

export default App;