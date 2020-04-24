const express = require('express');
const server = express();
const jwt= require('jsonwebtoken');
var cors=require('cors');

const bodyParser= require('body-parser');

const Sequelize= require("sequelize");
const sequelize= new Sequelize('mysql://root:root@localhost:8889/delilah');
const sql= require('mysql2');

server.listen(3000, () => {
    console.log("Servidor iniciado...");
}) ;

server.use([cors(), bodyParser.json()]);

server.get('/users',async (req,res)=>{
    let datos=await sequelize.query('SELECT * FROM clientes',
        {type: sequelize.QueryTypes.SELECT}
    ).then (function (resultados){
        return resultados;
    });

    res.json(datos);
});

// crear usuario -> en el campo de admin poner por default false
server.post('/register', (req,res) => {
    sequelize.query('INSERT INTO clientes VALUES (?,?,?,?,?,?)',
        {replacements:[null, req.body.nombre, req.body.email, req.body.contrasena, req.body.direccion, false]})
        .then(response=>{
            res.status(400).json({msj:"Login ingresado"});

        })
});

//validar el usuario

const firma= 'password';
const informacion ={name:"Agustina"};
const token= jwt.sign(informacion,firma);
console.log("token " + token);
//const token_decodificado= jwt.verify(token,firma);
//console.log(token_decodificado);

module.exports = server;


