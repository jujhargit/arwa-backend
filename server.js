const express = require('express');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const router = require('./routes/call-ai');
dotenv.config();
const app = express();
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const port = process.env.PORT

app.use(router);

app.get('/',(req,res)=>{
    res.send("Sever is Running")
})


app.listen(port,()=>{
    console.log(`server is running on port ${port}`)
});
