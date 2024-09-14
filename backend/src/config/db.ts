import mongoose from "mongoose";
import { MONGO_URI } from "../constants/env";

const connectToDatabase = async () => {
    try{
        await mongoose.connect(MONGO_URI);
        console.log('Succesfully Connected to DB');
    } catch(error){
        console.log('Could Not Connect to DB ', error);
        process.exit(1);
    }
};

export default connectToDatabase;