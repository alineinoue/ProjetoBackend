//Manipulação das imagens
const {v4: uuid} = require('uuid');
const jimp = require('jimp');

const Category = require('../models/Category');
const User = require('../models/User');
const Product = require('../models/Product');
const jwt = require('jsonwebtoken');


//Imagens
const addImage = async (buffer) => {
    let newName = `${uuid()}.jpg`;
    let tmpImg = await jimp.read(buffer);
    tmpImg.cover(500, 500).quality(80).write(`./public/media/${newName}`);
    return newName;
}


module.exports = {
    getCategorias: async (req, res) => {
        const cats = await Category.find();

        let categories = [];

        for(let i in cats) {
            categories.push({
                ...cats[i]._doc,
                img: `${process.env.BASE}/assets/images/${cats[i].slug}.png`
            });
        }

        res.json({categories});

    },
    add: async (req, res) => {
        let {title, price, description, amount, cat, token} = req.body;

        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const user = await User.findById(decoded.id);

        if(!title || !cat){
            res.json({error: 'Titulo e/ou categoria não foram preenchidos'});
            return;
        }

        if(cat.length < 12){
            res.json({error: 'ID de categoria inválido!'});
            return;
        }

        const category = await Category.findById(cat);
        if(!category){
            res.json({error: 'Categoria não existe'});
            return;
        }

        //Formatação do preço
        if(price){
            price = price.replace('.', '').replace(',', '.').replace('R$', '');
            price = parseFloat(price);
        } else {
            price = 0;
        }

        const newProduct = new Product();
        newProduct.idUser = user._id.toString();
        newProduct.category = cat;
        newProduct.title = title;
        newProduct.price = price;
        newProduct.amount = amount;
        newProduct.description = description;

        if(req.files && req.files.img){
            //Apenas 1 imagem
            if(req.files.img.length == undefined){
                if(['image/jpeg', 'image/jpg', 'image/png'].includes(req.files.img.mimetype)){
                    let url = await addImage(req.files.img.data);
                    newProduct.images.push({
                        url,
                        default: false
                    });
                }
            } else { //Mais de uma imagem
                for(let i=0; i<req.files.img.length; i++){
                    if(['image/jpeg', 'image/jpg', 'image/png'].includes(req.files.img[i].mimetype)){
                        let url = await addImage(req.files.img[i].data);
                        newProduct.images.push({
                            url,
                            default: false
                        });
                    }
                }
            }
        }

        if(newProduct.images.length > 0){
            newProduct.images[0].default = true;
        }

        const info = await newProduct.save();
        res.json({id: info._id});
    },
    getList: async (req, res) => {
        let {limit = 5, q, cat, page } = req.query;
        let total = 0;
        let filters = {}; 
    
        if (q) {
            filters.title = { '$regex': q, '$options': 'i' };
        }
    
        if (cat) {
            const c = await Category.findOne({ slug: cat }).exec();
            if (c) {
                filters.category = c._id.toString();
            }
        }
    
        const productsTotal = await Product.find(filters).exec();
        total = productsTotal.length;

        const startIndex = (page - 1) * limit;

        const productsData = await Product.find(filters)
            .skip(startIndex)
            .limit(parseFloat(limit))
            .exec();
    
        let products = [];
    
        for (let i in productsData) {
            let image;
    
            let defaultImg = productsData[i].images.find(e => e.default);
            if (defaultImg) {
                image = `${process.env.BASE}/media/${defaultImg.url}`;
            } else {
                image = `${process.env.BASE}/media/default.jpg`;
            }
    
            products.push({
                id: productsData[i]._id,
                title: productsData[i].title,
                price: productsData[i].price,
                description: productsData[i].description,
                image
            });
        }
    
        res.json({ products, total });
    },    
    getItem: async (req, res) => {
        let {id, other = null} = req.query;

        if(!id){
            res.json({error: 'Sem produto'});
            return;
        }

        if(id.length < 12){
            res.json({error: 'ID inválido'});
            return;
        }   

        const product = await Product.findById(id);
        if(!product){
            res.json({error: 'Produto inexistente'});
        }

        let images = [];
        for(let i in product.images){
            images.push(`${process.env.BASE}/media/${product.images[i].url}`);
        }

        let category = await Category.findById(product.category).exec();
        let userInfo = await User.findById(product.idUser).exec();

        let others = [];
        if(other) {
            const otherData = await Product.find({idUser: product.idUser}).exec();

            for(let i in otherData){
                if(otherData[i]._id.toString() != product._id.toString()){

                    let image = `${process.env.BASE}/media/default.jpg`;

                    let defaultImg = otherData[i].images.find(e => e.default);

                    if(defaultImg){
                        image = `${process.env.BASE}/media/${defaultImg.url}`;
                    }

                    others.push({
                        id: otherData[i]._id,
                        title: otherData[i].title,
                        price: otherData[i].price,
                        description: otherData[i].description,
                        amount: otherData[i].amount,
                        image
                    })

                } 
            }
        }

        res.json({
            id: product._id,
            title: product.title,
            price: product.price,
            description: product.description,
            amount: product.amount,
            images,
            category, 
            userInfo: {
                name: userInfo.name,
                email: userInfo.email
            },
            others
        });
    },
    edit: async (req, res) => {
        let { id } = req.params;
        let { title, price, description, amount, images, cat, token } = req.body;
    
        if (id.length < 12) {
            res.json({ error: 'ID inválido' });
            return;
        }
    
        const product = await Product.findById(id).exec();
        if (!product) {
            res.json({ error: 'Produto não encontrado!' });
            return;
        }
    
        let user;
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
            user = await User.findById(decoded.id);
        } catch (error) {
            res.json({ error: 'Token inválido' });
            return;
        }
    
        if (user && user._id.toString() !== product.idUser) {
            res.json({ error: "Você não tem permissão para modificar este produto" });
            return;
        }
    
        let updates = {};
    
        if (title) {
            updates.title = title;
        }
    
        if (price) {
            price = price.replace('.', '').replace(',', '.').replace('R$', '');
            price = parseFloat(price);
            updates.price = price;
        }
    
        if (amount) {
            updates.amount = amount;
        }
    
        if (description) {
            updates.description = description;
        }
    
        if (cat) {
            const category = await Category.findOne({ slug: cat }).exec();
            if (!category) {
                res.json({ error: 'Categoria não existe' });
                return;
            }
            updates.category = category._id.toString();
        }
    
        if (images) {
            updates.images = images;
        }
    
        await Product.findByIdAndUpdate(id, { $set: updates });
    
        res.json({ error: '' });
    },
    
};