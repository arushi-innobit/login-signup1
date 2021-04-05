const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Create the structure of the database
const typeSchema = new Schema({
    cdc:{
        type:Schema.Types.ObjectId,
        ref:'cdcdevices'
    },
    pdc:{
        type:Schema.Types.ObjectId,
        ref:'pdcdevices'
    },
    mld:{
        type:Schema.Types.ObjectId,
        ref:'mlddevices'
    },
    pfd:{
        type:Schema.Types.ObjectId,
        ref:'pfddevices'
    },
    agd:{
        type:Schema.Types.ObjectId,
        ref:'agddevices'
    },

})
const devicesSchema= new Schema({
    deviceType:{
        type: Schema.Types.ObjectId,
        required: true,
        req:'typeSchema'
    },
    portNumber:{
        type:String, 
        required:true
    },
});
const Trains = mongoose.model('TrainRecord',TrainSchema);
module.exports=Trains;