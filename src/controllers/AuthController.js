const {validationResult, matchedData} = require('express-validator');
const mongoose = require('mongoose');
const JWT = require('jsonwebtoken');
const User = require('../models/User');
const dotenv = require('dotenv');

dotenv.config();

module.exports = {
    signin: async (req, res) => {        
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            res.json({error: errors.mapped()});
            return;
        }

        const data = matchedData(req);

        //Validando o email
        const user = await User.findOne({email: data.email, password: data.password});
        if(user){
            const token = JWT.sign(
                {id: user.id, email: user.email},
                process.env.JWT_SECRET_KEY,
                {expiresIn: '2h'}
            );

            res.json({status: true, token});
            return;
        } else {
            res.json({error: 'Email e/ou senha errados!'});
        }
    },
    signup: async (req, res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            res.json({error: errors.mapped()});
            return;
        }

        const data = matchedData(req);

        //Validação se email já existe email
        const user = await User.findOne({
            email: data.email
        });
        if(user){
            res.json({
                error: {email: {msg: 'Email já cadastrado!'}}
            });
            return;
        }

        //Criação do user
        const newUser = new User({
            name: data.name, 
            email: data.email,
            password: data.password
        })
        await newUser.save();

        res.json({camposvalidados: true, data});
    }
};