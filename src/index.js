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
    const custumerAlreadyExists = custumers.some((custumer) => custumer.cpf === cpf);

    if(custumerAlreadyExists){
        return res.status(400).json({message: "Usuário já existe"})
    }

    custumers.push({
        id: uuid(),
        name,
        cpf,
        statement: []
    });
    return res.status(200).send();
});

app.get("/statement", (req, res) => {
    const { cpf } = req.headers;

    const custumer = custumers.find(custumer => custumer.cpf === cpf);

    if(!custumer){
        return res.status(400).json({ error: "Cliente não encontrado"})
    }

    return res.json(custumer.statement);
});

app.listen(3000, () => {
    console.log("is running!");
});