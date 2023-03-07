const { AuthenticationError } = require('apollo-server-express');
const { User } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
    Query: {
        me: async (parent, { userId }, context) => {
            if (context.user) {
                return User.findOne({ _id: userId })
            }
            throw new AuthenticationError('You need to be logged in!');
        }
    },

    Mutation: {
        addUser: async (parent, { name, email, password }) => {
            const user = await User.create({ name, email, password });
            const token = signToken(user);

            return { token, profile };
        },
        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email });

            if (!user) {
                throw new AuthenticationError('No user with this email found!');
            }

            const correctPw = await user.isCorrectPassword(password);

            if (!correctPw) {
                throw new AuthenticationError('Incorrect password!');
            }

            const token = signToken(user);
            return { token, profile };
        },
        saveBook: async (parent, { user, book }, context) => {
            if (context.user) {
                return User.findOneAndUpdate(
                    { _id: user._id },
                    {
                        $addToSet: { savedBooks: book },
                    },
                    {
                        new: true,
                        runValidators: true,
                    }
                );
            }
            throw new AuthenticationError('You need to be logged in!');
        },
        deleteBook: async (parent, { user, bookId }) => {
            return User.findOneAndUpdate(
                { _id: user._idId },
                { $pull: { savedBooks: bookId } },
                { new: true }
            );
        },
    }
};

module.exports = resolvers;