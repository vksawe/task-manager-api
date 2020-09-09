const mongoose = require("mongoose");
// const validator = require("validator");

const taskSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
    trim: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  owner:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'User',
    required:true
    
  }
},{
  timestamps:true
});

const task = new mongoose.model("tasks", taskSchema);


module.exports=task