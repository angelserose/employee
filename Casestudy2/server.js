// Server entrypoint (clean copy) - created because app.js in workspace had repeated content.
// This file contains the same backend implementation and can be used to run the server.

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, 'dist', 'Frontend')));

const mongoURI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/employeeDB';

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err.message));

const employeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  position: { type: String, required: true },
  salary: { type: Number, required: true },
}, { timestamps: true });

const Employee = mongoose.model('Employee', employeeSchema);

app.get('/api/employeelist', async (req, res) => {
  try {
    const employees = await Employee.find().sort({ createdAt: -1 });
    res.json(employees);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
});

app.get('/api/employeelist/:id', async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid ID' });
  try {
    const emp = await Employee.findById(id);
    if (!emp) return res.status(404).json({ error: 'Employee not found' });
    res.json(emp);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch employee' });
  }
});

app.post('/api/employeelist', async (req, res) => {
  const { name, location, position, salary } = req.body;
  if (!name || !location || !position || salary === undefined) return res.status(400).json({ error: 'Missing required fields' });
  try {
    const newEmp = new Employee({ name, location, position, salary });
    const saved = await newEmp.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create employee' });
  }
});

app.put('/api/employeelist', async (req, res) => {
  const { _id, name, location, position, salary } = req.body;
  if (!_id || !mongoose.Types.ObjectId.isValid(_id)) return res.status(400).json({ error: 'Valid _id required' });
  try {
    const updated = await Employee.findByIdAndUpdate(_id, { name, location, position, salary }, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ error: 'Employee not found' });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update employee' });
  }
});

app.delete('/api/employeelist/:id', async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid ID' });
  try {
    const deleted = await Employee.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: 'Employee not found' });
    res.json({ message: 'Employee deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete employee' });
  }
});

// Serve frontend for any non-API route
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(__dirname, 'dist', 'Frontend', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
