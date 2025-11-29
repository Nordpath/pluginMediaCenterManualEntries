(function (window) {
    'use strict';

    var ENGAGEMENT_COLLECTION = 'MediaEngagement';

    window.EngagementService = {
        getLikeCount: function(mediaId, callback) {
            var filter = {
                filter: {
                    "_buildfire.index.string1": "like-" + mediaId
                },
                recordCount: true
            };

            buildfire.publicData.search(filter, ENGAGEMENT_COLLECTION, function(err, result) {
                if (err) {
                    console.error('Error getting like count:', err);
                    callback(0);
                } else {
                    callback(result.totalRecord || 0);
                }
            });
        },

        getCommentCount: function(mediaId, callback) {
            var filter = {
                filter: {
                    "_buildfire.index.string1": "comment-" + mediaId
                },
                recordCount: true
            };

            buildfire.publicData.search(filter, ENGAGEMENT_COLLECTION, function(err, result) {
                if (err) {
                    console.error('Error getting comment count:', err);
                    callback(0);
                } else {
                    callback(result.totalRecord || 0);
                }
            });
        },

        isLikedByUser: function(mediaId, userId, callback) {
            var filter = {
                filter: {
                    "_buildfire.index.array1.string1": "like-" + mediaId + "-" + userId
                }
            };

            buildfire.publicData.search(filter, ENGAGEMENT_COLLECTION, function(err, result) {
                if (err) {
                    console.error('Error checking like status:', err);
                    callback(false, null);
                } else {
                    callback(result && result.length > 0, result && result.length > 0 ? result[0] : null);
                }
            });
        },

        toggleLike: function(mediaId, userId, callback) {
            var self = this;

            this.isLikedByUser(mediaId, userId, function(isLiked, existingRecord) {
                if (isLiked && existingRecord) {
                    buildfire.publicData.delete(existingRecord.id, ENGAGEMENT_COLLECTION, function(err) {
                        if (err) {
                            console.error('Error removing like:', err);
                            callback({ liked: false, count: 0 });
                        } else {
                            self.getLikeCount(mediaId, function(count) {
                                callback({ liked: false, count: count });
                            });
                        }
                    });
                } else {
                    var likeData = {
                        type: 'like',
                        mediaId: mediaId,
                        userId: userId,
                        createdAt: new Date().toISOString(),
                        _buildfire: {
                            index: {
                                string1: "like-" + mediaId,
                                array1: [
                                    { string1: "like-" + mediaId + "-" + userId }
                                ]
                            }
                        }
                    };

                    buildfire.publicData.insert(likeData, ENGAGEMENT_COLLECTION, false, function(err, result) {
                        if (err) {
                            console.error('Error adding like:', err);
                            callback({ liked: false, count: 0 });
                        } else {
                            self.getLikeCount(mediaId, function(count) {
                                callback({ liked: true, count: count });
                            });
                        }
                    });
                }
            });
        },

        recordShare: function(mediaId, userId, callback) {
            var shareData = {
                type: 'share',
                mediaId: mediaId,
                userId: userId,
                createdAt: new Date().toISOString(),
                _buildfire: {
                    index: {
                        string1: "share-" + mediaId,
                        array1: [
                            { string1: "share-" + mediaId + "-" + userId }
                        ]
                    }
                }
            };

            buildfire.publicData.insert(shareData, ENGAGEMENT_COLLECTION, false, function(err) {
                if (err) {
                    console.error('Error recording share:', err);
                }
                if (callback) callback(err);
            });
        },

        recordComment: function(mediaId, userId, callback) {
            var commentData = {
                type: 'comment',
                mediaId: mediaId,
                userId: userId,
                createdAt: new Date().toISOString(),
                _buildfire: {
                    index: {
                        string1: "comment-" + mediaId,
                        array1: [
                            { string1: "comment-" + mediaId + "-" + userId }
                        ]
                    }
                }
            };

            buildfire.publicData.insert(commentData, ENGAGEMENT_COLLECTION, false, function(err) {
                if (err) {
                    console.error('Error recording comment:', err);
                }
                if (callback) callback(err);
            });
        }
    };

})(window);
