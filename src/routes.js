const express = require('express');
const router = express.Router();

const AuthController = require('./controllers/AuthController');
const UserController = require('./controllers/UserController');
const ProductController = require('./controllers/ProductController');

router.get('/teste', (req, res) => {
    res.json({teste: true});
});

router.post('/user/signin', AuthController.signin);
router.post('/user/signup', AuthController.signup);

router.get('/user/me', UserController.info);
router.put('/user/me', UserController.edit);

router.get('/category', ProductController.getCategorias);

//Adicionar produto
router.post('/product/add', ProductController.add);
//Listar produto
router.get('/product/list', ProductController.getList);
//Listar produto específico
router.get('/product/item', ProductController.getItem);
//Alterar informações do produto, como pode imagem, n pode usar o método put.
router.post('/product/:id', ProductController.edit);

module.exports = router;
