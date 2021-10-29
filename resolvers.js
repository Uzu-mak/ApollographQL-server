const sqlite3 = require('sqlite3').verbose();

const database = new sqlite3.Database("blogsDB.db");

const resolvers = {
    Query: {
        getPost: (root, args, context, info) => {
            return new Promise((resolve, reject) => {
                database.get("SELECT * FROM posts WHERE title=?;", [args.title], function (err, postRecord) {
                    if (err) {
                        resolve({});
                    }
                    if (postRecord) {
                        database.get("SELECT name as author_name, email as author_email FROM users WHERE id=?;", [postRecord.author_id], function (err, userRecord) {
                            if (err) {
                                resolve({});
                            }
                            let finalData = {...postRecord, ...userRecord};
                            resolve(finalData);
                        });
                    } else {
                        resolve({});
                    }
                });
            });
        },

    },

    Mutation: {
        createPost: (root, args, context, info) => {
            return new Promise((resolve, reject) => {
                const dataFromClient = args.content;
                database.run("INSERT INTO posts(title, body, image, author_id, create_date) VALUES(?,?,?,?,?);", [dataFromClient.title, dataFromClient.body, dataFromClient.image, dataFromClient.authorId, dataFromClient.createDate], function (err, rows) {
                    if (err) {
                        resolve({ status: 400, message: err.message });
                    }
                    resolve({ status: 200, message: `Post (${dataFromClient.title}) saved successfully!` });
                });
            });
        },

        updatePost: (root, args, context, info) => {
            return new Promise((resolve, reject) => {
                const dataFromClient = args.content;
                database.run("UPDATE posts SET title=?, body=?, image=?, author_id=? WHERE id=?;", [dataFromClient.title, dataFromClient.body, dataFromClient.image, dataFromClient.authorId, dataFromClient.id], function (err, rows) {
                    if (err) {
                        resolve({ status: 400, message: err.message });
                    }
                    resolve({ status: 200, message: `Post (${dataFromClient.title}) updated successfully!` });
                });
            });
        },

        deletePost: (root, args, context, info) => {
            return new Promise((resolve, reject) => {
                const dataFromClient = args.content;
                database.get("SELECT title FROM posts WHERE id=?;", [dataFromClient.id], function (err, row) {
                    if (err) {
                        resolve({ status: 400, message: err.message });
                    }
                    if (row) {
                        const titleOfPost = row.title;
                        database.run("DELETE FROM posts WHERE id=?;", [dataFromClient.id], function (err, rows) {
                            if (err) {
                                resolve({ status: 400, message: err.message });
                            }
                            resolve({ status: 200, message: `Post (${titleOfPost}) deleted successfully!` });
                        });
                    } else {
                        resolve({ status: 400, message: "Post not found!" });
                    }
                });
            });
        },

        likePost: (root, args, context, info) => {
            return new Promise((resolve, reject) => {
                const dataFromClient = args.content;
                database.get("SELECT title, likes_count, unlikes_count FROM posts WHERE id=?;", [dataFromClient.id], function (err, row) {
                    if (err) {
                        resolve({ status: 400, message: err.message });
                    }
                    if (row) {
                        const title = row.title;
                        const numOfUnlikes = row.unlikes_count;
                        const numOfLikes = row.likes_count + 1;
                        database.run("UPDATE posts SET likes_count=? WHERE id=?;", [numOfLikes, dataFromClient.id], function (err, rows) {
                            if (err) {
                                resolve({ status: 400, message: err.message });
                            }
                            resolve({
                                status: 200,
                                message: `Post (${title}) has been liked successfully!`,
                                likesCount: numOfLikes,
                                unlikesCount: numOfUnlikes
                            });
                        });
                    } else {
                        resolve({ status: 400, message: "Did not find post" });
                    }
                });
            });
        },

        unlikePost: (root, args, context, info) => {
            return new Promise((resolve, reject) => {
                const dataFromClient = args.content;
                database.get("SELECT title, likes_count, unlikes_count FROM posts WHERE id=?;", [dataFromClient.id], function (err, row) {
                    if (err) {
                        resolve({ status: 400, message: err.message });
                    }
                    if (row) {
                        const title = row.title;
                        const numOfLikes = row.likes_count;
                        const numOfUnlikes = row.unlikes_count + 1;
                        database.run("UPDATE posts SET unlikes_count=? WHERE id=?;", [numOfUnlikes, dataFromClient.id], function (err, rows) {
                            if (err) {
                                resolve({ status: 400, message: err.message });
                            }
                            resolve({
                                status: 200,
                                message: `Post (${title}) has been unliked successfully!`,
                                likesCount: numOfLikes,
                                unlikesCount: numOfUnlikes
                            });
                        });
                    } else {
                        resolve({ status: 400, message: "did not find post" });
                    }
                });
            });
        },

        createComment: (root, args, context, info) => {
            return new Promise((resolve, reject) => {
                const dataFromClient = args.content;
                database.run("INSERT INTO comments(body, user_id, post_id, create_date) VALUES(?,?,?,?);", [dataFromClient.body, dataFromClient.userId, dataFromClient.postId, dataFromClient.createDate], function (err, rows) {
                    if (err) {
                        resolve({ status: 400, message: err.message });
                    }
                    resolve({ status: 200, message: `Comment has been saved successfully!` });
                });
            });
        },

        deleteComment: (root, args, context, info) => {
            return new Promise((resolve, reject) => {
                const dataFromClient = args.content;
                database.get("SELECT id FROM comments WHERE id=?;", [dataFromClient.id], function (err, row) {
                    if (err) {
                        resolve({ status: 400, message: err.message });
                    }
                    if (row) {
                        database.run("DELETE FROM comments WHERE id=?;", [dataFromClient.id], function (err, rows) {
                            if (err) {
                                resolve({ status: 400, message: err.message });
                            }
                            resolve({ status: 200, message: `Comment has been deleted successfully!` });
                        });
                    } else {
                        resolve({ status: 400, message: "Did not find comment" });
                    }
                });
            });
        },

        replyComment: (root, args, context, info) => {
            return new Promise((resolve, reject) => {
                const dataFromClient = args.content;
                database.run("INSERT INTO comment_replies(body, user_id, comment_id, create_date) VALUES(?,?,?,?);", [dataFromClient.body, dataFromClient.userId, dataFromClient.commentId, dataFromClient.createDate], function (err, rows) {
                    if (err) {
                        resolve({ status: 400, message: err.message });
                    }
                    resolve({ status: 200, message: `Comment reply has been saved successfully!` });
                });
            });
        },
    }
};

module.exports = resolvers;