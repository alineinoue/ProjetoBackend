const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const modelSchema = new mongoose.Schema({
    idUser: String,
    images: [Object],
    title: String,
    category: String,
    price: Number, 
    description: String,
    amount: Number
});

const modelName = 'Produto';

// Verifica se já tem conexão e o model está pronto, então o model é exportado direto na conexão
// Se não, ele irá criar.
if(mongoose.connection && mongoose.connection.models[modelName]){
    module.exports = mongoose.connection.models[modelName]
} else {
    module.exports = mongoose.model(modelName, modelSchema);
}