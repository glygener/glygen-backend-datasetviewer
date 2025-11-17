// app/src/pages/Statistics.jsx
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import './statistics.css';

function useFetchJson(url) {
  const [data, setData] = useState(null);
  useEffect(() => {
    fetch(url).then(r => r.json()).then(setData).catch(e => {
      console.error('Failed to load stats', e);
    });
  }, [url]);
  return data;
}

/* Simple tooltip */
function createTooltip() {
  const div = d3.select('body').append('div')
    .attr('class', 'stats-tooltip')
    .style('position', 'absolute')
    .style('pointer-events', 'none')
    .style('opacity', 0);
  return div;
}

function BarChart({ data }) {
  const ref = useRef();
  useEffect(() => {
    if (!data || data.length === 0) return;
    const container = d3.select(ref.current);
    container.selectAll('*').remove();

    const width = 900, height = 420, margin = { top: 20, right: 20, bottom: 120, left: 120 };
    const svg = container.append('svg').attr('width', width).attr('height', height);

    const x = d3.scaleBand().domain(data.map(d => d.key)).range([margin.left, width - margin.right]).padding(0.1);
    const y = d3.scaleLinear().domain([0, d3.max(data, d => d.value)]).nice().range([height - margin.bottom, margin.top]);

    const tooltip = createTooltip();

    svg.append('g')
      .selectAll('rect')
      .data(data)
      .join('rect')
      .attr('x', d => x(d.key))
      .attr('y', d => y(d.value))
      .attr('height', d => (height - margin.bottom) - y(d.value))
      .attr('width', x.bandwidth())
      .attr('fill', d => {
	if (d.category === 'Bacteria') return '#1f77b4';
	if (d.category === 'Viruses')  return '#ff7f0e';
	if (d.category === 'Eukaryota') return '#2ca02c';
	return '#7f7f7f'; // Other
      })
      .on('mouseover', (event, d) => {
        tooltip.style('opacity', 1).html(`<strong>${d.key}</strong><br/>${d.value}`);
      })
      .on('mousemove', event => tooltip.style('left', (event.pageX + 10) + 'px').style('top', (event.pageY + 10) + 'px'))
      .on('mouseout', () => tooltip.style('opacity', 0));

    svg.append('g').attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).tickFormat(d => d).tickValues(data.map(d => d.key).slice(0, 50)))
      .selectAll('text')
      .attr('transform', 'rotate(-60)')
      .style('text-anchor', 'end');

    svg.append('g').attr('transform', `translate(${margin.left},0)`).call(d3.axisLeft(y));

    return () => tooltip.remove();
  }, [data]);
  return <div ref={ref} className="chart-container" />;
}

function PieChart({ data, title }) {
  const ref = useRef();
  useEffect(() => {
    if (!data || data.length === 0) return;
    const width = 320, height = 320, radius = Math.min(width, height) / 2;
    const svg = d3.select(ref.current).append('svg').attr('width', width).attr('height', height);
    const g = svg.append('g').attr('transform', `translate(${width/2},${height/2})`);

    const pie = d3.pie().value(d => d.value);
    const arc = d3.arc().innerRadius(radius*0.2).outerRadius(radius*0.9);
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    const tooltip = createTooltip();

    const slices = g.selectAll('path').data(pie(data)).join('path')
      .attr('d', arc)
      .attr('fill', (d,i) => color(i))
      .on('mouseover', (event,d) => tooltip.style('opacity', 1).html(`<strong>${d.data.key}</strong><br/>${d.data.value}`))
      .on('mousemove', (event) => tooltip.style('left', (event.pageX + 8) + 'px').style('top', (event.pageY + 8) + 'px'))
      .on('mouseout', () => tooltip.style('opacity', 0));

    // legend (top N)
    const legend = svg.append('g').attr('transform', `translate(0,0)`);
    data.slice(0,6).forEach((d,i) => {
      legend.append('rect').attr('x', -width/2 + 10).attr('y', -height/2 + 20 + i*20).attr('width', 12).attr('height',12).attr('fill', color(i));
      legend.append('text').attr('x', -width/2 + 28).attr('y', -height/2 + 30 + i*20).text(`${d.key} (${d.value})`).style('font-size','12px');
    });

    return () => tooltip.remove();
  }, [data, title]);
  return <div className="pie" ref={ref}><h4 style={{textAlign:'center'}}>{title}</h4></div>;
}

export default function StatisticsPage() {
  const data = useFetchJson('/static/data/statistics_summary.json');

  if (!data) return <div>Loading statistics…</div>;

  // show top 40 Genus/Family entries for bar chart (now includes .category)
  const genusData = (data.genus_family || []).slice(0, 40);
//  console.log("StatisticsPage mounted");
  return (
    <div className="statistics-page container">
      <h2>ARGOSDB — Dataset statistics</h2>
      <section>
        <h3>Genus (top 40)</h3>
        <BarChart data={genusData} />
      </section>

      <section className="pies-grid">
        <PieChart data={data.kingdom.slice(0,20)} title={`Kingdom (${data.kingdom.reduce((s, x) => s + x.value, 0)})`} />
        <PieChart data={data.location.slice(0,20)} title={`Location`} />
        <PieChart data={data.host.slice(0,20)} title={`Host`} />
        <PieChart data={data.sample_type.slice(0,20)} title={`Sample type`} />
      </section>
    </div>
  );
}

