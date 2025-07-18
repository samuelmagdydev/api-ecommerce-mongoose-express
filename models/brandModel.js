const mongoose = require('mongoose');

//schema
const brandSchema = new mongoose.Schema({
    name: {
        type : String,
        required : [true, "Brand Required"],
        unique : [true , "Brand Must Be Unique"],
        minlength : [3,"Too Short Category Name"],
        maxlength : [32, "Too Long Category Name"],
    },
    slug :{
        type : String,
        lowercase: true,
    },
    image : String
},
{timestamps : true}
);

const setImageURL = (doc) => {
  if (doc.image) {
    const imageUrl = `${process.env.BASE_URL}/brands/${doc.image}`;
    doc.image = imageUrl;
  }
};

brandSchema.post("init", (doc) => {
  setImageURL(doc);
});

brandSchema.post("save", (doc) => {
  setImageURL(doc);
});

//model
module.exports =mongoose.model('Brand', brandSchema);

