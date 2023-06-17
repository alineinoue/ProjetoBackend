const { validationResult, matchedData } = require('express-validator');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const dotenv = require('dotenv');

dotenv.config();

module.exports = {
    signin: async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.json({ error: errors.mapped() });
            return;
        }

        const data = matchedData(req);

        //Validando o email
        const user = await User.findOne({ email: data.email, password: data.password });
        if (user) {
            const token = jwt.sign(
                { id: user.id, email: user.email },
                process.env.JWT_SECRET_KEY,
                { expiresIn: '2h' }
            );

            res.json({ status: true, token });
            return;
        } else {
            res.json({ error: 'Email e/ou senha errados!' });
        }
    },
    signup: async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.json({ error: errors.mapped() });
            return;
        }

        const data = matchedData(req);

        try {
            // Verificação se o email já existe
            const existingUser = await User.findOne({ email: data.email });
            if (existingUser) {
                return res.json({ error: { email: { msg: 'Email já cadastrado!' } } });
            }

            // Criação do usuário
            const newUser = new User({
                name: data.name,
                email: data.email,
                password: data.password,
            });
            const token = jwt.sign(
                { id: newUser.id, email: newUser.email },
                process.env.JWT_SECRET_KEY,
                { expiresIn: '2h' }
            );
            
            newUser.token = token; // Atribuir o valor do token depois de inicializá-lo
            await newUser.save();

            res.status(201).json({ mensagem: 'Usuário criado com sucesso!', id: newUser.id});


        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro no servidor' });
        }
    }
};