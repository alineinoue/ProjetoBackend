const express = require('express');
const router = express.Router();

const Auth = require('./middlewares/Auth');

const AuthValidator = require('./validators/AuthValidator');
const UserValidator = require('./validators/UserValidator');

const AuthController = require('./controllers/AuthController');
const UserController = require('./controllers/UserController');
const ProductController = require('./controllers/ProductController');
const CategoryController = require('./controllers/CategoryController');
const AdminController = require('./controllers/AdminController');
const InstallController = require('./controllers/InstallController');

// Rota de instalação do banco de dados
router.get('/install', InstallController.installDatabase);

//Cadastro usuário
router.post('/user/signup', AuthValidator.signup, AuthController.signup);
//Login usuário
router.post('/user/signin', AuthValidator.signin, AuthController.signin);
//Cadastro admin
router.post('/admin/signup', AuthValidator.signup, AdminController.createAdmin);
//Deletar usuário não administrador
router.delete('/admin/user/:id', Auth.private, AdminController.deleteUser);


router.get('/user/me', Auth.private, UserController.info);
router.put('/user/me/edit', UserValidator.edit, Auth.private, UserController.edit);
//Administrador edita um usuário pelo id 
router.put('/user/edit/:id', UserValidator.edit, Auth.private, AdminController.editUser);


//Adicionar nova categoria
router.post('/category/add', Auth.private, CategoryController.add);
//Listar categorias
router.get('/categories', CategoryController.getCategorias);
//Atualizar categoria
router.put('/category/:id', Auth.private, CategoryController.edit);
//Deletar categoria
router.delete('/category/:id', Auth.private, CategoryController.delete);


//Adicionar produto
router.post('/product/add', Auth.private, ProductController.add);
//Listar produto
router.get('/product/list', ProductController.getList);
//Listar produto específico
router.get('/product/item', ProductController.getItem);
//Alterar informações do produto
router.put('/product/:id', Auth.private, ProductController.edit);
//Deletar produto
router.delete('/product/:id', Auth.private, ProductController.delete);

module.exports = router;
