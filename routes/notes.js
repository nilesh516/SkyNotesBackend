const express = require('express')
const router = express.Router();
const fetchuser = require('../middleware/fetchuser');
const { body, validationResult } = require('express-validator');
const Notes = require('../models/Notes')


// ROUTE 1 : Fetch All notes using : GET api/notes/fetchallnotes  - Login required
router.get('/fetchallnotes', fetchuser, async (req, res) => {
    try {
        const notes = await Notes.find({ user: req.user.data })
        res.json(notes)
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal server Error");
    }

})

// ROUTE 2 : Add  new notes using : POST api/notes/addnote - Login required
router.post('/addnote', fetchuser, [
    body('title', 'Title length atleast should be 3 characters').isLength({ min: 3 }),
    body('description', 'description must be atleast 5 characters').isLength({ min: 5 }),
], async (req, res) => {
    // if there are errors, return bad request and the errors.
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, tag } = req.body;
    try {
        const note = new Notes({
            title, description, tag, user: req.user.data
        })
        const savedNote = await note.save();
        res.json(savedNote)

    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal server Error");
    }
})

// ROUTE 3 : Update  existing notes using : POST api/notes/updatenote/:id - Login required
router.put('/updatenote/:id', fetchuser, async (req, res) => {
    const { title, description, tag } = req.body;

    try {
        // create new note object
        const newNote = {};
        if (title) { newNote.title = title }
        if (description) { newNote.description = description }
        if (tag) { newNote.tag = tag }

        // find a note to be updated and update it

        let note = await Notes.findById(req.params.id);  // if parameter id is not matched then note is not found
        if (!note) { return res.status(400).send('Not Found') }

        if (note.user.toString() !== req.user.data) {
            return res.status(401).send('Not Allowed');         // if the user tries to delete others note then not allowed
        }

        note = await Notes.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true })
        res.json({ note });

    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal server Error");
    }


})

// ROUTE 4 : Delete  existing notes using : DELETE api/notes/deletenote/:id - Login required
router.delete('/deletenote/:id', fetchuser, async (req, res) => {

    try {
        // find a note to be delete and delete it
        let note = await Notes.findById(req.params.id);  // if parameter id is not matched then note is not found
        if (!note) { return res.status(400).send('Not Found') }

        //Allow deletion only if user owns this note
        if (note.user.toString() !== req.user.data) {
            return res.status(401).send('Not Allowed');         // if the user tries to delete others note then not allowed
        }

        note = await Notes.findByIdAndDelete(req.params.id)
        res.json({ Sucess: "Note has been deleted!", note: note });

    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal server Error");
    }


})
module.exports = router