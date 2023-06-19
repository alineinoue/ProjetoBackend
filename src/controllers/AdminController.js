const { validationResult, matchedData } = require('express-validator');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const dotenv = require('dotenv');

dotenv.config();

module.exports = {
    createAdmin: async (req, res) => {
        let { token } = req.body;
      
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          res.json({ error: errors.mapped() });
          return;
        }
      
        const data = matchedData(req);
      
        try {
          // Verificar se o token pertence a um usuário administrador
          const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
          const user = await User.findById(decodedToken.id);
          if (!user || !user.isAdmin) {
            return res.json({ error: 'Apenas administradores podem criar outros administradores' });
          }
      
          // Verificar se o email já existe
          const existingUser = await User.findOne({ email: data.email });
          if (existingUser) {
            return res.json({ error: { email: { msg: 'Email já cadastrado!' } } });
          }
      
          // Criação do usuário
          const newUser = new User({
            name: data.name,
            email: data.email,
            password: data.password,
            isAdmin: true
          });
          const newToken = jwt.sign(
            { id: newUser.id, email: newUser.email },
            process.env.JWT_SECRET_KEY,
            { expiresIn: '2h' }
          );
      
          newUser.token = newToken; // Atribuir o valor do novo token depois de inicializá-lo
          await newUser.save();
      
          return res.status(201).json({ mensagem: 'Usuário Administrador foi criado com sucesso!', id: newUser.id });
      
        } catch (error) {
          console.error(error);
          res.status(500).json({ error: 'Erro no servidor' });
        }
      },
      deleteUser: async (req, res) => {
        const { id } = req.params;
      
        if (id.length < 12) {
          res.json({ error: 'ID inválido' });
          return;
        }
      
        try {
          const user = await User.findById(id).exec();
          if (!user) {
            res.json({ error: 'Usuário não encontrado!' });
            return;
          }
      
          // Verificar se o usuário é um administrador
          if (!req.user.isAdmin) {
            res.json({ error: 'Apenas usuários administradores podem excluir outros usuários!' });
            return;
          }
      
          // Verificar se o usuário a ser excluído também é um administrador
          if (user.isAdmin) {
            res.json({ error: 'Não é possível excluir um usuário administrador!' });
            return;
          }
      
          await User.deleteOne({ _id: id });
      
          res.json({ mensagem: 'Usuário excluído com sucesso!' });
        } catch (error) {
          console.error(error);
          res.status(500).json({ error: 'Erro no servidor' });
        }
      },      
      editUser: async (req, res) => {
        const { id } = req.params;
      
        try {
          // Verifica se o usuário logado é um administrador
          if (!req.user.isAdmin) {
            res.json({ error: 'Apenas usuários administradores podem editar outros usuários' });
            return;
          }
      
          const errors = validationResult(req);
          if (!errors.isEmpty()) {
            res.json({ error: errors.mapped() });
            return;
          }
      
          const data = matchedData(req);
      
          // Verificar a validade do token
          jwt.verify(data.token, process.env.JWT_SECRET_KEY);
          // O token é válido, pode prosseguir com a lógica do método
      
          let updates = {};
      
          if (data.name) {
            updates.name = data.name;
          }
      
          if (data.email) {
            const emailCheck = await User.findOne({ email: data.email });
            if (emailCheck) {
              res.json({ error: 'Email já existe!' });
              return;
            }
            updates.email = data.email;
          }
      
          if (data.password) {
            updates.password = data.password;
          }
      
          await User.findOneAndUpdate({ _id: id }, { $set: updates });
      
          res.json({ mensagem: 'Usuário editado com sucesso!' });
        } catch (error) {
          console.error(error);
          res.status(500).json({ error: 'Erro no servidor' });
        }
      }      
};