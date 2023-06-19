const Category = require('../models/Category');
const User = require('../models/User');
const Product = require('../models/Product');
const jwt = require('jsonwebtoken');

module.exports = {
    getCategorias: async (req, res) => {
        const cats = await Category.find();

        let categories = [];

        for(let i in cats) {
            categories.push({
                ...cats[i]._doc
            });
        }

        res.json({categories});

    },
    add: async (req, res) => {
        let {name, slug, token} = req.body;

        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const user = await User.findById(decoded.id);

        if(!name || !slug){
            res.json({error: 'Nome e/ou slug da categoria não foram preenchidos'});
            return;
        }

        const newCategory = new Category();
        newCategory.name = name;
        newCategory.slug = slug;
      
        const info = await newCategory.save();
        res.json({id: info._id});
    },
    edit: async (req, res) => {
        let { id } = req.params;
        let { name, slug, token } = req.body;
    
        if (id.length < 12) {
            res.json({ error: 'ID inválido' });
            return;
        }
    
        const category = await Category.findById(id).exec();
        if (!category) {
            res.json({ error: 'Categoria não encontrada!' });
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
    
        let updates = {};
    
        if (name) {
            updates.name = name;
        }
    
        if (slug) {
            updates.slug = slug;
        }

        await Category.findByIdAndUpdate(id, { $set: updates });
    
        res.json({ mensagem: 'Categoria editada com sucesso!' });
    },
    delete: async (req, res) => {
        const { id } = req.params;
    
        if (id.length < 12) {
            res.json({ error: 'ID inválido' });
            return;
        }
    
        try {
            const category = await Category.findById(id).exec();
            if (!category) {
                res.json({ error: 'Categoria não encontrada!' });
                return;
            }
    
            const productsWithCategory = await Product.find({ category: id }).exec();
            if (productsWithCategory.length > 0) {
                res.json({ error: 'Não é possível excluir a categoria, pois ela está associada a um ou mais produtos.' });
                return;
            }
    
            await Category.deleteOne({ _id: id });
    
            res.json({ mensagem: 'Categoria excluída com sucesso!' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro no servidor' });
        }
    },    
};