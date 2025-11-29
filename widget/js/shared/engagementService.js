(function (window) {
    'use strict';

    const SUPABASE_URL = 'https://agjwwnxduleyfxemvboj.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFnand3bnhkdWxleWZ4ZW12Ym9qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0NDIwNzEsImV4cCI6MjA4MDAxODA3MX0.5PHwxzVoWUFlPyqxb1ouS-iA1TuijYOzkFUvdfDcxlI';

    let supabaseClient = null;

    function getSupabase() {
        if (!supabaseClient && window.supabase) {
            supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        }
        return supabaseClient;
    }

    window.EngagementService = {
        async getLikeCount(mediaId) {
            try {
                const sb = getSupabase();
                if (!sb) return 0;

                const { count, error } = await sb
                    .from('media_likes')
                    .select('*', { count: 'exact', head: true })
                    .eq('media_id', mediaId);

                if (error) throw error;
                return count || 0;
            } catch (err) {
                console.error('Error getting like count:', err);
                return 0;
            }
        },

        async getCommentCount(mediaId) {
            try {
                const sb = getSupabase();
                if (!sb) return 0;

                const { count, error } = await sb
                    .from('media_comments')
                    .select('*', { count: 'exact', head: true })
                    .eq('media_id', mediaId);

                if (error) throw error;
                return count || 0;
            } catch (err) {
                console.error('Error getting comment count:', err);
                return 0;
            }
        },

        async isLikedByUser(mediaId, userId) {
            try {
                const sb = getSupabase();
                if (!sb || !userId) return false;

                const { data, error } = await sb
                    .from('media_likes')
                    .select('id')
                    .eq('media_id', mediaId)
                    .eq('user_id', userId)
                    .maybeSingle();

                if (error) throw error;
                return !!data;
            } catch (err) {
                console.error('Error checking like status:', err);
                return false;
            }
        },

        async toggleLike(mediaId, userId) {
            try {
                const sb = getSupabase();
                if (!sb || !userId) return { liked: false, count: 0 };

                const isLiked = await this.isLikedByUser(mediaId, userId);

                if (isLiked) {
                    const { error } = await sb
                        .from('media_likes')
                        .delete()
                        .eq('media_id', mediaId)
                        .eq('user_id', userId);

                    if (error) throw error;
                } else {
                    const { error } = await sb
                        .from('media_likes')
                        .insert({
                            media_id: mediaId,
                            user_id: userId
                        });

                    if (error) throw error;
                }

                const count = await this.getLikeCount(mediaId);
                return { liked: !isLiked, count: count };
            } catch (err) {
                console.error('Error toggling like:', err);
                return { liked: false, count: 0 };
            }
        },

        async recordShare(mediaId, userId) {
            try {
                const sb = getSupabase();
                if (!sb || !userId) return;

                const { error } = await sb
                    .from('media_shares')
                    .insert({
                        media_id: mediaId,
                        user_id: userId
                    });

                if (error) throw error;
            } catch (err) {
                console.error('Error recording share:', err);
            }
        }
    };

})(window);
