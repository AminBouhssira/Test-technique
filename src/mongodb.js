const mongoose=require("mongoose")

const username = encodeURIComponent("aminbouhssira");
const password = encodeURIComponent("secretos123");

let uri = `mongodb+srv://`+username+`:`+password+`@utilisateurs.ivgwyfi.mongodb.net/test`;

mongoose.connect(uri)
.then(()=>{
    console.log("mongodb connecté")
})
.catch(()=>{
    console.log("echec de la connexion")
})

const inscriptionSchema= new mongoose.Schema({
    mail:{
        type: String,
        required:true
    },
    mdp:{
        type: String,
        required:true
    },
    
    
})



const collection= new mongoose.model("Collection",inscriptionSchema)

module.exports=collection