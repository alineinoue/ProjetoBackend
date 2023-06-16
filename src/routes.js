const express = require('express');
const router = express.Router();

const Auth = require('./middlewares/Auth');

const AuthValidator = require('./validators/AuthValidator');


const AuthController = require('./controllers/AuthController');
const UserController = require('./controllers/UserController');
const ProductController = require('./controllers/ProductController');

router.get('/teste', (req, res) => {
    res.json({teste: true});
});

router.post('/user/signin', AuthValidator.signin, AuthController.signin);
router.post('/user/signup', AuthValidator.signup, AuthController.signup);

router.get('/user/me', Auth.private, UserController.info);
router.put('/user/me', Auth.private, UserController.edit);

router.get('/category', ProductController.getCategorias);

//Adicionar produto
router.post('/product/add', Auth.private, ProductController.add);
//Listar produto
router.get('/product/list', ProductController.getList);
//Listar produto específico
router.get('/product/item', ProductController.getItem);
//Alterar informações do produto, como pode imagem, n pode usar o método put.
router.post('/product/:id', Auth.private, ProductController.edit);

module.exports = router;
