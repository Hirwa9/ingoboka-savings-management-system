import React from 'react'
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Title, Tooltip, Legend);

const PieGraph = ({ data, title = 'Bar graph data representation', displayLegend }) => {
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

    return <Pie options={options} data={data} />;
}

export default PieGraph;
