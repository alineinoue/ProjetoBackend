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

    },
    getItem: async (req, res) => {

    },
    edit: async (req, res) => {

    }
};