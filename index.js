import app from "./src/app.js";
import path from "path"
import { fileURLToPath } from 'url';

// env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, 'config', '.env')
import dotenv from 'dotenv';
dotenv.config({ path: envPath });

app.listen(process.env.PORT, () => {
    console.log(`Listening to PORT: ${process.env.PORT}`)
})