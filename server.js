const express = require('express');
const fs = require('fs');
const path = require('path');
const uuid = require('./helpers/uuid');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

// HTML routes
app.get('/notes', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/notes.html'));
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/index.html'));
});

const readFromFile = (file) =>  
    fs.readFileSync(path.join(__dirname, file),'utf8', (err, data) =>
    err ? console.error(err) : console.log(data)
);


/**
 *  Function to write data to the JSON file given a destination and some content
 *  @param {string} destination The file you want to write to.
 *  @param {object} content The content you want to write to the file.
 *  @returns {void} Nothing
 */
const writeToFile = (destination, content) =>
fs.writeFile(destination, JSON.stringify(content, null, 4), (err) =>
    err ? console.error(err) : console.info(`\nData written to ${destination}`)
);

/**
 *  Function to read data from a given a file and append some content
 *  @param {object} content The content you want to append to the file.
 *  @param {string} file The path to the file you want to save to.
 *  @returns {void} Nothing
 */
const readAndAppend = (content, file) => {
    fs.readFile(file, 'utf8', (err, data) => {
        if (err) {
        console.error(err);
        } else {
        const parsedData = JSON.parse(data);
        parsedData.push(content);
        writeToFile(file, parsedData);
    }
});
};

// API routes
app.get('/api/notes', (req, res) => {
    fs.readFile('./db/db.json', 'utf8', (err, data) => {
        if (err) {
            console.log(err);
        } else {
            res.json(JSON.parse(data));
        }
    })
});

app.post('/api/notes', (req, res) => {
    const { title, text } = req.body;
    if (title && text) {
        const newNote = {
            title,
            text,
            id: uuid(),
        };
        const priorNotes = JSON.parse(fs.readFileSync('./db/db.json'));
        priorNotes.push(newNote);
        fs.writeFileSync('./db/db.json', JSON.stringify(priorNotes), (err) => {
            err 
            ? console.log(err) 
            : console.log(`Review for ${newNote.title} has been written to JSON file`)
        });
        const response = {
            status: 'success',
            body: newNote,
        };
        console.log(response);
        return res.json(response);
    } else {
        res.status(500).json('Error in posting review');
    }
});

// delete notes
function deleteNote(id, parsedData) {
    console.log(parsedData);
    for (let i = 0; i< parsedData.length; i++){
        let note = parsedData[i];

        if (note.id == id) {
            parsedData.splice(i, 1);
            console.log(parsedData);


            break;
        }
    }
return parsedData;
}

const readAndDelete = (id, file, callback) => {
    fs.readFile(file, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
        } else {
            let parsedData = JSON.parse(data);
            parsedData = deleteNote(id, parsedData);
            writeToFile(file, parsedData);
            callback();
        }
    });
};

app.delete('/api/notes/:id', (req, res) => {
    readAndDelete(req.params.id, './db/db.json', () => {
        res.json(true);
    });
});



app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});


module.exports = { readFromFile, writeToFile, readAndAppend };