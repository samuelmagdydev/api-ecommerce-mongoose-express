const mongoose = require('mongoose');

const dbConnection =() =>{
    mongoose.connect(process.env.DB_URI).then((conn)=>{
        console.log(`Server Is Running : ${conn.connection.host} `);
    })
    // .catch((err)=>{
    //     console.error(`Failed To Connect : ${err}`);
    //     process.exit(1);
    // });
    
};

module.exports = dbConnection;