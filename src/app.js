import express from 'express';
import { getRecordById, getRecords, insertRecords, updateRecordById } from './controllers.js';

const app = express();

app.use(express.json());

app.route(`/:collection`).get(getRecords).post(insertRecords)

app.route(`/:collection/:id`).get(getRecordById).put(updateRecordById)

app.delete(`/:collection/:id`, () => {

})

export default app;