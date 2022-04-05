const express = require('express');
const { v4: uuid } = require('uuid');

const app = express();

app.use(express.json());

const custumers = [];

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


function verifyifAccountExistsCPF(req, res, next) {
    const { cpf } = req.headers;

    const custumer = custumers.find(custumer => custumer.cpf === cpf);

    if(!custumer){
        return res.status(400).json({ error: "Cliente não encontrado"})
    }

    req.custumer = custumer;

    return next();
}

function getBalance(statement) {
    const balance = statement.reduce((acc, operation) => {
        if(operation.type === 'credit'){
            return acc + operation.amount;
        }

        if(operation.type === 'debit'){
            return acc - operation.amount;
        }
    }, 0);
    return balance;
}

app.get("/statement", verifyifAccountExistsCPF, (req, res) => {
    const {custumer } = req;
    return res.json(custumer.statement);
});

app.post("/deposit", verifyifAccountExistsCPF, (req, res) => {
    const {description, amount} = req.body;
    const { custumer } = req;
    
    const statementOperation = {
        description,
        amount,
        created_at: new Date(),
        type: 'credit'
    }

    custumer.statement.push(statementOperation);

    return res.status(201).send();
});

app.post("/withdraw", verifyifAccountExistsCPF, (req, res) => {
    const { amount} = req.body;
    const { custumer } = req;

    const balance = getBalance(custumer.statement);

    if(balance < amount){
        res.status(400).json({error: "Saldo insuficiente!"});
    } 

    const statementOperation = {
        amount,
        created_at: new Date(),
        type: 'debit'
    }

    custumer.statement.push(statementOperation);

    return res.status(200).json({
        message: "Saque efetuado com sucesso"
    })
});

app.listen(3000, () => {
    console.log("is running!");
});