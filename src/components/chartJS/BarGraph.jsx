import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const BarGraph = ({ data, title = 'Bar graph data representation', displayLegend }) => {
  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: displayLegend,
        position: 'top',
      },
      title: {
        display: true,
        text: title,
      },
    },
  };

  return <Bar options={options} data={data} />;
}

export default BarGraph;
