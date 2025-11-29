(function (window) {
    'use strict';

    var supabaseUrl = 'https://agjwwnxduleyfxemvboj.supabase.co';
    var supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFnand3bnhkdWxleWZ4ZW12Ym9qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0NDIwNzEsImV4cCI6MjA4MDAxODA3MX0.5PHwxzVoWUFlPyqxb1ouS-iA1TuijYOzkFUvdfDcxlI';

    var supabase = window.supabase ? window.supabase.createClient(supabaseUrl, supabaseKey) : null;

    window.EngagementService = {
        getLikeCount: function(mediaId, callback) {
            if (!supabase) {
                console.warn('Supabase not available');
                callback(0);
                return;
            }

            supabase
                .from('media_likes')
                .select('*', { count: 'exact', head: true })
                .eq('media_id', mediaId)
                .then(function(response) {
                    callback(response.count || 0);
                })
                .catch(function(err) {
                    console.error('Error getting like count:', err);
                    callback(0);
                });
        },

        getCommentCount: function(mediaId, callback) {
            if (!supabase) {
                console.warn('Supabase not available');
                callback(0);
                return;
            }

            supabase
                .from('media_comments')
                .select('*', { count: 'exact', head: true })
                .eq('media_id', mediaId)
                .then(function(response) {
                    callback(response.count || 0);
                })
                .catch(function(err) {
                    console.error('Error getting comment count:', err);
                    callback(0);
                });
        },

        isLikedByUser: function(mediaId, userId, callback) {
            if (!supabase) {
                console.warn('Supabase not available');
                callback(false, null);
                return;
            }

            supabase
                .from('media_likes')
                .select('*')
                .eq('media_id', mediaId)
                .eq('user_id', userId)
                .maybeSingle()
                .then(function(response) {
                    callback(!!response.data, response.data);
                })
                .catch(function(err) {
                    console.error('Error checking like status:', err);
                    callback(false, null);
                });
        },

        toggleLike: function(mediaId, userId, callback) {
            var self = this;

            this.isLikedByUser(mediaId, userId, function(isLiked, existingRecord) {
                if (isLiked && existingRecord) {
                    supabase
                        .from('media_likes')
                        .delete()
                        .eq('id', existingRecord.id)
                        .then(function() {
                            self.getLikeCount(mediaId, function(count) {
                                callback({ liked: false, count: count });
                            });
                        })
                        .catch(function(err) {
                            console.error('Error removing like:', err);
                            callback({ liked: false, count: 0 });
                        });
                } else {
                    supabase
                        .from('media_likes')
                        .insert({
                            media_id: mediaId,
                            user_id: userId
                        })
                        .then(function() {
                            self.getLikeCount(mediaId, function(count) {
                                callback({ liked: true, count: count });
                            });
                        })
                        .catch(function(err) {
                            console.error('Error adding like:', err);
                            callback({ liked: false, count: 0 });
                        });
                }
            });
        },

        recordShare: function(mediaId, userId, callback) {
            if (!supabase) {
                console.warn('Supabase not available');
                if (callback) callback(new Error('Supabase not available'));
                return;
            }

            supabase
                .from('media_shares')
                .insert({
                    media_id: mediaId,
                    user_id: userId
                })
                .then(function() {
                    if (callback) callback(null);
                })
                .catch(function(err) {
                    console.error('Error recording share:', err);
                    if (callback) callback(err);
                });
        },

        addComment: function(mediaId, userId, commentText, callback) {
            if (!supabase) {
                console.warn('Supabase not available');
                if (callback) callback(new Error('Supabase not available'));
                return;
            }

            supabase
                .from('media_comments')
                .insert({
                    media_id: mediaId,
                    user_id: userId,
                    comment_text: commentText
                })
                .then(function() {
                    if (callback) callback(null);
                })
                .catch(function(err) {
                    console.error('Error adding comment:', err);
                    if (callback) callback(err);
                });
        },

        getComments: function(mediaId, callback) {
            if (!supabase) {
                console.warn('Supabase not available');
                callback([]);
                return;
            }

            supabase
                .from('media_comments')
                .select('*')
                .eq('media_id', mediaId)
                .order('created_at', { ascending: false })
                .then(function(response) {
                    callback(response.data || []);
                })
                .catch(function(err) {
                    console.error('Error getting comments:', err);
                    callback([]);
                });
        },

        loadEngagementData: function(mediaId, userId, callback) {
            var self = this;
            var result = {
                likeCount: 0,
                commentCount: 0,
                isLiked: false
            };

            self.getLikeCount(mediaId, function(likeCount) {
                result.likeCount = likeCount;

                self.getCommentCount(mediaId, function(commentCount) {
                    result.commentCount = commentCount;

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
        }
    };

})(window);
