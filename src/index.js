const express = require('express');
const { v4: uuid } = require('uuid');

const app = express();

app.use(express.json());

const custumers = [];

/**
 * cpf - string
 * name - string
 * id -  uuid
 * statement - array
 */
app.post("/account", (req, res) => {
    const {cpf, name} = req.body;
    const id = uuid();
    custumers.push({
        id,
        name,
        cpf,
        statement: []
    });
    return res.status(200).send();
});

app.listen(3000, () => {
    console.log("is running!");
});