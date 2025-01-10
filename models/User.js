import mongoose from "mongoose";
import bcrypt from 'bcryptjs';

const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: [true, "Please provide a name"]
    },
    email: {
        type: String,
        required: [true, "Please provide an email"]
    },
    password: {
        type: String,
        required: [true, "Please provide a password"]
    },
    storage: {
        type: Number,
        require: false
    },
    maxstorage: {
        type: Number,
        require: false
    },
    date_joined: {
        type: String,
        required: [true, "Please provide a date"]
    }
})

userSchema.pre('save', async function (next) {
    const salt = await bcrypt.genSalt(10);
    this.password = bcrypt.hashSync(this.password, salt);
    next();
})

userSchema.statics.login = async function (email, password) {
    const user = await this.findOne({ email });

    if (user) {
        const auth = await bcrypt.compare(password, user.password);
        if (auth) {
            return user
        } 
        throw Error('Invalid Password');
    }
    throw Error('Invalid User');
}

const User = mongoose.model('user', userSchema);

export default User;