const User = require('../models/User')
const Category = require('../models/Category')
const Product = require('../models/Product')

module.exports = {
    info: async (req, res) => {
        let token = req.query.token;

        const user = await User.findOne({token});
        const products = await Product.findOne({idUser: user._id.toString()});

        let productList = [];

        for(let i in products) {

            const cat = await Category.findById(products[i].category);

            productList.push({
                id: products[i]._id,
                images: products[i].images,
                title: products[i].title,
                price: products[i].price,
                description: products[i].description,
                amount: products[i].amount,
                category: cat.slug,
            });
        }

        res.json({
            name: user.name,
            email: user.email, 
            product: productList
        });
    },
    edit: async (req, res) => {

    }
};