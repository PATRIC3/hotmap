/**
 * app.js
 *
 * Demo app using heatmap.
 *
 * Authors: nconrad
 *
 */
import Heatmap from '../src/heatmap';

document.addEventListener('DOMContentLoaded', () => {
    let ele = document.querySelector('#chart');
    let dataPath = ele.getAttribute('data-path');

    let heatmap;

    let statusHandle = loading(ele);
    fetch(dataPath)
        .then(res => res.json())
        .then(data => {
            console.log('data input:', data);
            heatmap = loadViewer({ele, data});
        }).catch((e) => {
            console.log(e);
            alert(`Could not load viewer. Please contact owner.`);
        });

    clearInterval(statusHandle);

    // example of updating the chart
    let updateBtn = document.querySelector('.update-btn');
    if (!updateBtn) return;

    document.querySelector('.update-btn').onclick = () => {
        let data = heatmap.getState();
        let rows = data.rows.slice(0, 5),
            matrix = data.matrix.slice(0, 5);

        heatmap.update({rows, matrix});
    };
});


function loadViewer({ele, data}) {
    let {rows, cols, matrix} = data;
    let rowCatLabels = ['Isolation Country', 'Host', 'Genome Group'];
    let heatmap = new Heatmap({
        ele, rows, cols, matrix,
        rowsLabel: 'Genomes',
        colsLabel: 'Protein Families',
        rowCatLabels: rowCatLabels,
        colCatLabels: ['Protein Family ID'],
        color: {
            bins: ['=0', '=1', '=2', '<20', '>=20'],
            colors: ['#ffffff', '#fbe6e2', 0xffadad, 0xff6b6b, 0xff0000]
        },
        defaults: {cellWidth: 20},
        onHover: info => {
            let cs = info.rowCategories;
            return `
             <div><b>Genome:</b> ${info.yLabel}</div><br>
             <div><b>Protein Family:</b> ${info.xLabel}<div>
             <div><b>ID:</b> ${info.colCategories[0]}<div><br>
             <div><b>${rowCatLabels[0]}:</b> ${cs && cs[0] != 'undefined' ? cs[0] : 'N/A'}</div>
             <div><b>${rowCatLabels[1]}:</b> ${cs && cs[1] != 'undefined' ? cs[1] : 'N/A'}</div>
             <div><b>${rowCatLabels[2]}:</b> ${cs && cs[2] != 'undefined' ? cs[2] : 'N/A'}</div><br>
             <div><b>Value:</b> ${info.value}</div>`;
        }
    });

    return heatmap;
}


function loading(ele) {
    let i = 0;
    let handle = setInterval(() => {
        ele.innerHTML = `<br>loading${'.'.repeat(i % 4)}`;
        i += 1;
    }, 300);

    return handle;
}

/*
  Example mock data:
    let {xLabels, yLabels, matrix} = getMockData({
        m: 100,
        n: 150
    })
*/
function getMockData({m, n, random, numOfBins, gradient, gradientBottom}) {
    let size = m * n;
    let matrix = [];
    for (let i = 0; i < m; i++) {
        let row = [];
        for (let j = 0; j < n; j++) {
            let val;
            if (numOfBins)
                val = (Math.floor(Math.random() * numOfBins) + 1) / numOfBins;
            else if (random)
                val = Math.random();
            else if (gradient)
                val = i * j / size;
            else if (gradientBottom)
                val = i * i / size;
            else
                val = Math.random();

            row.push(val);
        }
        matrix.push(row);
    }

    let labels = getMockLabelNames(m, n);

    return {xLabels: labels.x, yLabels: labels.y, matrix};
}


function getMockLabelNames(m, n) {
    let labels = { x: [], y: [] };
    for (let i = 0; i < m; i++) {
        labels.y.push(`This is row ${i}`);
    }

    for (let j = 0; j < n; j++) {
        labels.x.push(`This is column ${j}`);
    }
    return labels;
}


function trimData(data) {
    let rows = data.col_nodes.map(row => {
        return {
            categories: [
                row['cat-1'].replace('Isolation Country: ', ''),
                row['cat-2'].replace('Host Name: ', ''),
                row['cat-3'].replace('Genome Group: ', ''),
            ],
            name: row.name
        };
    });

    let cols = data.row_nodes.map(row => {
        return {
            categories: [row['cat-0'].replace('FAMILY ID: ', '')],
            name: row.name
        };
    });

    let matrix = transpose(data.mat);

    return {rows, cols, matrix};
}


// simple matrix transpose
function transpose(matrix) {
    let numOfRows = matrix.length,
        numOfCols = matrix[0].length;

    let matrixT = [];
    for (let i = 0; i < numOfCols; i++) {
        matrixT.push([]);
    }

    // for each row in provided matrix
    for (let rowIdx = 0; rowIdx < numOfRows; rowIdx++) {
        // iterate each element, add to matrix T
        for (let j = 0; j < numOfCols; j++) {
            matrixT[j][rowIdx] = matrix[rowIdx][j];
        }
    }

    return matrixT;
}

