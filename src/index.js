const express = require('express');
const { v4: uuid } = require('uuid');

const app = express();

app.use(express.json());

const custumers = [];

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

app.put("/account",verifyifAccountExistsCPF, (req, res) => {
    const { name } = req.body;
    const { custumer } = req;

    custumer.name = name;

    return res.status(201).send();

});

app.get("/account", verifyifAccountExistsCPF,  (req, res) =>{
    const { custumer } = req;
    return res.status(200).json({ 
        name: custumer.name,
        cpf: custumer.cpf
    });
});

app.delete("/account", verifyifAccountExistsCPF,  (req, res) =>{
    const { custumer } = req;
    custumers.splice(custumer, 1);
    return res.status(200).json(custumers);
});

app.get("/statement", verifyifAccountExistsCPF, (req, res) => {
    const {custumer } = req;
    const makeStatement = {
        statement: custumer.statement,
        balance: getBalance(custumer.statement),
    }
    return res.json(makeStatement);
});

app.get("/statement/data", verifyifAccountExistsCPF, (req, res) => {
    const { custumer } = req;
    const { date } = req;
    const dateFormat = new Date(date + " 00:00");

    const statement = custumer.statement.filter((statement ) => statement.created_at.toDateString() === new Date(dateFormat).toDateString());
    return res.json(statement);
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