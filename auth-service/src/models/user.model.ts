import { Model, Schema, model } from "mongoose";
import type { User } from "@ksoftdev/core";
import { ZodError } from "zod";
import { Password } from "@ksoftdev/core";
import { BadRequestError } from "@ksoftdev/core";

type UserDoc = Omit<User, "password">;

interface UserFunctions {
    createUser(user: User): Promise<UserDoc>;
    getUsers(): Promise<User[]>;
    checkEmailIfExists(email: string): Promise<void>;
    signIn(email: string, password: string): Promise<UserDoc>;
}

const userSchema = new Schema<User, Model<User>, {}, {}, {}, UserFunctions>(
    {
        email: { type: String, required: true },
        password: { type: String, required: true },
    },
    {
        toJSON: {
            transform: (_doc, ret) => {
                ret.id = ret._id;
                delete ret.password;
                delete ret.__v;
                delete ret._id;
            },
        },
    },
);

userSchema.pre("save", function (done) {
    if (this.isModified("password")) {
        const password = this.get("password");
        const hash = Password.hash(password);
        this.set("password", hash);

        done();
    }
});

userSchema.static("createUser", async (user: User) => {
    const createdUser = await new UserModel(user);

    await createdUser.save();

    return createdUser.toJSON();
});

userSchema.static("createUser", async (user: User) => {
    const createdUser = await new UserModel(user);

    await createdUser.save();

    return createdUser.toJSON();
});

userSchema.static(
    "checkEmailIfExists",
    async (email: string): Promise<void> => {
        const isExists = await UserModel.findOne({ email });

        if (isExists) {
            throw new ZodError([
                { message: "email exists!", code: "custom", path: ["email"] },
            ]);
        }
    },
);

userSchema.static("signIn", async (email: string, password: string) => {
    const user = await UserModel.findOne({ email });

    if (!user || !Password.compare(password, user.password)) {
        throw new BadRequestError("invalid email or password");
    }

    return user.toJSON();
});

userSchema.static("getUsers", () => {
    return UserModel.find();
});

const UserModel = model<User, Model<User> & UserFunctions>("User", userSchema);

export default UserModel;
