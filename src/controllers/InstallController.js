const Categoria = require('../models/Category');
const Produto = require('../models/Product');
const Usuario = require('../models/User');
const mongoose = require('mongoose');
const ObjectID = mongoose.Types.ObjectId;

const InstallController = {
  installDatabase: async (req, res) => {
    try {
      // Criação das tabelas

      // Tabela Categoria
      await Categoria.create([
        { name: 'Categoria 1', slug: 'categoria-1' },
        { name: 'Categoria 2', slug: 'categoria-2' },
        { name: 'Categoria 3', slug: 'categoria-3' },
        { name: 'Categoria 4', slug: 'categoria-4' },
        { name: 'Categoria 5', slug: 'categoria-5' }
      ]);

      // Tabela Produto
      await Produto.create([
        { idUser: new ObjectID('649085fca2610a126f09f9db'), title: 'Produto 1', category: 'categoria-1', price: 60, description: 'Descrição do Produto 1' },
        { idUser: new ObjectID('649085fca2610a126f09f9db'), title: 'Produto 2', category: 'categoria-1', price: 100, description: 'Descrição do Produto 2' },
        { idUser: new ObjectID('648f74c7ee35374897b570b4'), title: 'Produto 3', category: 'categoria-2', price: 50, description: 'Descrição do Produto 3' },
        { idUser: new ObjectID('648d21b252d560b4b01a1370'), title: 'Produto 4', category: 'categoria-3', price: 99.50, description: 'Descrição do Produto 4' },
        { idUser: new ObjectID('649085fca2610a126f09f9db'), title: 'Produto 5', category: 'categoria-4', price: 20, description: 'Descrição do Produto 5' },
    ]);

      // Tabela Usuario
      await Usuario.create([
        { name: 'Usuário 1', email: 'usuario1@hotmail.com', password: '123', isAdmin: false, idUser: new ObjectID('649085fca2610a126f09f9db') },
        { name: 'Usuário 2', email: 'usuario2@hotmail.com', password: '123', isAdmin: false, idUser: new ObjectID('648f74c7ee35374897b570b4') },
        { name: 'Usuário Administrador', email: 'admin@hotmail.com', password: '123', isAdmin: true, idUser: new ObjectID('648f74c7ee35374897b570b4') },
        { name: 'Usuário Administrador 2', email: 'admin2@hotmail.com', password: '123', isAdmin: true, idUser: new ObjectID('648d21b252d560b4b01a1370')},
        { name: 'Usuário 3', email: 'usuario3@hotmail.com', password: '123', isAdmin: false, idUser: new ObjectID('649085fca2610a126f09f9db')}
      ]);

      res.json({ message: 'Banco de dados instalado com sucesso!' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao instalar o banco de dados' });
    }
  }
};

module.exports = InstallController;
