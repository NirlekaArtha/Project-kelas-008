import express from 'express';
import { config } from './config';

const app = express();

app.get('/', (req,res)=> {
	res.send(`Server running in ${config.env} mode`);
});

app.listen(config.port, () => {
	console.log(`Server started on ${config.port}`)
	console.log(`Env: ${config.env}`)
})
