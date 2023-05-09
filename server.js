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

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/index.html'));
});

// API routes
app.get('/api/notes', (req, res) => {
    fs.readFile(path.join(__dirname, '/db.json'), 'utf8', (err, data) => {
        if (err) {
            console.log(err);
        return res.status(500).end();
    }
    res.json(JSON.parse(data));
});
});

app.post('/api/notes', (req, res) => {
    const newNote = req.body;
        newNote.id = uuid.v4();
            fs.readFile(path.join(__dirname, '/db.json'), 'utf8', (err, data) => {
    if (err) {
        console.log(err);
    return res.status(500).end();
    }
    const notes = JSON.parse(data);
    notes.push(newNote);
    fs.writeFile(path.join(__dirname, '/db.json'), JSON.stringify(notes), (err) => {
        if (err) {
        console.log(err);
        return res.status(500).end();
    }
    res.json(newNote);
        });
    });
});


app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});
