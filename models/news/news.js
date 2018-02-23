const mongoose = require ('mongoose'),
    Schema = mongoose.Schema,

    NewsSchema = new Schema ({
        title: {type: String},
        description: {type: String},
        image: {type: String},
        url: {type: String, unique: true},
        category: {type: String},
        source: {type: String},
        date: {type: String},
        hour: {type: String}
    });

module.exports = mongoose.model('News', NewsSchema);
