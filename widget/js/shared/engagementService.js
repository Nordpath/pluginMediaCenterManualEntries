(function (window) {
    'use strict';

    var COLLECTIONS = {
        MediaLikes: 'MediaLikes',
        MediaComments: 'MediaComments',
        MediaShares: 'MediaShares'
    };

    window.EngagementService = {
        getLikeCount: function(mediaId, callback) {
            if (!mediaId) {
                callback(0);
                return;
            }

            var filter = {
                filter: {
                    "_buildfire.index.string1": "like-" + mediaId
                },
                recordCount: true
            };

            buildfire.publicData.search(filter, COLLECTIONS.MediaLikes, function(err, result) {
                if (err) {
                    console.error('Error getting like count:', err);
                    callback(0);
                    return;
                }
                callback(result.totalRecord || 0);
            });
        },

        getCommentCount: function(mediaId, callback) {
            if (!mediaId) {
                callback(0);
                return;
            }

            var filter = {
                filter: {
                    "_buildfire.index.string1": "comment-" + mediaId
                },
                recordCount: true
            };

            buildfire.publicData.search(filter, COLLECTIONS.MediaComments, function(err, result) {
                if (err) {
                    console.error('Error getting comment count:', err);
                    callback(0);
                    return;
                }
                callback(result.totalRecord || 0);
            });
        },

        isLikedByUser: function(mediaId, userId, callback) {
            if (!mediaId || !userId) {
                callback(false, null);
                return;
            }

            var filter = {
                filter: {
                    "_buildfire.index.string1": "like-" + mediaId,
                    "_buildfire.index.string2": userId
                }
            };

            buildfire.publicData.search(filter, COLLECTIONS.MediaLikes, function(err, result) {
                if (err) {
                    console.error('Error checking like status:', err);
                    callback(false, null);
                    return;
                }
                var existingLike = result && result.length > 0 ? result[0] : null;
                callback(!!existingLike, existingLike);
            });
        },

        toggleLike: function(mediaId, userId, callback) {
            var self = this;

            this.isLikedByUser(mediaId, userId, function(isLiked, existingRecord) {
                if (isLiked && existingRecord) {
                    buildfire.publicData.delete(existingRecord.id, COLLECTIONS.MediaLikes, function(err) {
                        if (err) {
                            console.error('Error removing like:', err);
                            callback({ liked: false, count: 0 });
                            return;
                        }

                        self.getLikeCount(mediaId, function(count) {
                            callback({ liked: false, count: count });
                        });
                    });
                } else {
                    var likeData = {
                        mediaId: mediaId,
                        userId: userId,
                        createdAt: new Date().toISOString(),
                        _buildfire: {
                            index: {
                                string1: "like-" + mediaId,
                                string2: userId
                            }
                        }
                    };

                    buildfire.publicData.insert(likeData, COLLECTIONS.MediaLikes, false, function(err) {
                        if (err) {
                            console.error('Error adding like:', err);
                            callback({ liked: false, count: 0 });
                            return;
                        }

                        self.getLikeCount(mediaId, function(count) {
                            callback({ liked: true, count: count });
                        });
                    });
                }
            });
        },

        recordShare: function(mediaId, userId, callback) {
            if (!mediaId || !userId) {
                if (callback) callback(new Error('Missing mediaId or userId'));
                return;
            }

            var shareData = {
                mediaId: mediaId,
                userId: userId,
                createdAt: new Date().toISOString(),
                _buildfire: {
                    index: {
                        string1: "share-" + mediaId,
                        string2: userId
                    }
                }
            };

            buildfire.publicData.insert(shareData, COLLECTIONS.MediaShares, false, function(err) {
                if (err) {
                    console.error('Error recording share:', err);
                    if (callback) callback(err);
                    return;
                }
                if (callback) callback(null);
            });
        },

        addComment: function(mediaId, userId, commentText, callback) {
            if (!mediaId || !userId || !commentText) {
                if (callback) callback(new Error('Missing required parameters'));
                return;
            }

            var commentData = {
                mediaId: mediaId,
                userId: userId,
                commentText: commentText,
                createdAt: new Date().toISOString(),
                _buildfire: {
                    index: {
                        string1: "comment-" + mediaId,
                        string2: userId,
                        date1: new Date()
                    }
                }
            };

            buildfire.publicData.insert(commentData, COLLECTIONS.MediaComments, false, function(err, result) {
                if (err) {
                    console.error('Error adding comment:', err);
                    if (callback) callback(err);
                    return;
                }
                if (callback) callback(null, result);
            });
        },

        getComments: function(mediaId, callback) {
            if (!mediaId) {
                callback([]);
                return;
            }

            var filter = {
                filter: {
                    "_buildfire.index.string1": "comment-" + mediaId
                },
                sort: {
                    "_buildfire.index.date1": -1
                }
            };

            buildfire.publicData.search(filter, COLLECTIONS.MediaComments, function(err, result) {
                if (err) {
                    console.error('Error getting comments:', err);
                    callback([]);
                    return;
                }
                callback(result || []);
            });
        },

        getShareCount: function(mediaId, callback) {
            if (!mediaId) {
                callback(0);
                return;
            }

            var filter = {
                filter: {
                    "_buildfire.index.string1": "share-" + mediaId
                },
                recordCount: true
            };

            buildfire.publicData.search(filter, COLLECTIONS.MediaShares, function(err, result) {
                if (err) {
                    console.error('Error getting share count:', err);
                    callback(0);
                    return;
                }
                callback(result.totalRecord || 0);
            });
        },

        loadEngagementData: function(mediaId, userId, callback) {
            var self = this;
            var result = {
                likeCount: 0,
                commentCount: 0,
                shareCount: 0,
                isLiked: false
            };

            self.getLikeCount(mediaId, function(likeCount) {
                result.likeCount = likeCount;

                self.getCommentCount(mediaId, function(commentCount) {
                    result.commentCount = commentCount;

                    self.getShareCount(mediaId, function(shareCount) {
                        result.shareCount = shareCount;

                        if (userId) {
                            self.isLikedByUser(mediaId, userId, function(isLiked) {
                                result.isLiked = isLiked;
                                callback(result);
                            });
                        } else {
                            callback(result);
                        }
                    });
                });
            });
        }
    };

})(window);
