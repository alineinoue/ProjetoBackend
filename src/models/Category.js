const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const modelSchema = new mongoose.Schema({
    name: String,
    slug: String
});

const modelName = 'Categoria';

// Verifica se já tem conexão e o model está pronto, então o model é exportado direto na conexão
// Se não, ele irá criar.
if(mongoose.connection && mongoose.connection.models[modelName]){
    module.exports = mongoose.connection.models[modelName]
} else {
    module.exports = mongoose.model(modelName, modelSchema);
}