const mongoose = require('mongoose');

const subCategorySchema = new mongoose.Schema({
    name : {
        type: String,
        trim : true,
        unique : [true , "SubCategory Must Be Unique"],
        minlenght: [2, "Too Short SubCategory Name"],
        maxlenght : [32,"Too Long SubCategory Name"],
    },
    slug:{
        type : String,
        lowercase : true,
    },
    category : {
        type : mongoose.Schema.ObjectId,
        ref: "Category",
        require: [true,'SubCategory Must Be Belong To Parent Category']
    } 
},
{timestamps: true}
);

module.exports = mongoose.model('SubCategory', subCategorySchema);
