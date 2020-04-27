const express = require('express');
const server = express();
const jwt= require('jsonwebtoken');
var cors=require('cors');
var md5= require('md5');

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
    var password= req.body.contrasena;
    sequelize.query('INSERT INTO clientes VALUES (?,?,?,?,?,?)',
        {replacements:[null, req.body.nombre, req.body.email, md5(password), req.body.direccion, false]})
        .then(response=>{
            res.status(400).json({msj:"Login ingresado"});

        })
});

//validar el usuario

const firma ="password";
const validarUsuario = async (req,res,next) =>{
    let{nombre,contrasena} = req.body;
    try{
        let resultado= await sequelize.query(`SELECT * FROM clientes WHERE nombre = '${nombre}'`,{type: sequelize.QueryTypes.SELECT})
        .then(res=>{
            return res
        })
        if(resultado[0].nombre === nombre && resultado[0].contrasena === contrasena){
            let token= await jwt.sign(resultado[0], firma);
            res.status(200).json({token:token});

        } else{
            res.status(401).json({msj: "Usaurio o contraseña invalida"});
        }
    }catch{
        res.status(401).json({msj: "Usaurio o contraseña invalida"});
    }
    next();
};

const autorizarUser = async(req,res,next) =>{
    let token= req.headers.authorization;
    console.log(token);
    try{
        decode = jwt.verify(token, firma);
        console.log(decode);
        if(decode){
            [request.nombre, request.admin] = [decode.nombre, request.admin];
            next();
        }else{
            throw "no tiene permisos";
        }
    }catch (error){
        response.status(401).json({msj: 'login invalido'});
    }
}

server.get('/login', validarUsuario, (req, res)=>{
    res.json({msj: 'Bienvenido ' + req.nombre});
});

// el usuario se loguea 
server.post('/login',(req, res) =>{
   let email= req.body.email;
   let password = req.body.contrasena;
    console.log(email);
   let datos= await sequelize.query('SELECT * FROM clientes WHERE email = ?, contrasena =? ',
    {replacements:[email, password], type: sequelize.QueryTypes.SELECT}
   ).then(res =>{
       return(res);
   });

   if(datos[0]===null){
       res.status(400).send('error: las credenciales son incorrectas');
   } else if(datos[0].email!===email){
       res.status(400).send('error: las credenciales ingresadas son incorrectas');
   } else {
        res.status(200).send('las crendenciales son correctas');
   }

});


