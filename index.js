const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;
const fs = require('fs');
const readline = require('readline');

app.use(express.static(__dirname + "/app"))

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.sendFile('index.html' , { root : __dirname});
});

app.get('/admin', (req, res) => {
	res.sendFile('/app/resultsOfSurvey.html' , { root : __dirname});
});

function getCurrentDate() {
  // Replace this with your logic to get the current date in the desired format
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

app.get('/api/survey-responses', (req, res) => {

	const filePath = 'database.txt'; // Replace with your file path

	const surveyResponses = [];

	const rl = readline.createInterface({
	  input: fs.createReadStream(filePath),
	  crlfDelay: Infinity
	});

	rl.on('line', (line) => {
	  const values = line.split(';');
	  const surveyResponse = {
	    date: getCurrentDate(), // Replace with your date logic
	    textQuestion: values[0],
	    question1: values[1],
	    question2: values[2],
	    options: [values[3]],
	    question4: values[4],
	    featureLocate: values[5],
	    comments: values[6]
	  };
	  surveyResponses.push(surveyResponse);
	});

	rl.on('close', () => {
  		console.log(surveyResponses);
	    res.json(surveyResponses);
	});
});

app.post("/submit", (req, res) => {
    const textQuestion = req.body.textQuestion;
    const question1 = req.body.question1;
    const question2 = req.body.question2;
    const options = req.body.options;
    const question4 = req.body.question4;
    const featureLocate = req.body.featureLocate;
    const additionalComments = req.body.comments;


	// Data to be appended
	const dataToAppend = textQuestion + ";" + question1 + ";" + question2 + ";" + options + ";" + question4 + ";" + featureLocate + ";" + additionalComments;
	const filePath = 'database.txt';

	// Read the existing content in the file
	fs.readFile(filePath, 'utf8', (readErr, existingData) => {
	    if (readErr) {
	        console.error('Error reading file:', readErr);
	    } else {
	        // Append data to the file with newline character
	        const newData = existingData ? existingData + '\n' + dataToAppend : dataToAppend;
	        
	        fs.writeFile(filePath, newData, (writeErr) => {
	            if (writeErr) {
	                console.error('Error writing to file:', writeErr);
	            } else {
	                console.log('Data appended to file successfully.');
	            }
	        });
	    }
	});

	res.redirect("/admin");
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
