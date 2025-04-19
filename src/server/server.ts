import express from 'express';
import { config } from './config';

const app = express();

app.get('/', (req,res)=> {
	res.send(`Server running in ${config.env} mode`);
});

app.get("/api", (req,res,next) => {
	res.json({title: "04tplp008"});
	next();
})

app.listen(config.port, () => {
	console.log(`Server started on ${config.port}`)
	console.log(`Env: ${config.env}`)
})
