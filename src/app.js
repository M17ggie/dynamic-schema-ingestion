import express from 'express';
import { deleteRecordById, getRecordById, getRecords, insertRecords, updateRecordById } from './controllers.js';

const app = express();

app.use(express.json());

app.route(`/:collection`).get(getRecords).post(insertRecords)

app.route(`/:collection/:id`).get(getRecordById).put(updateRecordById).delete(deleteRecordById)

export default app;