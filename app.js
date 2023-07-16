const MODEL = './weightsKeras.h5';
const app = document.querySelector("#app");
const startBtn = document.querySelector("#start-button");
const stopBtn = document.querySelector("#stop-button");
const ctx = document.getElementById('myChart');
const audioElement = document.getElementById('audio-element');
const width = 640;
const height = 480;
let started = false;
let data = [];
let myChart;
let periodicEmotion = null;
const emotionSamplingPeriod = 15;
let isSongPlaying = false;

const faceMode = affdex.FaceDetectorMode.LARGE_FACES;
const detector = new affdex.CameraDetector(app, width, height, faceMode);
detector.detectExpressions.smile = true;
detector.detectEmotions.joy = true;
detector.detectAppearance.gender = true;
detector.detectAllEmotions();
detector.detectAllExpressions();

startBtn.addEventListener("click", () => {
    if (!started) {
        started = true;
        detector.start();
    }
});

stopBtn.addEventListener("click", () => {
    if (started) {
        started = false;
        detector.stop();
        compileEmotionData();
        clearInterval(periodicEmotion);
    }
});

detector.addEventListener("onInitializeSuccess", () => {
    console.log('initialized successfully');
    if (!myChart) {
        myChart = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ['Fear 😱', 'Normal 😐', 'Anger 😡', 'Joy 😂', 'Sadness 😢', 'Surprise 😲'],
                datasets: [{
                    label: 'Probability on the scale of 0-100',
                    data: [0, 0, 0, 0, 0, 0],
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.2)',
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(255, 206, 86, 0.2)',
                        'rgba(75, 192, 192, 0.2)',
                        'rgba(153, 102, 255, 0.2)',
                        'rgba(182, 245, 66, 0.2)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(182, 245, 66, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                }
            }
        });
    }
    if (!periodicEmotion) {
        clearInterval(periodicEmotion);
    }
    periodicEmotion = setInterval(() => {
        const currentAvgMood = calculateMostOccuredEmotion();
        playVideo(currentAvgMood);
        data = [];
    }, 1000 * emotionSamplingPeriod);
});

detector.addEventListener("onInitializeFailure", () => {
    console.log('initialize failed');
});

detector.addEventListener("onWebcamConnectSuccess", () => {
    console.log("Camera successfully connected!.");
});

detector.addEventListener("onWebcamConnectFailure", () => {
    console.log("Failed to connect to the camera :(");
});

detector.addEventListener("onImageResultsSuccess", (faces, image, timestamp) => {
    if (faces.length) {
        const { emotions, expressions, appearance, measurements } = faces[0];
        myChart.data.datasets.forEach((dataset) => {
            dataset.data = [
                emotions.anger,
                emotions.disgust,
                emotions.fear,
                emotions.joy,
                emotions.sadness,
                emotions.surprise
            ];
        });
        myChart.update();
        const now = new Date();
        data.push({
            time: now.getTime(),
            gender: appearance.gender,
            ...emotions,
            ...expressions,
            interocularDistance: measurements.interocularDistance,
            pitch: measurements.orientation.pitch,
            yaw: measurements.orientation.yaw,
            roll: measurements.orientation.roll
        });
    }
});

detector.addEventListener("onImageResultsFailure", (image, timestamp, err_detail) => {});

function convertToCSV(objArray) {
    const array = objArray;
    let str = '';
    for (let i = 0; i < array.length; i++) {
        let line = '';
        for (let index in array[i]) {
            if (line !== '') {
                line += ',';
            }
            line += array[i][index];
        }
        str += line + '\r\n';
    }
    return str;
}

function exportCSVFile(headers, items, fileTitle) {
    if (headers) {
        items.unshift(headers);
    }
    const csv = convertToCSV(items);
    const exportedFilename = fileTitle + '.csv' || 'export.csv';
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    if (navigator.msSaveBlob) {
        navigator.msSaveBlob(blob, exportedFilename);
    } else {
        const link = document.createElement("a");
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", exportedFilename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }
}

function calculateMostOccuredEmotion() {
    const sumOfFace = data.reduce((sum, face) => {
        sum.anger += face.anger;
        sum.disgust += face.disgust;
        sum.fear += face.fear;
        sum.joy += face.joy;
        sum.sadness += face.sadness;
        sum.surprise += face.surprise;
        return sum;
    }, {
        anger: 0,
        disgust: 0,
        fear: 0,
        joy: 0,
        sadness: 0,
        surprise: 0
    });

    let maxEmotion = sumOfFace.anger;
    let mostOccuredEmotion = 'anger';

    for (let emotion in sumOfFace) {
        if (sumOfFace[emotion] > maxEmotion) {
            maxEmotion = sumOfFace[emotion];
            mostOccuredEmotion = emotion;
        }
    }

    return mostOccuredEmotion;
}

function playVideo(currentAvgMood) {
    if (!isSongPlaying) {
        audioElement.src = getSongUrl(currentAvgMood); // Replace 'getSongUrl' with your logic to get the song URL based on emotion
        audioElement.play();
        isSongPlaying = true;
    }
}

audioElement.addEventListener('ended', () => {
    isSongPlaying = false;
});

function compileEmotionData() {
    const headers = {
        time: 'Time',
        gender: 'Gender',
        anger: 'Anger',
        disgust: 'Disgust',
        fear: 'Fear',
        joy: 'Joy',
        sadness: 'Sadness',
        surprise: 'Surprise'
    };
    exportCSVFile(headers, data, 'FinalReport');
}
