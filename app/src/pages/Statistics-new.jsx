import React, { useEffect, useState } from "react";
import * as d3 from "d3";

export default function Statistics() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("/statistics_summary.json")
      .then(res => res.json())
      .then(setData)
      .catch(err => console.error("Failed to load JSON", err));
  }, []);

  if (!data) return <p>Loading...</p>;

  return (
    <div className="statistics-container">
      <h1>Dataset Statistics</h1>
      <Chart title="Genus distribution" data={data.genus} />
      <Chart title="Kingdom distribution" data={data.kingdom} />
      <Chart title="Host distribution" data={data.host} />
      <Chart title="Location distribution" data={data.location} />
      <Chart title="Sample Type distribution" data={data.sample_type} />
    </div>
  );
}

function Chart({ title, data }) {
  // you can later replace this with D3 or Observable Plot
  return (
    <div className="chart-block">
      <h2>{title}</h2>
      <svg width={500} height={300} />
    </div>
  );
}

