const express = require('express');
const router = express.Router();

const Auth = require('./middlewares/Auth');

const AuthValidator = require('./validators/AuthValidator');
const UserValidator = require('./validators/UserValidator');


const AuthController = require('./controllers/AuthController');
const UserController = require('./controllers/UserController');
const ProductController = require('./controllers/ProductController');
const CategoryController = require('./controllers/CategoryController');

router.get('/teste', (req, res) => {
    res.json({teste: true});
});

router.post('/user/signin', AuthValidator.signin, AuthController.signin);
router.post('/user/signup', AuthValidator.signup, AuthController.signup);

router.get('/user/me', Auth.private, UserController.info);
router.put('/user/me', UserValidator.edit, Auth.private, UserController.edit);

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
